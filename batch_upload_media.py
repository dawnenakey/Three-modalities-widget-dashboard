#!/usr/bin/env python3
"""
Batch Media Upload Script
Quickly add multiple videos and audio files to the database
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

async def batch_add_media():
    """Add all media files to the PDF page"""
    
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'pivot_accessibility')
    r2_public_url = os.getenv('R2_PUBLIC_URL', 'https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 80)
    print("BATCH MEDIA UPLOAD FOR testing.gopivot.me/pdf")
    print("=" * 80)
    print()
    
    # Find the Testing GoPivot website
    website = await db.websites.find_one({"name": {"$regex": "Testing.*GoPivot", "$options": "i"}}, {"_id": 0})
    if not website:
        print("❌ Testing GoPivot website not found!")
        return
    
    print(f"✅ Found website: {website['name']}")
    
    # Find the PDF page
    page = await db.pages.find_one({
        "website_id": website['id'],
        "url": {"$regex": "testing.gopivot.me/pdf", "$options": "i"}
    }, {"_id": 0})
    
    if not page:
        print("❌ PDF page not found!")
        return
    
    print(f"✅ Found page: {page.get('url', 'PDF page')}")
    
    # Get all sections
    sections = await db.sections.find({"page_id": page['id']}, {"_id": 0}).to_list(100)
    print(f"✅ Found {len(sections)} sections")
    print()
    
    if not sections:
        print("❌ No sections found! Please create sections first.")
        return
    
    # Show sections
    print("Available Sections:")
    for i, section in enumerate(sections, 1):
        text_preview = section.get('selected_text', section.get('text_content', 'No text'))[:50]
        print(f"  {i}. {text_preview}...")
    print()
    
    # Video files from R2
    videos = [
        ("10_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("11_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("12_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("13_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("14_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("15_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("16_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("17_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("18_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("19_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("1_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("20_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("21_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("22_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("23_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("24_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
        ("25_PIVOT-Informative-PDF2025.MOV", "American Sign Language"),
    ]
    
    # Audio files from R2
    audios_section_1 = [
        ("PIVOT-PDF-1_Text_to_Speech_Chinese_audio.mp3", "Chinese"),
        ("PIVOT-PDF-1_Text_to_Speech_English_audio.mp3", "English"),
        ("PIVOT-PDF-1_Text_to_Speech_Portuguese_audio.mp3", "Portuguese"),
        ("PIVOT-PDF-1_Text_to_Speech_Spanish_audio.mp3", "Spanish"),
        ("PIVOT-PDF-1_Text_to_Speech_Vietnamese_audio.mp3", "Vietnamese"),
    ]
    
    audios_section_2 = [
        ("PIVOT-PDF-2_Text_to_Speech_Chinese_audio.mp3", "Chinese"),
        ("PIVOT-PDF-2_Text_to_Speech_English_audio.mp3", "English"),
        ("PIVOT-PDF-2_Text_to_Speech_Portuguese_audio.mp3", "Portuguese"),
        ("PIVOT-PDF-2_Text_to_Speech_Spanish_audio.mp3", "Spanish"),
        ("PIVOT-PDF-2_Text_to_Speech_Vietnamese_audio.mp3", "Vietnamese"),
    ]
    
    audios_section_3 = [
        ("PIVOT-PDF-3_Text_to_Speech_Chinese_audio.mp3", "Chinese"),
        ("PIVOT-PDF-3_Text_to_Speech_English_audio.mp3", "English"),
        ("PIVOT-PDF-3_Text_to_Speech_Portuguese_audio.mp3", "Portuguese"),
        ("PIVOT-PDF-3_Text_to_Speech_Spanish_audio.mp3", "Spanish"),
        ("PIVOT-PDF-3_Text_to_Speech_Vietnamese_audio.mp3", "Vietnamese"),
    ]
    
    audios_section_4 = [
        ("PIVOT-PDF-4_Text_to_Speech_Chinese_audio.mp3", "Chinese"),
        ("PIVOT-PDF-4_Text_to_Speech_English_audio.mp3", "English"),
        ("PIVOT-PDF-4_Text_to_Speech_Portuguese_audio.mp3", "Portuguese"),
        ("PIVOT-PDF-4_Text_to_Speech_Spanish_audio.mp3", "Spanish"),
        ("PIVOT-PDF-4_Text_to_Speech_Vietnamese_audio.mp3", "Vietnamese"),
    ]
    
    # Map videos to sections (1:1 mapping for first 17 sections)
    print("📹 Adding Videos...")
    for i, (video_filename, language) in enumerate(videos):
        if i >= len(sections):
            print(f"  ⚠️  Skipping {video_filename} - not enough sections")
            continue
        
        section = sections[i]
        video_url = f"{r2_public_url}/videos/{video_filename}"
        
        # Check if video already exists
        existing = await db.videos.find_one({"section_id": section['id'], "video_url": video_url}, {"_id": 0})
        if existing:
            print(f"  ⏭️  Section {i+1}: Video already exists")
            continue
        
        video = {
            "id": str(uuid4()),
            "section_id": section['id'],
            "language": language,
            "video_url": video_url,
            "file_path": f"videos/{video_filename}",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.videos.insert_one(video)
        print(f"  ✅ Section {i+1}: Added {video_filename}")
    
    # Add audios to first 4 sections
    print("\n🎵 Adding Audio Files...")
    audio_mapping = [
        (0, audios_section_1),
        (1, audios_section_2),
        (2, audios_section_3),
        (3, audios_section_4),
    ]
    
    for section_idx, audio_list in audio_mapping:
        if section_idx >= len(sections):
            continue
        
        section = sections[section_idx]
        print(f"\n  Section {section_idx+1}:")
        
        for audio_filename, language in audio_list:
            audio_url = f"{r2_public_url}/audios/{audio_filename}"
            
            # Check if audio already exists
            existing = await db.audios.find_one({"section_id": section['id'], "audio_url": audio_url}, {"_id": 0})
            if existing:
                print(f"    ⏭️  {language}: Already exists")
                continue
            
            audio = {
                "id": str(uuid4()),
                "section_id": section['id'],
                "language": language,
                "audio_url": audio_url,
                "file_path": f"audios/{audio_filename}",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.audios.insert_one(audio)
            print(f"    ✅ {language}: Added")
    
    print("\n" + "=" * 80)
    print("✅ BATCH UPLOAD COMPLETE!")
    print("=" * 80)
    print()
    print("📊 Summary:")
    print(f"  - Videos added to {min(len(videos), len(sections))} sections")
    print(f"  - Audio files added to 4 sections (5 languages each)")
    print()
    print("🎉 Check your dashboard and widget - media should appear now!")
    print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(batch_add_media())
