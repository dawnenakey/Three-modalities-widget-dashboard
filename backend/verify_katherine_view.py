#!/usr/bin/env python3
"""
Verify View for Katherine
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
    print("🔍 VERIFYING VIEW FOR: katherine@dozanu.com")
    print("=" * 60)
    
    # 1. Get User
    user = await db.users.find_one({"email": "katherine@dozanu.com"})
    if not user:
        print("❌ User katherine@dozanu.com not found!")
        return
    
    print(f"User ID: {user['id']}")
    
    # 2. Find Websites she can see (Owner OR Collaborator)
    # This matches the query in server.py: get_websites()
    websites = await db.websites.find({
        "$or": [
            {"owner_id": user['id']},
            {"collaborators": user['id']}
        ]
    }).to_list(100)
    
    print(f"\n🌐 She has access to {len(websites)} Websites:")
    
    target_found = False
    
    for site in websites:
        # Check specifically for the PDF/DDS site
        is_target = "gopivot.me" in site.get('url', '') or "PDF" in site.get('name', '')
        marker = "⭐ " if is_target else "   "
        
        print(f"\n{marker}Site: {site.get('name')} ({site.get('url')})")
        print(f"   Role: {'Owner' if site['owner_id'] == user['id'] else 'Collaborator'}")
        
        # 3. Find Pages
        pages = await db.pages.find({"website_id": site['id']}).to_list(100)
        if pages:
            print(f"   📄 Pages ({len(pages)}):")
            for page in pages:
                # 4. Count Sections
                section_count = await db.sections.count_documents({"page_id": page['id']})
                
                # Check for PDF/DDS pages
                page_marker = "   "
                if "/pdf" in page.get('url', '') or "/dds" in page.get('url', ''):
                    page_marker = "👉 "
                    if is_target: target_found = True
                
                print(f"   {page_marker}- {page.get('url')} ({section_count} sections)")
        else:
            print("   📄 No pages")

    print("\n" + "=" * 60)
    if target_found:
        print("✅ VERIFIED: Katherine can see the /pdf and /dds pages.")
    else:
        print("❌ WARNING: Could not find /pdf or /dds pages in Katherine's view.")

if __name__ == "__main__":
    asyncio.run(main())
