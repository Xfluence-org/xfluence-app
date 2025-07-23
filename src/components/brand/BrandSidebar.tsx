
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { LogOut } from 'lucide-react';

interface BrandSidebarProps {
  userName?: string;
}

const BrandSidebar: React.FC<BrandSidebarProps> = ({ userName = 'Brand Name' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  
  const getActiveItem = () => {
    if (location.pathname.includes('/brand-dashboard')) return 'dashboard';
    if (location.pathname.includes('/brand/campaigns')) return 'campaigns';
    if (location.pathname.includes('/brand/ai-assistant')) return 'ai-assistant';
    if (location.pathname.includes('/brand/settings')) return 'settings';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊',
      onClick: () => navigate('/brand-dashboard')
    },
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      icon: '📱',
      onClick: () => navigate('/brand/campaigns')
    },
    { 
      id: 'ai-assistant', 
      label: 'AI Assistant', 
      icon: '🤖',
      onClick: () => navigate('/brand/ai-assistant')
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️',
      onClick: () => navigate('/brand/settings')
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen shadow-sm">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#1a1f2e]">Xfluence</h1>
        <p className="text-sm text-gray-600 mt-1">{profile?.user_type || 'Brand'} Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3",
              activeItem === item.id
                ? "bg-[#1DDCD3] text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100 hover:text-[#1a1f2e]"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <button 
            onClick={handleLogout}
            className="p-3 text-gray-600 hover:bg-gray-100 hover:text-[#1a1f2e] rounded-xl transition-all duration-200"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandSidebar;
