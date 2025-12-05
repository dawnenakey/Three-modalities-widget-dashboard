#!/usr/bin/env python3
"""
Check all media files and their status
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

async def check_all_media():
    """Check status of all media files"""
    
    print("📊 Media Status Report")
    print("=" * 80)
    
    # Get all sections with media
    sections = await db.sections.find({}, {"_id": 0}).to_list(1000)
    print(f"\n📄 Total Sections: {len(sections)}")
    
    sections_with_videos = [s for s in sections if s.get('videos_count', 0) > 0]
    sections_with_audio = [s for s in sections if s.get('audios_count', 0) > 0]
    
    print(f"   └─ Sections with videos: {len(sections_with_videos)}")
    print(f"   └─ Sections with audio: {len(sections_with_audio)}")
    
    # Check videos
    print(f"\n📹 Video Status:")
    videos = await db.videos.find({}, {"_id": 0}).to_list(10000)
    print(f"   Total video records: {len(videos)}")
    
    if videos:
        print(f"\n   Video Details:")
        for i, video in enumerate(videos, 1):
            file_path = Path(video.get('file_path', ''))
            exists = "✅" if file_path.exists() else "❌"
            size = file_path.stat().st_size if file_path.exists() else 0
            print(f"   {i}. {exists} {video.get('language', 'Unknown')} - {video.get('video_url', 'No URL')}")
            print(f"      File: {file_path}")
            print(f"      Size: {size} bytes")
            print(f"      Section ID: {video.get('section_id', 'Unknown')}")
    
    # Check audios
    print(f"\n🔊 Audio Status:")
    audios = await db.audios.find({}, {"_id": 0}).to_list(10000)
    print(f"   Total audio records: {len(audios)}")
    
    if audios:
        print(f"\n   Audio Details:")
        for i, audio in enumerate(audios, 1):
            file_path = Path(audio.get('file_path', ''))
            exists = "✅" if file_path.exists() else "❌"
            size = file_path.stat().st_size if file_path.exists() else 0
            print(f"   {i}. {exists} {audio.get('language', 'Unknown')} - {audio.get('audio_url', 'No URL')}")
            print(f"      File: {file_path}")
            print(f"      Size: {size} bytes")
            print(f"      Section ID: {audio.get('section_id', 'Unknown')}")
    
    # Check file system
    print(f"\n📁 File System Status:")
    video_dir = ROOT_DIR / 'uploads' / 'videos'
    audio_dir = ROOT_DIR / 'uploads' / 'audio'
    
    video_files = list(video_dir.glob('*')) if video_dir.exists() else []
    audio_files = list(audio_dir.glob('*')) if audio_dir.exists() else []
    
    print(f"   Videos on disk: {len(video_files)}")
    print(f"   Audio on disk: {len(audio_files)}")
    
    # Check for orphaned files (files without DB records)
    video_ids_in_db = {Path(v['file_path']).name for v in videos if v.get('file_path')}
    audio_ids_in_db = {Path(a['file_path']).name for a in audios if a.get('file_path')}
    
    orphaned_video_files = [f for f in video_files if f.name not in video_ids_in_db]
    orphaned_audio_files = [f for f in audio_files if f.name not in audio_ids_in_db]
    
    if orphaned_video_files:
        print(f"\n   ⚠️  Orphaned video files (no DB record):")
        for f in orphaned_video_files:
            print(f"      - {f.name} ({f.stat().st_size} bytes)")
    
    if orphaned_audio_files:
        print(f"\n   ⚠️  Orphaned audio files (no DB record):")
        for f in orphaned_audio_files:
            print(f"      - {f.name} ({f.stat().st_size} bytes)")
    
    print("\n" + "=" * 80)
    print("✅ Report Complete")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(check_all_media())
