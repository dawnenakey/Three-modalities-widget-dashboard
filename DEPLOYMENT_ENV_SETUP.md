# Environment Variables Setup for Deployment

## 🚨 CRITICAL: Why Video Uploads Aren't Working

**Problem:** `.env` files are ignored by Git (for security), so when you deploy, R2 credentials are missing!

**Solution:** Set environment variables in Emergent's deployment settings.

---

## Required Environment Variables

### Backend Environment Variables:
```
MONGO_URL=mongodb+srv://dawnena_db_user:JJQclDlNLWOLmvot@cluster0.dt2i9ox.mongodb.net/?appName=Cluster0
DB_NAME=pivot_accessibility
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-for-security
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# R2 Cloudflare Credentials (CRITICAL FOR VIDEO UPLOADS)
R2_ACCOUNT_ID=4d5a7cb9f96f18ffb5f6db99f5a00b6e
R2_ACCESS_KEY_ID=d6dd655cdb4bf3b42bb57dcb58b876bf
R2_SECRET_ACCESS_KEY=9bb6f06ea95cfcda0a30e6af70f7f1cb09cb0c2b0b9ee7b7ceacb37ebab1dc6e
R2_BUCKET_NAME=pivot-media
R2_PUBLIC_URL=https://pub-e8e4b23256f3485ca9c2e2b8ece10763.r2.dev
R2_ENDPOINT=https://4d5a7cb9f96f18ffb5f6db99f5a00b6e.r2.cloudflarestorage.com

# OpenAI (for TTS)
OPENAI_API_KEY=sk-proj-xK0yUCxbYTfjRe9//J/hutad1M=
```

### Frontend Environment Variables:
```
REACT_APP_BACKEND_URL=https://signbuddy-18.preview.emergentagent.com
PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

---

## How to Set in Emergent

### Option 1: Use Emergent's Environment Settings
1. Go to your project settings in Emergent
2. Find "Environment Variables" section
3. Add each variable above (name and value)
4. Deploy again

### Option 2: Contact Emergent Support
Ask the support agent for help setting these environment variables in your deployment.

---

## Why This Matters

**Without these variables:**
- ❌ R2 credentials missing → Video uploads fail
- ❌ MongoDB connection fails
- ❌ JWT authentication breaks
- ❌ TTS generation doesn't work

**With these variables:**
- ✅ Video uploads work (direct to R2)
- ✅ Database connections stable
- ✅ Authentication works properly
- ✅ All features functional

---

## Testing After Setup

After setting environment variables and deploying:

1. Check backend logs for "R2 credentials not configured" - should be GONE
2. Try uploading a video - should work without white screen
3. Check if videos appear in the section list
4. Verify widget displays the videos

---

## Security Note

These credentials are already exposed in your local `.env` files. For production:
- Use different credentials
- Rotate keys regularly
- Set up proper access policies on R2 bucket
- Use environment-specific variables (dev vs prod)
