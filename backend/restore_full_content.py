#!/usr/bin/env python3
"""
RESTORE FULL CONTENT SCRIPT
---------------------------
Restores:
1. Admin accounts (Katherine, Dawnena, Michelle) - Password: pivot2025
2. Website: Testing GoPIVOT ME (testing.gopivot.me)
3. Page: /pdf (with 4 sections and linked R2 media)
4. Page: /dds (with structure, ready for content)
"""

import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid
from passlib.context import CryptContext

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Content Data
PDF_SECTIONS = [
    "7000+ Spoken/Written | 300+ Signed | One Platform.",
    "PIVOT: The Future of Language Access Technology",
    "PIVOT is the first language access technology that embeds accessibility right where your information lives. No duplicate websites. No third-party dependencies. No expensive rebuilds.",
    "With a single line of code, PIVOT integrates seamlessly into your existing digital systems—instantly transforming them into inclusive, multilingual experiences."
]

PDF_MEDIA = [
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

DDS_SECTIONS = [
    "DDS Introduction: Welcome to the DDS (Developmental Disabilities Services) section.",
    "Services Overview: Our DDS program offers comprehensive support services including case management, therapy services, and community integration programs.",
    "How to Apply: To apply for DDS services, please contact your regional center or visit our application portal for more information."
]

async def restore_content():
    print("🚀 STARTING CONTENT RESTORATION")
    print("=" * 60)

    # 1. Setup Users
    print("\n👥 Restoring Users...")
    admin_emails = [
        ("katherine@dozanu.com", "Katherine"),
        ("dawnena@dozanu.com", "Dawnena"),
        ("michelle@dozanu.com", "Michelle")
    ]
    
    password = "pivot2025"
    hashed_password = pwd_context.hash(password)
    
    katherine_id = None
    
    for email, name in admin_emails:
        existing = await db.users.find_one({"email": email})
        if existing:
            print(f"   ⚠️  {name} ({email}) - Already exists")
            user_id = existing['id']
            # Force update password just in case
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"password": hashed_password}}
            )
        else:
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "email": email,
                "name": name,
                "password": hashed_password,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "role": "admin"
            }
            await db.users.insert_one(user)
            print(f"   ✅ Created {name} ({email})")
        
        if email == "katherine@dozanu.com":
            katherine_id = user_id

    # 2. Setup Website
    print("\n🌐 Restoring Website...")
    website_url = "testing.gopivot.me"
    website = await db.websites.find_one({"url": {"$regex": website_url}})
    
    if website:
        print(f"   ⚠️  Website exists: {website['name']}")
        website_id = website['id']
        # Ensure Katherine is owner or collaborator
        if website['owner_id'] != katherine_id:
            if katherine_id not in website.get('collaborators', []):
                await db.websites.update_one(
                    {"id": website_id},
                    {"$push": {"collaborators": katherine_id}}
                )
                print("   ✅ Added Katherine as collaborator")
    else:
        website_id = str(uuid.uuid4())
        new_website = {
            "id": website_id,
            "owner_id": katherine_id,
            "name": "Testing GoPIVOT ME",
            "url": "https://testing.gopivot.me",
            "embed_code": f'<script src="{os.environ.get("REACT_APP_BACKEND_URL")}/api/widget.js" data-website-id="{website_id}"></script>',
            "created_at": datetime.now(timezone.utc).isoformat(),
            "collaborators": []
        }
        await db.websites.insert_one(new_website)
        print(f"   ✅ Created Website: {new_website['name']}")

    # 3. Setup PDF Page & Content
    print("\n📄 Restoring /pdf Page & Content...")
    pdf_page = await db.pages.find_one({"website_id": website_id, "url": {"$regex": "/pdf"}})
    
    if pdf_page:
        print(f"   ⚠️  PDF Page exists")
        page_id = pdf_page['id']
    else:
        page_id = str(uuid.uuid4())
        new_page = {
            "id": page_id,
            "website_id": website_id,
            "url": "https://testing.gopivot.me/pdf",
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "sections_count": 0
        }
        await db.pages.insert_one(new_page)
        print(f"   ✅ Created PDF Page")

    # Wipe existing sections for clean restore (requested: "videos we had... are gone")
    # This ensures we don't end up with partial/broken sections
    # Only wipe if count mismatch or explicitly trying to fix
    
    current_sections_count = await db.sections.count_documents({"page_id": page_id})
    print(f"   ℹ️  Current PDF Sections: {current_sections_count}")
    
    # If sections exist but likely incomplete or broken, delete them
    if current_sections_count > 0 and current_sections_count < 4:
        print("   ⚠️  Incomplete sections found. Wiping to restore full content...")
        section_ids = [s['id'] for s in await db.sections.find({"page_id": page_id}).to_list(100)]
        await db.videos.delete_many({"section_id": {"$in": section_ids}})
        await db.audios.delete_many({"section_id": {"$in": section_ids}})
        await db.sections.delete_many({"page_id": page_id})
        current_sections_count = 0
    
    # If sections don't exist (or were wiped), create them
    if current_sections_count == 0:
        print("   📝 Creating PDF Sections & Linking Media...")
        for i, text in enumerate(PDF_SECTIONS):
            section_id = str(uuid.uuid4())
            section = {
                "id": section_id,
                "page_id": page_id,
                "selected_text": text,
                "text_content": text,
                "position_order": i + 1,
                "status": "Active",
                "videos_count": 1,
                "audios_count": 1,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.sections.insert_one(section)
            
            # Link Video
            video = {
                "id": str(uuid.uuid4()),
                "section_id": section_id,
                "language": "ASL (American Sign Language)",
                "video_url": PDF_MEDIA[i]["video"],
                "file_path": f"videos/restored_{i+1}.mp4", # Placeholder path
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.videos.insert_one(video)
            
            # Link Audio
            audio = {
                "id": str(uuid.uuid4()),
                "section_id": section_id,
                "language": "English",
                "audio_url": PDF_MEDIA[i]["audio"],
                "file_path": f"audio/restored_{i+1}.mp3", # Placeholder path
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.audios.insert_one(audio)
            print(f"     ✅ Restored Section {i+1} with Media")
            
        await db.pages.update_one({"id": page_id}, {"$set": {"sections_count": len(PDF_SECTIONS)}})
    else:
        # Verify media exists for existing sections
        print("   🔍 Verifying media for existing sections...")
        sections = await db.sections.find({"page_id": page_id}).sort("position_order", 1).to_list(100)
        for i, section in enumerate(sections):
             # Check Video
             video_exists = await db.videos.find_one({"section_id": section['id']})
             if not video_exists and i < len(PDF_MEDIA):
                video = {
                    "id": str(uuid.uuid4()),
                    "section_id": section['id'],
                    "language": "ASL (American Sign Language)",
                    "video_url": PDF_MEDIA[i]["video"],
                    "file_path": f"videos/restored_{i+1}.mp4",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.videos.insert_one(video)
                print(f"     ✅ Restored missing video for Section {i+1}")
                await db.sections.update_one({"id": section['id']}, {"$set": {"videos_count": 1}})

    # 4. Setup DDS Page & Structure
    print("\n📄 Restoring /dds Page & Structure...")
    dds_page = await db.pages.find_one({"website_id": website_id, "url": {"$regex": "/dds"}})
    
    if dds_page:
        print(f"   ⚠️  DDS Page exists")
        dds_page_id = dds_page['id']
    else:
        dds_page_id = str(uuid.uuid4())
        new_dds_page = {
            "id": dds_page_id,
            "website_id": website_id,
            "url": "https://testing.gopivot.me/dds",
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "sections_count": 0
        }
        await db.pages.insert_one(new_dds_page)
        print(f"   ✅ Created DDS Page")

    # DDS Sections (No Media Known)
    current_dds_sections = await db.sections.count_documents({"page_id": dds_page_id})
    if current_dds_sections == 0:
        print("   📝 Creating DDS Sections...")
        for i, text in enumerate(DDS_SECTIONS):
            section_id = str(uuid.uuid4())
            section = {
                "id": section_id,
                "page_id": dds_page_id,
                "selected_text": text,
                "text_content": text,
                "position_order": i + 1,
                "status": "Active",
                "videos_count": 0,
                "audios_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.sections.insert_one(section)
            print(f"     ✅ Restored DDS Section {i+1}")
            
        await db.pages.update_one({"id": dds_page_id}, {"$set": {"sections_count": len(DDS_SECTIONS)}})
    else:
        print(f"   ⚠️  DDS Sections already exist ({current_dds_sections})")

    print("\n" + "=" * 60)
    print("✅ RESTORATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(restore_content())
