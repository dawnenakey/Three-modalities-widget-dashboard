# 🚀 R2 Direct Upload Implementation Guide

## Overview
This document explains the permanent solution for client video/audio uploads using Cloudflare R2 with presigned URLs.

---

## 📋 Prerequisites

### 1. Get R2 Credentials from Cloudflare

1. **Login to Cloudflare Dashboard:** https://dash.cloudflare.com/
2. **Navigate to R2:**
   - Click "R2" in the left sidebar
   - Or go to: https://dash.cloudflare.com/[your-account-id]/r2

3. **Create a Bucket** (if not already created):
   - Click "Create bucket"
   - Name: `pivot-media` (or your preferred name)
   - Location: Automatic (recommended)
   - Click "Create bucket"

4. **Get Account ID:**
   - Visible at top of R2 dashboard
   - Format: `abc123def456`

5. **Create R2 API Token:**
   - Go to "Manage R2 API Tokens"
   - Click "Create API token"
   - Permissions: "Read & Write"
   - Bucket: Select your bucket or "All buckets"
   - Click "Create API token"
   - **SAVE THESE** (shown only once):
     - Access Key ID
     - Secret Access Key

6. **Set Custom Domain** (Optional but recommended):
   - In bucket settings, add custom domain
   - Or use default: `https://pub-[hash].r2.dev`

---

## ⚙️ Backend Setup

### Step 1: Update Environment Variables

Add to `/app/backend/.env`:

```env
# Cloudflare R2 Storage (For Video/Audio Uploads)
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_r2_access_key_here
R2_SECRET_ACCESS_KEY=your_r2_secret_key_here
R2_BUCKET_NAME=pivot-media
R2_PUBLIC_URL=https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev
```

**Replace:**
- `your_account_id_here` with your Account ID
- `your_r2_access_key_here` with your Access Key ID
- `your_r2_secret_key_here` with your Secret Access Key
- `R2_PUBLIC_URL` with your R2 bucket public URL

### Step 2: Files Already Created

✅ `/app/backend/r2_client.py` - R2 client implementation
✅ `/app/backend/server.py` - New API endpoints added

---

## 🔄 Upload Flow (How It Works)

### For Video Upload:

```
1. Frontend: Request upload URL
   POST /api/sections/{section_id}/video/upload-url
   Body: { filename: "video.mp4", content_type: "video/mp4" }

2. Backend: Generate presigned URL
   Returns: { upload_url, fields, public_url, file_id }

3. Frontend: Upload directly to R2
   POST to upload_url with fields + video file

4. Frontend: Confirm upload
   POST /api/sections/{section_id}/video/confirm
   Body: { file_key, public_url, language }

5. Backend: Save to database
   Returns: Video object with R2 URL
```

### For Audio Upload:

Same flow but use:
- `/sections/{section_id}/audio/upload-url`
- `/sections/{section_id}/audio/confirm`

---

## 💰 Cost Analysis

**Cloudflare R2 Pricing:**
- Storage: $0.015/GB/month
- Class A Operations (uploads): $4.50/million
- Class B Operations (reads): $0.36/million
- Egress: **FREE** (major advantage over S3)

**Example for 10 Clients/Month:**
- 10 clients × 10 videos × 50MB = 5GB storage
- Monthly cost: 5GB × $0.015 = **$0.075/month**
- Upload operations: ~100 uploads × $0.0000045 = **$0.00045**
- **Total: ~$0.08/month**

Compare to backend storage: Limited by server disk + bandwidth costs

---

## ✅ Advantages Over Backend Upload

| Feature | Backend Upload | R2 Direct Upload |
|---------|---------------|------------------|
| File Size Limit | 140MB (proxy limit) | 5GB |
| Upload Speed | Slow (2 hops) | Fast (direct) |
| Server Load | High | Zero |
| Bandwidth Cost | High | Free egress |
| Scalability | Limited | Unlimited |
| CDN Delivery | No | Yes (global) |
| Reliability | Server dependent | 99.9% SLA |

---

## 🧪 Testing the Implementation

### Test with curl:

```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST "https://testing.gopivot.me/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dawnena@dozanu.com","password":"pivot2025"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# 2. Get upload URL
curl -s -X POST "https://testing.gopivot.me/api/sections/{section_id}/video/upload-url" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.mp4","content_type":"video/mp4"}'

# 3. Upload to R2 (use upload_url and fields from step 2)
# Use browser or multipart form upload

# 4. Confirm upload
curl -s -X POST "https://testing.gopivot.me/api/sections/{section_id}/video/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"file_key":"videos/uuid.mp4","public_url":"https://...","language":"ASL"}'
```

---

## 🔐 Security Features

✅ **Presigned URLs expire** after 1 hour
✅ **User authentication required** to generate URLs
✅ **Website ownership verified** before allowing uploads
✅ **File type restrictions** via content-type
✅ **Size limits enforced** (5GB max)

---

## 🎯 Next Steps

1. **Get R2 credentials** from Cloudflare
2. **Update `.env` file** with your credentials
3. **Deploy backend** with new endpoints
4. **Update frontend** to use new upload flow (see frontend section below)
5. **Test uploads** with a few videos
6. **Monitor R2 dashboard** for usage

---

## 📊 Monitoring

**In Cloudflare R2 Dashboard:**
- View storage used
- Track operations count
- Monitor bandwidth
- Set up usage alerts

**Recommended Alerts:**
- Storage > 10GB
- Operations > 10,000/day
- Unusual spike in uploads

---

## 🐛 Troubleshooting

**"R2 client not configured"**
- Check .env variables are set
- Restart backend after .env changes

**"Access denied" on upload**
- Verify API token permissions (Read & Write)
- Check bucket name matches

**Upload fails silently**
- Check CORS settings on R2 bucket
- Verify presigned URL hasn't expired
- Check file size < 5GB

**Video doesn't play in widget**
- Verify public URL is accessible
- Check R2 bucket is set to public
- Confirm video codec is supported (H.264 recommended)

---

## 📞 Support

For R2-specific issues:
- Cloudflare R2 Docs: https://developers.cloudflare.com/r2/
- Cloudflare Support: https://dash.cloudflare.com/support

For PIVOT implementation issues:
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Test endpoints with curl
- Verify database records created

---

**Implementation Status:** ✅ Ready to deploy
**Next Action:** Get R2 credentials and update .env file
