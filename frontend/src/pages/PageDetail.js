import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
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
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionText, setNewSectionText] = useState('');

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

  const handleAddSection = async () => {
    if (!newSectionText.trim()) {
      toast.error('Please enter section text');
      return;
    }

    try {
      await axios.post(`${API}/pages/${pageId}/sections`, {
        selected_text: newSectionText,
        position_order: sections.length + 1
      });
      toast.success('Section added successfully!');
      setNewSectionText('');
      setShowAddSection(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to add section');
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
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-detail-title">Page Sections</h1>
          <p className="text-gray-600" data-testid="page-detail-url">{page.url}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sections ({sections.length})</h2>
              <p className="text-gray-600">
                Click on a section to add ASL videos and audio files
              </p>
            </div>
            <Button
              onClick={() => setShowAddSection(!showAddSection)}
              className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold"
            >
              {showAddSection ? 'Cancel' : '+ Add Section'}
            </Button>
          </div>
          
          {/* Page Count & Purchase Link */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pages Used</p>
                <p className="text-2xl font-bold text-gray-900">{sections.length}/40</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Need more pages?</p>
                <a 
                  href="/billing" 
                  className="text-sm font-medium text-[#2F419D] hover:text-[#2F419D] hover:underline transition-all"
                >
                  To purchase more pages, please click here
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-semibold">Basic:</span> $75/page | <span className="font-semibold">Pro:</span> $65/page
                </p>
              </div>
            </div>
          </div>
        </div>

        {showAddSection && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Section</h3>
            <textarea
              value={newSectionText}
              onChange={(e) => setNewSectionText(e.target.value)}
              placeholder="Enter the text content for this section..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleAddSection}
                className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold"
              >
                Create Section
              </Button>
              <Button
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionText('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sections.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sections found</h3>
            <p className="text-gray-600">This page has no content sections</p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="sections-list">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => navigate(`/sections/${section.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#00CED1]/50 transition-all cursor-pointer"
                data-testid={`section-card-${section.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Section #{section.position_order}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          section.status === 'Active' ? 'bg-green-100 text-green-700' :
                          section.status === 'Needs Review' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                        data-testid={`section-status-${section.id}`}
                      >
                        {section.status}
                      </span>
                    </div>
                    <p className="text-gray-900 leading-relaxed mb-4" data-testid={`section-text-${section.id}`}>
                      {section.selected_text}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-[#00CED1]" />
                        {section.videos_count} videos
                      </span>
                      <span className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-[#00CED1]" />
                        {section.audios_count} audio files
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}