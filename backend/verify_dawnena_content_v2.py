#!/usr/bin/env python3
"""
Verify Content for dawnena@dozanu.com (Robust Version)
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def main():
    print("🔍 VERIFYING CONTENT FOR: dawnena@dozanu.com")
    print("=" * 60)
    
    # 1. Get User
    user = await db.users.find_one({"email": "dawnena@dozanu.com"})
    if not user:
        print("❌ User not found!")
        return
    
    print(f"User ID: {user['id']}")
    
    # 2. Find Websites (Owner OR Collaborator)
    websites = await db.websites.find({
        "$or": [
            {"owner_id": user['id']},
            {"collaborators": user['id']}
        ]
    }).to_list(100)
    
    print(f"\n🌐 Found {len(websites)} Websites:")
    
    for site in websites:
        print(f"\n   ------------------------------------------------")
        site_name = site.get('name', 'Unnamed Site')
        site_url = site.get('url', 'No URL')
        print(f"   Site: {site_name} ({site_url})")
        print(f"   Role: {'Owner' if site.get('owner_id') == user['id'] else 'Collaborator'}")
        
        # 3. Find Pages
        pages = await db.pages.find({"website_id": site['id']}).to_list(100)
        print(f"   📄 Pages: {len(pages)}")
        
        for page in pages:
            # 4. Find Sections
            sections = await db.sections.find({"page_id": page['id']}).to_list(100)
            media_count = 0
            for section in sections:
                # 5. Check Media
                videos = await db.videos.count_documents({"section_id": section['id']})
                audios = await db.audios.count_documents({"section_id": section['id']})
                if videos > 0 or audios > 0:
                    media_count += 1
            
            print(f"      - {page.get('url', 'No URL')} ({len(sections)} sections, {media_count} with media)")

    # 6. Remove dawnena@icloud.com if exists
    print("\n🧹 Cleanup: Removing dawnena@icloud.com...")
    del_result = await db.users.delete_one({"email": "dawnena@icloud.com"})
    if del_result.deleted_count > 0:
        print("   ✅ Removed dawnena@icloud.com")
    else:
        print("   👌 User dawnena@icloud.com not found (already removed or never existed)")

    print("\n" + "=" * 60)
    print("✅ VERIFICATION COMPLETE")

if __name__ == "__main__":
    asyncio.run(main())
