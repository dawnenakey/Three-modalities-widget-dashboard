#!/usr/bin/env python3
"""
Find Page /start
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
    print("🔍 FINDING PAGE '/start'")
    
    pages = await db.pages.find({"url": {"$regex": "/start"}}).to_list(100)
    
    if not pages:
        print("❌ No pages found with '/start'")
        return

    for page in pages:
        print(f"\n📄 Page: {page['url']}")
        print(f"   ID: {page['id']}")
        print(f"   Website ID: {page['website_id']}")
        
        # Get Website
        site = await db.websites.find_one({"id": page['website_id']})
        print(f"   Website: {site.get('name') if site else 'Unknown'}")
        
        # Get Sections
        sections = await db.sections.find({"page_id": page['id']}).to_list(100)
        print(f"   Sections: {len(sections)}")
        
        for section in sections:
            videos = await db.videos.count_documents({"section_id": section['id']})
            print(f"      Section {section['position_order']}: {videos} videos")

if __name__ == "__main__":
    asyncio.run(main())
