import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Lock, CreditCard } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Add update logic here
    setTimeout(() => {
      toast.success('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-[#00CED1]" />
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input defaultValue={user?.name} className="mt-1" />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" defaultValue={user?.email} className="mt-1" />
                </div>
                <div>
                  <Label>Company (Optional)</Label>
                  <Input placeholder="Your company name" className="mt-1" />
                </div>
                <Button
                  type="submit"
                  className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </div>

            {/* Password Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="h-5 w-5 text-[#00CED1]" />
                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              </div>
              <form className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" className="mt-1" />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input type="password" className="mt-1" />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input type="password" className="mt-1" />
                </div>
                <Button
                  type="submit"
                  className="bg-[#00CED1] hover:bg-[#00CED1]/90 text-black font-semibold"
                >
                  Update Password
                </Button>
              </form>
            </div>

            {/* Billing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-[#00CED1]" />
                <h2 className="text-lg font-semibold text-gray-900">Billing & Payments</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Current Plan</p>
                    <p className="text-sm text-gray-600">PRO Plan - $99/month</p>
                  </div>
                  <Button variant="outline" size="sm">Manage Plan</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Payment Method</p>
                    <p className="text-sm text-gray-600">•••• •••• •••• 4242</p>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Account Type</p>
                  <p className="font-medium text-gray-900">PRO</p>
                </div>
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">User ID</p>
                  <p className="font-medium text-gray-900 text-xs">{user?.id?.slice(0, 8)}...</p>
                </div>
              </div>
            </div>

            <div className="bg-[#00CED1]/5 rounded-xl border border-[#00CED1]/20 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contact our support team for assistance with your account.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}