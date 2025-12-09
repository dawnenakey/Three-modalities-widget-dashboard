from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Re-use existing setup or create minimal for this route
# Note: In a real app, this would be integrated into server.py more cleanly
# For now, we'll append this to server.py or ensure server.py has this logic.

class SectionOrderUpdate(BaseModel):
    id: str
    position_order: int

class ReorderRequest(BaseModel):
    sections: List[SectionOrderUpdate]

# This logic needs to be added to server.py
# @api_router.put("/pages/{page_id}/sections/reorder")
# async def reorder_sections(page_id: str, request: ReorderRequest, current_user: dict = Depends(get_current_user)):
#     # Verify page access...
#     
#     # Update each section
#     for item in request.sections:
#         await db.sections.update_one(
#             {"id": item.id, "page_id": page_id},
#             {"$set": {"position_order": item.position_order}}
#         )
#     return {"message": "Sections reordered successfully"}
