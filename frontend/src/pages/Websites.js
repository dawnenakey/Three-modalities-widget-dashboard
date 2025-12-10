import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Websites() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      console.log('🔍 Fetching websites from:', `${API}/websites`);
      console.log('🔑 Auth header:', axios.defaults.headers.common['Authorization'] ? 'Present' : 'Missing');
      const response = await axios.get(`${API}/websites`);
      console.log('✅ Websites response:', response.data);
      setWebsites(response.data);
    } catch (error) {
      console.error('❌ Error fetching websites:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      toast.error(`Failed to load websites: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Websites</h1>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        </div>

        {websites.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-gray-600 mb-4">No websites yet</p>
            <Button onClick={() => navigate('/')} className="bg-[#21D4B4] hover:bg-[#91EED2] text-black font-semibold">
              Add Your First Website
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <div
                key={website.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Website Preview Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center overflow-hidden">
                  {website.image_url ? (
                    <img 
                      src={website.image_url} 
                      alt={website.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`text-center ${website.image_url ? 'hidden' : 'flex'} flex-col items-center justify-center w-full h-full`}>
                    <h2 className="text-4xl font-bold text-white mb-2">
                      PI<span className="text-[#00CED1]">V</span>OT
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-8 w-8 border-2 border-[#00CED1] rounded-full flex items-center justify-center">
                        <span className="text-xs text-[#00CED1]">\ud83d\udc4b</span>
                      </div>
                      <div className="h-8 w-8 border-2 border-[#00CED1] rounded-full flex items-center justify-center">
                        <span className="text-xs text-[#00CED1]">\ud83d\udcc4</span>
                      </div>
                      <div className="h-8 w-8 border-2 border-[#00CED1] rounded-full flex items-center justify-center">
                        <span className="text-xs text-[#00CED1]">\ud83d\udd0a</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">Language Access Technology</p>
                  </div>
                </div>

                {/* Website Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{website.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 truncate">{website.url}</p>
                  
                  <Button
                    onClick={() => navigate(`/websites/${website.id}`)}
                    className="w-full bg-black hover:bg-black/90 text-white font-semibold"
                  >
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
