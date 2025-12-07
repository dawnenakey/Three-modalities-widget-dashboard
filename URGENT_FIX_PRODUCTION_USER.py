#!/usr/bin/env python3
"""
URGENT: Ensure production user exists with correct password
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from passlib.context import CryptContext
import uuid
from pathlib import Path
from dotenv import load_dotenv

# Load backend .env
load_dotenv('/app/backend/.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def fix_production_user():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    print("🔧 URGENT PRODUCTION USER FIX")
    print("="*70)
    print(f"MongoDB: {mongo_url[:50]}...")
    print(f"Database: {db_name}\n")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    email = "dawnena@dozanu.com"
    password = "pivot2025"
    
    # Check if user exists
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user:
        print(f"✅ User exists: {email}")
        print(f"   ID: {user['id']}")
        
        # Update password to ensure it's correct
        hashed = pwd_context.hash(password)
        await db.users.update_one(
            {"email": email},
            {"$set": {"password": hashed}}
        )
        print(f"✅ Password updated for {email}")
        user_id = user['id']
        
    else:
        print(f"❌ User NOT FOUND: {email}")
        print(f"   Creating user now...")
        
        user_id = str(uuid.uuid4())
        hashed = pwd_context.hash(password)
        
        new_user = {
            "id": user_id,
            "email": email,
            "name": "Dawnena Admin",
            "password": hashed,
            "role": "super_admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(new_user)
        print(f"✅ Created user: {email}")
        print(f"   ID: {user_id}")
    
    # Ensure website exists for this user
    website_id = 'fe05622a-8043-41c7-958c-5c657a701fc1'
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    
    if website:
        print(f"\n✅ Website exists: {website.get('name')}")
        # Update owner
        await db.websites.update_one(
            {"id": website_id},
            {"$set": {"owner_id": user_id}}
        )
        print(f"   Owner updated to {user_id}")
    else:
        print(f"\n❌ Website NOT FOUND. Creating...")
        website_doc = {
            "id": website_id,
            "owner_id": user_id,
            "name": "Testing GoPIVOT ME",
            "url": "https://testing.gopivot.me",
            "embed_code": f'<script src="https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/widget.js" data-website-id="{website_id}"></script>',
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.websites.insert_one(website_doc)
        print(f"✅ Created website: {website_id}")
    
    print("\n" + "="*70)
    print("🎉 PRODUCTION FIX COMPLETE!")
    print("="*70)
    print(f"\n📋 Login Credentials:")
    print(f"   URL: https://testing.gopivot.me/login")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    print(f"\n✅ Try logging in now!")

asyncio.run(fix_production_user())
