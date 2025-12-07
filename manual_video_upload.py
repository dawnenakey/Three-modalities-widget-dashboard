#!/usr/bin/env python3
"""
Manual Video Upload Script
Use this to add videos that were manually uploaded to R2 Cloudflare

USAGE:
python manual_video_upload.py
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

async def add_manual_video():
    """Add a manually uploaded video to the database"""
    
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'pivot_accessibility')
    if not mongo_url:
        print("❌ Error: MONGO_URL not found in environment")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 60)
    print("MANUAL VIDEO UPLOAD TO DATABASE")
    print("=" * 60)
    print()
    print("First, upload your video to R2 Cloudflare:")
    print("1. Go to Cloudflare Dashboard → R2")
    print("2. Open your 'pivot-media' bucket")
    print("3. Upload your video file")
    print("4. Get the public URL")
    print()
    print("=" * 60)
    print()
    
    # List all websites
    print("📋 Available Websites:")
    websites = await db.websites.find({}, {"_id": 0}).to_list(100)
    for i, website in enumerate(websites, 1):
        print(f"  {i}. {website['name']} (ID: {website['id']})")
    
    if not websites:
        print("  No websites found. Please create a website first.")
        return
    
    website_idx = int(input("\nSelect website number: ")) - 1
    selected_website = websites[website_idx]
    
    # List pages for selected website
    print(f"\n📄 Pages in '{selected_website['name']}':")
    pages = await db.pages.find({"website_id": selected_website['id']}, {"_id": 0}).to_list(100)
    for i, page in enumerate(pages, 1):
        print(f"  {i}. {page.get('title', page['url'])} (ID: {page['id']})")
    
    if not pages:
        print("  No pages found. Please create a page first.")
        return
    
    page_idx = int(input("\nSelect page number: ")) - 1
    selected_page = pages[page_idx]
    
    # List sections for selected page
    print(f"\n📝 Sections in '{selected_page.get('title', selected_page['url'])}':")
    sections = await db.sections.find({"page_id": selected_page['id']}, {"_id": 0}).to_list(100)
    for i, section in enumerate(sections, 1):
        text_preview = section.get('selected_text', section.get('text_content', 'No text'))[:50]
        print(f"  {i}. {text_preview}... (ID: {section['id']})")
    
    if not sections:
        print("  No sections found. Please create a section first.")
        return
    
    section_idx = int(input("\nSelect section number: ")) - 1
    selected_section = sections[section_idx]
    
    print("\n" + "=" * 60)
    print("VIDEO DETAILS")
    print("=" * 60)
    
    # Get video details
    language = input("Language (e.g., American Sign Language): ")
    video_filename = input("Video filename in R2 (e.g., asl-welcome.mp4): ")
    
    # Construct R2 URL
    r2_public_url = os.getenv('R2_PUBLIC_URL', 'https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev')
    video_url = f"{r2_public_url}/videos/{video_filename}"
    
    print(f"\n📹 Video URL: {video_url}")
    confirm = input("Is this correct? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Cancelled.")
        return
    
    # Create video record
    video = {
        "id": str(uuid4()),
        "section_id": selected_section['id'],
        "language": language,
        "video_url": video_url,
        "file_path": f"videos/{video_filename}",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Insert into database
    await db.videos.insert_one(video)
    
    # Update section video count
    video_count = await db.videos.count_documents({"section_id": selected_section['id']})
    await db.sections.update_one(
        {"id": selected_section['id']},
        {"$set": {"videos_count": video_count}}
    )
    
    print("\n✅ Video added successfully!")
    print(f"   Video ID: {video['id']}")
    print(f"   Section: {selected_section.get('selected_text', 'N/A')[:50]}...")
    print(f"   Language: {language}")
    print(f"   URL: {video_url}")
    print()
    print("🎉 The video will now appear in:")
    print("   - Dashboard section view")
    print("   - Widget for this page")
    print()
    
    # Ask if they want to add another
    another = input("Add another video? (yes/no): ")
    if another.lower() == 'yes':
        await add_manual_video()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_manual_video())
