"""
Cloudflare R2 Client for Direct Upload
Handles presigned URL generation for client-side uploads
"""

import os
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class R2Client:
    def __init__(self):
        self.account_id = os.getenv('R2_ACCOUNT_ID')
        self.access_key = os.getenv('R2_ACCESS_KEY_ID')
        self.secret_key = os.getenv('R2_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('R2_BUCKET_NAME', 'pivot-media')
        self.public_url = os.getenv('R2_PUBLIC_URL')
        
        if not all([self.account_id, self.access_key, self.secret_key]):
            logger.warning("R2 credentials not configured. Direct uploads will not work.")
            self.client = None
            return
        
        # Configure S3 client for R2
        # Use path-style addressing for R2 compatibility
        self.client = boto3.client(
            's3',
            endpoint_url=f'https://{self.account_id}.r2.cloudflarestorage.com',
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            config=Config(
                signature_version='s3v4',
                s3={'addressing_style': 'path'}
            ),
            region_name='auto'
        )
    
    def generate_presigned_upload_url(
        self,
        file_key: str,
        content_type: str = 'video/mp4',
        expires_in: int = 3600
    ) -> Optional[Dict]:
        """
        Generate a presigned PUT URL for uploading to R2
        (R2 does not support presigned POST - must use PUT)
        
        Args:
            file_key: The S3 key where the file will be stored
            content_type: MIME type of the file (e.g., video/mp4, video/quicktime)
            expires_in: URL expiration time in seconds
        
        Returns:
            Dictionary with 'upload_url', 'public_url', and 'file_key'
        """
        if not self.client:
            logger.error("R2 client not initialized - cannot generate presigned URL")
            return None
        
        # Log which bucket we're using for debugging
        logger.info(f"Generating presigned PUT URL for bucket: {self.bucket_name}, key: {file_key}")
        
        try:
            # Generate presigned PUT URL (R2 supports PUT, not POST)
            presigned_url = self.client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key,
                    'ContentType': content_type
                },
                ExpiresIn=expires_in
            )
            
            # Construct public URL with fallback
            public_url_base = self.public_url or f"https://pub-{self.account_id}.r2.dev"
            public_url = f"{public_url_base}/{file_key}"
            
            logger.info(f"Generated presigned PUT URL successfully. Public URL: {public_url}")
            
            return {
                'upload_url': presigned_url,
                'public_url': public_url,
                'file_key': file_key,
                'method': 'PUT'  # Tell frontend to use PUT
            }
            
        except Exception as e:
            logger.error(f"Failed to generate presigned URL: {str(e)}")
            return None
    
    def generate_presigned_download_url(self, file_key: str, expires_in: int = 3600):
        """
        Generate a presigned URL for downloading/viewing a file
        
        Args:
            file_key: The key/path of the file in R2
            expires_in: URL expiration time in seconds
        
        Returns:
            str: Presigned download URL
        """
        if not self.client:
            raise ValueError("R2 client not configured")
        
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating download URL: {e}")
            raise
    
    def delete_file(self, file_key: str):
        """
        Delete a file from R2
        
        Args:
            file_key: The key/path of the file to delete
        
        Returns:
            bool: True if successful
        """
        if not self.client:
            raise ValueError("R2 client not configured")
        
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            return True
        except ClientError as e:
            logger.error(f"Error deleting file: {e}")
            return False


# Singleton instance
r2_client = R2Client()
