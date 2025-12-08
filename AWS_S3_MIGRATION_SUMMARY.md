# AWS S3 Migration Summary

## Changes Made

### 1. Backend Changes
- ✅ Created `/app/backend/s3_service.py` - New S3 service module with presigned URL generation
- ✅ Updated `/app/backend/server.py`:
  - Replaced `r2_client` import with `s3_service`
  - Updated `/sections/{id}/video/upload-url` endpoint to use S3
  - Updated `/sections/{id}/audio/upload-url` endpoint to use S3
  - Added file validation for size and type

### 2. Environment Configuration
- ✅ Added to `/app/backend/.env`:
  - `S3_BUCKET_NAME=pivot-s3-bucket`
  - `PRESIGNED_URL_EXPIRATION=600`
  - AWS credentials fields ready for your values

### 3. Frontend Changes
- ✅ Dashboard "Caption Settings" → "Text Settings"
- ✅ Widget text highlighting removed from panel
- ✅ Widget webpage highlighting added (finds and highlights text on actual page)
- ✅ Updated widget.js ready for download at `/app/frontend/public/widget-updated.js`

### 4. S3 Configuration Details
- **Bucket**: pivot-s3-bucket
- **Folder Structure**: 
  - Videos: `media/videos/`
  - Audio: `media/audio/`
- **Upload Method**: Presigned PUT URLs (same as R2 approach)
- **Max File Size**: 500MB
- **URL Expiration**: 10 minutes (600 seconds)

## S3 Bucket CORS Configuration Required

You need to add this CORS policy to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "GET", "HEAD"],
        "AllowedOrigins": [
            "https://testing.gopivot.me",
            "http://localhost:3000"
        ],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

## Deployment Steps

1. **Update AWS Credentials in .env**:
   - Replace `your_aws_access_key_here` with actual key
   - Replace `your_aws_secret_key_here` with actual secret
   - Confirm AWS_REGION (default: us-east-1)

2. **Add CORS Policy to S3 Bucket**:
   - Go to AWS Console → S3 → pivot-s3-bucket → Permissions → CORS
   - Paste the JSON above

3. **Deploy Application**

4. **Download Updated Widget**:
   - After deployment: `https://testing.gopivot.me/widget-updated.js`
   - Upload to R2 as `widget.js` (replaces old version)

5. **Test Upload**:
   - Login to dashboard
   - Navigate to a section
   - Try uploading video/audio

## What This Fixes

✅ Dashboard upload functionality (presigned URLs to S3)
✅ Widget text highlighting on actual webpage (not in panel)
✅ Dashboard UI: "Caption" → "Text"
✅ More reliable upload infrastructure with AWS S3
✅ Proper file validation (size, type, extensions)

## Files Modified

- `/app/backend/s3_service.py` (NEW)
- `/app/backend/server.py` (MODIFIED)
- `/app/backend/.env` (MODIFIED)
- `/app/frontend/src/pages/SectionDetail.js` (MODIFIED - Caption→Text)
- `/app/backend/static/widget.js` (MODIFIED - highlighting)
- `/app/frontend/public/widget-updated.js` (NEW - for download)

## Next Steps After Deployment

1. Update AWS credentials in .env
2. Add CORS policy to S3 bucket
3. Deploy
4. Download widget from testing.gopivot.me/widget-updated.js
5. Upload to R2 as widget.js
6. Test dashboard upload feature!
