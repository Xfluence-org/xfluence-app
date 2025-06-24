
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
    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200",
            activeTab === tab
              ? "bg-[#1DDCD3] text-white shadow-lg"
              : "text-gray-600 hover:text-[#1a1f2e] hover:bg-gray-50"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
