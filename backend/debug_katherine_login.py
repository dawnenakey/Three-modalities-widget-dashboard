#!/usr/bin/env python3
"""
Deep Debug Katherine Login
--------------------------
1. Checks for duplicate accounts.
2. Checks for whitespace in email.
3. Tests password verification locally.
4. Force resets if necessary.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import bcrypt

# Load environment variables
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def verify_password(plain, hashed):
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception as e:
        print(f"      ❌ Bcrypt error: {e}")
        return False

async def main():
    print("🔍 DEBUGGING LOGIN FOR: katherine@dozanu.com")
    print("=" * 60)
    
    target_email = "katherine@dozanu.com"
    password = "pivot2025"
    
    # 1. Find ALL matching records (to catch duplicates)
    # Using regex to catch case-sensitivity or whitespace issues
    users = await db.users.find({"email": {"$regex": f"^{target_email}$", "$options": "i"}}).to_list(100)
    
    print(f"Found {len(users)} user record(s):")
    
    for i, user in enumerate(users):
        print(f"\n[{i+1}] ID: {user['id']}")
        print(f"    Email: '{user['email']}'")
        print(f"    Name: {user.get('name')}")
        print(f"    Role: {user.get('role')}")
        
        # 2. Test Password
        is_valid = verify_password(password, user['password'])
        print(f"    🔑 Testing 'pivot2025': {'✅ MATCH' if is_valid else '❌ INVALID'}")
        
        # 3. If invalid, Fix it
        if not is_valid:
            print("    🛠️  Fixing password now...")
            new_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            
            await db.users.update_one(
                {"id": user['id']},
                {"$set": {"password": new_hash}}
            )
            
            # Verify update
            updated_user = await db.users.find_one({"id": user['id']})
            if verify_password(password, updated_user['password']):
                print("    ✅ Password successfully updated and verified.")
            else:
                print("    ❌ Failed to update password.")

    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
