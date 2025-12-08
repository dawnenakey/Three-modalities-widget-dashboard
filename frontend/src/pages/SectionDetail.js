import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Sparkles, Video, Volume2, FileText, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Dedicated S3 upload helper - uses raw fetch, NOT axios
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

// VideoPlayer Component with Loading State and Delete Button
function VideoPlayer({ video, onDelete }) {
  const [loadingState, setLoadingState] = useState('loading'); // 'loading', 'loaded', 'error'
  const [retryCount, setRetryCount] = useState(0);
  const [cacheBuster] = useState(() => Date.now()); // Cache buster set once on mount
  const [deleting, setDeleting] = useState(false);

  const handleLoadStart = () => {
    setLoadingState('loading');
  };

  const handleCanPlay = () => {
    setLoadingState('loaded');
  };

  const handleError = (e) => {
    // Retry up to 2 times before showing error
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(retryCount + 1);
        e.target.load(); // Reload the video
      }, 1000);
    } else {
      setLoadingState('error');
    }
  };

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
          <p className="text-xs text-blue-500 mt-1">Please wait while the video loads</p>
        </div>
      )}
      
      {loadingState === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
          <p className="text-sm text-red-600">⚠️ Unable to load video</p>
          <p className="text-xs text-red-500 mt-1">The video file may be corrupted or moved</p>
          <Button
            onClick={() => {
              setRetryCount(0);
              setLoadingState('loading');
            }}
            size="sm"
            className="mt-3"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      )}
      
      <video
        src={`${process.env.REACT_APP_BACKEND_URL}${video.video_url}?t=${cacheBuster}`}
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

const ASL_LANGUAGES = ['ASL (American Sign Language)', 'LSM (Mexican)', 'BSL (British)', 'LSF (French)', 'Auslan (Australian)', 'JSL (Japanese)', 'KSL (Korean)', 'LIBRAS (Brazilian)'];
const AUDIO_LANGUAGES = ['English', 'Spanish', 'French', 'Chinese', 'Arabic', 'Hindi', 'Portuguese', 'Russian', 'Japanese', 'Korean'];
const TTS_VOICES = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo (Smooth)' },
  { value: 'nova', label: 'Nova (Energetic)' },
  { value: 'onyx', label: 'Onyx (Deep)' },
];

