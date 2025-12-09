#!/usr/bin/env python3
"""
Dump Recent Videos
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
    print("🔍 RECENT VIDEOS")
    
    videos = await db.videos.find({}).sort("created_at", -1).limit(5).to_list(5)
    
    for vid in videos:
        print(f"\n📹 Video ID: {vid['id']}")
        print(f"   URL: {vid['video_url']}")
        print(f"   Created: {vid.get('created_at')}")
        print(f"   Section ID: {vid['section_id']}")

if __name__ == "__main__":
    asyncio.run(main())
