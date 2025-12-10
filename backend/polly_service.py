"""
AWS Polly Service for Text-to-Speech
Handles audio generation using AWS Polly
"""
import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv
from pathlib import Path
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Initialize Polly client
polly_client = boto3.client(
    'polly',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

# Language to Voice ID mapping for common languages
# Using neural voices for better quality
LANGUAGE_VOICE_MAP = {
    'en': 'Joanna',      # English (US) - Neural
    'en-US': 'Joanna',
    'en-GB': 'Amy',      # English (UK) - Neural
    'es': 'Lupe',        # Spanish (US) - Neural
    'es-ES': 'Conchita', # Spanish (Spain) - Neural
    'es-MX': 'Lupe',     # Spanish (Mexico) - Neural
    'fr': 'Celine',      # French - Neural
    'fr-FR': 'Celine',
    'de': 'Marlene',     # German - Neural
    'de-DE': 'Marlene',
    'it': 'Bianca',      # Italian - Neural
    'it-IT': 'Bianca',
    'pt': 'Camila',      # Portuguese (Brazil) - Neural
    'pt-BR': 'Camila',
    'pt-PT': 'Ines',     # Portuguese (Portugal) - Neural
    'ja': 'Mizuki',      # Japanese - Neural
    'ja-JP': 'Mizuki',
    'ko': 'Seoyeon',     # Korean - Neural
    'ko-KR': 'Seoyeon',
    'zh': 'Zhiyu',       # Chinese (Mandarin) - Neural
    'zh-CN': 'Zhiyu',
    'ar': 'Zeina',       # Arabic - Standard
    'hi': 'Aditi',       # Hindi - Neural
    'hi-IN': 'Aditi',
    'ru': 'Tatyana',     # Russian - Neural
    'ru-RU': 'Tatyana',
    'nl': 'Laura',       # Dutch - Neural
    'nl-NL': 'Laura',
    'sv': 'Astrid',      # Swedish - Neural
    'sv-SE': 'Astrid',
    'pl': 'Ola',         # Polish - Neural
    'pl-PL': 'Ola',
}

# Language code normalization (map common codes to AWS format)
LANGUAGE_CODE_MAP = {
    'english': 'en-US',
    'spanish': 'es-US',
    'french': 'fr-FR',
    'german': 'de-DE',
    'italian': 'it-IT',
    'portuguese': 'pt-BR',
    'japanese': 'ja-JP',
    'korean': 'ko-KR',
    'chinese': 'zh-CN',
    'arabic': 'ar',
    'hindi': 'hi-IN',
    'russian': 'ru-RU',
    'dutch': 'nl-NL',
    'swedish': 'sv-SE',
    'polish': 'pl-PL',
}

def normalize_language_code(language: str) -> tuple[str, str]:
    """
    Normalize language input to AWS format
    Returns: (language_code, voice_id)
    """
    language_lower = language.lower().strip()
    
    # Check direct mapping first
    if language_lower in LANGUAGE_CODE_MAP:
        lang_code = LANGUAGE_CODE_MAP[language_lower]
    elif language in LANGUAGE_VOICE_MAP:
        lang_code = language
    elif len(language) == 2:
        # Two-letter code, try to expand
        lang_code = f"{language}-US" if language == 'en' else f"{language}-{language.upper()}"
    else:
        # Default to English
        lang_code = 'en-US'
        logger.warning(f"Unknown language '{language}', defaulting to en-US")
    
    # Get voice ID
    voice_id = LANGUAGE_VOICE_MAP.get(lang_code, LANGUAGE_VOICE_MAP.get(lang_code.split('-')[0], 'Joanna'))
    
    return lang_code, voice_id

def generate_speech(text: str, language: str = 'en-US', voice_id: str = None, engine: str = 'neural') -> bytes:
    """
    Generate speech audio using AWS Polly
    
    Args:
        text: Text to convert to speech
        language: Language code (e.g., 'en-US', 'es', 'Spanish')
        voice_id: Specific voice ID (optional, auto-selected if not provided)
        engine: 'neural' (better quality) or 'standard' (cheaper)
    
    Returns:
        bytes: Audio data in MP3 format
    """
    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        raise Exception("AWS credentials not configured for Polly")
    
    # Normalize language and get voice
    lang_code, default_voice = normalize_language_code(language)
    voice = voice_id or default_voice
    
    try:
        # Check if voice supports neural engine
        # Some voices only support standard
        try:
            response = polly_client.synthesize_speech(
                Text=text,
                OutputFormat='mp3',
                VoiceId=voice,
                LanguageCode=lang_code,
                Engine=engine
            )
        except ClientError as e:
            # If neural fails, try standard
            if 'neural' in str(e).lower() and engine == 'neural':
                logger.warning(f"Neural not available for {voice}, using standard")
                response = polly_client.synthesize_speech(
                    Text=text,
                    OutputFormat='mp3',
                    VoiceId=voice,
                    LanguageCode=lang_code,
                    Engine='standard'
                )
            else:
                raise
        
        audio_data = response['AudioStream'].read()
        logger.info(f"Generated {len(audio_data)} bytes of audio for language {lang_code} using voice {voice}")
        return audio_data
        
    except ClientError as e:
        error_msg = f"AWS Polly error: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"Error generating speech: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)

def get_available_voices(language_code: str = None):
    """
    Get list of available voices for a language
    """
    try:
        params = {}
        if language_code:
            params['LanguageCode'] = language_code
        
        response = polly_client.describe_voices(**params)
        return response['Voices']
    except Exception as e:
        logger.error(f"Error getting voices: {e}")
        return []

