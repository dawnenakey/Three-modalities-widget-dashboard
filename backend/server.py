from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import aiofiles
from bs4 import BeautifulSoup
import requests
from emergentintegrations.llm.openai import OpenAITextToSpeech

# IMPORTANT: Load .env BEFORE importing services so credentials are available
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Now import services after .env is loaded
import s3_service

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create upload directories
UPLOAD_DIR = ROOT_DIR / 'uploads'
VIDEO_DIR = UPLOAD_DIR / 'videos'
AUDIO_DIR = UPLOAD_DIR / 'audio'
for dir_path in [VIDEO_DIR, AUDIO_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Security
security = HTTPBearer()
JWT_SECRET = os.environ['JWT_SECRET_KEY']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
JWT_EXPIRATION = int(os.environ['JWT_EXPIRATION_HOURS'])

# Helper function to check website access (owner or collaborator)
async def check_website_access(website_id: str, user_id: str) -> bool:
    """Check if user has access to website (as owner or collaborator)"""
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    if not website:
        return False
    
    # Check if user is owner
    if website.get('owner_id') == user_id:
        return True
    
    # Check if user is in collaborators list
    collaborators = website.get('collaborators', [])
    if user_id in collaborators:
        return True
    
    return False

# Initialize OpenAI TTS
tts = OpenAITextToSpeech(api_key=os.getenv("EMERGENT_LLM_KEY"))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Root route
@api_router.get("/")
async def root():
    return {"message": "PIVOT API - Accessibility Platform"}

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class Website(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    name: str
    url: str
    embed_code: str = ""
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WebsiteCreate(BaseModel):
    name: str
    url: str

class Page(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    website_id: str
    url: str
    status: str = "Not Setup"  # Not Setup, Active, Inactive
    sections_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PageCreate(BaseModel):
    url: str

class Section(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_id: str
    selected_text: str
    text_content: Optional[str] = None
    position_order: int
    status: str = "Not Setup"  # Not Setup, Needs Review, Active
    videos_count: int = 0
    audios_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SectionCreate(BaseModel):
    selected_text: str
    position_order: Optional[int] = None

class SectionUpdate(BaseModel):
    text_content: Optional[str] = None
    status: Optional[str] = None

class Video(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_id: str
    language: str  # ASL, LSM, BSL, etc.
    video_url: str
    file_path: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Audio(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_id: str
    language: str  # English, Spanish, etc.
    audio_url: str
    file_path: str
    captions: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SectionOrderUpdate(BaseModel):
    id: str
    position_order: int

class ReorderRequest(BaseModel):
    sections: List[SectionOrderUpdate]

# Request models for R2 upload endpoints
class UploadUrlRequest(BaseModel):
    filename: str
    content_type: str = "video/mp4"
    file_size: int = 0  # File size in bytes (optional, for validation)

class ConfirmUploadRequest(BaseModel):
    file_key: str
    public_url: str
    language: str = "American Sign Language"

class TextTranslation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_id: str
    language: str  # Spanish, Chinese, French, etc.
    language_code: str  # ES, ZH, FR, etc.
    text_content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Analytics(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    website_id: str
    page_url: str
    views: int = 0
    interactions: int = 0
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Auth utilities
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Normalize email to lowercase
    email = user_data.email.lower().strip()
    
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=email, name=user_data.name)
    user_dict = user.model_dump()
    user_dict['timestamp'] = user_dict['created_at'].isoformat()
    user_dict['password'] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token(user.id)
    return Token(access_token=token, user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    # Normalize email to lowercase
    email = credentials.email.lower().strip()
    
    user_doc = await db.users.find_one({"email": email})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    token = create_access_token(user.id)
    return Token(access_token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# Widget route - publicly accessible
@api_router.get("/widget.js")
async def get_widget_js():
    widget_path = ROOT_DIR / "static" / "widget.js"
    return FileResponse(widget_path, media_type="application/javascript")

@app.get("/api/widget.js")
async def serve_widget_api():
    widget_path = ROOT_DIR / "static" / "widget.js"
    return FileResponse(widget_path, media_type="application/javascript")

# Website routes
@api_router.get("/websites", response_model=List[Website])
async def get_websites(current_user: dict = Depends(get_current_user)):
    # Get websites where user is owner OR collaborator
    websites = await db.websites.find({
        "$or": [
            {"owner_id": current_user['id']},
            {"collaborators": current_user['id']}
        ]
    }, {"_id": 0}).to_list(1000)
    
    # FORCE FIX: Ensure embed code is always correct, even for old records
    for site in websites:
        correct_code = f'<script src="https://testing.gopivot.me/api/widget.js" data-website-id="{site["id"]}"></script>'
        if site.get('embed_code') != correct_code:
            site['embed_code'] = correct_code
            
    return websites

@api_router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get aggregated statistics for dashboard in a single query"""
    # Get total websites count
    websites = await db.websites.find({"owner_id": current_user['id']}, {"_id": 0, "id": 1}).to_list(1000)
    website_ids = [w['id'] for w in websites]
    
    # Get total pages count for all user's websites
    total_pages = 0
    if website_ids:
        total_pages = await db.pages.count_documents({"website_id": {"$in": website_ids}})
    
    return {
        "total_websites": len(websites),
        "total_pages": total_pages,
        "total_users": 1  # Current user
    }

@api_router.post("/websites", response_model=Website)
async def create_website(website_data: WebsiteCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Hardcode domain for consistency
        backend_url = "https://testing.gopivot.me"
        
        # Extract OpenGraph/featured image from website (non-blocking)
        try:
            image_url = await extract_og_image(website_data.url)
        except Exception as e:
            # Don't fail website creation if image extraction fails
            logging.warning(f"Failed to extract OG image from {website_data.url}: {str(e)}")
            image_url = None
        
        website = Website(
            owner_id=current_user['id'],
            name=website_data.name,
            url=website_data.url,
            embed_code=f'<script src="{backend_url}/api/widget.js" data-website-id="{{website_id}}"></script>',
            image_url=image_url
        )
        website_dict = website.model_dump()
        website_dict['created_at'] = website_dict['created_at'].isoformat()
        website_dict['embed_code'] = website_dict['embed_code'].replace('{website_id}', website.id)
        
        await db.websites.insert_one(website_dict)
        return website
    except Exception as e:
        logging.error(f"Failed to create website: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create website: {str(e)}")

@api_router.get("/websites/{website_id}", response_model=Website)
async def get_website(website_id: str, current_user: dict = Depends(get_current_user)):
    # Check if user has access (owner or collaborator)
    has_access = await check_website_access(website_id, current_user['id'])
    if not has_access:
        raise HTTPException(status_code=404, detail="Website not found")
    
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    
    # FORCE FIX: Ensure embed code is always correct
    if website:
        correct_code = f'<script src="https://testing.gopivot.me/api/widget.js" data-website-id="{website["id"]}"></script>'
        website['embed_code'] = correct_code
        
    return website

@api_router.delete("/websites/{website_id}")
async def delete_website(website_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.websites.delete_one({"id": website_id, "owner_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Website not found")
    return {"message": "Website deleted"}

# Page routes
@api_router.get("/websites/{website_id}/pages", response_model=List[Page])
async def get_pages(website_id: str, current_user: dict = Depends(get_current_user)):
    # Check if user has access (owner or collaborator)
    has_access = await check_website_access(website_id, current_user['id'])
    if not has_access:
        raise HTTPException(status_code=404, detail="Website not found")
    
    pages = await db.pages.find({"website_id": website_id}, {"_id": 0}).to_list(1000)
    
    # Calculate status for each page based on content
    for page in pages:
        # Get sections for this page
        sections = await db.sections.find({"page_id": page['id']}, {"_id": 0}).to_list(1000)
        
        # Calculate if page has any content
        has_content = False
        for section in sections:
            # Check if section has videos or audio
            videos_count = await db.videos.count_documents({"section_id": section['id']})
            audios_count = await db.audios.count_documents({"section_id": section['id']})
            
            if videos_count > 0 or audios_count > 0:
                has_content = True
                break
        
        # Set status
        page['status'] = 'Active' if has_content else 'Not Setup'
    
    return pages

@api_router.patch("/pages/{page_id}/status")
async def update_page_status(page_id: str, status_data: dict, current_user: dict = Depends(get_current_user)):
    """Update page status manually"""
    page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Verify user has access to the website
    website = await db.websites.find_one({"id": page['website_id']}, {"_id": 0})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    has_access = await check_website_access(page['website_id'], current_user['id'])
    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update status
    new_status = status_data.get('status', 'Not Setup')
    await db.pages.update_one(
        {"id": page_id},
        {"$set": {"status": new_status}}
    )
    
    return {"message": "Status updated", "status": new_status}

@api_router.post("/websites/{website_id}/pages", response_model=Page)
async def create_page(website_id: str, page_data: PageCreate, current_user: dict = Depends(get_current_user)):
    # Check if user has access (owner or collaborator)
    has_access = await check_website_access(website_id, current_user['id'])
    if not has_access:
        raise HTTPException(status_code=404, detail="Website not found")
    
    page = Page(website_id=website_id, url=page_data.url)
    page_dict = page.model_dump()
    page_dict['created_at'] = page_dict['created_at'].isoformat()
    
    await db.pages.insert_one(page_dict)
    
    # Auto-scrape page content
    try:
        sections = await scrape_page_content(page_data.url)
        for idx, text in enumerate(sections, 1):
            section = Section(
                page_id=page.id,
                selected_text=text,
                text_content=text,
                position_order=idx
            )
            section_dict = section.model_dump()
            section_dict['created_at'] = section_dict['created_at'].isoformat()
            await db.sections.insert_one(section_dict)
        
        page_dict['sections_count'] = len(sections)
        await db.pages.update_one({"id": page.id}, {"$set": {"sections_count": len(sections)}})
    except Exception as e:
        logging.error(f"Error scraping page: {e}")
    
    return page

async def scrape_page_content(url: str) -> List[str]:
    """
    Scrape page content with preference for main/article content.
    Produces ordered chunks (400–800 chars) suitable for sections.
    """
    try:
        response = requests.get(
            url,
            timeout=10,
            headers={'User-Agent': 'Mozilla/5.0 (PIVOT Scraper)'}
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        # Remove non-content tags early
        for element in soup(['script', 'style', 'noscript', 'iframe']):
            element.decompose()

        # Prefer main content if present
        main = (
            soup.find('main') or
            soup.find(attrs={'role': 'main'}) or
            soup.find('article') or
            soup.find('div', class_=['entry-content', 'post-content', 'page-content'])
        )
        root = main or soup.body or soup

        # We will walk block-level content in order
        BLOCK_TAGS = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'li',
            'section', 'article', 'div',
            'button', 'a'
        ]

        chunks: List[str] = []
        current = []

        def flush_current():
            nonlocal current
            if not current:
                return
            text = ' '.join(current)
            text = ' '.join(text.split())
            if len(text) >= 40:      # discard tiny scraps
                chunks.append(text[:1000])  # hard cap per section
            current = []

        for el in root.descendants:
            if not hasattr(el, "name"):
                continue
            if el.name not in BLOCK_TAGS:
                continue

            # Skip nav/header/footer/aside sections even if nested
            if el.find_parent(['nav', 'header', 'footer', 'aside']):
                continue

            text = el.get_text(separator=' ', strip=True)
            text = ' '.join(text.split())
            if len(text) < 20:
                continue

            # Accumulate until we hit ~600 chars then flush as one "section"
            if sum(len(t) for t in current) + len(text) > 600:
                flush_current()
            current.append(text)

        flush_current()

        # Simple dedupe: exact text only
        seen = set()
        unique_chunks: List[str] = []
        for t in chunks:
            if t not in seen:
                seen.add(t)
                unique_chunks.append(t)

        return unique_chunks[:100]  # safety cap
    except Exception as e:
        logging.error(f"Scraping error for {url}: {e}")
        return []

async def extract_og_image(url: str) -> Optional[str]:
    """Extract OpenGraph image or featured image from webpage"""
    try:
        # Use a shorter timeout and handle errors more gracefully
        response = requests.get(url, timeout=3, headers={'User-Agent': 'Mozilla/5.0'}, allow_redirects=True)
        if response.status_code != 200:
            return None
            
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Try OpenGraph image
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content']
        
        # Try Twitter card image
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        if twitter_image and twitter_image.get('content'):
            return twitter_image['content']
        
        # Try first large image on page
        for img in soup.find_all('img'):
            src = img.get('src')
            if src and ('logo' not in src.lower() and 'icon' not in src.lower()):
                # Make sure it's an absolute URL
                if src.startswith('http'):
                    return src
                elif src.startswith('/'):
                    from urllib.parse import urljoin
                    return urljoin(url, src)
        
        return None
    except Exception as e:
        logging.error(f"Image extraction error: {e}")
        return None

@api_router.get("/pages/{page_id}", response_model=Page)
async def get_page(page_id: str, current_user: dict = Depends(get_current_user)):
    page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@api_router.delete("/pages/{page_id}")
async def delete_page(page_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a page and all its associated content (sections, videos, audio, translations)"""
    # Find the page
    page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Security: Verify page belongs to current user
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all sections for this page
    sections = await db.sections.find({"page_id": page_id}, {"_id": 0}).to_list(1000)
    section_ids = [section['id'] for section in sections]
    
    if section_ids:
        # Delete all videos for these sections
        await db.videos.delete_many({"section_id": {"$in": section_ids}})
        # Delete all audio for these sections
        await db.audios.delete_many({"section_id": {"$in": section_ids}})
        # Delete all translations for these sections
        await db.text_translations.delete_many({"section_id": {"$in": section_ids}})
        # Delete all sections
        await db.sections.delete_many({"page_id": page_id})
    
    # Delete the page itself
    await db.pages.delete_one({"id": page_id})
    
    # Update website page count
    page_count = await db.pages.count_documents({"website_id": page['website_id']})
    await db.websites.update_one(
        {"id": page['website_id']},
        {"$set": {"pages_count": page_count}}
    )
    
    return {"message": "Page and all associated content deleted successfully"}

# Section routes
@api_router.get("/pages/{page_id}/sections", response_model=List[Section])
async def get_sections(page_id: str, current_user: dict = Depends(get_current_user)):
    sections = await db.sections.find({"page_id": page_id}, {"_id": 0}).sort("position_order", 1).to_list(1000)
    return sections

@api_router.put("/pages/{page_id}/sections/reorder")
async def reorder_sections(page_id: str, request: ReorderRequest, current_user: dict = Depends(get_current_user)):
    """Reorder sections for a specific page"""
    # Verify page exists
    page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
        
    # Verify user has access to the website
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update each section's order
    for item in request.sections:
        await db.sections.update_one(
            {"id": item.id, "page_id": page_id},
            {"$set": {"position_order": item.position_order}}
        )
        
    return {"message": "Sections reordered successfully"}

@api_router.post("/pages/{page_id}/sections", response_model=Section)
async def create_section(page_id: str, section_data: SectionCreate, current_user: dict = Depends(get_current_user)):
    page = await db.pages.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if section_data.position_order is None:
        max_order = await db.sections.find({"page_id": page_id}).sort("position_order", -1).limit(1).to_list(1)
        section_data.position_order = (max_order[0]['position_order'] + 1) if max_order else 1
    
    section = Section(
        page_id=page_id,
        selected_text=section_data.selected_text,
        text_content=section_data.selected_text,
        position_order=section_data.position_order
    )
    section_dict = section.model_dump()
    section_dict['created_at'] = section_dict['created_at'].isoformat()
    
    await db.sections.insert_one(section_dict)
    return section

@api_router.get("/sections/{section_id}", response_model=Section)
async def get_section(section_id: str, current_user: dict = Depends(get_current_user)):
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section

@api_router.patch("/sections/{section_id}", response_model=Section)
async def update_section(
    section_id: str,
    payload: SectionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update section text and/or status."""
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    # Security: verify ownership via page -> website
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")

    update_data = {}
    if payload.text_content is not None:
        update_data["text_content"] = payload.text_content
        update_data["selected_text"] = payload.text_content  # keep in sync with edits

    if payload.status is not None:
        update_data["status"] = payload.status

    if update_data:
        await db.sections.update_one(
            {"id": section_id},
            {"$set": update_data}
        )

    updated_section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    return updated_section


@api_router.delete("/sections/{section_id}")
async def delete_section(section_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a section and all its associated media"""
    # Find the section
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Security: Verify section belongs to current user
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete all videos associated with this section
    await db.videos.delete_many({"section_id": section_id})
    
    # Delete all audios associated with this section
    await db.audios.delete_many({"section_id": section_id})
    
    # Delete the section itself
    await db.sections.delete_one({"id": section_id})
    
    return {"message": "Section and all associated media deleted successfully"}


# Video routes - R2 Direct Upload (NEW - RECOMMENDED)
@api_router.post("/sections/{section_id}/video/upload-url")
async def get_video_upload_url(
    section_id: str,
    request: UploadUrlRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a presigned URL for direct upload to AWS S3
    Client uploads video directly to S3, then calls /video/confirm
    """
    # Security: Verify section belongs to current user
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Check page ownership
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Check website access
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Validate file
    is_valid, error_msg = s3_service.validate_file(request.filename, request.file_size, "video")
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_ext = request.filename.split('.')[-1] if '.' in request.filename else 'mp4'
    unique_filename = f"videos/{file_id}.{file_ext}"
    
    # Generate presigned upload URL for S3
    try:
        upload_data = s3_service.generate_presigned_upload_url(
            filename=unique_filename,
            content_type=request.content_type,
            file_size=request.file_size
        )
        
        return {
            "upload_url": upload_data['upload_url'],
            "public_url": upload_data['public_url'],
            "file_key": upload_data['file_key']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {str(e)}")


@api_router.post("/sections/{section_id}/video/confirm", response_model=Video)
async def confirm_video_upload(
    section_id: str,
    request: ConfirmUploadRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Confirm video upload and save to database
    Called after client successfully uploads to R2
    """
    # Security check
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create video record
    video_obj = Video(
        section_id=section_id,
        language=request.language,
        video_url=request.public_url,
        file_path=request.file_key  # Store R2 key for future reference
    )
    video_dict = video_obj.model_dump()
    video_dict['created_at'] = video_dict['created_at'].isoformat()
    
    await db.videos.insert_one(video_dict)
    await db.sections.update_one({"id": section_id}, {"$inc": {"videos_count": 1}})
    
    # SIGN THE URL for immediate playback
    if not request.public_url.startswith("/"):
        signed_url = s3_service.generate_presigned_url(request.file_key)
        video_obj.video_url = signed_url
    
    return video_obj


# Video routes - Legacy Backend Upload (KEPT FOR COMPATIBILITY)
@api_router.post("/sections/{section_id}/videos", response_model=Video)
async def upload_video(
    section_id: str,
    language: str = Form(...),
    video: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Security: Verify section belongs to current user
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Check page ownership
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Check website access (owner or collaborator)
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied: You don't have access to this section")
    
    file_id = str(uuid.uuid4())
    file_ext = video.filename.split('.')[-1]
    file_path = VIDEO_DIR / f"{file_id}.{file_ext}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await video.read()
        await f.write(content)
    
    video_obj = Video(
        section_id=section_id,
        language=language,
        video_url=f"/api/uploads/videos/{file_id}.{file_ext}",
        file_path=str(file_path)
    )
    video_dict = video_obj.model_dump()
    video_dict['created_at'] = video_dict['created_at'].isoformat()
    
    await db.videos.insert_one(video_dict)
    await db.sections.update_one({"id": section_id}, {"$inc": {"videos_count": 1}})
    
    return video_obj

@api_router.get("/sections/{section_id}/videos", response_model=List[Video])
async def get_videos(section_id: str, current_user: dict = Depends(get_current_user)):
    # Security: Verify section belongs to current user
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Check website access (owner or collaborator)
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied: You don't have access to this section")
    
    videos = await db.videos.find({"section_id": section_id}, {"_id": 0}).to_list(1000)
    
    # SIGN URLS
    for video in videos:
        if not video['video_url'].startswith("/"):
            key = video.get('file_path')
            if not key and 'amazonaws.com' in video['video_url']:
                key = video['video_url'].split('.amazonaws.com/')[-1]
            if key:
                video['video_url'] = s3_service.generate_presigned_url(key)
    
    return videos

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a video"""
    # Find the video
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Security: Verify video belongs to current user
    section = await db.sections.find_one({"id": video['section_id']}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete from database
    await db.videos.delete_one({"id": video_id})
    
    # Update section video count
    videos_count = await db.videos.count_documents({"section_id": video['section_id']})
    await db.sections.update_one(
        {"id": video['section_id']},
        {"$set": {"videos_count": videos_count}}
    )
    
    return {"message": "Video deleted successfully"}


# Audio routes - R2 Direct Upload (NEW - RECOMMENDED)
@api_router.post("/sections/{section_id}/audio/upload-url")
async def get_audio_upload_url(
    section_id: str,
    request: UploadUrlRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate presigned URL for direct audio upload to AWS S3"""
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Validate file
    is_valid, error_msg = s3_service.validate_file(request.filename, request.file_size, "audio")
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_ext = request.filename.split('.')[-1] if '.' in request.filename else 'mp3'
    unique_filename = f"audio/{file_id}.{file_ext}"
    
    try:
        upload_data = s3_service.generate_presigned_upload_url(
            filename=unique_filename,
            content_type=request.content_type,
            file_size=request.file_size
        )
        
        return {
            "upload_url": upload_data['upload_url'],
            "public_url": upload_data['public_url'],
            "file_key": upload_data['file_key']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {str(e)}")


@api_router.post("/sections/{section_id}/audio/confirm", response_model=Audio)
async def confirm_audio_upload(
    section_id: str,
    request: ConfirmUploadRequest,
    current_user: dict = Depends(get_current_user)
):
    """Confirm audio upload and save to database"""
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    audio_obj = Audio(
        section_id=section_id,
        language=request.language,
        audio_url=request.public_url,
        file_path=request.file_key
    )
    audio_dict = audio_obj.model_dump()
    audio_dict['created_at'] = audio_dict['created_at'].isoformat()
    
    await db.audios.insert_one(audio_dict)
    await db.sections.update_one({"id": section_id}, {"$inc": {"audios_count": 1}})
    
    # SIGN THE URL
    if not request.public_url.startswith("/"):
        signed_url = s3_service.generate_presigned_url(request.file_key)
        audio_obj.audio_url = signed_url
    
    return audio_obj


# Audio routes - Legacy Backend Upload (KEPT FOR COMPATIBILITY)
@api_router.post("/sections/{section_id}/audio", response_model=Audio)
async def upload_audio(
    section_id: str,
    language: str = Form(...),
    audio: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Security: Verify section belongs to current user
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Check page ownership
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Check website access (owner or collaborator)
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied: You don't have access to this section")
    
    file_id = str(uuid.uuid4())
    file_ext = audio.filename.split('.')[-1]
    file_path = AUDIO_DIR / f"{file_id}.{file_ext}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await audio.read()
        await f.write(content)
    
    audio_obj = Audio(
        section_id=section_id,
        language=language,
        audio_url=f"/api/uploads/audio/{file_id}.{file_ext}",
        file_path=str(file_path)
    )
    audio_dict = audio_obj.model_dump()
    audio_dict['created_at'] = audio_dict['created_at'].isoformat()
    
    await db.audios.insert_one(audio_dict)
    await db.sections.update_one({"id": section_id}, {"$inc": {"audios_count": 1}})
    
    return audio_obj

@api_router.post("/sections/{section_id}/audio/generate", response_model=Audio)
async def generate_audio(
    section_id: str,
    language: str = Form(...),
    voice: str = Form("alloy"),
    current_user: dict = Depends(get_current_user)
):
    # Security: Verify section belongs to current user
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Check ownership
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Check website access (owner or collaborator)
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied: You don't have access to this section")
    
    try:
        audio_bytes = await tts.generate_speech(
            text=section['selected_text'],
            model="tts-1",
            voice=voice
        )
        
        file_id = str(uuid.uuid4())
        file_path = AUDIO_DIR / f"{file_id}.mp3"
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(audio_bytes)
        
        audio_obj = Audio(
            section_id=section_id,
            language=language,
            audio_url=f"/api/uploads/audio/{file_id}.mp3",
            file_path=str(file_path),
            captions=section['selected_text']
        )
        audio_dict = audio_obj.model_dump()
        audio_dict['created_at'] = audio_dict['created_at'].isoformat()
        
        await db.audios.insert_one(audio_dict)
        await db.sections.update_one({"id": section_id}, {"$inc": {"audios_count": 1}})
        
        return audio_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

@api_router.get("/sections/{section_id}/audio", response_model=List[Audio])
async def get_audios(section_id: str, current_user: dict = Depends(get_current_user)):
    # Security: Verify section belongs to current user
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Check website access (owner or collaborator)
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied: You don't have access to this section")
    
    audios = await db.audios.find({"section_id": section_id}, {"_id": 0}).to_list(1000)
    
    # SIGN URLS
    for audio in audios:
        if not audio['audio_url'].startswith("/"):
            key = audio.get('file_path')
            if not key and 'amazonaws.com' in audio['audio_url']:
                key = audio['audio_url'].split('.amazonaws.com/')[-1]
            if key:
                audio['audio_url'] = s3_service.generate_presigned_url(key)
    
    return audios

@api_router.delete("/audios/{audio_id}")
async def delete_audio(audio_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an audio file"""
    # Find the audio
    audio = await db.audios.find_one({"id": audio_id}, {"_id": 0})
    if not audio:
        raise HTTPException(status_code=404, detail="Audio not found")
    
    # Security: Verify audio belongs to current user
    section = await db.sections.find_one({"id": audio['section_id']}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete from database
    await db.audios.delete_one({"id": audio_id})
    
    return {"message": "Audio deleted successfully"}


# Text Translation API
@api_router.post("/sections/{section_id}/translations", response_model=TextTranslation)
async def create_text_translation(
    section_id: str,
    language: str = Form(...),
    language_code: str = Form(...),
    text_content: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Create a text translation for a section"""
    # Verify section exists and user has access
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create translation
    translation = TextTranslation(
        section_id=section_id,
        language=language,
        language_code=language_code,
        text_content=text_content
    )
    
    translation_dict = translation.model_dump()
    translation_dict['created_at'] = translation_dict['created_at'].isoformat()
    await db.text_translations.insert_one(translation_dict)
    
    return translation

@api_router.get("/sections/{section_id}/translations", response_model=List[TextTranslation])
async def get_text_translations(section_id: str):
    """Get all text translations for a section"""
    translations = await db.text_translations.find({"section_id": section_id}, {"_id": 0}).to_list(1000)
    return translations

@api_router.delete("/translations/{translation_id}")
async def delete_text_translation(translation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a text translation"""
    # Find the translation
    translation = await db.text_translations.find_one({"id": translation_id}, {"_id": 0})
    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")
    
    # Security: Verify translation belongs to current user
    section = await db.sections.find_one({"id": translation['section_id']}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page = await db.pages.find_one({"id": section['page_id']}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not await check_website_access(page['website_id'], current_user['id']):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete from database
    await db.text_translations.delete_one({"id": translation_id})
    
    return {"message": "Translation deleted successfully"}

# Widget API (Public)
@api_router.get("/widget/{website_id}/content")
async def get_widget_content(website_id: str, page_url: str):
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    page = await db.pages.find_one({"website_id": website_id, "url": page_url, "status": "Active"}, {"_id": 0})
    if not page:
        return {"sections": []}
    
    sections = await db.sections.find({"page_id": page['id'], "status": "Active"}, {"_id": 0}).sort([("position_order", 1), ("order", 1)]).to_list(1000)
    
    # Normalize field names: use 'text_content' for consistency with widget
    for section in sections:
        # Handle both 'text' and 'selected_text' fields
        if 'text' in section and 'text_content' not in section:
            section['text_content'] = section['text']
        elif 'selected_text' in section and 'text_content' not in section:
            section['text_content'] = section['selected_text']
    
    # Optimize: Batch fetch all videos and audios to avoid N+1 queries
    section_ids = [section['id'] for section in sections]
    
    if section_ids:
        all_videos = await db.videos.find({"section_id": {"$in": section_ids}}, {"_id": 0}).to_list(10000)
        all_audios = await db.audios.find({"section_id": {"$in": section_ids}}, {"_id": 0}).to_list(10000)
        all_translations = await db.text_translations.find({"section_id": {"$in": section_ids}}, {"_id": 0}).to_list(10000)
        
        # Create lookup dictionaries for O(1) access AND SIGN URLS
        videos_by_section = {}
        for video in all_videos:
            # SIGN VIDEO URL
            if not video['video_url'].startswith("/"):
                key = video.get('file_path')
                if not key and 'amazonaws.com' in video['video_url']:
                    key = video['video_url'].split('.amazonaws.com/')[-1]
                if key:
                    video['video_url'] = s3_service.generate_presigned_url(key)

            if video['section_id'] not in videos_by_section:
                videos_by_section[video['section_id']] = []
            videos_by_section[video['section_id']].append(video)
        
        audios_by_section = {}
        for audio in all_audios:
            # SIGN AUDIO URL
            if not audio['audio_url'].startswith("/"):
                key = audio.get('file_path')
                if not key and 'amazonaws.com' in audio['audio_url']:
                    key = audio['audio_url'].split('.amazonaws.com/')[-1]
                if key:
                    audio['audio_url'] = s3_service.generate_presigned_url(key)

            if audio['section_id'] not in audios_by_section:
                audios_by_section[audio['section_id']] = []
            audios_by_section[audio['section_id']].append(audio)
        
        translations_by_section = {}
        for translation in all_translations:
            if translation['section_id'] not in translations_by_section:
                translations_by_section[translation['section_id']] = []
            translations_by_section[translation['section_id']].append(translation)
        
        # Attach videos, audios, and translations to each section
        for section in sections:
            section['videos'] = videos_by_section.get(section['id'], [])
            section['audios'] = audios_by_section.get(section['id'], [])
            section['translations'] = translations_by_section.get(section['id'], [])
    
    # Track analytics
    await db.analytics.update_one(
        {"website_id": website_id, "page_url": page_url},
        {"$inc": {"views": 1}},
        upsert=True
    )
    
    return {"sections": sections}

# Analytics
@api_router.get("/analytics/{website_id}")
async def get_analytics(website_id: str, current_user: dict = Depends(get_current_user)):
    website = await db.websites.find_one({"id": website_id, "owner_id": current_user['id']})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    analytics = await db.analytics.find({"website_id": website_id}, {"_id": 0}).to_list(1000)
    return analytics

@api_router.get("/analytics/overview")
async def get_analytics_overview(current_user: dict = Depends(get_current_user)):
    """Get aggregated analytics across all user's websites"""
    
    # Get all user's websites
    websites = await db.websites.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
    website_ids = [w['id'] for w in websites]
    
    # Get all analytics data
    all_analytics = await db.analytics.find(
        {"website_id": {"$in": website_ids}}, 
        {"_id": 0}
    ).to_list(10000)
    
    # Calculate total activations (views)
    total_activations = sum(a.get('views', 0) for a in all_analytics)
    
    # Get modality usage
    modality_usage = {
        "asl": sum(a.get('asl_views', 0) for a in all_analytics),
        "audio": sum(a.get('audio_plays', 0) for a in all_analytics),
        "text": sum(a.get('text_views', 0) for a in all_analytics)
    }
    
    # Get top pages (sorted by views)
    top_pages = sorted(all_analytics, key=lambda x: x.get('views', 0), reverse=True)[:5]
    top_pages_data = [{"url": p.get('page_url', 'Unknown'), "views": p.get('views', 0)} for p in top_pages]
    
    # Get top content (for now, return placeholder)
    top_content = []
    
    # Get top languages (placeholder for now)
    top_languages = [
        {"code": "EN", "name": "English", "count": total_activations},
    ]
    
    return {
        "totalActivations": total_activations,
        "topPages": top_pages_data,
        "topContent": top_content,
        "modalityUsage": modality_usage,
        "topLanguages": top_languages
    }

# User invitations
class UserInvite(BaseModel):
    email: EmailStr
    role: str

@api_router.post("/users/invite")
async def invite_user(invite: UserInvite, current_user: dict = Depends(get_current_user)):
    """Send invitation to add a new user"""
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": invite.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create invitation record
    invitation = {
        "id": str(uuid.uuid4()),
        "email": invite.email,
        "role": invite.role,
        "invited_by": current_user['id'],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending"
    }
    
    await db.invitations.insert_one(invitation)
    
    # In a real app, you would send an email here
    # For now, we'll just return success
    
    return {"message": f"Invitation sent to {invite.email}", "invitation_id": invitation['id']}

# Clean up orphaned media files
@api_router.post("/admin/cleanup-orphaned-media")
async def cleanup_orphaned_media(current_user: dict = Depends(get_current_user)):
    """Remove database records for videos/audio files that no longer exist on disk"""
    
    videos_removed = 0
    audios_removed = 0
    
    # Check all videos
    videos = await db.videos.find({}, {"_id": 0}).to_list(10000)
    for video in videos:
        file_path = Path(video.get('file_path', ''))
        if not file_path.exists():
            await db.videos.delete_one({"id": video['id']})
            # Update section video count
            await db.sections.update_one(
                {"id": video['section_id']},
                {"$inc": {"videos_count": -1}}
            )
            videos_removed += 1
    
    # Check all audios
    audios = await db.audios.find({}, {"_id": 0}).to_list(10000)
    for audio in audios:
        file_path = Path(audio.get('file_path', ''))
        if not file_path.exists():
            await db.audios.delete_one({"id": audio['id']})
            # Update section audio count
            await db.sections.update_one(
                {"id": audio['section_id']},
                {"$inc": {"audios_count": -1}}
            )
            audios_removed += 1
    
    return {
        "message": "Cleanup complete",
        "videos_removed": videos_removed,
        "audios_removed": audios_removed
    }

# Serve uploaded files
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Static files (uploads)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Serve PDF directly with proper headers
@api_router.get("/pivot-one-pager.pdf")
async def serve_pdf():
    from fastapi.responses import FileResponse
    pdf_path = ROOT_DIR / "static" / "PIVOT-ONE-PAGER.pdf"
    return FileResponse(pdf_path, media_type="application/pdf", headers={"Content-Disposition": "inline"})

# Mount static directory for widget files
STATIC_DIR = ROOT_DIR / "static"
app.mount("/api/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Serve widget.js through both routes
@app.get("/widget.js")
async def serve_widget():
    widget_path = ROOT_DIR / "static" / "widget.js"
    return FileResponse(widget_path, media_type="application/javascript")

@app.get("/api/widget.js")
async def serve_widget_api():
    widget_path = ROOT_DIR / "static" / "widget.js"
    return FileResponse(widget_path, media_type="application/javascript")

# Serve demo page
@app.get("/demo")
async def serve_demo():
    demo_path = ROOT_DIR / "static" / "demo.html"
    return FileResponse(demo_path, media_type="text/html")

# Serve widget test page
@app.get("/test-widget")
async def serve_test_widget():
    test_path = ROOT_DIR / "static" / "test-widget.html"
    return FileResponse(test_path, media_type="text/html")

# Serve widget preview page
@app.get("/widget-preview")
async def serve_widget_preview():
    preview_path = ROOT_DIR / "static" / "widget-preview.html"
    return FileResponse(preview_path, media_type="text/html")

# Serve simple widget test page
@app.get("/simple-test")
async def serve_simple_test():
    test_path = ROOT_DIR / "static" / "simple-test.html"
    return FileResponse(test_path, media_type="text/html")

# Serve testing.gopivot.me test page
@api_router.get("/test-widget-page")
async def serve_test_widget_page():
    from fastapi.responses import HTMLResponse
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PIVOT Widget Test - testing.gopivot.me/pivot-widget-test/</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #333;
        }
        .info-box {
            background: #f4f4f4;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .content-section {
            margin: 30px 0;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <h1>PIVOT Widget Test Page</h1>
    
    <div class="info-box">
        <strong>Simulating URL:</strong> https://testing.gopivot.me/pivot-widget-test/<br>
        <strong>Widget Status:</strong> Widget should appear in the bottom-right corner<br>
        <strong>Note:</strong> This is a test page showing how the widget will work after deployment
    </div>

    <div class="content-section">
        <h2>Welcome Section</h2>
        <p>Welcome to our PIVOT accessibility demo! This section demonstrates how we provide multiple modalities for content access.</p>
    </div>

    <div class="content-section">
        <h2>Features Section</h2>
        <p>Our platform offers ASL video interpretation, text-to-speech audio, and text transcripts for every section of your content.</p>
    </div>

    <div class="content-section">
        <h2>Getting Started</h2>
        <p>Click on any section to view the corresponding content in your preferred format. All modalities are synchronized for easy navigation.</p>
    </div>

    <!-- PIVOT Widget Embed Code (using current environment) -->
    <script>
        // Override window.location.href for testing purposes
        Object.defineProperty(window, 'location', {
            value: {
                href: 'https://testing.gopivot.me/pivot-widget-test/',
                origin: 'https://testing.gopivot.me',
                protocol: 'https:',
                host: 'testing.gopivot.me',
                hostname: 'testing.gopivot.me',
                pathname: '/pivot-widget-test/'
            },
            writable: false
        });
    </script>
    <script src="/api/widget.js" data-website-id="fe05622a-8043-41c7-958c-5c657a701fc1"></script>
</body>
</html>"""
    return HTMLResponse(content=html_content)

# Test page for DDS
@api_router.get("/test-dds-page")
async def serve_test_dds_page():
    from fastapi.responses import HTMLResponse
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DDS - Developmental Disabilities Services</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        .info-box { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .content-section { margin: 30px 0; padding: 20px; background: #fff; border: 1px solid #ddd; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>DDS - Developmental Disabilities Services</h1>
    <div class="info-box">
        <strong>Page:</strong> testing.gopivot.me/dds<br>
        <strong>Widget:</strong> Active (bottom-right corner)
    </div>
    <div class="content-section">
        <h2>DDS Introduction</h2>
        <p>Welcome to the DDS (Developmental Disabilities Services) section. This page provides accessible information about developmental disability services.</p>
    </div>
    <div class="content-section">
        <h2>Services Overview</h2>
        <p>Our DDS program offers comprehensive support services including case management, therapy services, and community integration programs.</p>
    </div>
    <div class="content-section">
        <h2>How to Apply</h2>
        <p>To apply for DDS services, please contact your regional center or visit our application portal for more information.</p>
    </div>
    <script src="/api/widget.js" data-website-id="fe05622a-8043-41c7-958c-5c657a701fc1"></script>
</body>
</html>"""
    return HTMLResponse(content=html_content)

# Test page for PDF
@api_router.get("/test-pdf-page")
async def serve_test_pdf_page():
    from fastapi.responses import HTMLResponse
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Resources</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        .info-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .content-section { margin: 30px 0; padding: 20px; background: #fff; border: 1px solid #ddd; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>PDF Resources</h1>
    <div class="info-box">
        <strong>Page:</strong> testing.gopivot.me/pdf<br>
        <strong>Widget:</strong> Active (bottom-right corner)
    </div>
    <div class="content-section">
        <h2>PDF Resources Introduction</h2>
        <p>Access our library of PDF resources and documents. All materials are available in multiple accessible formats.</p>
    </div>
    <div class="content-section">
        <h2>Document Categories</h2>
        <p>Browse through our categorized collection of forms, guides, and informational materials organized by topic.</p>
    </div>
    <div class="content-section">
        <h2>Accessibility Features</h2>
        <p>All PDF documents include screen reader compatibility, alternative text descriptions, and can be accessed through our multi-modal interface.</p>
    </div>
    <script src="/api/widget.js" data-website-id="fe05622a-8043-41c7-958c-5c657a701fc1"></script>
</body>
</html>"""
    return HTMLResponse(content=html_content)


app.include_router(api_router)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "https://testing.gopivot.me",
    "https://demo.gopivot.me",
    "https://app.gopivot.me",
    "https://a11y-pivot.emergent.host"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
