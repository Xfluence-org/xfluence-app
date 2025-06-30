
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  userName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userName = 'Name' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const getActiveItem = () => {
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname === '/opportunities') return 'opportunities';
    if (location.pathname === '/campaigns') return 'campaigns';
    if (location.pathname.startsWith('/task-workflow/')) return 'campaigns';
    if (location.pathname === '/settings') return 'settings';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'opportunities', label: 'Opportunities', icon: '💡', path: '/opportunities' },
    { id: 'campaigns', label: 'Campaigns', icon: '📱', path: '/campaigns' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    navigate(item.path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-[#1a1f2e] to-[#252b3b] flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Xfluence</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3",
              activeItem === item.id
                ? "bg-[#1DDCD3] text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-center">
          <button 
            onClick={handleLogout}
            className="p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
