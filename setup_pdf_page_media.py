#!/usr/bin/env python3
"""
Setup media for testing.gopivot.me/pdf page
Creates 4th section if needed and links all media
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

# Section content
SECTION_TEXTS = [
    "7000+ Spoken/Written | 300+ Signed | One Platform.",
    "PIVOT: The Future of Language Access Technology",
    "PIVOT is the first language access technology that embeds accessibility right where your information lives. No duplicate websites. No third-party dependencies. No expensive rebuilds.",
    "With a single line of code, PIVOT integrates seamlessly into your existing digital systems—instantly transforming them into inclusive, multilingual experiences."
]

async def setup_page():
    """Setup PDF page with 4 sections and media"""
    
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'pivot_accessibility')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 80)
    print("PDF PAGE SETUP - 4 SECTIONS WITH MEDIA")
    print("=" * 80)
    print()
    
    # Find the page with "PDF Resources" title or most sections
    pages = await db.pages.find(
        {'url': {'$regex': 'testing.gopivot.me/pdf', '$options': 'i'}},
        {'_id': 0}
    ).to_list(100)
    
    # Choose the page with most sections
    page = None
    max_sections = 0
    for p in pages:
        count = await db.sections.count_documents({'page_id': p['id']})
        if count > max_sections:
            max_sections = count
            page = p
    
    if not page:
        print("❌ No page found for testing.gopivot.me/pdf")
        client.close()
        return
    
    print(f"✅ Using page: {page.get('title', 'No title')} ({page['id']})")
    print(f"   URL: {page.get('url')}")
    
    # Get existing sections
    sections = await db.sections.find(
        {'page_id': page['id']},
        {'_id': 0}
    ).sort('position_order', 1).to_list(100)
    
    print(f"   Current sections: {len(sections)}")
    print()
    
    # Create missing sections
    if len(sections) < 4:
        print(f"📝 Creating {4 - len(sections)} missing sections...")
        for i in range(len(sections), 4):
            new_section = {
                "id": str(uuid4()),
                "page_id": page['id'],
                "position_order": i + 1,
                "text_content": SECTION_TEXTS[i],
                "selected_text": SECTION_TEXTS[i],
                "start_offset": 0,
                "end_offset": len(SECTION_TEXTS[i]),
                "videos_count": 0,
                "audio_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.sections.insert_one(new_section)
            sections.append(new_section)
            print(f"  ✅ Created section {i + 1}: {SECTION_TEXTS[i][:60]}...")
        print()
    
    # Re-fetch sections to ensure we have all 4
    sections = await db.sections.find(
        {'page_id': page['id']},
        {'_id': 0}
    ).sort('position_order', 1).limit(4).to_list(4)
    
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
    
    print("📹 Linking media to sections...")
    video_count = 0
    audio_count = 0
    
    for i, section in enumerate(sections):
        section_num = i + 1
        text_preview = section.get('selected_text', section.get('text_content', 'No text'))[:60]
        print(f"\nSection {section_num}: {text_preview}...")
        
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
            print(f"  📹 Video: ✅ Linked to R2")
        
        # Add audio
        audio_url = media_data[i]["audio"]
        existing_audio = await db.audios.find_one({
            "section_id": section['id'],
            "audio_url": audio_url
        }, {"_id": 0})
        
        if existing_audio:
            print(f"  🎵 Audio (English): Already linked")
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
            print(f"  🎵 Audio (English): ✅ Linked to R2")
    
    print()
    print("=" * 80)
    print("✅ SETUP COMPLETE!")
    print("=" * 80)
    print()
    print(f"📊 Summary:")
    print(f"  - Page: {page.get('url')}")
    print(f"  - Sections: 4")
    print(f"  - New videos linked: {video_count}")
    print(f"  - New audio files linked: {audio_count}")
    print()
    print("🎉 Visit testing.gopivot.me/pdf to see the widget with full content!")
    print("   The widget should now show ASL videos and audio for all 4 sections.")
    print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_page())
