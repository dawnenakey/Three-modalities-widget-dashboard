import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Globe, BarChart3, Settings, LogOut, Briefcase } from 'lucide-react';

/**
 * @typedef {Object} NavItem
 * @property {string} path - Route path
 * @property {React.ComponentType<{ className?: string }>} icon - Lucide icon component
 * @property {string} label - Navigation label
 * @property {boolean} exact - Whether to match path exactly
 */

/**
 * Dashboard layout component with sidebar navigation
 * @param {{ children: React.ReactNode }} props - Component props
 * @returns {JSX.Element} DashboardLayout component
 */
export default function DashboardLayout({ children }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles user logout
   * @returns {void}
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /** @type {NavItem[]} */
  const navItems = [
    { path: '/', icon: Home, label: 'Home', exact: true },
    { path: '/websites', icon: Globe, label: 'Websites', exact: false },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', exact: true },
    { path: '/add-on-services', icon: Briefcase, label: 'Add-On Services', exact: true },
    { path: '/settings', icon: Settings, label: 'Settings', exact: true },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a1a] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800 flex flex-col items-center">
          <img src="/zigzag_logo.svg" alt="PIVOT powered by dozanu" className="h-20 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? 'bg-[#21D4B4] text-black font-semibold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-[#21D4B4] flex items-center justify-center text-black font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            data-testid="logout-button"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}