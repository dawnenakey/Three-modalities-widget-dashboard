#!/usr/bin/env python3
"""
Directly fix embed codes in MongoDB database
"""

import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def fix_all_embed_codes():
    """Update ALL websites in database to use correct embed codes"""
    
    print("🔧 Fixing ALL Embed Codes in Database")
    print("=" * 80)
    
    # Get ALL websites (no filter)
    websites = await db.websites.find({}, {"_id": 0}).to_list(1000)
    
    print(f"\n📊 Found {len(websites)} total websites in database")
    
    updated_count = 0
    
    for website in websites:
        old_embed = website.get('embed_code', '')
        website_id = website['id']
        website_name = website.get('name', 'Unknown')
        
        # Generate new correct embed code
        new_embed = f'<script src="https://testing.gopivot.me/api/widget.js" data-website-id="{website_id}"></script>'
        
        # Check if needs updating
        if 'emergent' in old_embed.lower() or 'localhost' in old_embed.lower() or old_embed != new_embed:
            print(f"\n📝 Updating: {website_name}")
            print(f"   Owner: {website.get('owner_id', 'Unknown')[:20]}...")
            print(f"   Old: {old_embed[:80]}...")
            print(f"   New: {new_embed}")
            
            # Update in database
            result = await db.websites.update_one(
                {"id": website_id},
                {"$set": {"embed_code": new_embed}}
            )
            
            if result.modified_count > 0:
                print(f"   ✅ Updated successfully")
                updated_count += 1
            else:
                print(f"   ⚠️  No changes made")
        else:
            print(f"\n✅ Already correct: {website_name}")
    
    print("\n" + "=" * 80)
    print(f"✅ Updated {updated_count} website(s)")
    print("=" * 80)
    
    # Show final state
    print("\n📋 Verification - All Embed Codes:")
    print("=" * 80)
    websites = await db.websites.find({}, {"_id": 0}).to_list(1000)
    for website in websites:
        print(f"\n{website.get('name', 'Unknown')}:")
        print(f"  {website.get('embed_code', 'No embed code')}")

if __name__ == "__main__":
    asyncio.run(fix_all_embed_codes())
