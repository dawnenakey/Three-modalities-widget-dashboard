#!/usr/bin/env python3
"""
Batch Media Upload Script - Maps videos by number to sections
Video #1 → Section #1, Video #2 → Section #2, etc.
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

async def batch_add_all_media():
    """Add all media files mapping by number"""
    
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'pivot_accessibility')
    r2_public_url = os.getenv('R2_PUBLIC_URL', 'https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 80)
    print("BATCH MEDIA UPLOAD - NUMBER MAPPING")
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
    
    # Get all sections, sorted by position_order
    sections = await db.sections.find(
        {"page_id": page['id']},
        {"_id": 0}
    ).sort("position_order", 1).to_list(100)
    
    print(f"✅ Found {len(sections)} sections")
    print()
    
    if not sections:
        print("❌ No sections found! Please create sections first.")
        return
    
    # Video files from R2 (map by number)
    video_files = [
        "1_PIVOT-Informative-PDF2025.MOV",
        "10_PIVOT-Informative-PDF2025.MOV",
        "11_PIVOT-Informative-PDF2025.MOV",
        "12_PIVOT-Informative-PDF2025.MOV",
        "13_PIVOT-Informative-PDF2025.MOV",
        "14_PIVOT-Informative-PDF2025.MOV",
        "15_PIVOT-Informative-PDF2025.MOV",
        "16_PIVOT-Informative-PDF2025.MOV",
        "17_PIVOT-Informative-PDF2025.MOV",
        "18_PIVOT-Informative-PDF2025.MOV",
        "19_PIVOT-Informative-PDF2025.MOV",
        "20_PIVOT-Informative-PDF2025.MOV",
        "21_PIVOT-Informative-PDF2025.MOV",
        "22_PIVOT-Informative-PDF2025.MOV",
        "23_PIVOT-Informative-PDF2025.MOV",
        "24_PIVOT-Informative-PDF2025.MOV",
        "25_PIVOT-Informative-PDF2025.MOV",
    ]
    
    # Sort video files by number
    def get_video_number(filename):
        match = re.match(r'(\d+)_', filename)
        return int(match.group(1)) if match else 999
    
    video_files.sort(key=get_video_number)
    
    # Audio files from R2 (map by number)
    audio_languages = ["Chinese", "English", "Portuguese", "Spanish", "Vietnamese"]
    audio_lang_codes = ["ZH", "EN", "PT", "ES", "VI"]
    
    print("📹 Adding Videos (mapping by number)...")
    video_count = 0
    for video_filename in video_files:
        # Extract video number
        video_num = get_video_number(video_filename)
        
        # Map to section (video 1 → section 0, video 2 → section 1, etc.)
        section_idx = video_num - 1
        
        if section_idx >= len(sections):
            print(f"  ⚠️  Video {video_num}: No section #{video_num} available (only {len(sections)} sections)")
            continue
        
        section = sections[section_idx]
        video_url = f"{r2_public_url}/videos/{video_filename}"
        
        # Check if video already exists
        existing = await db.videos.find_one({"section_id": section['id'], "video_url": video_url}, {"_id": 0})
        if existing:
            print(f"  ⏭️  Video {video_num} → Section {video_num}: Already exists")
            continue
        
        video = {
            "id": str(uuid4()),
            "section_id": section['id'],
            "language": "American Sign Language",
            "video_url": video_url,
            "file_path": f"videos/{video_filename}",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.videos.insert_one(video)
        video_count += 1
        print(f"  ✅ Video {video_num} → Section {video_num}: Added {video_filename}")
    
    # Add audio files (PIVOT-PDF-1, PIVOT-PDF-2, PIVOT-PDF-3, PIVOT-PDF-4)
    print("\n🎵 Adding Audio Files (mapping by number)...")
    audio_count = 0
    
    for section_num in range(1, 5):  # Audio for sections 1-4
        if section_num > len(sections):
            print(f"  ⚠️  Section {section_num}: Not enough sections")
            continue
        
        section = sections[section_num - 1]  # section_num 1 → index 0
        print(f"\n  Section {section_num}:")
        
        for lang_idx, language in enumerate(audio_languages):
            lang_code = audio_lang_codes[lang_idx]
            audio_filename = f"PIVOT-PDF-{section_num}_Text_to_Speech_{language}_audio.mp3"
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
            audio_count += 1
            print(f"    ✅ {language}: Added")
    
    print("\n" + "=" * 80)
    print("✅ BATCH UPLOAD COMPLETE!")
    print("=" * 80)
    print()
    print("📊 Summary:")
    print(f"  - Total sections available: {len(sections)}")
    print(f"  - Videos added: {video_count}")
    print(f"  - Audio files added: {audio_count}")
    print()
    print("🎉 Check your dashboard and widget - media should appear now!")
    print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(batch_add_all_media())
