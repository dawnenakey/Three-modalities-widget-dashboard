// BUILD VERSION: 2025-12-08-v5 - S3 PRESIGNED FIX
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Sparkles, Video, Volume2, FileText, Loader2, ExternalLink } from 'lucide-react';

/**
 * @typedef {'loading' | 'loaded' | 'error'} VideoLoadingState
 */

/**
 * @typedef {Object} VideoData
 * @property {number} id - Video unique identifier
 * @property {string} language - Video language
 * @property {string} video_url - Video URL (signed S3 URL)
 */

/**
 * @typedef {Object} AudioData
 * @property {number} id - Audio unique identifier
 * @property {string} language - Audio language
 * @property {string} audio_url - Audio URL (signed S3 URL)
 */

/**
 * @typedef {Object} Translation
 * @property {number} id - Translation unique identifier
 * @property {string} language - Language name
 * @property {string} language_code - Language code (e.g., 'es', 'fr')
 * @property {string} text_content - Translated text content
 */

/**
 * @typedef {Object} SectionData
 * @property {number} id - Section unique identifier
 * @property {string} selected_text - Original text content
 * @property {string} [text_content] - Alternative text content field
 * @property {number} position_order - Order position
 * @property {string} status - Section status
 */

/**
 * @typedef {Object} NewTranslation
 * @property {string} language - Language name
 * @property {string} language_code - Language code
 * @property {string} text - Translated text
 */

/**
 * @typedef {Object} TranslateLanguage
 * @property {string} language - Language name
 * @property {string} language_code - Language code
 */

/**
 * @typedef {Object} UploadUrlResponse
 * @property {string} upload_url - Presigned S3 upload URL
 * @property {string} file_key - S3 file key
 * @property {string} public_url - Public URL for the uploaded file
 */

/** @type {string} */
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Uploads a file directly to S3 using a presigned URL
 * @param {string} uploadUrl - Presigned S3 upload URL
 * @param {File} file - File to upload
 * @returns {Promise<void>}
 * @throws {Error} If upload fails
 */
async function uploadToS3WithFetch(uploadUrl, file) {
  const res = await window.fetch(uploadUrl, {
    method: "PUT",
    body: file,
    // NO headers, NO Authorization, NO Content-Type
  });

  if (!res.ok) {
    throw new Error(`S3 upload failed with status ${res.status}`);
  }
}

/**
 * Returns the media URL or empty string if not provided
 * @param {string | undefined | null} url - The media URL
 * @returns {string} The URL or empty string
 */
function getMediaUrl(url) {
  return url || '';
}

/**
 * VideoPlayer Component with Loading State and Delete Button
 * @param {{ video: VideoData; onDelete: (videoId: number) => Promise<void> }} props - Component props
 * @returns {JSX.Element} VideoPlayer component
 */
