# AWS Polly & Translate Implementation

## ✅ Implementation Complete

AWS Polly (TTS) and AWS Translate have been integrated into the PIVOT application.

## New Services Created

### 1. `backend/polly_service.py`
- AWS Polly text-to-speech service
- Supports 20+ languages with neural voices
- Auto-selects appropriate voice for language
- Falls back to standard voices if neural unavailable

### 2. `backend/translate_service.py`
- AWS Translate text translation service
- Supports 30+ languages
- Auto-detects source language
- Normalizes language codes

## New API Endpoints

### 1. Auto-Translate Text
**Endpoint**: `POST /api/sections/{section_id}/translations/generate`

**Description**: Automatically translates section text to target language using AWS Translate

**Parameters**:
- `target_language`: Target language (e.g., "Spanish", "es", "fr-FR")
- `language_code`: Language code for storage (e.g., "ES", "FR")

**Example**:
```bash
curl -X POST http://localhost:8001/api/sections/{section_id}/translations/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "target_language=Spanish" \
  -F "language_code=ES"
```

**Response**: Returns `TextTranslation` object with translated text

---

### 2. Generate Audio with Provider Choice
**Endpoint**: `POST /api/sections/{section_id}/audio/generate` (Enhanced)

**New Parameter**: `provider` (optional, default: "openai")
- `"openai"`: Use OpenAI TTS (existing)
- `"polly"`: Use AWS Polly TTS (new)

**Example with Polly**:
```bash
curl -X POST http://localhost:8001/api/sections/{section_id}/audio/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "language=Spanish" \
  -F "voice=alloy" \
  -F "provider=polly"
```

**Response**: Returns `Audio` object with audio URL (stored in S3)

---

### 3. Translate + Generate Audio (Combined)
**Endpoint**: `POST /api/sections/{section_id}/audio/generate-translated`

**Description**: One-step process that:
1. Translates text to target language (AWS Translate)
2. Generates audio in that language (AWS Polly)
3. Stores both translation and audio

**Parameters**:
- `target_language`: Target language (e.g., "Spanish", "es")
- `language_code`: Language code for storage (e.g., "ES")

**Example**:
```bash
curl -X POST http://localhost:8001/api/sections/{section_id}/audio/generate-translated \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "target_language=Spanish" \
  -F "language_code=ES"
```

**Response**:
```json
{
  "translation": {
    "id": "...",
    "section_id": "...",
    "language": "Spanish",
    "language_code": "ES",
    "text_content": "Texto traducido..."
  },
  "audio": {
    "id": "...",
    "section_id": "...",
    "language": "Spanish",
    "audio_url": "https://...",
    "captions": "Texto traducido..."
  },
  "message": "Translation and audio generated successfully"
}
```

## Supported Languages

### AWS Polly Voices (Neural)
- English (US/UK): Joanna, Amy
- Spanish (US/Spain/Mexico): Lupe, Conchita
- French: Celine
- German: Marlene
- Italian: Bianca
- Portuguese (Brazil/Portugal): Camila, Ines
- Japanese: Mizuki
- Korean: Seoyeon
- Chinese: Zhiyu
- Arabic: Zeina
- Hindi: Aditi
- Russian: Tatyana
- And more...

### AWS Translate Languages
- 30+ languages supported
- Auto-detects source language
- Common: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic, Hindi, Russian, Dutch, Swedish, Polish, Turkish, Vietnamese, Thai, and more

## Storage

### Audio Files
- **Stored in**: AWS S3 bucket (`pivot-s3-bucket`)
- **Path**: `audio/{file_id}.mp3`
- **Access**: Presigned URLs (valid for 1 hour)
- **Widget**: Uses presigned URLs for playback

### Translations
- **Stored in**: MongoDB `text_translations` collection
- **Accessible via**: Widget and dashboard

## Usage Examples

### Example 1: Translate Section Text
```python
# Translate English text to Spanish
POST /api/sections/{id}/translations/generate
{
  "target_language": "Spanish",
  "language_code": "ES"
}
```

### Example 2: Generate Audio with Polly
```python
# Generate Spanish audio using AWS Polly
POST /api/sections/{id}/audio/generate
{
  "language": "Spanish",
  "provider": "polly"
}
```

### Example 3: Translate + Generate Audio (One Step)
```python
# Translate to Spanish AND generate Spanish audio
POST /api/sections/{id}/audio/generate-translated
{
  "target_language": "Spanish",
  "language_code": "ES"
}
```

## Frontend Integration

The frontend can now:
1. **Translate text**: Call `/translations/generate` endpoint
2. **Generate audio with Polly**: Add `provider=polly` parameter
3. **One-click translate+audio**: Use `/audio/generate-translated` endpoint

## Cost Optimization

### Free Tier Usage
- **AWS Polly Standard**: 5M characters/month FREE
- **AWS Translate**: 2M characters/month FREE

### Recommended Approach
1. Use **standard voices** for common languages (free tier)
2. Use **neural voices** for quality-critical content
3. Cache translations to avoid re-translating
4. Store audio in S3 (already configured)

## Testing

### Test Translation
```bash
# Test at http://localhost:8001/docs
# Use endpoint: POST /api/sections/{section_id}/translations/generate
```

### Test Polly Audio
```bash
# Test at http://localhost:8001/docs
# Use endpoint: POST /api/sections/{section_id}/audio/generate
# Set provider=polly
```

### Test Combined
```bash
# Test at http://localhost:8001/docs
# Use endpoint: POST /api/sections/{section_id}/audio/generate-translated
```

## Next Steps

1. ✅ Services implemented
2. ✅ Endpoints added
3. ⏳ Test endpoints locally
4. ⏳ Update frontend to use new endpoints
5. ⏳ Deploy to EC2

## Files Modified/Created

- ✅ `backend/polly_service.py` (NEW)
- ✅ `backend/translate_service.py` (NEW)
- ✅ `backend/server.py` (MODIFIED - added endpoints)
- ✅ Uses existing AWS credentials from `.env`
- ✅ Audio stored in S3 (accessible by widget)

## Ready to Test!

The server should restart automatically (with --reload). Test the new endpoints at:
- http://localhost:8001/docs

