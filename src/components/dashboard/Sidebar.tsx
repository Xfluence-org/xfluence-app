
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { LogOut, BarChart3, Bot } from 'lucide-react';

interface SidebarProps {
  userName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const getActiveItem = () => {
    if (location.pathname === '/analyze-content') return 'analyze-content';
    if (location.pathname === '/brand/ai-assistant') return 'ai-assistant';
    return 'analyze-content';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { id: 'analyze-content', label: 'Analyze Content', icon: BarChart3, path: '/analyze-content' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, path: '/brand/ai-assistant' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    navigate(item.path);
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
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 backdrop-blur-md",
              activeItem === item.id
                ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg border border-white/30"
                : "text-gray-700 dark:text-gray-300 hover:bg-white/20 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-white/20"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
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
