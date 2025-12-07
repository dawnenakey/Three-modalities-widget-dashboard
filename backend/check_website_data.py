#!/usr/bin/env python3
"""
Check website data for user dawnena@dozanu.com
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

async def check_data():
    """Check data for specific user"""
    
    # Find user
    user = await db.users.find_one({"email": "dawnena@dozanu.com"}, {"_id": 0})
    if not user:
        print("User not found!")
        return
    
    print(f"✅ User: {user['name']} ({user['email']})")
    print(f"   User ID: {user['id']}")
    
    # Get websites
    websites = await db.websites.find({"owner_id": user['id']}, {"_id": 0}).to_list(100)
    print(f"\n📊 Websites: {len(websites)}")
    
    for website in websites:
        print(f"\n  Website: {website['name']}")
        print(f"  ID: {website['id']}")
        print(f"  URL: {website.get('url', 'N/A')}")
        
        # Get pages for this website
        pages = await db.pages.find({"website_id": website['id']}, {"_id": 0}).to_list(100)
        print(f"  Pages: {len(pages)}")
        
        for page in pages:
            sections = await db.sections.find({"page_id": page['id']}, {"_id": 0}).to_list(100)
            videos_count = sum(s.get('videos_count', 0) for s in sections)
            audios_count = sum(s.get('audios_count', 0) for s in sections)
            
            print(f"    - {page.get('url', 'No URL')}: {len(sections)} sections, {videos_count} videos, {audios_count} audio")

if __name__ == "__main__":
    asyncio.run(check_data())
