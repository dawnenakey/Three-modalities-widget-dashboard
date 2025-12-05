"""
Setup script to populate production database with initial data
"""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
from uuid import uuid4
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def setup_production_data():
    mongo_url = os.environ.get('MONGO_URL')
    print(f"Connecting to database...")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client.pivot_db
    
    # Check if data already exists
    user_count = await db.users.count_documents({})
    if user_count > 0:
        print(f"⚠️  Database already has {user_count} users. Delete existing data first? (y/n)")
        response = input().strip().lower()
        if response != 'y':
            print("Aborting.")
            client.close()
            return
        
        # Clear existing data
        print("Clearing existing data...")
        await db.users.delete_many({})
        await db.websites.delete_many({})
        await db.pages.delete_many({})
        await db.sections.delete_many({})
        await db.videos.delete_many({})
        await db.audios.delete_many({})
        print("✓ Cleared")
    
    # 1. Create user account
    print("\n1. Creating user account...")
    user_email = "dawnena@dozanu.com"
    user_password = "password123"  # User should change this
    
    user_id = str(uuid4())
    hashed_password = pwd_context.hash(user_password)
    
    user = {
        "id": user_id,
        "email": user_email,
        "password": hashed_password,
        "role": "admin",
        "name": "Dawnena",
        "plan": "pro",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    print(f"✓ Created user: {user_email}")
    print(f"  Password: {user_password}")
    print(f"  User ID: {user_id}")
    
    # 2. Create website
    print("\n2. Creating website...")
    website_id = str(uuid4())
    
    website = {
        "id": website_id,
        "user_id": user_id,
        "owner_id": user_id,
        "collaborators": [],
        "name": "Demo PIVOT Site",
        "domain": "demo.gopivot.me",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.websites.insert_one(website)
    print(f"✓ Created website: demo.gopivot.me")
    print(f"  Website ID: {website_id}")
    
    # 3. Create page
    print("\n3. Creating page...")
    page_id = str(uuid4())
    
    page = {
        "id": page_id,
        "website_id": website_id,
        "url": "https://demo.gopivot.me/pivot-widget-test/",
        "title": "PIVOT Widget Test Page",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.pages.insert_one(page)
    print(f"✓ Created page: /pivot-widget-test/")
    print(f"  Page ID: {page_id}")
    
    # 4. Create sample sections
    print("\n4. Creating sample sections...")
    
    section1_id = str(uuid4())
    section1 = {
        "id": section1_id,
        "page_id": page_id,
        "title": "Welcome Section",
        "text": "Welcome to our PIVOT accessibility demo! This section demonstrates how we provide multiple modalities for content access.",
        "order": 1,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    section2_id = str(uuid4())
    section2 = {
        "id": section2_id,
        "page_id": page_id,
        "title": "Features Section",
        "text": "Our platform offers ASL video interpretation, text-to-speech audio, and text transcripts for every section of your content.",
        "order": 2,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    section3_id = str(uuid4())
    section3 = {
        "id": section3_id,
        "page_id": page_id,
        "title": "Getting Started",
        "text": "Click on any section to view the corresponding content in your preferred format. All modalities are synchronized for easy navigation.",
        "order": 3,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.sections.insert_many([section1, section2, section3])
    print(f"✓ Created 3 sections with text content")
    
    # Summary
    print("\n" + "="*60)
    print("✅ PRODUCTION DATABASE SETUP COMPLETE!")
    print("="*60)
    print(f"\n📧 Login Credentials:")
    print(f"   Email: {user_email}")
    print(f"   Password: {user_password}")
    print(f"\n🌐 Website created: demo.gopivot.me")
    print(f"📄 Page created: /pivot-widget-test/")
    print(f"📝 Sections: 3 sections with text content")
    print(f"\n⚠️  IMPORTANT: User should now:")
    print(f"   1. Login at testing.gopivot.me")
    print(f"   2. Navigate to the page and upload video/audio for each section")
    print(f"   3. The widget will then display content on the WordPress test page")
    print("\n" + "="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_production_data())
