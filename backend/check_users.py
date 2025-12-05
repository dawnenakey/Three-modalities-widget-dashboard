#!/usr/bin/env python3
"""
Check all users in database
"""

import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def check_users():
    """Check all users"""
    
    print("👥 Users in Database")
    print("=" * 80)
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(100)
    
    print(f"\nTotal Users: {len(users)}\n")
    
    for i, user in enumerate(users, 1):
        print(f"{i}. {user.get('name', 'No Name')}")
        print(f"   Email: {user.get('email', 'No Email')}")
        print(f"   ID: {user.get('id', 'No ID')}")
        
        # Count their websites
        website_count = await db.websites.count_documents({"owner_id": user.get('id')})
        print(f"   Websites: {website_count}")
        print()
    
    # Check specifically for demo user
    demo_user = await db.users.find_one({"email": "demo@pivot.com"}, {"_id": 0})
    
    if demo_user:
        print("✅ Demo user EXISTS")
    else:
        print("❌ Demo user NOT FOUND")
    
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(check_users())
