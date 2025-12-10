"""
AWS Translate Service for Text Translation
Handles text translation using AWS Translate
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

# Initialize Translate client
translate_client = boto3.client(
    'translate',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

# Language name to code mapping
LANGUAGE_CODE_MAP = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'japanese': 'ja',
    'korean': 'ko',
    'chinese': 'zh',
    'arabic': 'ar',
    'hindi': 'hi',
    'russian': 'ru',
    'dutch': 'nl',
    'swedish': 'sv',
    'polish': 'pl',
    'turkish': 'tr',
    'vietnamese': 'vi',
    'thai': 'th',
    'indonesian': 'id',
    'hebrew': 'he',
    'czech': 'cs',
    'greek': 'el',
    'hungarian': 'hu',
    'romanian': 'ro',
    'finnish': 'fi',
    'norwegian': 'no',
    'danish': 'da',
}

# Supported AWS Translate languages (common ones)
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'ru': 'Russian',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'id': 'Indonesian',
    'he': 'Hebrew',
    'cs': 'Czech',
    'el': 'Greek',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'da': 'Danish',
}

def normalize_language_code(language: str) -> str:
    """
    Normalize language input to AWS Translate format
    Returns: 2-letter language code (e.g., 'en', 'es', 'fr')
    """
    language_lower = language.lower().strip()
    
    # Check direct mapping
    if language_lower in LANGUAGE_CODE_MAP:
        return LANGUAGE_CODE_MAP[language_lower]
    
    # Check if already a 2-letter code
    if len(language) == 2 and language.lower() in SUPPORTED_LANGUAGES:
        return language.lower()
    
    # Check if it's a language-region code (e.g., 'en-US' -> 'en')
    if '-' in language:
        base_code = language.split('-')[0].lower()
        if base_code in SUPPORTED_LANGUAGES:
            return base_code
    
    # Default to English if unknown
    logger.warning(f"Unknown language '{language}', defaulting to 'en'")
    return 'en'

def translate_text(text: str, source_language: str = 'auto', target_language: str = 'es') -> str:
    """
    Translate text using AWS Translate
    
    Args:
        text: Text to translate
        source_language: Source language code (use 'auto' for auto-detect)
        target_language: Target language code or name (e.g., 'es', 'Spanish', 'fr-FR')
    
    Returns:
        str: Translated text
    """
    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        raise Exception("AWS credentials not configured for Translate")
    
    # Normalize target language
    target_code = normalize_language_code(target_language)
    
    # Handle source language
    if source_language.lower() == 'auto':
        source_code = 'auto'
    else:
        source_code = normalize_language_code(source_language)
    
    try:
        response = translate_client.translate_text(
            Text=text,
            SourceLanguageCode=source_code,
            TargetLanguageCode=target_code
        )
        
        translated_text = response['TranslatedText']
        detected_source = response.get('SourceLanguageCode', source_code)
        
        logger.info(f"Translated text from {detected_source} to {target_code} ({len(text)} chars -> {len(translated_text)} chars)")
        return translated_text
        
    except ClientError as e:
        error_msg = f"AWS Translate error: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"Error translating text: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)

def get_supported_languages():
    """
    Get list of supported languages
    """
    return SUPPORTED_LANGUAGES

