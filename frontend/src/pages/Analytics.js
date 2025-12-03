import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your accessibility widget performance and usage</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Track widget views, interactions, and accessibility content usage across all your websites.
          </p>
        </div>

        {/* Placeholder for future analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Widget Views</h3>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-2">Data collection starts after deployment</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Modal Opens</h3>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-2">Track user engagement</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Content Requests</h3>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-2">ASL, Audio, Text views</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
