#!/usr/bin/env python3
"""
Fix old section schema in database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

async def fix_sections():
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL')
    if not mongo_url:
        print("Error: MONGO_URL not found in environment")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client['pivot']
    
    print("Finding sections with old schema...")
    
    # Find sections with 'text' field instead of 'selected_text'
    old_sections = await db.sections.find({
        "$or": [
            {"text": {"$exists": True}},
            {"title": {"$exists": True}},
            {"order": {"$exists": True}}
        ]
    }, {"_id": 0}).to_list(1000)
    
    print(f"Found {len(old_sections)} sections with old schema")
    
    for section in old_sections:
        update_fields = {}
        
        # Migrate 'text' to 'selected_text'
        if 'text' in section and 'selected_text' not in section:
            update_fields['selected_text'] = section['text']
            print(f"  - Migrating section {section['id']}: 'text' -> 'selected_text'")
        
        # Migrate 'text' to 'text_content' as well for consistency
        if 'text' in section and 'text_content' not in section:
            update_fields['text_content'] = section['text']
        
        # Migrate 'order' to 'position_order'
        if 'order' in section and 'position_order' not in section:
            update_fields['position_order'] = section['order']
            print(f"  - Migrating section {section['id']}: 'order' -> 'position_order'")
        
        # Migrate 'title' to 'section_title' (if needed)
        if 'title' in section and 'section_title' not in section:
            update_fields['section_title'] = section['title']
            print(f"  - Migrating section {section['id']}: 'title' -> 'section_title'")
        
        # Set default status if missing
        if 'status' not in section:
            update_fields['status'] = 'Active'
            print(f"  - Setting default status for section {section['id']}")
        
        # Apply updates
        if update_fields:
            await db.sections.update_one(
                {"id": section['id']},
                {"$set": update_fields}
            )
            print(f"  ✓ Updated section {section['id']}")
    
    print(f"\n✅ Migration complete! Fixed {len(old_sections)} sections")
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_sections())
