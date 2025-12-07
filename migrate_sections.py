#!/usr/bin/env python3
"""
Migration script to fix sections with old schema that are causing white page issues.

The issue: Some sections have old fields (title, text, order) but the new Section model 
expects (selected_text, position_order). This causes ResponseValidationError when 
the API tries to return these sections, leading to white page after video upload.
"""

import os
import asyncio
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv('/app/backend/.env')

async def migrate_sections():
    """Migrate sections from old schema to new schema"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🔄 Starting section schema migration...")
    
    # Find sections with old schema (have 'title' field)
    old_sections = await db.sections.find({'title': {'$exists': True}}).to_list(1000)
    print(f"Found {len(old_sections)} sections with old schema")
    
    migrated_count = 0
    
    for section in old_sections:
        section_id = section.get('id')
        print(f"Migrating section {section_id}...")
        
        # Prepare update data
        update_data = {}
        
        # Map old fields to new fields
        if 'text' in section:
            update_data['selected_text'] = section['text']
        elif 'title' in section:
            update_data['selected_text'] = section['title']
        
        if 'order' in section:
            update_data['position_order'] = section['order']
        else:
            update_data['position_order'] = 1
        
        # Add missing fields with defaults
        if 'status' not in section:
            update_data['status'] = 'Not Setup'
        if 'videos_count' not in section:
            update_data['videos_count'] = 0
        if 'audios_count' not in section:
            update_data['audios_count'] = 0
        
        # Update the section
        result = await db.sections.update_one(
            {'id': section_id},
            {
                '$set': update_data,
                '$unset': {
                    'title': '',
                    'text': '',
                    'order': ''
                }
            }
        )
        
        if result.modified_count > 0:
            migrated_count += 1
            print(f"  ✅ Migrated section {section_id}")
        else:
            print(f"  ❌ Failed to migrate section {section_id}")
    
    print(f"\n🎉 Migration complete! Migrated {migrated_count} sections")
    
    # Verify migration
    remaining_old = await db.sections.find({'title': {'$exists': True}}).to_list(10)
    if remaining_old:
        print(f"⚠️  Warning: {len(remaining_old)} sections still have old schema")
    else:
        print("✅ All sections now use the new schema")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_sections())