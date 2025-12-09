#!/usr/bin/env python3
"""
Fix Embed Codes & Debug Video
-----------------------------
1. Updates all websites to use correct 'testing.gopivot.me' embed code.
2. Inspects the most recent video upload to debug playback issues.
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
    print("🚀 STARTING FIX & DEBUG SCRIPT")
    print("=" * 60)

    # 1. Fix Embed Codes
    print("\n🔧 Fixing Embed Codes for All Websites...")
    websites = await db.websites.find({}).to_list(1000)
    count = 0
    for site in websites:
        new_code = f'<script src="https://testing.gopivot.me/api/widget.js" data-website-id="{site["id"]}"></script>'
        if site.get('embed_code') != new_code:
            await db.websites.update_one(
                {"id": site["id"]},
                {"$set": {"embed_code": new_code}}
            )
            print(f"   ✅ Updated: {site.get('name', 'Unknown')}")
            count += 1
        else:
            print(f"   👌 Already Correct: {site.get('name', 'Unknown')}")
    
    print(f"   Summary: Updated {count} websites.")

    # 2. Debug Video URL
    print("\n🔍 Debugging Most Recent Video Upload...")
    # Get the most recently created video
    recent_video = await db.videos.find({}).sort("created_at", -1).limit(1).to_list(1)
    
    if recent_video:
        vid = recent_video[0]
        print(f"   ID: {vid['id']}")
        print(f"   Section ID: {vid['section_id']}")
        print(f"   Language: {vid['language']}")
        print(f"   Stored Video URL: {vid['video_url']}")
        print(f"   File Path/Key: {vid.get('file_path', 'N/A')}")
        
        # Check if URL looks valid
        if "s3.amazonaws.com" in vid['video_url']:
            print("   ✅ URL format appears correct (S3).")
        else:
            print("   ⚠️  URL format might be incorrect (not S3 standard).")
            
        print("\n   👉 Action: Try opening the Stored Video URL in a browser.")
        print("      If it downloads/plays, the file is good.")
        print("      If it says Access Denied, the S3 bucket is not public.")
        print("      If it plays in browser but not in dashboard -> CORS issue.")
    else:
        print("   ⚠️  No videos found in database.")

    print("\n" + "=" * 60)
    print("✅ DONE")

if __name__ == "__main__":
    asyncio.run(main())
