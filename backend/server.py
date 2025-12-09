@api_router.post("/pages/{page_id}/sections", response_model=Section)
async def create_section(page_id: str, section_data: SectionCreate, current_user: dict = Depends(get_current_user)):
    page = await db.pages.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if section_data.position_order is None:
        max_order = await db.sections.find({"page_id": page_id}).sort("position_order", -1).limit(1).to_list(1)
        section_data.position_order = (max_order[0]['position_order'] + 1) if max_order else 1
    
    section = Section(
        page_id=page_id,
        selected_text=section_data.selected_text,
        text_content=section_data.selected_text,
        position_order=section_data.position_order
    )
    section_dict = section.model_dump()
    section_dict['created_at'] = section_dict['created_at'].isoformat()
    
    await db.sections.insert_one(section_dict)
    return section

@api_router.get("/sections/{section_id}", response_model=Section)
async def get_section(section_id: str, current_user: dict = Depends(get_current_user)):
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section

@api_router.patch("/sections/{section_id}", response_model=Section)
async def update_section(
    section_id: str,
    payload: SectionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update section text and/or status."""
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    # Security: verify ownership via page -> website
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")

    update_data = {}
    if payload.text_content is not None:
        update_data["text_content"] = payload.text_content
        update_data["selected_text"] = payload.text_content  # keep in sync with edits

    if payload.status is not None:
        update_data["status"] = payload.status

    if update_data:
        await db.sections.update_one(
            {"id": section_id},
            {"$set": update_data}
        )

    updated_section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    return updated_section
