@api_router.get("/widget/{website_id}/content")
async def get_widget_content(website_id: str, page_url: str):
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    page = await db.pages.find_one({"website_id": website_id, "url": page_url, "status": "Active"}, {"_id": 0})
    if not page:
        return {"sections": []}
    
    sections = await db.sections.find({"page_id": page['id'], "status": "Active"}, {"_id": 0}).sort([("position_order", 1), ("order", 1)]).to_list(1000)
    
    # Normalize field names: use 'text_content' for consistency with widget
    for section in sections:
        # Handle both 'text' and 'selected_text' fields
        if 'text' in section and 'text_content' not in section:
            section['text_content'] = section['text']
        elif 'selected_text' in section and 'text_content' not in section:
            section['text_content'] = section['selected_text']
    
    # Optimize: Batch fetch all videos and audios to avoid N+1 queries
    section_ids = [section['id'] for section in sections]
    
    if section_ids:
        all_videos = await db.videos.find({"section_id": {"$in": section_ids}}, {"_id": 0}).to_list(10000)
        all_audios = await db.audios.find({"section_id": {"$in": section_ids}}, {"_id": 0}).to_list(10000)
        all_translations = await db.text_translations.find({"section_id": {"$in": section_ids}}, {"_id": 0}).to_list(10000)
        
        # Create lookup dictionaries for O(1) access AND SIGN URLS
        videos_by_section = {}
        for video in all_videos:
            # SIGN VIDEO URL
            if not video['video_url'].startswith("/"):
                key = video.get('file_path')
                if not key and 'amazonaws.com' in video['video_url']:
                    key = video['video_url'].split('.amazonaws.com/')[-1]
                if key:
                    video['video_url'] = s3_service.generate_presigned_url(key)

            if video['section_id'] not in videos_by_section:
                videos_by_section[video['section_id']] = []
            videos_by_section[video['section_id']].append(video)
        
        audios_by_section = {}
        for audio in all_audios:
            # SIGN AUDIO URL
            if not audio['audio_url'].startswith("/"):
                key = audio.get('file_path')
                if not key and 'amazonaws.com' in audio['audio_url']:
                    key = audio['audio_url'].split('.amazonaws.com/')[-1]
                if key:
                    audio['audio_url'] = s3_service.generate_presigned_url(key)

            if audio['section_id'] not in audios_by_section:
                audios_by_section[audio['section_id']] = []
            audios_by_section[audio['section_id']].append(audio)
        
        translations_by_section = {}
        for translation in all_translations:
            if translation['section_id'] not in translations_by_section:
                translations_by_section[translation['section_id']] = []
            translations_by_section[translation['section_id']].append(translation)
        
        # Attach videos, audios, and translations to each section
        for section in sections:
            section['videos'] = videos_by_section.get(section['id'], [])
            section['audios'] = audios_by_section.get(section['id'], [])
            section['translations'] = translations_by_section.get(section['id'], [])
    
    # Track analytics
    await db.analytics.update_one(
        {"website_id": website_id, "page_url": page_url},
        {"$inc": {"views": 1}},
        upsert=True
    )
    
    return {"sections": sections}
class SectionOrderUpdate(BaseModel):
    id: str
    position_order: int

class ReorderRequest(BaseModel):
    sections: List[SectionOrderUpdate]

@api_router.put("/pages/{page_id}/sections/reorder")
async def reorder_sections(page_id: str, request: ReorderRequest, current_user: dict = Depends(get_current_user)):
    """Reorder sections for a specific page"""
    # Verify page exists
    page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
        
    # Verify user has access to the website
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update each section's order
    # Using bulk write would be more efficient, but loop is fine for small number of sections
    for item in request.sections:
        await db.sections.update_one(
            {"id": item.id, "page_id": page_id},
            {"$set": {"position_order": item.position_order}}
        )
        
    return {"message": "Sections reordered successfully"}
