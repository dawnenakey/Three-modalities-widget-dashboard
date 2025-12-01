import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-600">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" data-testid="website-detail-title">{website.name}</h1>
              <p className="text-slate-600" data-testid="website-detail-url">{website.url}</p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" data-testid="add-page-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Page
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Page</DialogTitle>
                </DialogHeader>
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
                    <p className="text-xs text-slate-500">Content will be automatically scraped</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={creating} data-testid="create-page-button">
                    {creating ? 'Creating...' : 'Create Page'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Embed Code */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Widget Embed Code</h2>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm mb-4 overflow-x-auto" data-testid="embed-code">
            {website.embed_code}
          </div>
          <Button onClick={copyEmbedCode} variant="outline" className="w-full" data-testid="copy-embed-button">
            {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Embed Code'}
          </Button>
        </div>

        {/* Pages List */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Pages ({pages.length})</h2>
          {pages.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No pages yet</h3>
              <p className="text-slate-600 mb-6">Add your first page to get started</p>
              <Button onClick={() => setShowDialog(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Page
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" data-testid="pages-list">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  to={`/pages/${page.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-primary/50 transition-all"
                  data-testid={`page-card-${page.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900" data-testid={`page-url-${page.id}`}>
                          {page.url}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            page.status === 'Active' ? 'bg-green-100 text-green-700' :
                            page.status === 'Inactive' ? 'bg-slate-100 text-slate-700' :
                            'bg-orange-100 text-orange-700'
                          }`}
                          data-testid={`page-status-${page.id}`}
                        >
                          {page.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {page.sections_count} sections
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}