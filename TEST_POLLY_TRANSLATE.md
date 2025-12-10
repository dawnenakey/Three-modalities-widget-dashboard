# Testing AWS Polly & Translate Integration

## Quick Test Guide

### Prerequisites
- Server running: http://localhost:8001
- MongoDB connected ✅
- AWS credentials configured ✅

## Test Endpoints

### 1. Test Auto-Translation

**Endpoint**: `POST /api/sections/{section_id}/translations/generate`

**Steps**:
1. Open http://localhost:8001/docs
2. Find endpoint: `POST /api/sections/{section_id}/translations/generate`
3. Click "Try it out"
4. Enter:
   - `section_id`: (use a real section ID from your database)
   - `target_language`: "Spanish" (or "es", "fr", etc.)
   - `language_code`: "ES"
5. Click "Execute"

**Expected**: Returns translated text stored in database

---

### 2. Test Polly Audio Generation

**Endpoint**: `POST /api/sections/{section_id}/audio/generate`

**Steps**:
1. Open http://localhost:8001/docs
2. Find endpoint: `POST /api/sections/{section_id}/audio/generate`
3. Click "Try it out"
4. Enter:
   - `section_id`: (use a real section ID)
   - `language`: "Spanish"
   - `voice`: "alloy" (ignored for Polly, auto-selected)
   - `provider`: "polly" ⭐ **NEW PARAMETER**
5. Click "Execute"

**Expected**: Returns audio object with S3 URL

---

### 3. Test Combined Translate + Audio

**Endpoint**: `POST /api/sections/{section_id}/audio/generate-translated`

**Steps**:
1. Open http://localhost:8001/docs
2. Find endpoint: `POST /api/sections/{section_id}/audio/generate-translated`
3. Click "Try it out"
4. Enter:
   - `section_id`: (use a real section ID)
   - `target_language`: "Spanish"
   - `language_code`: "ES"
5. Click "Execute"

**Expected**: Returns both translation and audio objects

---

## Using curl (Alternative)

### Get a Section ID First
```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Get websites to find a section
curl -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/websites
```

### Test Translation
```bash
curl -X POST http://localhost:8001/api/sections/{SECTION_ID}/translations/generate \
  -H "Authorization: Bearer $TOKEN" \
  -F "target_language=Spanish" \
  -F "language_code=ES"
```

### Test Polly Audio
```bash
curl -X POST http://localhost:8001/api/sections/{SECTION_ID}/audio/generate \
  -H "Authorization: Bearer $TOKEN" \
  -F "language=Spanish" \
  -F "provider=polly"
```

### Test Combined
```bash
curl -X POST http://localhost:8001/api/sections/{SECTION_ID}/audio/generate-translated \
  -H "Authorization: Bearer $TOKEN" \
  -F "target_language=Spanish" \
  -F "language_code=ES"
```

## What to Verify

### ✅ Translation Endpoint
- [ ] Returns translated text
- [ ] Translation stored in database
- [ ] Can retrieve translation via GET endpoint

### ✅ Polly Audio Endpoint
- [ ] Generates audio successfully
- [ ] Audio stored in S3
- [ ] Audio URL is accessible
- [ ] Audio plays in browser/widget

### ✅ Combined Endpoint
- [ ] Translation created
- [ ] Audio generated
- [ ] Both stored correctly
- [ ] Audio URL works

## Troubleshooting

### "AWS credentials not configured"
- Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `backend/.env`
- Restart server after updating

### "Polly error" or "Translate error"
- Verify AWS credentials are correct
- Check AWS region matches (us-east-1)
- Verify IAM user has Polly and Translate permissions

### Audio not playing
- Check S3 bucket CORS configuration
- Verify presigned URL is valid
- Check audio file exists in S3

## Next Steps After Testing

1. ✅ Verify all endpoints work
2. Update frontend to use new endpoints
3. Add UI for language selection
4. Deploy to EC2

