#!/usr/bin/env python3
"""
Setup script to create the demo website with pre-defined ID
for testing.gopivot.me/dds and testing.gopivot.me/pdf pages
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

async def setup_demo_website():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client['pivot_db']
    
    # Pre-defined website ID that matches the DDS and PDF pages
    website_id = 'fe05622a-8043-41c7-958c-5c657a701fc1'
    admin_email = 'dawnena+admin@dozanu.com'
    
    print("🚀 Setting up demo website...")
    print(f"   Website ID: {website_id}")
    print(f"   Owner: {admin_email}")
    
    # Check if website already exists
    existing = await db.websites.find_one({"id": website_id})
    if existing:
        print(f"\n⚠️  Website already exists!")
        print(f"   Name: {existing.get('name')}")
        return website_id
    
    # Create website
    website = {
        "id": website_id,
        "name": "Testing GoPIVOT ME",
        "url": "https://testing.gopivot.me",
        "owner_email": admin_email,
        "collaborators": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "status": "active"
    }
    
    await db.websites.insert_one(website)
    print(f"\n✅ Website created: {website['name']}")
    
    # Create page for /pdf
    page_pdf = {
        "id": "pdf-page-001",
        "website_id": website_id,
        "name": "PDF Demo Page",
        "url": "https://testing.gopivot.me/pdf",
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.pages.insert_one(page_pdf)
    print(f"✅ Page created: {page_pdf['name']} ({page_pdf['url']})")
    
    # Create page for /dds
    page_dds = {
        "id": "dds-page-001",
        "website_id": website_id,
        "name": "DDS Language Resources",
        "url": "https://testing.gopivot.me/dds",
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.pages.insert_one(page_dds)
    print(f"✅ Page created: {page_dds['name']} ({page_dds['url']})")
    
    print("\n" + "="*60)
    print("🎉 Setup Complete!")
    print("="*60)
    print(f"\n📋 Next Steps:")
    print(f"   1. Log in to dashboard: https://testing.gopivot.me")
    print(f"   2. Go to 'Websites' and find '{website['name']}'")
    print(f"   3. Click on the website to view pages")
    print(f"   4. Click on 'PDF Demo Page' or 'DDS Language Resources'")
    print(f"   5. Add sections and upload ASL videos, audio, and text")
    print(f"\n🔗 Widget will work on:")
    print(f"   - https://testing.gopivot.me/pdf")
    print(f"   - https://testing.gopivot.me/dds")
    print(f"\n✨ Widget ID: {website_id}")
    
    return website_id

if __name__ == "__main__":
    asyncio.run(setup_demo_website())
