
import React from 'react';
import { cn } from '@/lib/utils';
import { CampaignTab } from '@/types/campaigns';

interface TabNavigationProps {
  activeTab: CampaignTab;
  onTabChange: (tab: CampaignTab) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: CampaignTab[] = ['Active', 'Completed', 'Requests'];

  return (
    <div className="flex bg-white/10 backdrop-blur-md rounded-xl p-1 mb-6 border border-white/20">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300",
            activeTab === tab
              ? "bg-brand-primary text-brand-primary-foreground shadow-lg border border-brand-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
