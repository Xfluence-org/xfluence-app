
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { LogOut, BarChart3, Bot, Smartphone, Settings, Search } from 'lucide-react';
import { isFeatureEnabled, getFeatureInfo } from '@/config/features';
import { FeatureIndicator } from '@/components/ui/feature-indicator';
import { FeatureLockedModal } from '@/components/ui/feature-locked-modal';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface SidebarProps {
  userName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const [lockedFeatureModal, setLockedFeatureModal] = useState<{
    isOpen: boolean;
    featureName: string;
  }>({ isOpen: false, featureName: '' });
  
  // Enable secret admin access
  useAdminAccess();

  const getActiveItem = () => {
    if (location.pathname === '/analyze-content') return 'analyze-content';
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname === '/opportunities') return 'opportunities';
    if (location.pathname === '/campaigns') return 'campaigns';
    if (location.pathname === '/settings') return 'settings';
    return 'analyze-content';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { 
      id: 'analyze-content', 
      label: 'Analyze Content', 
      icon: BarChart3, 
      path: '/analyze-content',
      feature: 'contentAnalysis' as const
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      path: '/dashboard',
      feature: 'influencerDashboard' as const
    },
    { 
      id: 'opportunities', 
      label: 'Opportunities', 
      icon: Search, 
      path: '/opportunities',
      feature: 'opportunities' as const
    },
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      icon: Smartphone, 
      path: '/campaigns',
      feature: 'campaigns' as const
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      path: '/settings',
      feature: 'influencerSettings' as const
    },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (isFeatureEnabled(item.feature)) {
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleLockedFeatureClick = (featureName: string) => {
    setLockedFeatureModal({ isOpen: true, featureName });
  };

  return (
    <div className="w-64 bg-white/10 backdrop-blur-2xl border-r border-white/20 flex flex-col h-screen fixed left-0 top-0 z-40 overflow-hidden">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Xfluence</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isEnabled = isFeatureEnabled(item.feature);
          const featureInfo = getFeatureInfo(item.feature);
          
          return (
            <button
              key={item.id}
              onClick={isEnabled ? () => navigate(item.path) : () => handleLockedFeatureClick(item.feature)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 backdrop-blur-md relative",
                activeItem === item.id && isEnabled
                  ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg border border-white/30"
                  : isEnabled
                  ? "text-gray-700 dark:text-gray-300 hover:bg-white/20 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-white/20"
                  : "text-gray-500 dark:text-gray-500 opacity-60 cursor-pointer hover:opacity-80 border border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              <FeatureIndicator 
                feature={featureInfo} 
                variant="influencer" 
                className="ml-auto"
              />
            </button>
          );
        })}
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

      {/* Feature Locked Modal */}
      <FeatureLockedModal
        isOpen={lockedFeatureModal.isOpen}
        onClose={() => setLockedFeatureModal({ isOpen: false, featureName: '' })}
        featureName={lockedFeatureModal.featureName}
      />
    </div>
  );
};

export default Sidebar;
