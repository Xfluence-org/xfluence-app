
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { LogOut, BarChart3, Bot, Smartphone, Settings } from 'lucide-react';

interface SidebarProps {
  userName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const getActiveItem = () => {
    if (location.pathname === '/analyze-content') return 'analyze-content';
    if (location.pathname.includes('/brand/ai-assistant')) return 'ai-assistant';
    return 'analyze-content';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { 
      id: 'analyze-content', 
      label: 'Analyze Content', 
      icon: BarChart3, 
      path: '/analyze-content',
      isActive: true 
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      path: '/dashboard',
      isActive: false,
      comingSoon: true 
    },
    { 
      id: 'opportunities', 
      label: 'Opportunities', 
      icon: Bot, 
      path: '/opportunities',
      isActive: false,
      comingSoon: true 
    },
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      icon: Smartphone, 
      path: '/campaigns',
      isActive: false,
      comingSoon: true 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      path: '/settings',
      isActive: false,
      comingSoon: true 
    },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.isActive) {
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 bg-white/10 backdrop-blur-2xl border-r border-white/20 flex flex-col h-screen relative overflow-hidden">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Xfluence</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            disabled={!item.isActive}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 backdrop-blur-md relative",
              activeItem === item.id && item.isActive
                ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg border border-white/30"
                : item.isActive
                ? "text-gray-700 dark:text-gray-300 hover:bg-white/20 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-white/20"
                : "text-gray-500 dark:text-gray-500 opacity-60 cursor-not-allowed border border-transparent"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.comingSoon && (
              <span className="ml-auto text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-md">
                Soon
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Logged in as</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-800 dark:text-white truncate pr-2">
            {userName || profile?.name || 'User'}
          </span>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-300 backdrop-blur-md border border-transparent hover:border-white/20"
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
