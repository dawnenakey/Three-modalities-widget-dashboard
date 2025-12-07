#!/usr/bin/env python3
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

async def check_all():
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'pivot_accessibility')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"Connected to database: {db_name}")
    
    # Get ALL sections
    all_sections = await db.sections.find({}, {"_id": 0}).to_list(10000)
    print(f"Total sections: {len(all_sections)}")
    
    fixed_count = 0
    # Check for old schema
    for section in all_sections:
        has_old_schema = False
        issues = []
        
        if 'text' in section and 'selected_text' not in section:
            has_old_schema = True
            issues.append("missing 'selected_text'")
        
        if 'order' in section and 'position_order' not in section:
            has_old_schema = True
            issues.append("missing 'position_order'")
        
        if has_old_schema:
            print(f"\n❌ Section {section['id']} (page: {section.get('page_id', 'N/A')})")
            print(f"   Issues: {', '.join(issues)}")
            
            # Fix it now
            update_fields = {}
            if 'text' in section:
                update_fields['selected_text'] = section['text']
                update_fields['text_content'] = section['text']
            if 'order' in section:
                update_fields['position_order'] = section['order']
            if 'status' not in section:
                update_fields['status'] = 'Active'
            
            await db.sections.update_one(
                {"id": section['id']},
                {"$set": update_fields}
            )
            print(f"   ✓ FIXED!")
            fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} sections total")
    client.close()

asyncio.run(check_all())
