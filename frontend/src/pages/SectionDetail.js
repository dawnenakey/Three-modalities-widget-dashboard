import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Sparkles, Video, Volume2, FileText } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const fetchData = async () => {
    try {
      const [sectionRes, videosRes, audiosRes] = await Promise.all([
        axios.get(`${API}/sections/${sectionId}`),
        axios.get(`${API}/sections/${sectionId}/videos`),
        axios.get(`${API}/sections/${sectionId}/audio`)
      ]);
      setSection(sectionRes.data);
      setVideos(videosRes.data);
      setAudios(audiosRes.data);
    } catch (error) {
      toast.error('Failed to load section data');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setUploading(true);
    try {
      await axios.post(`${API}/sections/${sectionId}/videos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Video uploaded!');
      e.target.reset();
      fetchData();
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setUploading(true);
    try {
      await axios.post(`${API}/sections/${sectionId}/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Audio uploaded!');
      e.target.reset();
      fetchData();
    } catch (error) {
      toast.error('Failed to upload audio');
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sections
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Section Settings</h1>

        {/* Text Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-[#00CED1]" />
            <h2 className="text-lg font-semibold text-gray-900">Text Content</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{section.selected_text}</p>
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
                  className="w-full bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold"
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
                videos.map((video) => (
                  <div key={video.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">{video.language}</p>
                    <video
                      src={`${process.env.REACT_APP_BACKEND_URL}${video.video_url}`}
                      controls
                      className="w-full rounded"
                    />
                  </div>
                ))
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
                  className="w-full bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold"
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
                audios.map((audio) => (
                  <div key={audio.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">{audio.language}</p>
                    <audio
                      src={`${process.env.REACT_APP_BACKEND_URL}${audio.audio_url}`}
                      controls
                      className="w-full"
                    />
                  </div>
                ))
              )}
            </div>
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