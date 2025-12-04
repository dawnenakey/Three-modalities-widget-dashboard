#!/usr/bin/env python3
"""
Verify upload integrity and ensure files and database are in sync
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

async def verify_and_fix():
    """Verify upload integrity and recreate missing database records"""
    
    print("🔍 PIVOT Upload Integrity Check")
    print("=" * 80)
    
    video_dir = ROOT_DIR / 'uploads' / 'videos'
    audio_dir = ROOT_DIR / 'uploads' / 'audio'
    
    # Get all files on disk
    video_files = list(video_dir.glob('*')) if video_dir.exists() else []
    audio_files = list(audio_dir.glob('*')) if audio_dir.exists() else []
    
    print(f"\n📁 Files on Disk:")
    print(f"   Videos: {len(video_files)}")
    print(f"   Audio: {len(audio_files)}")
    
    # Get all database records
    db_videos = await db.videos.find({}, {"_id": 0}).to_list(10000)
    db_audios = await db.audios.find({}, {"_id": 0}).to_list(10000)
    
    print(f"\n💾 Records in Database:")
    print(f"   Videos: {len(db_videos)}")
    print(f"   Audio: {len(db_audios)}")
    
    # Find files without database records (orphaned files)
    db_video_files = {Path(v['file_path']).name for v in db_videos if v.get('file_path')}
    db_audio_files = {Path(a['file_path']).name for a in db_audios if a.get('file_path')}
    
    orphaned_videos = [f for f in video_files if f.name not in db_video_files]
    orphaned_audios = [f for f in audio_files if f.name not in db_audio_files]
    
    # Find database records without files (broken references)
    broken_video_refs = [v for v in db_videos if not Path(v.get('file_path', '')).exists()]
    broken_audio_refs = [a for a in db_audios if not Path(a.get('file_path', '')).exists()]
    
    print(f"\n⚠️  Issues Found:")
    print(f"   Orphaned video files (no DB record): {len(orphaned_videos)}")
    print(f"   Orphaned audio files (no DB record): {len(orphaned_audios)}")
    print(f"   Broken video references (file missing): {len(broken_video_refs)}")
    print(f"   Broken audio references (file missing): {len(broken_audio_refs)}")
    
    if orphaned_videos:
        print(f"\n📹 Orphaned Video Files:")
        for f in orphaned_videos:
            print(f"   - {f.name} ({f.stat().st_size} bytes, created: {f.stat().st_mtime})")
    
    if orphaned_audios:
        print(f"\n🔊 Orphaned Audio Files:")
        for f in orphaned_audios:
            print(f"   - {f.name} ({f.stat().st_size} bytes, created: {f.stat().st_mtime})")
    
    if broken_video_refs:
        print(f"\n❌ Broken Video References (should be cleaned up):")
        for v in broken_video_refs:
            print(f"   - ID: {v.get('id')}, Section: {v.get('section_id')}, File: {Path(v.get('file_path', '')).name}")
    
    if broken_audio_refs:
        print(f"\n❌ Broken Audio References (should be cleaned up):")
        for a in broken_audio_refs:
            print(f"   - ID: {a.get('id')}, Section: {a.get('section_id')}, File: {Path(a.get('file_path', '')).name}")
    
    print("\n" + "=" * 80)
    print("✅ Integrity Check Complete")
    print("=" * 80)
    
    # Recommendations
    if broken_video_refs or broken_audio_refs:
        print("\n💡 Recommendation: Run cleanup_orphaned_media.py to remove broken references")
    
    if orphaned_videos or orphaned_audios:
        print("\n💡 Recommendation: Orphaned files can be safely deleted or associated with sections manually")
    
    return {
        "orphaned_videos": len(orphaned_videos),
        "orphaned_audios": len(orphaned_audios),
        "broken_video_refs": len(broken_video_refs),
        "broken_audio_refs": len(broken_audio_refs)
    }

if __name__ == "__main__":
    asyncio.run(verify_and_fix())
