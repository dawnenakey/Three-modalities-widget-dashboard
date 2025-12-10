# AWS Polly Integration Proposal

## Current State

### Text-to-Speech (TTS)
- **Current**: Uses OpenAI TTS API (`generate_tts_audio` function)
- **Endpoint**: `/api/sections/{section_id}/audio/generate`
- **Model**: `gpt-4o-mini-tts`
- **Voices**: OpenAI voices (alloy, echo, fable, onyx, nova, shimmer)

### Text Translation
- **Current**: Manual text translations stored in database
- **Model**: `TextTranslation` in database
- **Endpoints**: 
  - `POST /api/sections/{section_id}/translations` - Create translation
  - `GET /api/sections/{section_id}/translations` - Get translations

## Your Question: Text-to-Text Translation from Audio

### Current Flow
1. **Text → Audio**: OpenAI TTS converts section text to audio
2. **Text → Text Translation**: Manual translations can be created via API

### What You're Asking For
**Option 1**: Translate the text that was used to generate audio
- ✅ Already possible via `/api/sections/{section_id}/translations`
- Just create a translation with the translated text

**Option 2**: Audio → Text → Translation
- Currently: No speech-to-text (transcription) feature
- Would need: Audio transcription → Translation

## AWS Polly Integration

### Benefits of AWS Polly
1. **Cost**: Often cheaper than OpenAI TTS
2. **Languages**: Supports 47+ languages and voices
3. **AWS Integration**: Already using AWS S3, fits ecosystem
4. **Neural Voices**: High-quality neural TTS
5. **SSML Support**: Advanced speech markup

### Implementation Options

#### Option A: Replace OpenAI TTS with AWS Polly
```python
import boto3

polly_client = boto3.client('polly', region_name='us-east-1')

async def generate_tts_audio_polly(text: str, language_code: str = "en-US", voice_id: str = "Joanna"):
    response = polly_client.synthesize_speech(
        Text=text,
        OutputFormat='mp3',
        VoiceId=voice_id,
        LanguageCode=language_code,
        Engine='neural'  # or 'standard'
    )
    return response['AudioStream'].read()
```

#### Option B: Add AWS Polly as Alternative TTS Provider
- Keep OpenAI as default
- Add option to choose provider (OpenAI or AWS Polly)
- Frontend can select which to use

#### Option C: Use AWS Polly for Multi-Language TTS
- Use OpenAI for English
- Use AWS Polly for other languages (better language support)

## Text-to-Text Translation Enhancement

### Current Translation Flow
1. User creates section with text
2. User manually creates translation via API
3. Translation stored in `text_translations` collection

### Enhanced Flow with AWS Translate
```python
import boto3

translate_client = boto3.client('translate', region_name='us-east-1')

async def translate_text(text: str, source_lang: str, target_lang: str):
    response = translate_client.translate_text(
        Text=text,
        SourceLanguageCode=source_lang,
        TargetLanguageCode=target_lang
    )
    return response['TranslatedText']
```

### Combined Workflow
1. **Text → Translation**: Use AWS Translate
2. **Translated Text → Audio**: Use AWS Polly (in target language)
3. Store both translation and audio

## Recommended Implementation

### Phase 1: Add AWS Polly as Alternative TTS
1. Add `boto3` dependency (already installed)
2. Create `polly_service.py` similar to `s3_service.py`
3. Add environment variables:
   ```env
   AWS_REGION=us-east-1  # Already have this
   # Use existing AWS credentials
   ```
4. Modify `generate_audio` endpoint to accept `provider` parameter
5. Frontend can choose: OpenAI or AWS Polly

### Phase 2: Add AWS Translate for Text Translation
1. Create `translate_service.py`
2. Add endpoint: `POST /api/sections/{section_id}/translations/generate`
3. Auto-translate section text to target language
4. Then generate audio with AWS Polly in that language

### Phase 3: Complete Workflow
1. User selects section text
2. Choose target language
3. Auto-translate (AWS Translate)
4. Auto-generate audio (AWS Polly in target language)
5. Store both translation and audio

## Code Example

### AWS Polly Service
```python
# backend/polly_service.py
import boto3
import os
from botocore.exceptions import ClientError

polly_client = boto3.client(
    'polly',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

# Language to Voice mapping
LANGUAGE_VOICES = {
    'en-US': 'Joanna',
    'es-ES': 'Conchita',
    'fr-FR': 'Celine',
    'de-DE': 'Marlene',
    # ... more mappings
}

def generate_speech(text: str, language_code: str = 'en-US', voice_id: str = None):
    if not voice_id:
        voice_id = LANGUAGE_VOICES.get(language_code, 'Joanna')
    
    try:
        response = polly_client.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=voice_id,
            LanguageCode=language_code,
            Engine='neural'
        )
        return response['AudioStream'].read()
    except ClientError as e:
        raise Exception(f"Polly error: {str(e)}")
```

### AWS Translate Service
```python
# backend/translate_service.py
import boto3
import os

translate_client = boto3.client(
    'translate',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

def translate_text(text: str, source_lang: str, target_lang: str):
    try:
        response = translate_client.translate_text(
            Text=text,
            SourceLanguageCode=source_lang,
            TargetLanguageCode=target_lang
        )
        return response['TranslatedText']
    except Exception as e:
        raise Exception(f"Translate error: {str(e)}")
```

## Cost Comparison

### OpenAI TTS
- ~$15 per 1M characters
- Good quality, limited languages

### AWS Polly
- ~$4 per 1M characters (standard)
- ~$16 per 1M characters (neural)
- 47+ languages, many voices per language

### AWS Translate
- ~$15 per 1M characters
- 75+ languages supported

## Next Steps

1. **Decide on approach**:
   - Replace OpenAI with AWS Polly?
   - Add AWS Polly as alternative?
   - Add AWS Translate for auto-translation?

2. **If proceeding**, I can:
   - Create `polly_service.py`
   - Create `translate_service.py`
   - Update endpoints to support both providers
   - Update frontend to allow provider selection

Would you like me to implement AWS Polly integration?

