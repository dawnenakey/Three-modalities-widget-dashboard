#!/usr/bin/env python3
"""
Fix Password Script (Direct Bcrypt)
-----------------------------------
Updates the password for katherine@dozanu.com using the exact same
bcrypt logic as server.py to ensure compatibility.
"""

import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import bcrypt

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    """Exact same logic as server.py"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

async def fix_passwords():
    print("🔧 Fixing passwords with direct bcrypt...")
    
    password = "pivot2025"
    hashed_password = hash_password(password)
    
    target_emails = [
        "katherine@dozanu.com",
        "katherine+admin@dozanu.com",
        "dawnena@dozanu.com"
    ]
    
    for email in target_emails:
        user = await db.users.find_one({"email": email})
        if user:
            await db.users.update_one(
                {"email": email},
                {"$set": {"password": hashed_password}}
            )
            print(f"   ✅ Updated password for: {email}")
            
            # Verify immediately
            updated_user = await db.users.find_one({"email": email})
            stored_hash = updated_user['password']
            if bcrypt.checkpw(password.encode(), stored_hash.encode()):
                print(f"      Verified: Login should work now.")
            else:
                print(f"      ❌ Verification failed immediately!")
        else:
            print(f"   ⚠️ User not found: {email}")

if __name__ == "__main__":
    asyncio.run(fix_passwords())
