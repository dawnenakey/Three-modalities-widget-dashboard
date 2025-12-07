#!/usr/bin/env python3
"""
Test database persistence to see if records are being deleted automatically
"""

import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def test_persistence():
    """Test if database records persist"""
    
    print("🧪 Testing Database Record Persistence")
    print("=" * 80)
    
    # Count existing records
    video_count_before = await db.videos.count_documents({})
    audio_count_before = await db.audios.count_documents({})
    
    print(f"\n📊 Current State:")
    print(f"   Videos in DB: {video_count_before}")
    print(f"   Audio in DB: {audio_count_before}")
    
    # Create a test video record
    test_video_id = str(uuid.uuid4())
    test_video = {
        "id": test_video_id,
        "section_id": "test-section-persistence",
        "language": "English",
        "video_url": f"/api/uploads/videos/test-{test_video_id}.mp4",
        "file_path": str(ROOT_DIR / "uploads" / "videos" / f"test-{test_video_id}.mp4"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    print(f"\n✍️  Creating test video record...")
    print(f"   ID: {test_video_id}")
    await db.videos.insert_one(test_video)
    print(f"   ✅ Record created successfully")
    
    # Wait a moment
    print(f"\n⏳ Waiting 2 seconds...")
    await asyncio.sleep(2)
    
    # Check if record still exists
    print(f"\n🔍 Checking if record persists...")
    found_video = await db.videos.find_one({"id": test_video_id}, {"_id": 0})
    
    if found_video:
        print(f"   ✅ Record FOUND - Database persistence is working!")
        print(f"   Details: {found_video.get('language')} - {found_video.get('video_url')}")
    else:
        print(f"   ❌ Record NOT FOUND - Database records are being deleted!")
        print(f"   This is the root cause of your video disappearing issue")
    
    # Wait longer
    print(f"\n⏳ Waiting 5 more seconds...")
    await asyncio.sleep(5)
    
    # Check again
    print(f"\n🔍 Checking again after 7 seconds total...")
    found_video_2 = await db.videos.find_one({"id": test_video_id}, {"_id": 0})
    
    if found_video_2:
        print(f"   ✅ Record STILL EXISTS - Good!")
    else:
        print(f"   ❌ Record DISAPPEARED - This confirms auto-deletion issue")
    
    # Count records again
    video_count_after = await db.videos.count_documents({})
    audio_count_after = await db.audios.count_documents({})
    
    print(f"\n📊 Final State:")
    print(f"   Videos in DB: {video_count_after} (was {video_count_before})")
    print(f"   Audio in DB: {audio_count_after} (was {audio_count_before})")
    
    # Clean up test record
    if found_video_2:
        print(f"\n🧹 Cleaning up test record...")
        await db.videos.delete_one({"id": test_video_id})
        print(f"   ✅ Test record removed")
    
    print("\n" + "=" * 80)
    print("✅ Test Complete")
    print("=" * 80)
    
    # Check for any TTL indexes that might auto-delete records
    print(f"\n🔍 Checking for TTL indexes (auto-delete mechanisms)...")
    video_indexes = await db.videos.index_information()
    audio_indexes = await db.audios.index_information()
    
    print(f"\n📑 Video Collection Indexes:")
    for index_name, index_info in video_indexes.items():
        print(f"   - {index_name}: {index_info}")
        if 'expireAfterSeconds' in str(index_info):
            print(f"     ⚠️  TTL INDEX FOUND - Records expire after {index_info.get('expireAfterSeconds', 'unknown')} seconds")
    
    print(f"\n📑 Audio Collection Indexes:")
    for index_name, index_info in audio_indexes.items():
        print(f"   - {index_name}: {index_info}")
        if 'expireAfterSeconds' in str(index_info):
            print(f"     ⚠️  TTL INDEX FOUND - Records expire after {index_info.get('expireAfterSeconds', 'unknown')} seconds")
    
    return found_video_2 is not None

if __name__ == "__main__":
    result = asyncio.run(test_persistence())
    if not result:
        print("\n⚠️  WARNING: Database records are not persisting!")
        print("   This is why your videos disappear after upload.")
    else:
        print("\n✅ Database persistence is working correctly.")
        print("   The issue may be intermittent or caused by external factors.")
