#!/usr/bin/env python3
"""
Fix all website embed codes to use testing.gopivot.me
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

async def fix_embed_codes():
    """Update all website embed codes to use gopivot domain"""
    
    print("🔧 Fixing Embed Codes")
    print("=" * 80)
    
    backend_url = "https://testing.gopivot.me"
    
    websites = await db.websites.find({}, {"_id": 0}).to_list(100)
    
    updated_count = 0
    
    for website in websites:
        old_embed = website.get('embed_code', '')
        new_embed = f'<script src="{backend_url}/api/widget.js" data-website-id="{website["id"]}"></script>'
        
        if old_embed != new_embed:
            print(f"\n📝 Updating: {website['name']}")
            print(f"   Old: {old_embed[:80]}...")
            print(f"   New: {new_embed}")
            
            await db.websites.update_one(
                {"id": website['id']},
                {"$set": {"embed_code": new_embed}}
            )
            updated_count += 1
        else:
            print(f"\n✅ Already correct: {website['name']}")
    
    print("\n" + "=" * 80)
    print(f"✅ Updated {updated_count} website(s)")
    print("=" * 80)
    
    # Show final state
    print("\n📋 Final Embed Codes:")
    websites = await db.websites.find({}, {"_id": 0}).to_list(100)
    for website in websites:
        print(f"\n{website['name']}:")
        print(f"  {website.get('embed_code', 'No embed code')}")

if __name__ == "__main__":
    asyncio.run(fix_embed_codes())
