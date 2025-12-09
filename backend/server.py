@api_router.get("/websites/{website_id}", response_model=Website)
async def get_website(website_id: str, current_user: dict = Depends(get_current_user)):
    # Check if user has access (owner or collaborator)
    has_access = await check_website_access(website_id, current_user['id'])
    if not has_access:
        raise HTTPException(status_code=404, detail="Website not found")
    
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    
    # FORCE FIX: Ensure embed code is always correct
    if website:
        correct_code = f'<script src="https://testing.gopivot.me/api/widget.js" data-website-id="{website["id"]}"></script>'
        website['embed_code'] = correct_code
        
    return website