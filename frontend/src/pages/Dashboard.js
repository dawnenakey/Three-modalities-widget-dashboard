import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Globe, LogOut, Accessibility, ExternalLink } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [websites, setWebsites] = useState([]);
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
              <Accessibility className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900" data-testid="dashboard-title">PIVOT</h1>
              <p className="text-xs text-slate-600">Accessibility Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-700" data-testid="user-name">Welcome, {user?.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-600 hover:text-slate-900"
              data-testid="logout-button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Websites</h2>
            <p className="text-slate-600">Manage accessibility for your web properties</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 h-11 px-6 shadow-sm" data-testid="add-website-button">
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
                <Button type="submit" className="w-full" disabled={creating} data-testid="create-website-button">
                  {creating ? 'Creating...' : 'Create Website'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Websites Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading websites...</p>
          </div>
        ) : websites.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Globe className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No websites yet</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first website</p>
            <Button onClick={() => setShowDialog(true)} className="bg-primary hover:bg-primary/90">
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
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-primary/50 transition-all group"
                data-testid={`website-card-${website.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2" data-testid={`website-name-${website.id}`}>
                  {website.name}
                </h3>
                <p className="text-sm text-slate-600 truncate mb-4" data-testid={`website-url-${website.id}`}>
                  {website.url}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Created {new Date(website.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}