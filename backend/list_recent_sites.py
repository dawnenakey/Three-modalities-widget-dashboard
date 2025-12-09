#!/usr/bin/env python3
"""
List Recent Websites
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
    print("🔍 FINDING MOST RECENT WEBSITES")
    
    websites = await db.websites.find({}).sort("created_at", -1).limit(5).to_list(5)
    for site in websites:
        print(f"\n🌐 Name: {site.get('name')}")
        print(f"   URL: {site.get('url')}")
        print(f"   Owner ID: {site.get('owner_id')}")
        print(f"   ID: {site['id']}")
        
        # Check pages
        pages = await db.pages.find({"website_id": site['id']}).to_list(5)
        for p in pages:
            print(f"   📄 Page: {p.get('url')}")

if __name__ == "__main__":
    asyncio.run(main())
