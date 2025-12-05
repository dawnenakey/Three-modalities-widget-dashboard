#!/usr/bin/env python3
"""
Scrape demo content from demo.gopivot.me and populate demo websites
"""

import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid
import httpx
from bs4 import BeautifulSoup

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def scrape_page_content(url: str):
    """Scrape content from a URL"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted elements
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        
        # Get main content
        sections = []
        
        # Try to find main content
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
        if main_content:
            # Get all paragraphs and headings
            for elem in main_content.find_all(['p', 'h1', 'h2', 'h3', 'li']):
                text = elem.get_text(strip=True)
                if text and len(text) > 20:  # Minimum length
                    sections.append(text)
        
        # If no main content found, get all text
        if not sections:
            text = soup.get_text(separator=' ', strip=True)
            # Split into chunks of ~500 characters
            words = text.split()
            current_section = []
            current_length = 0
            
            for word in words:
                current_section.append(word)
                current_length += len(word) + 1
                
                if current_length >= 500:
                    section_text = ' '.join(current_section)
                    if len(section_text) > 50:
                        sections.append(section_text)
                    current_section = []
                    current_length = 0
            
            # Add remaining
            if current_section:
                section_text = ' '.join(current_section)
                if len(section_text) > 50:
                    sections.append(section_text)
        
        return sections[:10]  # Limit to 10 sections per page
        
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return []

async def setup_demo_content():
    """Setup demo content for both websites"""
    
    print("🌐 Scraping Demo Content")
    print("=" * 80)
    
    # Get demo websites
    pdf_website = await db.websites.find_one({"url": "testing.gopivot.me/pdf"}, {"_id": 0})
    dds_website = await db.websites.find_one({"url": "testing.gopivot.me/internal-dds-duplicate/"}, {"_id": 0})
    
    if not pdf_website or not dds_website:
        print("❌ Demo websites not found. Run setup_admin_demo.py first")
        return
    
    # Demo 1: PDF Website
    print("\n📄 Scraping PDF Demo (demo.gopivot.me/pdf)...")
    pdf_sections = await scrape_page_content("https://demo.gopivot.me/pdf")
    
    if pdf_sections:
        # Create page
        page_id = str(uuid.uuid4())
        page = {
            "id": page_id,
            "website_id": pdf_website['id'],
            "url": "testing.gopivot.me/pdf",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "sections_count": len(pdf_sections)
        }
        await db.pages.insert_one(page)
        print(f"   ✅ Created page with {len(pdf_sections)} sections")
        
        # Create sections
        for idx, text in enumerate(pdf_sections, 1):
            section_id = str(uuid.uuid4())
            section = {
                "id": section_id,
                "page_id": page_id,
                "selected_text": text,
                "position_order": idx,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "videos_count": 0,
                "audios_count": 0
            }
            await db.sections.insert_one(section)
            print(f"   📝 Section {idx}: {text[:80]}...")
    else:
        print("   ⚠️  No content scraped from PDF demo")
    
    # Demo 2: California DDS
    print("\n🏛️  Scraping California DDS Demo (demo.gopivot.me/internal-dds-duplicate/)...")
    dds_sections = await scrape_page_content("https://demo.gopivot.me/internal-dds-duplicate/")
    
    if dds_sections:
        # Create page
        page_id = str(uuid.uuid4())
        page = {
            "id": page_id,
            "website_id": dds_website['id'],
            "url": "testing.gopivot.me/internal-dds-duplicate/",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "sections_count": len(dds_sections)
        }
        await db.pages.insert_one(page)
        print(f"   ✅ Created page with {len(dds_sections)} sections")
        
        # Create sections
        for idx, text in enumerate(dds_sections, 1):
            section_id = str(uuid.uuid4())
            section = {
                "id": section_id,
                "page_id": page_id,
                "selected_text": text,
                "position_order": idx,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "videos_count": 0,
                "audios_count": 0
            }
            await db.sections.insert_one(section)
            print(f"   📝 Section {idx}: {text[:80]}...")
    else:
        print("   ⚠️  No content scraped from DDS demo")
    
    print("\n" + "=" * 80)
    print("✅ Demo Content Scraped!")
    print("=" * 80)
    print("\n📋 Summary:")
    print(f"   PDF Demo: {len(pdf_sections)} sections")
    print(f"   DDS Demo: {len(dds_sections)} sections")
    print("\n📝 Next Steps:")
    print("   1. Login as any admin account:")
    print("      - katherine@dozanu.com / pivot2025")
    print("      - dawnena@dozanu.com / pivot2025")
    print("      - michelle@dozanu.com / pivot2025")
    print("   2. Navigate to demo websites")
    print("   3. Upload ASL videos to sections")
    print("   4. Generate AI audio for sections")
    print("   5. Test widget on testing.gopivot.me/pdf and /internal-dds-duplicate/")

if __name__ == "__main__":
    asyncio.run(setup_demo_content())
