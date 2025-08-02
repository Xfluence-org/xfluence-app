
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
              ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg border border-white/30"
              : "text-gray-600 hover:text-[#1a1f2e] hover:bg-white/10"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
