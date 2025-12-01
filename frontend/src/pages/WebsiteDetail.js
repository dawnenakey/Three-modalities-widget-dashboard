import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, FileText, Code, Copy, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WebsiteDetail() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, [websiteId]);

  const fetchData = async () => {
    try {
      const [websiteRes, pagesRes] = await Promise.all([
        axios.get(`${API}/websites/${websiteId}`),
        axios.get(`${API}/websites/${websiteId}/pages`)
      ]);
      setWebsite(websiteRes.data);
      setPages(pagesRes.data);
    } catch (error) {
      toast.error('Failed to load website data');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API}/websites/${websiteId}/pages`, { url });
      toast.success('Page created and content scraped!');
      setShowDialog(false);
      setUrl('');
      fetchData();
    } catch (error) {
      toast.error('Failed to create page');
    } finally {
      setCreating(false);
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(website.embed_code);
    setCopied(true);
    toast.success('Embed code copied!');
    setTimeout(() => setCopied(false), 2000);
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
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="website-detail-title">{website.name}</h1>
            <p className="text-gray-600" data-testid="website-detail-url">{website.url}</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold" data-testid="add-page-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent className="pointer-events-auto" aria-describedby="add-page-description">
              <DialogHeader>
                <DialogTitle>Add New Page</DialogTitle>
              </DialogHeader>
              <p id="add-page-description" className="sr-only">Add a new page to this website</p>
              <form onSubmit={handleCreatePage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Page URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/page"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    data-testid="page-url-input"
                  />
                  <p className="text-xs text-gray-500">Content will be automatically scraped</p>
                </div>
                <Button type="submit" className="w-full bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold" disabled={creating} data-testid="create-page-button">
                  {creating ? 'Creating...' : 'Create Page'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Embed Code */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-[#00CED1]" />
            <h2 className="text-lg font-semibold text-gray-900">Widget Embed Code</h2>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm mb-4 overflow-x-auto" data-testid="embed-code">
            {website.embed_code}
          </div>
          <Button onClick={copyEmbedCode} className="w-full bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold" data-testid="copy-embed-button">
            {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Embed Code'}
          </Button>
        </div>

        {/* Pages List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pages ({pages.length})</h2>
          {pages.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No pages yet</h3>
              <p className="text-gray-600 mb-6">Add your first page to get started</p>
              <Button onClick={() => setShowDialog(true)} className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Page
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" data-testid="pages-list">
              {pages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => navigate(`/pages/${page.id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#00CED1]/50 transition-all cursor-pointer"
                  data-testid={`page-card-${page.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900" data-testid={`page-url-${page.id}`}>
                          {page.url}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            page.status === 'Active' ? 'bg-green-100 text-green-700' :
                            page.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }`}
                          data-testid={`page-status-${page.id}`}
                        >
                          {page.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {page.sections_count} sections
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}