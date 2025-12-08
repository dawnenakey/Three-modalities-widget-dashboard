"""
AWS S3 Service for Direct File Uploads using Presigned URLs
"""
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
PRESIGNED_URL_EXPIRATION = int(os.getenv("PRESIGNED_URL_EXPIRATION", "600"))

# S3 Client Configuration (CRITICAL: signature_version must be s3v4 for presigned PUT URLs)
s3_config = Config(
    region_name=AWS_REGION,
    signature_version="s3v4",
    retries={"max_attempts": 3, "mode": "standard"}
)

s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
    config=s3_config
)

# File Upload Configuration
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv"}
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".aac", ".m4a"}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

def get_content_type(filename: str) -> str:
    """Get MIME type for file"""
    ext = Path(filename).suffix.lower()
    content_types = {
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
        ".avi": "video/x-msvideo",
        ".mkv": "video/x-matroska",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".flac": "audio/flac",
        ".aac": "audio/aac",
        ".m4a": "audio/mp4"
    }
    return content_types.get(ext, "application/octet-stream")

def validate_file(filename: str, file_size: int, file_type: str) -> tuple[bool, str]:
    """Validate file type and size"""
    file_ext = Path(filename).suffix.lower()
    
    if file_type == "video":
        if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
            return False, f"Invalid video extension. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
    elif file_type == "audio":
        if file_ext not in ALLOWED_AUDIO_EXTENSIONS:
            return False, f"Invalid audio extension. Allowed: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
    else:
        return False, "Invalid file type. Must be 'video' or 'audio'"
    
    if file_size > MAX_FILE_SIZE:
        return False, f"File size exceeds {MAX_FILE_SIZE / 1024 / 1024}MB limit"
    
    return True, ""

def generate_presigned_upload_url(filename: str, content_type: str, file_size: int) -> dict:
    """
    Generate a presigned PUT URL for direct browser-to-S3 upload
    Returns dict with upload_url, file_key, and public_url
    
    CRITICAL: Only sign Bucket and Key - nothing else!
    - Do NOT include ContentType (causes signature mismatch)
    - Do NOT include ContentLength (browser sets automatically)
    - Browser will handle all headers automatically
    """
    try:
        # Generate S3 object key with media/ prefix
        file_key = f"media/{filename}"
        
        # Generate presigned URL for PUT operation
        # ONLY include Bucket and Key - let browser handle everything else
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": S3_BUCKET_NAME,
                "Key": file_key
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION
        )
        
        # Generate public URL for accessing the file after upload
        # Since bucket has public read access, use direct public URL (no signature needed)
        public_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_key}"
        
        return {
            "upload_url": presigned_url,  # Presigned PUT URL for upload only
            "file_key": file_key,
            "public_url": public_url,  # Direct public URL for viewing (no signature)
            "expiration": PRESIGNED_URL_EXPIRATION
        }
    except ClientError as e:
        raise Exception(f"Error generating presigned URL: {str(e)}")

def get_public_url(file_key: str) -> str:
    """Generate public URL for accessing an uploaded file"""
    return f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_key}"
