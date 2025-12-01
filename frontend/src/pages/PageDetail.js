import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, FileText, Video, Volume2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PageDetail() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [pageId]);

  const fetchData = async () => {
    try {
      const [pageRes, sectionsRes] = await Promise.all([
        axios.get(`${API}/pages/${pageId}`),
        axios.get(`${API}/pages/${pageId}/sections`)
      ]);
      setPage(pageRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      toast.error('Failed to load page data');
      navigate('/');
    } finally {
      setLoading(false);
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
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1" data-testid="page-detail-title">Page Sections</h1>
            <p className="text-slate-600" data-testid="page-detail-url">{page.url}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Sections ({sections.length})</h2>
          <p className="text-slate-600 mb-6">
            Click on a section to add ASL videos and audio files
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No sections found</h3>
            <p className="text-slate-600">This page has no content sections</p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="sections-list">
            {sections.map((section) => (
              <Link
                key={section.id}
                to={`/sections/${section.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-primary/50 transition-all"
                data-testid={`section-card-${section.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        Section #{section.position_order}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          section.status === 'Active' ? 'bg-green-100 text-green-700' :
                          section.status === 'Needs Review' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }`}
                        data-testid={`section-status-${section.id}`}
                      >
                        {section.status}
                      </span>
                    </div>
                    <p className="text-slate-900 leading-relaxed mb-4" data-testid={`section-text-${section.id}`}>
                      {section.selected_text}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        {section.videos_count} videos
                      </span>
                      <span className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        {section.audios_count} audio files
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}