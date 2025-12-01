import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Video, Volume2, Upload, Sparkles } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ASL_LANGUAGES = [
  'ASL (American Sign Language)',
  'LSM (Lengua de señas mexicana)',
  'BSL (British Sign Language)',
  'LSF (Langue des signes française)',
];

const AUDIO_LANGUAGES = [
  'English', 'Spanish', 'French', 'Chinese', 'Arabic', 'Hindi', 'Portuguese', 'Russian', 'Japanese', 'Korean'
];

const TTS_VOICES = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo (Smooth)' },
  { value: 'fable', label: 'Fable (Expressive)' },
  { value: 'nova', label: 'Nova (Energetic)' },
  { value: 'onyx', label: 'Onyx (Deep)' },
  { value: 'shimmer', label: 'Shimmer (Bright)' },
];

export default function SectionDetail() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [showTTSDialog, setShowTTSDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

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
      toast.success('Video uploaded successfully!');
      setShowVideoDialog(false);
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
      toast.success('Audio uploaded successfully!');
      setShowAudioDialog(false);
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
      toast.success('Audio generated successfully!');
      setShowTTSDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate audio');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-600">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 mb-2" data-testid="section-detail-title">Section Content</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Section Text */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Text Content</h2>
          <p className="text-slate-700 leading-relaxed" data-testid="section-text">{section.selected_text}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Videos Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">ASL Videos</h2>
              <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90" size="sm" data-testid="upload-video-button">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="pointer-events-auto" aria-describedby="video-upload-description">
                  <DialogHeader>
                    <DialogTitle>Upload ASL Video</DialogTitle>
                  </DialogHeader>
                  <p id="video-upload-description" className="sr-only">Upload a sign language video for this section</p>
                  <form onSubmit={handleVideoUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Sign Language</Label>
                      <Select name="language" required>
                        <SelectTrigger data-testid="video-language-select">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASL_LANGUAGES.map((lang) => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video">Video File</Label>
                      <input
                        type="file"
                        name="video"
                        accept="video/*"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        data-testid="video-file-input"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={uploading} data-testid="submit-video-button">
                      {uploading ? 'Uploading...' : 'Upload Video'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {videos.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <Video className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No videos uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="videos-list">
                {videos.map((video) => (
                  <div key={video.id} className="bg-white border border-slate-200 rounded-xl p-4" data-testid={`video-item-${video.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900" data-testid={`video-language-${video.id}`}>{video.language}</span>
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                    <video
                      src={`${process.env.REACT_APP_BACKEND_URL}${video.video_url}`}
                      controls
                      className="w-full rounded-lg"
                      data-testid={`video-player-${video.id}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audio Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Audio Files</h2>
              <div className="flex gap-2">
                <Dialog open={showTTSDialog} onOpenChange={setShowTTSDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="generate-audio-button">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="pointer-events-auto" aria-describedby="tts-generate-description">
                    <DialogHeader>
                      <DialogTitle>Generate Audio (AI)</DialogTitle>
                    </DialogHeader>
                    <p id="tts-generate-description" className="sr-only">Generate audio using AI text-to-speech</p>
                    <form onSubmit={handleGenerateTTS} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select name="language" required>
                          <SelectTrigger data-testid="tts-language-select">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {AUDIO_LANGUAGES.map((lang) => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice">Voice</Label>
                        <Select name="voice" defaultValue="alloy" required>
                          <SelectTrigger data-testid="tts-voice-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TTS_VOICES.map((voice) => (
                              <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={generating} data-testid="submit-generate-button">
                        {generating ? 'Generating...' : 'Generate Audio'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog open={showAudioDialog} onOpenChange={setShowAudioDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90" size="sm" data-testid="upload-audio-button">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="pointer-events-auto" aria-describedby="audio-upload-description">
                    <DialogHeader>
                      <DialogTitle>Upload Audio File</DialogTitle>
                    </DialogHeader>
                    <p id="audio-upload-description" className="sr-only">Upload an audio file for this section</p>
                    <form onSubmit={handleAudioUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select name="language" required>
                          <SelectTrigger data-testid="audio-language-select">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {AUDIO_LANGUAGES.map((lang) => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="audio">Audio File</Label>
                        <input
                          type="file"
                          name="audio"
                          accept="audio/*"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          data-testid="audio-file-input"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={uploading} data-testid="submit-audio-button">
                        {uploading ? 'Uploading...' : 'Upload Audio'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {audios.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <Volume2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No audio files yet</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="audios-list">
                {audios.map((audio) => (
                  <div key={audio.id} className="bg-white border border-slate-200 rounded-xl p-4" data-testid={`audio-item-${audio.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900" data-testid={`audio-language-${audio.id}`}>{audio.language}</span>
                      <Volume2 className="h-4 w-4 text-primary" />
                    </div>
                    <audio
                      src={`${process.env.REACT_APP_BACKEND_URL}${audio.audio_url}`}
                      controls
                      className="w-full"
                      data-testid={`audio-player-${audio.id}`}
                    />
                    {audio.captions && (
                      <p className="text-xs text-slate-500 mt-2">{audio.captions}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}