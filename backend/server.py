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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
    position_order: int
    status: str = "Not Setup"  # Not Setup, Needs Review, Active
    videos_count: int = 0
    audios_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SectionCreate(BaseModel):
    selected_text: str
    position_order: Optional[int] = None

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
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=user_data.email, name=user_data.name)
    user_dict = user.model_dump()
    user_dict['timestamp'] = user_dict['created_at'].isoformat()
    user_dict['password'] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token(user.id)
    return Token(access_token=token, user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    token = create_access_token(user.id)
    return Token(access_token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# Website routes
@api_router.get("/websites", response_model=List[Website])
async def get_websites(current_user: dict = Depends(get_current_user)):
    websites = await db.websites.find({"owner_id": current_user['id']}, {"_id": 0}).to_list(1000)
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
    backend_url = os.getenv("REACT_APP_BACKEND_URL")
    if not backend_url:
        raise ValueError("REACT_APP_BACKEND_URL environment variable is required")
    
    website = Website(
        owner_id=current_user['id'],
        name=website_data.name,
        url=website_data.url,
        embed_code=f'<script src="{backend_url}/widget.js" data-website-id="{{website_id}}"></script>'
    )
    website_dict = website.model_dump()
    website_dict['created_at'] = website_dict['created_at'].isoformat()
    website_dict['embed_code'] = website_dict['embed_code'].replace('{website_id}', website.id)
    
    await db.websites.insert_one(website_dict)
    return website

@api_router.get("/websites/{website_id}", response_model=Website)
async def get_website(website_id: str, current_user: dict = Depends(get_current_user)):
    website = await db.websites.find_one({"id": website_id, "owner_id": current_user['id']}, {"_id": 0})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
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
    website = await db.websites.find_one({"id": website_id, "owner_id": current_user['id']})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    pages = await db.pages.find({"website_id": website_id}, {"_id": 0}).to_list(1000)
    return pages

@api_router.post("/websites/{website_id}/pages", response_model=Page)
async def create_page(website_id: str, page_data: PageCreate, current_user: dict = Depends(get_current_user)):
    website = await db.websites.find_one({"id": website_id, "owner_id": current_user['id']})
    if not website:
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
    try:
        response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(response.content, "html.parser")
        
        for element in soup(['script', 'style', 'nav', 'footer', 'header']):
            element.decompose()
        
        texts = []
        for tag in soup.find_all(['h1', 'h2', 'h3', 'p']):
            text = tag.get_text(strip=True)
            if len(text) > 20:
                texts.append(text[:500])
        
        return texts[:50]
    except Exception as e:
        logging.error(f"Scraping error: {e}")
        return []

@api_router.get("/pages/{page_id}", response_model=Page)
async def get_page(page_id: str, current_user: dict = Depends(get_current_user)):
    page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@api_router.delete("/pages/{page_id}")
async def delete_page(page_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    # Also delete associated sections
    await db.sections.delete_many({"page_id": page_id})
    return {"message": "Page deleted"}

# Section routes
@api_router.get("/pages/{page_id}/sections", response_model=List[Section])
async def get_sections(page_id: str, current_user: dict = Depends(get_current_user)):
    sections = await db.sections.find({"page_id": page_id}, {"_id": 0}).sort("position_order", 1).to_list(1000)
    return sections

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

# Video routes
@api_router.post("/sections/{section_id}/videos", response_model=Video)
async def upload_video(
    section_id: str,
    language: str = Form(...),
    video: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    section = await db.sections.find_one({"id": section_id})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
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
    videos = await db.videos.find({"section_id": section_id}, {"_id": 0}).to_list(1000)
    return videos

# Audio routes
@api_router.post("/sections/{section_id}/audio", response_model=Audio)
async def upload_audio(
    section_id: str,
    language: str = Form(...),
    audio: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    section = await db.sections.find_one({"id": section_id})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
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
    section = await db.sections.find_one({"id": section_id})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
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
    audios = await db.audios.find({"section_id": section_id}, {"_id": 0}).to_list(1000)
    return audios

# Widget API (Public)
@api_router.get("/widget/{website_id}/content")
async def get_widget_content(website_id: str, page_url: str):
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    page = await db.pages.find_one({"website_id": website_id, "url": page_url, "status": "Active"}, {"_id": 0})
    if not page:
        return {"sections": []}
    
    sections = await db.sections.find({"page_id": page['id'], "status": "Active"}, {"_id": 0}).sort("position_order", 1).to_list(1000)
    
    # Optimize: Batch fetch all videos and audios to avoid N+1 queries
    section_ids = [section['id'] for section in sections]
    
    if section_ids:
        all_videos = await db.videos.find({"section_id": {"$in": section_ids}}, {"_id": 0}).to_list(10000)
        all_audios = await db.audios.find({"section_id": {"$in": section_ids}}, {"_id": 0}).to_list(10000)
        
        # Create lookup dictionaries for O(1) access
        videos_by_section = {}
        for video in all_videos:
            if video['section_id'] not in videos_by_section:
                videos_by_section[video['section_id']] = []
            videos_by_section[video['section_id']].append(video)
        
        audios_by_section = {}
        for audio in all_audios:
            if audio['section_id'] not in audios_by_section:
                audios_by_section[audio['section_id']] = []
            audios_by_section[audio['section_id']].append(audio)
        
        # Attach videos and audios to each section
        for section in sections:
            section['videos'] = videos_by_section.get(section['id'], [])
            section['audios'] = audios_by_section.get(section['id'], [])
    
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

# Serve uploaded files
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Static files (uploads)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Serve widget.js
@app.get("/widget.js")
async def serve_widget():
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



app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()