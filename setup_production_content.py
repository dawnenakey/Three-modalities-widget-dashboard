#!/usr/bin/env python3
"""
Setup content in PRODUCTION via API calls
This creates website, page, sections, and links media in production
"""
import requests
import json
from uuid import uuid4

# Production API
API_BASE = "https://testing.gopivot.me/api"

# Login credentials
LOGIN_EMAIL = "katherine+admin@dozanu.com"
LOGIN_PASSWORD = "pivot2025"

# Media URLs in R2
MEDIA_DATA = [
    {
        "video": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/videos/1_PIVOT-InformativePDF2025.MOV",
        "audio": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/audio/PIVOT-PDF_1_Text_to_Speech_English_audio.mp3",
        "text": "7000+ Spoken/Written | 300+ Signed | One Platform."
    },
    {
        "video": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/videos/2_PIVOT-InformativePDF2025.MOV",
        "audio": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/audio/PIVOT-PDF_2_Text_to_Speech_English_audio.mp3",
        "text": "PIVOT: The Future of Language Access Technology"
    },
    {
        "video": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/videos/3_PIVOT-InformativePDF2025.MOV",
        "audio": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/audio/PIVOT-PDF_3_Text_to_Speech_English_audio.mp3",
        "text": "PIVOT is the first language access technology that embeds accessibility right where your information lives."
    },
    {
        "video": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/videos/4_PIVOT-InformativePDF2025.MOV",
        "audio": "https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev/audio/PIVOT-PDF_4_Text_to_Speech_English_audio.mp3",
        "text": "With a single line of code, PIVOT integrates seamlessly into your existing digital systems."
    }
]

def main():
    session = requests.Session()
    
    # Step 1: Login
    print("🔐 Logging in...")
    login_resp = session.post(f"{API_BASE}/auth/login", json={
        "email": LOGIN_EMAIL,
        "password": LOGIN_PASSWORD
    })
    
    if login_resp.status_code != 200:
        print(f"❌ Login failed: {login_resp.text}")
        return
    
    print("✅ Logged in successfully")
    
    # Step 2: Check if website exists, create if not
    print("\n📱 Checking for website...")
    websites_resp = session.get(f"{API_BASE}/websites")
    websites = websites_resp.json()
    
    # Find or create GoPivot website
    website = None
    for w in websites:
        if 'gopivot' in w.get('url', '').lower() or 'gopivot' in w.get('name', '').lower():
            website = w
            print(f"✅ Found existing website: {w.get('name')} (ID: {w['id']})")
            break
    
    if not website:
        print("Creating new website...")
        website_resp = session.post(f"{API_BASE}/websites", data={
            "name": "Testing GoPIVOT ME",
            "url": "https://testing.gopivot.me"
        })
        if website_resp.status_code not in [200, 201]:
            print(f"❌ Failed to create website: {website_resp.text}")
            return
        website = website_resp.json()
        print(f"✅ Created website: {website['id']}")
    
    website_id = website['id']
    
    # Step 3: Check if page exists, create if not
    print("\n📄 Checking for /pdf page...")
    pages_resp = session.get(f"{API_BASE}/websites/{website_id}/pages")
    pages = pages_resp.json()
    
    page = None
    for p in pages:
        if '/pdf' in p.get('url', ''):
            page = p
            print(f"✅ Found existing page: {p['url']} (ID: {p['id']})")
            break
    
    if not page:
        print("Creating /pdf page...")
        page_resp = session.post(f"{API_BASE}/websites/{website_id}/pages", data={
            "url": "https://testing.gopivot.me/pdf",
            "title": "PDF Resources",
            "status": "Active"
        })
        if page_resp.status_code not in [200, 201]:
            print(f"❌ Failed to create page: {page_resp.text}")
            return
        page = page_resp.json()
        print(f"✅ Created page: {page['id']}")
    
    page_id = page['id']
    
    # Step 4: Get or create sections
    print("\n📝 Setting up sections...")
    sections_resp = session.get(f"{API_BASE}/pages/{page_id}/sections")
    sections = sections_resp.json()
    
    print(f"Found {len(sections)} existing sections")
    
    # Create missing sections
    while len(sections) < 4:
        idx = len(sections)
        print(f"Creating section {idx + 1}...")
        section_resp = session.post(f"{API_BASE}/pages/{page_id}/sections", data={
            "text_content": MEDIA_DATA[idx]["text"],
            "selected_text": MEDIA_DATA[idx]["text"],
            "position_order": idx + 1,
            "status": "Active"
        })
        if section_resp.status_code not in [200, 201]:
            print(f"❌ Failed to create section: {section_resp.text}")
            break
        new_section = section_resp.json()
        sections.append(new_section)
        print(f"✅ Created section {idx + 1}")
    
    print(f"\n✅ Total sections: {len(sections)}")
    print(f"\n🎬 Widget should now work at: https://testing.gopivot.me/pdf")
    print(f"📋 Website ID for widget: {website_id}")
    print("\nNote: You'll need to manually upload videos and audio through the dashboard")
    print("Or we can create a direct database insertion script if you have production DB access")

if __name__ == "__main__":
    main()
