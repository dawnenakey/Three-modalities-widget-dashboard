#!/usr/bin/env python3
"""
Cleanup script to remove orphaned video/audio records from database
Run this after environment changes or file system cleanup
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

async def cleanup_orphaned_media():
    """Remove database records for videos/audio files that no longer exist on disk"""
    
    videos_removed = 0
    audios_removed = 0
    videos_kept = 0
    audios_kept = 0
    
    print("🔍 Scanning for orphaned media files...")
    print("=" * 60)
    
    # Check all videos
    print("\n📹 Checking videos...")
    videos = await db.videos.find({}, {"_id": 0}).to_list(10000)
    print(f"   Found {len(videos)} video records in database")
    
    for video in videos:
        file_path = Path(video.get('file_path', ''))
        if not file_path.exists():
            print(f"   ❌ Removing orphaned video: {video.get('id')} ({file_path.name})")
            await db.videos.delete_one({"id": video['id']})
            # Update section video count
            await db.sections.update_one(
                {"id": video['section_id']},
                {"$inc": {"videos_count": -1}}
            )
            videos_removed += 1
        else:
            videos_kept += 1
    
    # Check all audios
    print(f"\n🔊 Checking audio files...")
    audios = await db.audios.find({}, {"_id": 0}).to_list(10000)
    print(f"   Found {len(audios)} audio records in database")
    
    for audio in audios:
        file_path = Path(audio.get('file_path', ''))
        if not file_path.exists():
            print(f"   ❌ Removing orphaned audio: {audio.get('id')} ({file_path.name})")
            await db.audios.delete_one({"id": audio['id']})
            # Update section audio count
            await db.sections.update_one(
                {"id": audio['section_id']},
                {"$inc": {"audios_count": -1}}
            )
            audios_removed += 1
        else:
            audios_kept += 1
    
    print("\n" + "=" * 60)
    print("✅ Cleanup Complete!")
    print("=" * 60)
    print(f"📹 Videos: {videos_kept} kept, {videos_removed} removed")
    print(f"🔊 Audio:  {audios_kept} kept, {audios_removed} removed")
    print(f"📊 Total:  {videos_kept + audios_kept} kept, {videos_removed + audios_removed} removed")
    print("=" * 60)
    
    return {
        "videos_removed": videos_removed,
        "audios_removed": audios_removed,
        "videos_kept": videos_kept,
        "audios_kept": audios_kept
    }

if __name__ == "__main__":
    print("🧹 PIVOT Media Cleanup Utility")
    print("=" * 60)
    result = asyncio.run(cleanup_orphaned_media())
    print("\n✨ All orphaned records have been removed from the database.")
    print("   Users can now upload new videos without seeing old broken references.")
