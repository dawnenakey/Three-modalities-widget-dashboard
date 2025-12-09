#!/usr/bin/env python3
"""
RESTORE ACCESS V2 & DIAGNOSTIC
------------------------------
1. Checks for dawnena@icloud.com vs dawnena@dozanu.com
2. Ensures both have accounts.
3. Resets passwords to 'pivot2025'.
4. Lists websites to verify content presence.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import bcrypt
from datetime import datetime, timezone
import uuid

# Load environment variables
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

async def restore_access():
    print("🚀 RESTORING ACCESS & DIAGNOSING")
    print("=" * 60)
    
    password = "pivot2025"
    hashed_password = hash_password(password)
    
    users_to_check = [
        "katherine@dozanu.com",
        "dawnena@dozanu.com",
        "dawnena@icloud.com"  # The one user asked about
    ]
    
    # 1. Fix/Create Users
    print("\n👤 Checking Users...")
    
    # We need to find the "main" account that holds the data (likely dawnena@dozanu.com from previous restore)
    main_owner = await db.users.find_one({"email": "dawnena@dozanu.com"})
    
    for email in users_to_check:
        user = await db.users.find_one({"email": email})
        
        if user:
            print(f"   ✅ Found existing: {email}")
            # Update password
            await db.users.update_one(
                {"email": email},
                {"$set": {"password": hashed_password}}
            )
            print(f"      🔑 Password reset to '{password}'")
        else:
            print(f"   ⚠️  Missing: {email} - Creating now...")
            new_user_id = str(uuid.uuid4())
            new_user = {
                "id": new_user_id,
                "email": email,
                "name": email.split('@')[0].capitalize(),
                "password": hashed_password,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "role": "admin"
            }
            await db.users.insert_one(new_user)
            print(f"      ✅ Created user: {email} (ID: {new_user_id})")
            user = new_user # For later use

    # 2. Ensure Access to Content
    print("\n🌐 Verifying Content Access...")
    
    # Get all websites
    websites = await db.websites.find({}).to_list(100)
    
    # Get user IDs for mapping
    user_map = {}
    for email in users_to_check:
        u = await db.users.find_one({"email": email})
        if u:
            user_map[email] = u['id']
            
    print(f"   User IDs: {user_map}")

    for site in websites:
        print(f"\n   Site: {site.get('name')} ({site['id']})")
        print(f"   Owner: {site.get('owner_id')}")
        
        # Ensure katherine and dawnena(s) are collaborators if they aren't owners
        owner_id = site.get('owner_id')
        collaborators = site.get('collaborators', [])
        
        updated_collabs = False
        for email, uid in user_map.items():
            if uid != owner_id and uid not in collaborators:
                collaborators.append(uid)
                updated_collabs = True
                print(f"      ➕ Adding {email} as collaborator")
        
        if updated_collabs:
            await db.websites.update_one(
                {"id": site['id']},
                {"$set": {"collaborators": collaborators}}
            )
            print("      ✅ Updated collaborators")
            
        # Verify Pages
        page_count = await db.pages.count_documents({"website_id": site['id']})
        print(f"      📄 Pages: {page_count}")

    print("\n" + "=" * 60)
    print("✅ ACCESS RESTORED")
    print("   Try logging in with 'pivot2025' for ALL accounts.")

if __name__ == "__main__":
    asyncio.run(restore_access())
