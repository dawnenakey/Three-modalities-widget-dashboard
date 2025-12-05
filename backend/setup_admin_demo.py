#!/usr/bin/env python3
"""
Setup admin accounts and demo websites
"""

import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid
from passlib.context import CryptContext

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def setup_admins_and_demo():
    """Create admin accounts and demo websites"""
    
    print("🚀 Setting Up Admin Accounts & Demo Websites")
    print("=" * 80)
    
    # Admin emails
    admin_emails = [
        ("katherine@dozanu.com", "Katherine"),
        ("dawnena@dozanu.com", "Dawnena"),
        ("michelle@dozanu.com", "Michelle")
    ]
    
    password = "pivot2025"
    hashed_password = pwd_context.hash(password)
    
    admin_ids = []
    
    print("\n👥 Creating Admin Accounts...")
    for email, name in admin_emails:
        # Check if user exists
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing:
            print(f"   ⚠️  {name} ({email}) - Already exists")
            admin_ids.append(existing['id'])
        else:
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "email": email,
                "name": name,
                "password": hashed_password,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "role": "admin"  # Mark as admin
            }
            await db.users.insert_one(user)
            admin_ids.append(user_id)
            print(f"   ✅ Created {name} ({email})")
    
    print(f"\n📊 Total Admin Accounts: {len(admin_ids)}")
    
    # Create shared demo websites under first admin (dawnena)
    dawnena_id = admin_ids[1]  # dawnena@dozanu.com
    
    print(f"\n🌐 Creating Demo Websites (Owner: dawnena@dozanu.com)...")
    
    # Demo Website 1: PDF
    pdf_website_id = str(uuid.uuid4())
    pdf_website = {
        "id": pdf_website_id,
        "owner_id": dawnena_id,
        "name": "PIVOT PDF Demo",
        "url": "testing.gopivot.me/pdf",
        "image_url": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "collaborators": admin_ids  # All 3 admins can access
    }
    
    existing_pdf = await db.websites.find_one({"url": "testing.gopivot.me/pdf"}, {"_id": 0})
    if existing_pdf:
        print(f"   ⚠️  PDF Demo website already exists")
        pdf_website_id = existing_pdf['id']
    else:
        await db.websites.insert_one(pdf_website)
        print(f"   ✅ Created PDF Demo website")
    
    # Demo Website 2: California DDS
    dds_website_id = str(uuid.uuid4())
    dds_website = {
        "id": dds_website_id,
        "owner_id": dawnena_id,
        "name": "California DDS Demo",
        "url": "testing.gopivot.me/internal-dds-duplicate/",
        "image_url": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "collaborators": admin_ids  # All 3 admins can access
    }
    
    existing_dds = await db.websites.find_one({"url": "testing.gopivot.me/internal-dds-duplicate/"}, {"_id": 0})
    if existing_dds:
        print(f"   ⚠️  DDS Demo website already exists")
        dds_website_id = existing_dds['id']
    else:
        await db.websites.insert_one(dds_website)
        print(f"   ✅ Created California DDS Demo website")
    
    print("\n" + "=" * 80)
    print("✅ Setup Complete!")
    print("=" * 80)
    print("\n📋 Admin Credentials:")
    for email, name in admin_emails:
        print(f"   {name}: {email} / pivot2025")
    
    print("\n🌐 Demo Websites:")
    print(f"   1. PDF Demo: {pdf_website_id}")
    print(f"   2. California DDS: {dds_website_id}")
    
    print("\n📝 Next Steps:")
    print("   1. Scrape content from demo.gopivot.me/pdf")
    print("   2. Scrape content from demo.gopivot.me/internal-dds-duplicate/")
    print("   3. Generate AI audio for sections")
    print("   4. Admin users upload ASL videos")
    
    return {
        "admin_ids": admin_ids,
        "pdf_website_id": pdf_website_id,
        "dds_website_id": dds_website_id
    }

if __name__ == "__main__":
    result = asyncio.run(setup_admins_and_demo())
    print("\n✨ All admin accounts ready to login!")
