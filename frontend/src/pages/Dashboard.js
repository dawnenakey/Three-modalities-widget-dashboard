import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Globe, FileText, Users, ExternalLink } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [stats, setStats] = useState({ websites: 0, pages: 0, users: 1 });
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await axios.get(`${API}/websites`);
      setWebsites(response.data);
      setStats({ ...stats, websites: response.data.length });
    } catch (error) {
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
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
      fetchWebsites();
    } catch (error) {
      toast.error('Failed to create website');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="dashboard-title">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage your accessibility platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm" data-testid="stats-websites">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#00CED1]/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-[#00CED1]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.websites}</p>
                <p className="text-sm text-gray-600">Websites</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm" data-testid="stats-pages">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#00CED1]/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#00CED1]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pages}</p>
                <p className="text-sm text-gray-600">Pages</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm" data-testid="stats-users">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#00CED1]/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#00CED1]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Websites Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Websites</h2>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold h-11 px-6" data-testid="add-website-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Website
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-website-dialog" className="pointer-events-auto" aria-describedby="add-website-description">
              <DialogHeader>
                <DialogTitle>Add New Website</DialogTitle>
              </DialogHeader>
              <p id="add-website-description" className="sr-only">Add a new website to manage accessibility</p>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Website Name</Label>
                  <Input
                    id="name"
                    placeholder="My Website"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-testid="website-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    data-testid="website-url-input"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold" disabled={creating} data-testid="create-website-button">
                  {creating ? 'Creating...' : 'Create Website'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Websites Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading websites...</p>
          </div>
        ) : websites.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No websites yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first website</p>
            <Button onClick={() => setShowDialog(true)} className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Website
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="websites-grid">
            {websites.map((website) => (
              <Link
                key={website.id}
                to={`/websites/${website.id}`}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#00CED1]/50 transition-all group"
                data-testid={`website-card-${website.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-[#00CED1]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00CED1]/20 transition-colors">
                    <Globe className="h-6 w-6 text-[#00CED1]" />
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[#00CED1] transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`website-name-${website.id}`}>
                  {website.name}
                </h3>
                <p className="text-sm text-gray-600 truncate mb-4" data-testid={`website-url-${website.id}`}>
                  {website.url}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Created {new Date(website.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}