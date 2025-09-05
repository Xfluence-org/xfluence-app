
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { LogOut, BarChart3, Smartphone, Bot, Settings, Users, TrendingUp, Calendar } from 'lucide-react';
import { isFeatureEnabled, getFeatureInfo } from '@/config/features';
import { FeatureIndicator } from '@/components/ui/feature-indicator';
import { FeatureLockedModal } from '@/components/ui/feature-locked-modal';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface BrandSidebarProps {
  userName?: string;
}

const BrandSidebar: React.FC<BrandSidebarProps> = ({ userName }) => {
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
    if (location.pathname.includes('/analyze-content')) return 'analyze-content';
    if (location.pathname.includes('/find-influencers')) return 'find-influencers';
    if (location.pathname.includes('/brand/ai-assistant')) return 'ai-assistant';
    if (location.pathname.includes('/brand-dashboard')) return 'brand-dashboard';
    if (location.pathname.includes('/brand/campaigns')) return 'brand-campaigns';
    if (location.pathname.includes('/brand/progress')) return 'brand-progress';
    if (location.pathname.includes('/brand/settings')) return 'brand-settings';
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
      id: 'find-influencers', 
      label: 'Find Influencers', 
      icon: Users,
      path: '/find-influencers',
      feature: 'findInfluencers' as const
    },
    { 
      id: 'ai-assistant', 
      label: 'AI Assistant', 
      icon: Bot,
      path: '/brand/ai-assistant',
      feature: 'aiAssistant' as const
    },
    { 
      id: 'brand-dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      path: '/brand-dashboard',
      feature: 'brandDashboard' as const
    },
    { 
      id: 'brand-campaigns', 
      label: 'Campaigns', 
      icon: Calendar,
      path: '/brand/campaigns',
      feature: 'brandCampaigns' as const
    },
    { 
      id: 'brand-progress', 
      label: 'Progress', 
      icon: TrendingUp,
      path: '/brand/progress',
      feature: 'brandProgress' as const
    },
    { 
      id: 'brand-settings', 
      label: 'Settings', 
      icon: Settings,
      path: '/brand/settings',
      feature: 'brandSettings' as const
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleLockedFeatureClick = (featureName: string) => {
    setLockedFeatureModal({ isOpen: true, featureName });
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
        {menuItems.map((item) => {
          const isEnabled = isFeatureEnabled(item.feature);
          const featureInfo = getFeatureInfo(item.feature);
          
          return (
            <button
              key={item.id}
              onClick={isEnabled ? () => navigate(item.path) : () => handleLockedFeatureClick(item.feature)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 relative",
                activeItem === item.id && isEnabled
                  ? "bg-brand-primary text-brand-primary-foreground shadow-lg font-medium"
                  : isEnabled
                  ? "text-foreground hover:bg-muted/50 font-medium"
                  : "text-muted-foreground font-medium opacity-60 cursor-pointer hover:opacity-80"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              <FeatureIndicator 
                feature={featureInfo} 
                variant="brand" 
                className="ml-auto"
              />
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Logged in as</span>
        </div>
        <div className="flex items-center justify-between mb-3">
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

      {/* Feature Locked Modal */}
      <FeatureLockedModal
        isOpen={lockedFeatureModal.isOpen}
        onClose={() => setLockedFeatureModal({ isOpen: false, featureName: '' })}
        featureName={lockedFeatureModal.featureName}
      />
    </div>
  );
};

export default BrandSidebar;
