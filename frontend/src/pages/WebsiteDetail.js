import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Code, Copy, CheckCircle, Trash2, Edit } from 'lucide-react';

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

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await axios.delete(`${API}/pages/${pageId}`);
      toast.success('Page deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete page');
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
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{website.name}</h1>
            <p className="text-gray-600">{website.url}</p>
          </div>
        </div>

        {/* Widget Installation Code */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-[#00CED1]" />
            <h2 className="text-lg font-semibold text-gray-900">Widget Installation Code</h2>
          </div>
          <div className="bg-[#0a0e27] rounded-lg p-4 mb-4 overflow-x-auto">
            <pre className="text-[#00CED1] text-sm font-mono">
              <code>{website.embed_code}</code>
            </pre>
          </div>
          <Button onClick={copyEmbedCode} className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold">
            {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>

        {/* Pages Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pages</h2>
              <p className="text-sm text-gray-600 mt-1">{pages.length}/15</p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Page
                </Button>
              </DialogTrigger>
              <DialogContent className="pointer-events-auto" aria-describedby="add-page-description">
                <DialogHeader>
                  <DialogTitle>Add New Page</DialogTitle>
                </DialogHeader>
                <p id="add-page-description" className="sr-only">Add a new page</p>
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
                    />
                    <p className="text-xs text-gray-500">Content will be automatically scraped</p>
                  </div>
                  <Button type="submit" className="w-full bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Page'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {pages.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-600 mb-4">No pages added yet</p>
              <Button onClick={() => setShowDialog(true)} className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Page
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Page URL</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sections</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/pages/${page.id}`)}
                          className="text-sm text-gray-900 hover:text-[#00CED1] font-medium"
                        >
                          {page.url}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          page.status === 'Active' ? 'bg-green-100 text-green-700' :
                          page.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {page.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{page.sections_count || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => navigate(`/pages/${page.id}`)}
                            size="sm"
                            variant="outline"
                            className="text-[#00CED1] border-[#00CED1] hover:bg-[#00CED1] hover:text-black"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Sections
                          </Button>
                          <Button
                            onClick={() => handleDeletePage(page.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}