
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
