
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface BrandSidebarProps {
  userName?: string;
}

const BrandSidebar: React.FC<BrandSidebarProps> = ({ userName = 'Brand Name' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  
  const getActiveItem = () => {
    if (location.pathname.includes('/brand-dashboard')) return 'analytics';
    if (location.pathname.includes('/brand/campaigns')) return 'campaigns';
    if (location.pathname.includes('/brand/applications')) return 'applications';
    if (location.pathname.includes('/brand/ai-assistant')) return 'ai-assistant';
    if (location.pathname.includes('/brand/settings')) return 'settings';
    return 'analytics';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { 
      id: 'analytics', 
      label: 'Analytics', 
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
      id: 'applications', 
      label: 'Applications', 
      icon: '📝',
      onClick: () => navigate('/brand/applications')
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
    <div className="w-70 bg-white border-r border-border flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <h1 className="text-h2 font-semibold text-text-primary">Xfluence</h1>
        <p className="text-body text-text-secondary mt-1">Brand Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "w-full text-left px-4 py-3 rounded-md transition-smooth flex items-center gap-3 group",
              activeItem === item.id
                ? "bg-background-tertiary text-primary font-semibold border-l-3 border-primary"
                : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-6 border-t border-border">
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-text-secondary hover:bg-background-tertiary hover:text-text-primary rounded-md transition-smooth font-medium"
        >
          {userName} [log out →]
        </button>
      </div>
    </div>
  );
};

export default BrandSidebar;
