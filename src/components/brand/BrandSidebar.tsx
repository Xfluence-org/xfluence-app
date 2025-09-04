
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { LogOut, BarChart3, Smartphone, Bot, Settings } from 'lucide-react';

interface BrandSidebarProps {
  userName?: string;
}

const BrandSidebar: React.FC<BrandSidebarProps> = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  
  const getActiveItem = () => {
    if (location.pathname.includes('/analyze-content')) return 'analyze-content';
    if (location.pathname.includes('/find-influencers')) return 'find-influencers';
    if (location.pathname.includes('/brand/ai-assistant')) return 'ai-assistant';
    return 'analyze-content';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { 
      id: 'analyze-content', 
      label: 'Analyze Content', 
      icon: BarChart3,
      onClick: () => navigate('/analyze-content')
    },
    { 
      id: 'find-influencers', 
      label: 'Find Influencers', 
      icon: Smartphone,
      onClick: () => navigate('/find-influencers')
    },
    { 
      id: 'ai-assistant', 
      label: 'AI Assistant', 
      icon: Bot,
      onClick: () => navigate('/brand/ai-assistant')
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 bg-white/10 backdrop-blur-2xl border-r border-white/20 flex flex-col h-screen relative overflow-hidden">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-brand-primary">Xfluence</h1>
        <p className="text-sm text-muted-foreground mt-1">{profile?.user_type || 'Brand'} Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3",
              activeItem === item.id
                ? "bg-brand-primary text-brand-primary-foreground shadow-lg font-medium"
                : "text-foreground hover:bg-muted/50 font-medium"
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
          <span className="text-sm text-muted-foreground">Logged in as</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground truncate pr-2">
            {userName || profile?.name || 'Brand'}
          </span>
          <button 
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all duration-300"
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
