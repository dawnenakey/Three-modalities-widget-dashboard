#!/usr/bin/env python3
"""
Quick script to link 4 section media files from R2 to database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

async def link_media():
    """Link media files to first 4 sections of PDF page"""
    
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'pivot_accessibility')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 80)
    print("QUICK MEDIA LINK - 4 SECTIONS")
    print("=" * 80)
    print()
    
    # Find page with 'pdf' in URL
    page = await db.pages.find_one(
        {"url": {"$regex": "pdf", "$options": "i"}},
        {"_id": 0}
    )
    
    if not page:
        print("❌ Page with 'pdf' in URL not found!")
        client.close()
        return
    
    print(f"✅ Found page: {page.get('url', page.get('title', 'PDF page'))}")
    
    # Get first 4 sections
    sections = await db.sections.find(
        {"page_id": page['id']},
        {"_id": 0}
    ).sort("position_order", 1).limit(4).to_list(4)
    
    if len(sections) < 4:
        print(f"❌ Only found {len(sections)} sections. Need at least 4.")
        client.close()
        return
    
    print(f"✅ Found {len(sections)} sections")
    print()
    
    # Media URLs
    media_data = [
        {
            "video": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/videos/1_PIVOT-InformativePDF2025.MOV",
            "audio": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/audio/PIVOT-PDF_1_Text_to_Speech_English_audio.mp3"
        },
        {
            "video": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/videos/2_PIVOT-InformativePDF2025.MOV",
            "audio": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/audio/PIVOT-PDF_2_Text_to_Speech_English_audio.mp3"
        },
        {
            "video": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/videos/3_PIVOT-InformativePDF2025.MOV",
            "audio": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/audio/PIVOT-PDF_3_Text_to_Speech_English_audio.mp3"
        },
        {
            "video": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/videos/4_PIVOT-InformativePDF2025.MOV",
            "audio": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/audio/PIVOT-PDF_4_Text_to_Speech_English_audio.mp3"
        }
    ]
    
    video_count = 0
    audio_count = 0
    
    for i, section in enumerate(sections):
        section_num = i + 1
        print(f"Section {section_num}:")
        text_preview = section.get('selected_text', section.get('text_content', 'No text'))[:60]
        print(f"  Text: {text_preview}...")
        
        # Add video
        video_url = media_data[i]["video"]
        existing_video = await db.videos.find_one({
            "section_id": section['id'],
            "video_url": video_url
        }, {"_id": 0})
        
        if existing_video:
            print(f"  📹 Video: Already linked")
        else:
            video = {
                "id": str(uuid4()),
                "section_id": section['id'],
                "language": "ASL (American Sign Language)",
                "video_url": video_url,
                "file_path": f"videos/{section_num}_PIVOT-InformativePDF2025.MOV",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.videos.insert_one(video)
            video_count += 1
            print(f"  📹 Video: ✅ Linked")
        
        # Add audio
        audio_url = media_data[i]["audio"]
        existing_audio = await db.audios.find_one({
            "section_id": section['id'],
            "audio_url": audio_url
        }, {"_id": 0})
        
        if existing_audio:
            print(f"  🎵 Audio: Already linked")
        else:
            audio = {
                "id": str(uuid4()),
                "section_id": section['id'],
                "language": "English",
                "audio_url": audio_url,
                "file_path": f"audio/PIVOT-PDF_{section_num}_Text_to_Speech_English_audio.mp3",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.audios.insert_one(audio)
            audio_count += 1
            print(f"  🎵 Audio: ✅ Linked")
        
        print()
    
    print("=" * 80)
    print("✅ MEDIA LINKING COMPLETE!")
    print("=" * 80)
    print()
    print(f"📊 New media linked:")
    print(f"  - Videos: {video_count}")
    print(f"  - Audio files: {audio_count}")
    print()
    print("🎉 Visit testing.gopivot.me/pdf to see the widget with content!")
    print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(link_media())
