import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { BarChart3, TrendingUp, Globe, Eye, Languages } from 'lucide-react';
import { toast } from 'sonner';

/**
 * @typedef {Object} ModalityUsage
 * @property {number} asl - ASL video views count
 * @property {number} audio - Audio plays count
 * @property {number} text - Text views count
 */

/**
 * @typedef {Object} TopPage
 * @property {string} url - Page URL
 * @property {number} views - View count
 */

/**
 * @typedef {Object} TopContent
 * @property {string} text - Content text
 * @property {number} interactions - Interaction count
 */

/**
 * @typedef {Object} TopLanguage
 * @property {string} code - Language code
 * @property {string} name - Language name
 * @property {number} count - Usage count
 */

/**
 * @typedef {Object} AnalyticsStats
 * @property {number} totalActivations - Total widget activations
 * @property {TopPage[]} topPages - Most viewed pages
 * @property {TopContent[]} topContent - Most interacted content
 * @property {ModalityUsage} modalityUsage - Usage by modality type
 * @property {TopLanguage[]} topLanguages - Most used languages
 */

/** @type {string} */
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Analytics page component displaying usage statistics
 * @returns {JSX.Element} Analytics component
 */
export default function Analytics() {
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [loading, setLoading] = useState(true);
  /** @type {[AnalyticsStats, React.Dispatch<React.SetStateAction<AnalyticsStats>>]} */
  const [stats, setStats] = useState(/** @type {AnalyticsStats} */ ({
    totalActivations: 0,
    topPages: [],
    topContent: [],
    modalityUsage: {
      asl: 0,
      audio: 0,
      text: 0
    },
    topLanguages: []
  }));

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /**
   * Fetches analytics data from the API
   * @returns {Promise<void>}
   */
  const fetchAnalytics = async () => {
    try {
      /** @type {{ data: AnalyticsStats }} */
      const response = await axios.get(`${API}/analytics/overview`);
      setStats(response.data);
    } catch (/** @type {any} */ error) {
      console.error('Failed to load analytics:', error);
      // Show placeholder data for now
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your accessibility widget performance and usage</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Widget Activations</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalActivations}</p>
            <p className="text-xs text-gray-500 mt-2">Lifetime widget opens</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">ASL Video Views</p>
            <p className="text-3xl font-bold text-gray-900">{stats.modalityUsage.asl}</p>
            <p className="text-xs text-gray-500 mt-2">Sign language content</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Audio Plays</p>
            <p className="text-3xl font-bold text-gray-900">{stats.modalityUsage.audio}</p>
            <p className="text-xs text-gray-500 mt-2">Text-to-speech usage</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Languages className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Text Views</p>
            <p className="text-3xl font-bold text-gray-900">{stats.modalityUsage.text}</p>
            <p className="text-xs text-gray-500 mt-2">Transcript reads</p>
          </div>
        </div>

        {/* Top Pages & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-[#21D4B4]" />
              <h2 className="text-lg font-semibold text-gray-900">Top Pages</h2>
            </div>
            {stats.topPages.length > 0 ? (
              <div className="space-y-3">
                {stats.topPages.map((page, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{page.url || 'Unknown Page'}</p>
                      <p className="text-xs text-gray-500">{page.views || 0} views</p>
                    </div>
                    <div className="ml-4">
                      <span className="text-lg font-bold text-[#21D4B4]">{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No page data yet</p>
                <p className="text-gray-400 text-xs mt-1">Data will appear once widget is used</p>
              </div>
            )}
          </div>

          {/* Top Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-[#21D4B4]" />
              <h2 className="text-lg font-semibold text-gray-900">Top Content</h2>
            </div>
            {stats.topContent.length > 0 ? (
              <div className="space-y-3">
                {stats.topContent.map((content, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {content.text?.substring(0, 50) || 'Content'}...
                      </p>
                      <p className="text-xs text-gray-500">{content.interactions || 0} interactions</p>
                    </div>
                    <div className="ml-4">
                      <span className="text-lg font-bold text-[#21D4B4]">{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No content data yet</p>
                <p className="text-gray-400 text-xs mt-1">Data will appear once widget is used</p>
              </div>
            )}
          </div>
        </div>

        {/* Modality Usage Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Modality Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">ASL Video</span>
                <span className="text-sm font-bold text-gray-900">{stats.modalityUsage.asl}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all"
                  style={{ 
                    width: `${stats.totalActivations > 0 ? (stats.modalityUsage.asl / stats.totalActivations * 100) : 0}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Audio</span>
                <span className="text-sm font-bold text-gray-900">{stats.modalityUsage.audio}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ 
                    width: `${stats.totalActivations > 0 ? (stats.modalityUsage.audio / stats.totalActivations * 100) : 0}%` 
                  }}
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Text</span>
                <span className="text-sm font-bold text-gray-900">{stats.modalityUsage.text}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ 
                    width: `${stats.totalActivations > 0 ? (stats.modalityUsage.text / stats.totalActivations * 100) : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Languages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Languages className="h-5 w-5 text-[#21D4B4]" />
            <h2 className="text-lg font-semibold text-gray-900">Top Languages</h2>
          </div>
          {stats.topLanguages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.topLanguages.map((lang, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{lang.code || 'EN'}</p>
                  <p className="text-sm text-gray-600 mt-1">{lang.name || 'English'}</p>
                  <p className="text-xs text-gray-500 mt-2">{lang.count || 0} uses</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No language data yet</p>
              <p className="text-gray-400 text-xs mt-1">Data will appear once widget is used</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}