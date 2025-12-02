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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': 'bg-[#045D04] text-white',
      'Inactive': 'bg-[#A7A9AD] text-black',
      'Not Setup': 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10'
    };
    return statusConfig[status] || statusConfig['Not Setup'];
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{website.name}</h1>
          <Button 
            variant="destructive" 
            onClick={handleDeleteWebsite}
            className="bg-[#981B1E] hover:bg-[#981b1d90]"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Website
          </Button>
        </div>

        {/* Side-by-side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
          {/* Left Side - Website Info Card */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md border p-4">
            <div className="w-full h-48 overflow-hidden rounded-md flex justify-center items-center bg-gradient-to-r from-[#123a35] to-[#1f1f36] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-24 w-24 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 mb-1">{website.name}</p>
            <p className="text-sm text-gray-600 mb-4 break-words">{website.url}</p>
            <a 
              href={website.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full mt-4 inline-block text-center rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
            >
              View Website
            </a>

            {/* Widget Installation Code */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Code className="h-4 w-4 text-[#00CED1]" />
                <h3 className="text-sm font-semibold text-gray-900">Embed Code</h3>
              </div>
              <div className="bg-[#1e042a] rounded-lg p-3 mb-3 overflow-x-auto">
                <pre className="text-[#00CED1] text-xs font-mono whitespace-pre-wrap break-all">
                  <code>{website.embed_code}</code>
                </pre>
              </div>
              <Button onClick={copyEmbedCode} className="w-full bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold">
                {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
          </div>

          {/* Right Side - Pages List */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-lg border">
            <div className="bg-[#1e042a] rounded-t-lg flex justify-between items-center px-6 py-4">
              <h2 className="text-white font-semibold text-xl">Pages</h2>
              <p className="text-white font-semibold">({pages.length} / 15 pages)</p>
            </div>
            
            <div className="p-4">
              <div className="flex justify-end mb-4">
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
            <div className="p-12 text-center">
              <p className="text-gray-600 mb-4">You don't have any pages added for this website yet.</p>
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