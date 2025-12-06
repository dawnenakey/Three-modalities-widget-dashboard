#!/usr/bin/env python3
"""
URGENT FIX: Create the website with proper structure for dawnena@dozanu.com
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

# Load environment
ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

async def create_website_NOW():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    website_id = 'fe05622a-8043-41c7-958c-5c657a701fc1'
    
    # Get user
    user = await db.users.find_one({"email": "dawnena@dozanu.com"}, {"_id": 0})
    if not user:
        print("❌ User not found")
        return
    
    print(f"✅ User: {user['email']} (ID: {user['id']})")
    
    # Update or create website
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    
    if website:
        # Update to ensure correct structure
        await db.websites.update_one(
            {"id": website_id},
            {"$set": {
                "owner_id": user['id'],
                "name": "Testing GoPIVOT ME",
                "url": "https://testing.gopivot.me",
                "embed_code": f'<script src="https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/widget.js" data-website-id="{website_id}"></script>',
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        print(f"✅ Updated website: {website_id}")
    else:
        # Create new
        website_doc = {
            "id": website_id,
            "owner_id": user['id'],
            "name": "Testing GoPIVOT ME",
            "url": "https://testing.gopivot.me",
            "embed_code": f'<script src="https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/widget.js" data-website-id="{website_id}"></script>',
            "image_url": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.websites.insert_one(website_doc)
        print(f"✅ Created website: {website_id}")
    
    # Ensure pages exist
    page_dds = await db.pages.find_one({"website_id": website_id, "url": "https://testing.gopivot.me/dds"}, {"_id": 0})
    if not page_dds:
        page_doc = {
            "id": "dds-page-001",
            "website_id": website_id,
            "name": "DDS Language Resources",
            "url": "https://testing.gopivot.me/dds",
            "status": "published",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.pages.insert_one(page_doc)
        print(f"✅ Created DDS page")
    
    page_pdf = await db.pages.find_one({"website_id": website_id, "url": "https://testing.gopivot.me/pdf"}, {"_id": 0})
    if not page_pdf:
        page_doc = {
            "id": "pdf-page-001",
            "website_id": website_id,
            "name": "PDF Demo Page",
            "url": "https://testing.gopivot.me/pdf",
            "status": "published",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.pages.insert_one(page_doc)
        print(f"✅ Created PDF page")
    
    print("\n" + "="*60)
    print("🎉 READY TO USE!")
    print("="*60)
    print(f"\n1. Refresh your dashboard at https://testing.gopivot.me")
    print(f"2. You should see 'Testing GoPIVOT ME' website")
    print(f"3. Click on it to see 2 pages: DDS and PDF")
    print(f"4. Click on a page, then click 'Add Section'")
    print(f"5. Enter text, upload ASL video and audio")
    print(f"\nWebsite ID: {website_id}")

asyncio.run(create_website_NOW())