function VideoPlayer({ video, onDelete }) {
  /** @type {[VideoLoadingState, React.Dispatch<React.SetStateAction<VideoLoadingState>>]} */
  const [loadingState, setLoadingState] = useState(/** @type {VideoLoadingState} */ ('loading'));
  /** @type {[number, React.Dispatch<React.SetStateAction<number>>]} */
  const [retryCount, setRetryCount] = useState(0);
  // Backend now returns signed URL which might change, so we rely on that instead of cache busting
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [deleting, setDeleting] = useState(false);
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [errorMsg, setErrorMsg] = useState('');

  const videoUrl = getMediaUrl(video.video_url);

  /**
   * Handles video load start event
   * @returns {void}
   */
  const handleLoadStart = () => {
    setLoadingState('loading');
    setErrorMsg('');
  };

  /**
   * Handles video can play event
   * @returns {void}
   */
  const handleCanPlay = () => {
    setLoadingState('loaded');
  };

  /**
   * Handles video error event
   * @param {React.SyntheticEvent<HTMLVideoElement, Event>} e - Error event
   * @returns {void}
   */
  const handleError = (e) => {
    console.error("Video load error:", e);
    /** @type {MediaError | null} */
    const error = /** @type {HTMLVideoElement} */ (e.target).error;
    let msg = "Unknown error";
    if (error) {
        if (error.code === 1) msg = "Aborted";
        if (error.code === 2) msg = "Network Error";
        if (error.code === 3) msg = "Decode Error";
        if (error.code === 4) msg = "Source Not Supported";
    }
    setErrorMsg(msg);

    // Retry up to 2 times before showing error
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        /** @type {HTMLVideoElement} */ (e.target).load();
      }, 1500);
    } else {
      setLoadingState('error');
    }
  };

  /**
   * Handles retry button click
   * @returns {void}
   */
  const handleRetry = () => {
      setRetryCount(0);
      setLoadingState('loading');
      // Force reload by updating the src slightly (if signed url hasn't expired)
      // or rely on re-fetch from parent which isn't happening here yet.
      // For now, just reset state.
  };

  /**
   * Handles delete button click
   * @returns {Promise<void>}
   */
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this video (${video.language})?`)) {
      return;
    }
    setDeleting(true);
    await onDelete(video.id);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">{video.language}</p>
        <Button
          onClick={handleDelete}
          disabled={deleting}
          size="sm"
          variant="destructive"
          className="h-7 px-2 text-xs"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
      
      {loadingState === 'loading' && (
        <div className="bg-blue-50 border border-blue-200 rounded p-6 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-blue-600 font-medium">Loading video...</p>
          <p className="text-xs text-blue-500 mt-1">Attempt {retryCount + 1}...</p>
        </div>
      )}
      
      {loadingState === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
          <p className="text-sm text-red-600 font-medium">⚠️ Unable to load video</p>
          <p className="text-xs text-red-500 mt-1 mb-2">{errorMsg}</p>
          <div className="flex gap-2 justify-center">
            <Button
                onClick={handleRetry}
                size="sm"
                variant="outline"
                className="bg-white"
            >
                Retry
            </Button>
            <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-white shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
            >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open URL
            </a>
          </div>
        </div>
      )}
      
      <video
        key={`${video.id}-${retryCount}`}
        src={videoUrl}
        controls
        preload="metadata"
        className={`w-full rounded ${loadingState !== 'loaded' ? 'hidden' : ''}`}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
      />
    </div>
  );
}

/** @type {readonly string[]} */
const ASL_LANGUAGES = ['ASL (American Sign Language)', 'LSM (Mexican)', 'BSL (British)', 'LSF (French)', 'Auslan (Australian)', 'JSL (Japanese)', 'KSL (Korean)', 'LIBRAS (Brazilian)'];
/** @type {readonly string[]} */
const AUDIO_LANGUAGES = ['English', 'Spanish', 'French', 'Chinese', 'Arabic', 'Hindi', 'Portuguese', 'Russian', 'Japanese', 'Korean'];

/**
 * @typedef {Object} TTSVoice
 * @property {string} value - Voice ID
 * @property {string} label - Voice display label
 */

/** @type {readonly TTSVoice[]} */
const TTS_VOICES = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo (Smooth)' },
  { value: 'nova', label: 'Nova (Energetic)' },
  { value: 'onyx', label: 'Onyx (Deep)' },
];

/**
 * Section detail page component for managing videos, audio, and translations
 * @returns {JSX.Element} SectionDetail component
 */
export default function SectionDetail() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  /** @type {[SectionData | null, React.Dispatch<React.SetStateAction<SectionData | null>>]} */
  const [section, setSection] = useState(/** @type {SectionData | null} */ (null));
  /** @type {[VideoData[], React.Dispatch<React.SetStateAction<VideoData[]>>]} */
  const [videos, setVideos] = useState(/** @type {VideoData[]} */ ([]));
  /** @type {[AudioData[], React.Dispatch<React.SetStateAction<AudioData[]>>]} */
  const [audios, setAudios] = useState(/** @type {AudioData[]} */ ([]));
  /** @type {[Translation[], React.Dispatch<React.SetStateAction<Translation[]>>]} */
  const [translations, setTranslations] = useState(/** @type {Translation[]} */ ([]));
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [loading, setLoading] = useState(true);
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [uploading, setUploading] = useState(false);
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [generating, setGenerating] = useState(false);
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [generatingAll, setGeneratingAll] = useState(false);
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [editingText, setEditingText] = useState(false);
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [editedText, setEditedText] = useState('');
  /** @type {[NewTranslation, React.Dispatch<React.SetStateAction<NewTranslation>>]} */
  const [newTranslation, setNewTranslation] = useState(/** @type {NewTranslation} */ ({ language: '', language_code: '', text: '' }));
  /** @type {[TranslateLanguage, React.Dispatch<React.SetStateAction<TranslateLanguage>>]} */
  const [selectedTranslateLanguage, setSelectedTranslateLanguage] = useState(/** @type {TranslateLanguage} */ ({ language: '', language_code: '' }));

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  /**
   * Fetches section data including videos, audios, and translations
   * @returns {Promise<void>}
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch section first to verify it exists
      /** @type {{ data: SectionData }} */
      const sectionRes = await axios.get(`${API}/sections/${sectionId}`);
      setSection(sectionRes.data);

      // Then fetch videos and audios (these can fail without breaking the page)
      try {
        /** @type {{ data: VideoData[] }} */
        const videosRes = await axios.get(`${API}/sections/${sectionId}/videos`);
        setVideos(videosRes.data);
      } catch (/** @type {any} */ videoError) {
        console.error('Failed to load videos:', videoError);
        setVideos([]);
      }

      try {
        /** @type {{ data: AudioData[] }} */
        const audiosRes = await axios.get(`${API}/sections/${sectionId}/audio`);
        setAudios(audiosRes.data);
      } catch (/** @type {any} */ audioError) {
        console.error('Failed to load audio:', audioError);
        setAudios([]);
      }

      // Fetch text translations
      try {
        /** @type {{ data: Translation[] }} */
        const translationsRes = await axios.get(`${API}/sections/${sectionId}/translations`);
        setTranslations(translationsRes.data);
      } catch (/** @type {any} */ translationError) {
        console.error('Failed to load translations:', translationError);
        setTranslations([]);
      }
    } catch (/** @type {any} */ error) {
      console.error('Failed to load section data:', error);
      // Only navigate away if it's a 404 (section not found)
      if (error.response?.status === 404) {
        toast.error('Section not found');
        navigate('/');
      } else {
        // For other errors, show error and stay on page
        toast.error(`Failed to load section: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles video file upload
   * @param {React.FormEvent<HTMLFormElement>} e - Form event
   * @returns {Promise<void>}
   */
  const handleVideoUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(/** @type {HTMLFormElement} */ (e.target));
    const videoFile = /** @type {File | null} */ (formData.get('video'));
    const language = /** @type {string | null} */ (formData.get('language'));

    if (!videoFile || !videoFile.name) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (500MB max)
    const MAX_SIZE = 500 * 1024 * 1024; // 500MB
    if (videoFile.size > MAX_SIZE) {
      toast.error(`File too large! Maximum size is 500MB. Your file is ${(videoFile.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get presigned upload URL from backend
      /** @type {{ data: UploadUrlResponse }} */
      const { data: uploadData } = await axios.post(`${API}/sections/${sectionId}/video/upload-url`, {
        filename: videoFile.name,
        content_type: videoFile.type || 'video/mp4',
        file_size: videoFile.size
      });

      // Step 2: Upload directly to S3 using presigned PUT URL
      toast.loading('Uploading video to S3...', { id: 'video-upload' });
      await uploadToS3WithFetch(uploadData.upload_url, videoFile);

      // Step 3: Confirm upload with backend
      await axios.post(`${API}/sections/${sectionId}/video/confirm`, {
        file_key: uploadData.file_key,
        public_url: uploadData.public_url,
        language: language
      });

      toast.success('Video uploaded successfully! Refreshing...', { id: 'video-upload' });
      /** @type {HTMLFormElement} */ (e.target).reset();

      // Refresh data after successful upload with a small delay
      setTimeout(async () => {
        try {
          await fetchData();
        } catch (/** @type {any} */ refreshError) {
          console.error('Failed to refresh after upload:', refreshError);
          toast.info('Video uploaded! Please refresh the page manually to see it.');
        }
      }, 1000); // Give the backend a moment to finish processing
    } catch (/** @type {any} */ error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload video', { id: 'video-upload' });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handles audio file upload
   * @param {React.FormEvent<HTMLFormElement>} e - Form event
   * @returns {Promise<void>}
   */
  const handleAudioUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(/** @type {HTMLFormElement} */ (e.target));
    const audioFile = /** @type {File | null} */ (formData.get('audio'));
    const language = /** @type {string | null} */ (formData.get('language'));

    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    // Validate file size (500MB for audio)
    const MAX_SIZE = 524288000; // 500MB
    if (audioFile.size > MAX_SIZE) {
      toast.error(`Audio file is too large. Maximum size is 500MB. Your file is ${(audioFile.size / 1048576).toFixed(2)}MB`);
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get presigned upload URL
      /** @type {{ data: UploadUrlResponse }} */
      const { data: uploadData } = await axios.post(`${API}/sections/${sectionId}/audio/upload-url`, {
        filename: audioFile.name,
        content_type: audioFile.type || 'audio/mpeg',
        file_size: audioFile.size
      });

      // Step 2: Upload directly to S3 using presigned PUT URL
      toast.loading('Uploading audio to S3...', { id: 'audio-upload' });
      await uploadToS3WithFetch(uploadData.upload_url, audioFile);

      // Step 3: Confirm upload
      await axios.post(`${API}/sections/${sectionId}/audio/confirm`, {
        file_key: uploadData.file_key,
        public_url: uploadData.public_url,
        language: language
      });

      toast.success('Audio uploaded successfully! Refreshing...', { id: 'audio-upload' });
      /** @type {HTMLFormElement} */ (e.target).reset();

      // Refresh data after successful upload with a small delay
      setTimeout(async () => {
        try {
          await fetchData();
        } catch (/** @type {any} */ refreshError) {
          console.error('Failed to refresh after upload:', refreshError);
          toast.info('Audio uploaded! Please refresh the page manually to see it.');
        }
      }, 1000); // Give the backend a moment to finish processing
    } catch (/** @type {any} */ error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload audio', { id: 'audio-upload' });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handles TTS audio generation
   * @param {React.FormEvent<HTMLFormElement>} e - Form event
   * @returns {Promise<void>}
   */
  const handleGenerateTTS = async (e) => {
    e.preventDefault();
    const formData = new FormData(/** @type {HTMLFormElement} */ (e.target));
    setGenerating(true);
    try {
      await axios.post(`${API}/sections/${sectionId}/audio/generate`, formData);
      toast.success('Audio generated!');
      /** @type {HTMLFormElement} */ (e.target).reset();
      fetchData();
    } catch (/** @type {any} */ error) {
      toast.error(error.response?.data?.detail || 'Failed to generate audio');
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Handles video deletion
   * @param {number} videoId - ID of the video to delete
   * @returns {Promise<void>}
   */
  const handleDeleteVideo = async (videoId) => {
    try {
      await axios.delete(`${API}/videos/${videoId}`);
      toast.success('Video deleted successfully!');
      fetchData();
    } catch (/** @type {any} */ error) {
      console.error('Delete video error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete video');
    }
  };

  /**
   * Handles audio deletion
   * @param {number} audioId - ID of the audio to delete
   * @returns {Promise<void>}
   */
  const handleDeleteAudio = async (audioId) => {
    try {
      await axios.delete(`${API}/audios/${audioId}`);
      toast.success('Audio deleted successfully!');
      fetchData();
    } catch (/** @type {any} */ error) {
      console.error('Delete audio error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete audio');
    }
  };

  /**
   * Handles adding a new translation manually
   * @param {React.FormEvent<HTMLFormElement>} e - Form event
   * @returns {Promise<void>}
   */
  const handleAddTranslation = async (e) => {
    e.preventDefault();
    if (!newTranslation.language || !newTranslation.language_code || !newTranslation.text) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('language', newTranslation.language);
      formData.append('language_code', newTranslation.language_code);
      formData.append('text_content', newTranslation.text);

      await axios.post(`${API}/sections/${sectionId}/translations`, formData);
      toast.success('Translation added successfully!');
      setNewTranslation({ language: '', language_code: '', text: '' });
      fetchData();
    } catch (/** @type {any} */ error) {
      console.error('Add translation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to add translation');
    }
  };

  /**
   * Handles translation deletion
   * @param {number} translationId - ID of the translation to delete
   * @returns {Promise<void>}
   */
  const handleDeleteTranslation = async (translationId) => {
    try {
      await axios.delete(`${API}/translations/${translationId}`);
      toast.success('Translation deleted successfully!');
      fetchData();
    } catch (/** @type {any} */ error) {
      console.error('Delete translation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete translation');
    }
  };

  /**
   * Handles generating a translation for a single language
   * @returns {Promise<void>}
   */
  const handleGenerateTranslation = async () => {
    if (!selectedTranslateLanguage.language || !selectedTranslateLanguage.language_code) {
      toast.error('Please select a language to translate to');
      return;
    }

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('target_language', selectedTranslateLanguage.language);
      formData.append('language_code', selectedTranslateLanguage.language_code);

      await axios.post(`${API}/sections/${sectionId}/translations/generate`, formData);
      toast.success(`Translation to ${selectedTranslateLanguage.language} generated successfully!`);
      setSelectedTranslateLanguage({ language: '', language_code: '' });
      fetchData();
    } catch (/** @type {any} */ error) {
      console.error('Generate translation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate translation');
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Handles generating translations for all available languages
   * @returns {Promise<void>}
   */
  const handleGenerateAllTranslations = async () => {
    if (!window.confirm('This will translate this section to ALL available languages. This may take a few minutes. Continue?')) {
      return;
    }

    setGeneratingAll(true);
    try {
      const formData = new FormData();
      formData.append('source_language', 'auto');

      /** @type {{ data: Translation[] }} */
      const response = await axios.post(`${API}/sections/${sectionId}/translations/generate-all`, formData);
      toast.success(`Generated ${response.data.length} translations successfully!`);
      fetchData();
    } catch (/** @type {any} */ error) {
      console.error('Generate all translations error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate translations');
    } finally {
      setGeneratingAll(false);
    }
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[#00CED1] animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading section data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!section) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-2">Section not found</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sections
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this section? This will also delete all videos and audio files associated with it.')) {
                try {
                  await axios.delete(`${API}/sections/${sectionId}`);
                  toast.success('Section deleted successfully!');
                  navigate(-1);
                } catch (error) {
                  console.error('Delete section error:', error);
                  toast.error('Failed to delete section');
                }
              }
            }}
            size="sm"
            className="bg-red-100 text-red-600 hover:bg-red-200"
          >
            Delete Section
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Section Settings</h1>

        {/* Text Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#00CED1]" />
              <h2 className="text-lg font-semibold text-gray-900">Text Content</h2>
            </div>
            {!editingText && (
              <Button
                onClick={() => {
                  setEditingText(true);
                  setEditedText(section.selected_text || section.text_content || '');
                }}
                variant="outline"
                size="sm"
                className="text-[#00CED1] border-[#00CED1] hover:bg-[#00CED1] hover:text-black"
              >
                Edit Text
              </Button>
            )}
          </div>
          
          {editingText ? (
            <div className="space-y-4">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
              />
              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    try {
                      await axios.patch(`${API}/sections/${sectionId}`, {
                        text_content: editedText
                      });
                      setSection({...section, selected_text: editedText, text_content: editedText});
                      setEditingText(false);
                      toast.success('Text updated successfully!');
                    } catch (error) {
                      toast.error('Failed to update text');
                    }
                  }}
                  className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setEditingText(false);
                    setEditedText('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">{section.selected_text || section.text_content || 'No text content'}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sign Language Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Video className="h-5 w-5 text-[#00CED1]" />
              <h2 className="text-lg font-semibold text-gray-900">Sign Language Settings</h2>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleVideoUpload} className="mb-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Language</Label>
                  <Select name="language" required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select sign language" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASL_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Video File</Label>
                  <input
                    type="file"
                    name="video"
                    accept="video/*"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold"
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </Button>
              </div>
            </form>

            {/* Videos List */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Uploaded Videos ({videos.length})</p>
              {videos.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No videos uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {videos.map((video) => (
                    <VideoPlayer key={video.id} video={video} onDelete={handleDeleteVideo} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Volume2 className="h-5 w-5 text-[#00CED1]" />
              <h2 className="text-lg font-semibold text-gray-900">Audio Settings</h2>
            </div>

            {/* Generate TTS Form */}
            <div className="mb-6 p-4 bg-[#00CED1]/5 rounded-lg border border-[#00CED1]/20">
              <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00CED1]" />
                Generate AI Audio
              </p>
              <form onSubmit={handleGenerateTTS} className="space-y-3">
                <div>
                  <Select name="language" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIO_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select name="voice" defaultValue="alloy" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TTS_VOICES.map((voice) => (
                        <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold"
                  disabled={generating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate Audio'}
                </Button>
              </form>
            </div>

            {/* Upload Audio Form */}
            <form onSubmit={handleAudioUpload} className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Or Upload Audio File</p>
              <div className="space-y-3">
                <Select name="language" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIO_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="file"
                  name="audio"
                  accept="audio/*"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Audio'}
                </Button>
              </div>
            </form>

            {/* Audios List */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Audio Files ({audios.length})</p>
              {audios.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No audio files yet</p>
              ) : (
                <div className="space-y-3">
                  {audios.map((audio) => (
                    <div key={audio.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{audio.language}</p>
                        <Button
                          onClick={() => handleDeleteAudio(audio.id)}
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                      <audio
                        src={getMediaUrl(audio.audio_url)}
                        controls
                        className="w-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'bg-red-50 border border-red-200 rounded p-4 text-center';
                          errorDiv.innerHTML = `<p class="text-sm text-red-600">⚠️ Audio file not found</p><p class="text-xs text-red-500 mt-1">This audio file may have been deleted or moved</p>`;
                          e.target.parentNode.appendChild(errorDiv);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Text Settings (Text Translations) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-[#00CED1]" />
            <h2 className="text-lg font-semibold text-gray-900">Text Settings</h2>
          </div>

          {/* Auto-Translate Section */}
          <div className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-900">Auto-Translate (AWS Translate)</p>
            <p className="text-xs text-gray-600 mb-4">Automatically translate this section's text to other languages</p>
            
            {/* Single Language Translation */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={selectedTranslateLanguage.language}
                  onChange={(e) => {
                    const lang = e.target.value;
                    const code = lang === 'Spanish' ? 'es' : 
                                lang === 'French' ? 'fr' : 
                                lang === 'German' ? 'de' : 
                                lang === 'Chinese' ? 'zh' : 
                                lang === 'Japanese' ? 'ja' : 
                                lang === 'Portuguese' ? 'pt' : 
                                lang === 'Arabic' ? 'ar' : 
                                lang === 'Hindi' ? 'hi' : 
                                lang === 'Russian' ? 'ru' : 
                                lang === 'Italian' ? 'it' : 
                                lang === 'Korean' ? 'ko' : 'en';
                    setSelectedTranslateLanguage({ language: lang, language_code: code });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                >
                  <option value="">Select language...</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Russian">Russian</option>
                  <option value="Italian">Italian</option>
                  <option value="Korean">Korean</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Language Code</label>
                <input
                  type="text"
                  value={selectedTranslateLanguage.language_code}
                  onChange={(e) => setSelectedTranslateLanguage({...selectedTranslateLanguage, language_code: e.target.value.toUpperCase()})}
                  placeholder="e.g., ES, FR"
                  maxLength={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerateTranslation}
                  disabled={generating || !selectedTranslateLanguage.language}
                  className="w-full bg-[#00CED1] hover:bg-[#21D4B4] text-black font-semibold"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Translate'
                  )}
                </Button>
              </div>
            </div>

            {/* Translate to All Languages */}
            <div className="pt-3 border-t border-blue-300">
              <Button
                onClick={handleGenerateAllTranslations}
                disabled={generatingAll}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
              >
                {generatingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Translating to all languages...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Translate to ALL Languages
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-600 mt-2 text-center">This will generate translations for all supported languages</p>
            </div>
          </div>

          {/* Add New Translation Form (Manual Entry) */}
          <form onSubmit={handleAddTranslation} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Add Text Translation (Manual Entry)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <input
                  type="text"
                  value={newTranslation.language}
                  onChange={(e) => setNewTranslation({...newTranslation, language: e.target.value})}
                  placeholder="e.g., Spanish, Chinese"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language Code
                </label>
                <input
                  type="text"
                  value={newTranslation.language_code}
                  onChange={(e) => setNewTranslation({...newTranslation, language_code: e.target.value.toUpperCase()})}
                  placeholder="e.g., ES, ZH"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Translated Text
              </label>
              <textarea
                value={newTranslation.text}
                onChange={(e) => setNewTranslation({...newTranslation, text: e.target.value})}
                placeholder="Enter the translated text..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold"
            >
              Add Translation
            </Button>
          </form>

          {/* Existing Translations List */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600">Text Translations ({translations.length})</p>
            {translations.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No text translations yet. The original English text will be used.</p>
            ) : (
              <div className="space-y-3">
                {translations.map((translation) => (
                  <div key={translation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{translation.language}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{translation.language_code}</span>
                      </div>
                      <Button
                        onClick={() => handleDeleteTranslation(translation.id)}
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{translation.text_content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Analytics Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Analytics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Views</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
              <p className="text-sm text-gray-600">Videos</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{audios.length}</p>
              <p className="text-sm text-gray-600">Audio Files</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
