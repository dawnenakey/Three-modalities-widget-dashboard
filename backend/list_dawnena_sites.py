#!/usr/bin/env python3
"""
List Dawnena's Websites
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
    print("🔍 FINDING WEBSITES FOR dawnena@dozanu.com")
    
    # Get user ID
    user = await db.users.find_one({"email": "dawnena@dozanu.com"})
    if not user:
        print("❌ User not found")
        return
    
    print(f"User ID: {user['id']}")
    
    # Find websites
    websites = await db.websites.find({"owner_id": user['id']}).to_list(100)
    for site in websites:
        print(f"\n🌐 Name: {site.get('name')}")
        print(f"   URL: {site.get('url')}")
        print(f"   ID: {site['id']}")
        print(f"   Embed Code: {site.get('embed_code')}")

if __name__ == "__main__":
    asyncio.run(main())
