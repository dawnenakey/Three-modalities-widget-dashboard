import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Globe, FileText, Users, Code, Copy, CheckCircle } from 'lucide-react';
import UserManagementDialog from '@/components/UserManagementDialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔍 Fetching dashboard data from:', `${API}/websites`);
      console.log('🔑 Auth header:', axios.defaults.headers.common['Authorization'] ? 'Present' : 'Missing');
      // Fetch websites and stats in parallel
      const [websitesRes, statsRes] = await Promise.all([
        axios.get(`${API}/websites`),
        axios.get(`${API}/stats`)
      ]);
      
      console.log('✅ Websites response:', websitesRes.data);
      console.log('✅ Stats response:', statsRes.data);
      setWebsites(websitesRes.data);
      setTotalPages(statsRes.data.total_pages);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      toast.error(`Failed to load data: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API}/websites`, { name, url });
      toast.success('Website created successfully!');
      setShowDialog(false);
      setName('');
      setUrl('');
      fetchData();
    } catch (error) {
      toast.error('Failed to create website');
    } finally {
      setCreating(false);
    }
  };

  const copyWidgetCode = async () => {
    const code = `<script src="${process.env.REACT_APP_BACKEND_URL}/api/widget.js" data-website-id="YOUR_WEBSITE_ID"></script>`;
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Widget code copied!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          toast.success('Widget code copied!');
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          toast.error('Failed to copy. Please select and copy manually.');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      // Final fallback - select the code so user can copy manually
      toast.error('Clipboard not available. Code is selected - press Ctrl+C to copy.');
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.body.removeChild(textArea);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header with Plan Badge */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">My Plan:</span>
              <span className="px-3 py-1 bg-[#A460FF] text-white font-semibold rounded text-sm">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards with Ratios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Website</p>
            <p className="text-3xl font-bold text-gray-900">{websites.length}/40</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Pages</p>
            <p className="text-3xl font-bold text-gray-900">{totalPages}/40</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Users</p>
            <p className="text-3xl font-bold text-gray-900">1/15</p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold h-12">
                Add Website
              </Button>
            </DialogTrigger>
            <DialogContent className="pointer-events-auto" aria-describedby="add-website-description">
              <DialogHeader>
                <DialogTitle>Add New Website</DialogTitle>
              </DialogHeader>
              <p id="add-website-description" className="sr-only">Add a new website</p>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Website Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Website'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold h-12">
            Add Page
          </Button>
          
          <UserManagementDialog />
        </div>

        {/* Install PIVOT Widget */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Install PIVOT Widget</h2>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Quick Installation:</strong> For best results, paste the installation code just before the closing <code className="bg-gray-100 px-1 rounded">body</code> tag on your website. You only need to do this once. Any changes and automatically updates on each site you publish changes.
          </p>
          <div className="bg-[#0a0e27] rounded-lg p-4 mb-4 overflow-x-auto">
            <pre className="text-[#00CED1] text-sm font-mono">
              <code>{`<script
  src="${process.env.REACT_APP_BACKEND_URL}/api/widget.js"
  data-website-id="YOUR_WEBSITE_ID"
  id="pivot-widget"
  async
></script>`}</code>
            </pre>
          </div>
          <div className="flex gap-4">
            <Button onClick={copyWidgetCode} className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold">
              {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Installation Code'}
            </Button>
            <Button 
              onClick={() => window.open('https://testing.gopivot.me/installation-guides', '_blank')}
              className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold"
            >
              Show Instructions
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}