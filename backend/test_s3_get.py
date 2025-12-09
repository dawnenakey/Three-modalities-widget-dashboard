#!/usr/bin/env python3
"""
Test if we can create a presigned GET url manually
"""
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

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

def generate_presigned_url(file_key: str) -> str:
    try:
        url = s3_client.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': S3_BUCKET_NAME,
                'Key': file_key
            },
            ExpiresIn=3600
        )
        return url
    except ClientError as e:
        print(f"Error: {e}")
        return "ERROR"

if __name__ == "__main__":
    # Test key
    key = "media/videos/4_PIVOT-InformativePDF2025.MOV"
    print(f"Generating URL for key: {key}")
    url = generate_presigned_url(key)
    print(f"URL: {url}")
