#!/usr/bin/env python3
"""
Deep Inspect Tribal
-------------------
Finds the 'mytribal.ai' website and drills down to the video URL.
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
    print("🔍 INSPECTING 'mytribal.ai' DATA")
    print("=" * 60)

    # 1. Find Website
    # Search by URL or Name
    websites = await db.websites.find({
        "$or": [
            {"url": {"$regex": "mytribal", "$options": "i"}},
            {"name": {"$regex": "tribal", "$options": "i"}}
        ]
    }).to_list(100)
    
    if not websites:
        print("❌ No website found matching 'tribal'")
        return

    for site in websites:
        print(f"\n🌐 Website: {site.get('name')} ({site['id']})")
        print(f"   URL: {site.get('url')}")
        print(f"   Embed Code: {site.get('embed_code')[:100]}...")
        
        # 2. Find Page /start
        pages = await db.pages.find({"website_id": site['id']}).to_list(100)
        for page in pages:
            print(f"   📄 Page: {page.get('url')} ({page['id']})")
            
            # 3. Find Sections
            sections = await db.sections.find({"page_id": page['id']}).to_list(100)
            for section in sections:
                # 4. Find Videos
                videos = await db.videos.find({"section_id": section['id']}).to_list(100)
                if videos:
                    print(f"      📍 Section: {section.get('text_content', '')[:30]}...")
                    for vid in videos:
                        print(f"         📹 Video ID: {vid['id']}")
                        print(f"            URL: {vid['video_url']}")
                        print(f"            Key: {vid.get('file_path')}")
                        print(f"            Created: {vid.get('created_at')}")

if __name__ == "__main__":
    asyncio.run(main())