export default function SectionDetail() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [newTranslation, setNewTranslation] = useState({ language: '', language_code: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch section first to verify it exists
      const sectionRes = await axios.get(`${API}/sections/${sectionId}`);
      setSection(sectionRes.data);
      
      // Then fetch videos and audios (these can fail without breaking the page)
      try {
        const videosRes = await axios.get(`${API}/sections/${sectionId}/videos`);
        setVideos(videosRes.data);
      } catch (videoError) {
        console.error('Failed to load videos:', videoError);
        setVideos([]);
      }
      
      try {
        const audiosRes = await axios.get(`${API}/sections/${sectionId}/audio`);
        setAudios(audiosRes.data);
      } catch (audioError) {
        console.error('Failed to load audio:', audioError);
        setAudios([]);
      }
      
      // Fetch text translations
      try {
        const translationsRes = await axios.get(`${API}/sections/${sectionId}/translations`);
        setTranslations(translationsRes.data);
      } catch (translationError) {
        console.error('Failed to load translations:', translationError);
        setTranslations([]);
      }
    } catch (error) {
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

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const videoFile = formData.get('video');
    const language = formData.get('language');
    
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
      const { data: uploadData } = await axios.post(`${API}/sections/${sectionId}/video/upload-url`, {
        filename: videoFile.name,
        content_type: videoFile.type || 'video/mp4',
        file_size: videoFile.size
      });
      
      // Step 2: Upload directly to R2
      // Check if backend returned Presigned POST (has fields) or Presigned PUT (no fields)
      if (uploadData.fields) {
        // Presigned POST approach (legacy)
        const r2FormData = new FormData();
        Object.entries(uploadData.fields).forEach(([key, value]) => {
          r2FormData.append(key, value);
        });
        r2FormData.append('file', videoFile);
        
        await axios.post(uploadData.upload_url, r2FormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            toast.loading(`Uploading video: ${percentCompleted}%`, { id: 'video-upload' });
          }
        });
      } else {
        // Presigned PUT approach for S3
        // Use dedicated fetch helper (NOT axios)
        toast.loading('Uploading video to S3...', { id: 'video-upload' });
        await uploadToS3WithFetch(uploadData.upload_url, videoFile);
      }
      
      // Step 3: Confirm upload with backend
      await axios.post(`${API}/sections/${sectionId}/video/confirm`, {
        file_key: uploadData.file_key,
        public_url: uploadData.public_url,
        language: language
      });
      
      toast.success('Video uploaded successfully! Refreshing...', { id: 'video-upload' });
      e.target.reset();
      
      // Refresh data after successful upload with a small delay
      setTimeout(async () => {
        try {
          await fetchData();
        } catch (refreshError) {
          console.error('Failed to refresh after upload:', refreshError);
          toast.info('Video uploaded! Please refresh the page manually to see it.');
        }
      }, 1000); // Give the backend a moment to finish processing
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload video', { id: 'video-upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const audioFile = formData.get('audio');
    const language = formData.get('language');
    
    // Validate file size (500MB for audio)
    const MAX_SIZE = 524288000; // 500MB
    if (audioFile.size > MAX_SIZE) {
      toast.error(`Audio file is too large. Maximum size is 500MB. Your file is ${(audioFile.size / 1048576).toFixed(2)}MB`);
      return;
    }
    
    setUploading(true);
    try {
      // Step 1: Get presigned upload URL
      const { data: uploadData } = await axios.post(`${API}/sections/${sectionId}/audio/upload-url`, {
        filename: audioFile.name,
        content_type: audioFile.type || 'audio/mpeg',
        file_size: audioFile.size
      });
      
      // Step 2: Upload directly to R2
      // Check if backend returned Presigned POST (has fields) or Presigned PUT (no fields)
      if (uploadData.fields) {
        // Presigned POST approach (legacy)
        const r2FormData = new FormData();
        Object.entries(uploadData.fields).forEach(([key, value]) => {
          r2FormData.append(key, value);
        });
        r2FormData.append('file', audioFile);
        
        await axios.post(uploadData.upload_url, r2FormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            toast.loading(`Uploading audio: ${percentCompleted}%`, { id: 'audio-upload' });
          }
        });
      } else {
        // Presigned PUT approach for S3
        // Use dedicated fetch helper (NOT axios)
        toast.loading('Uploading audio to S3...', { id: 'audio-upload' });
        await uploadToS3WithFetch(uploadData.upload_url, audioFile);
      }
      
      // Step 3: Confirm upload
      await axios.post(`${API}/sections/${sectionId}/audio/confirm`, {
        file_key: uploadData.file_key,
        public_url: uploadData.public_url,
        language: language
      });
      
      toast.success('Audio uploaded successfully! Refreshing...', { id: 'audio-upload' });
      e.target.reset();
      
      // Refresh data after successful upload with a small delay
      setTimeout(async () => {
        try {
          await fetchData();
        } catch (refreshError) {
          console.error('Failed to refresh after upload:', refreshError);
          toast.info('Audio uploaded! Please refresh the page manually to see it.');
        }
      }, 1000); // Give the backend a moment to finish processing
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload audio', { id: 'audio-upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateTTS = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setGenerating(true);
    try {
      await axios.post(`${API}/sections/${sectionId}/audio/generate`, formData);
      toast.success('Audio generated!');
      e.target.reset();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate audio');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await axios.delete(`${API}/videos/${videoId}`);
      toast.success('Video deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Delete video error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete video');
    }
  };

  const handleDeleteAudio = async (audioId) => {
    try {
      await axios.delete(`${API}/audios/${audioId}`);
      toast.success('Audio deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Delete audio error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete audio');
    }
  };

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
    } catch (error) {
      console.error('Add translation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to add translation');
    }
  };

  const handleDeleteTranslation = async (translationId) => {
    try {
      await axios.delete(`${API}/translations/${translationId}`);
      toast.success('Translation deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Delete translation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete translation');
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
                        src={`${process.env.REACT_APP_BACKEND_URL}${audio.audio_url}`}
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

          {/* Add New Translation Form */}
          <form onSubmit={handleAddTranslation} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Add Text Translation</p>
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