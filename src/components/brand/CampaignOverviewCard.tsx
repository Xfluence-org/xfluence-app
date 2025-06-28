
import React from 'react';
import { BrandCampaign } from '@/types/brandDashboard';
import ProgressBar from '@/components/dashboard/ProgressBar';

interface CampaignOverviewCardProps {
  campaign: BrandCampaign;
  onViewDetails: (campaignId: string) => void;
}

const CampaignOverviewCard: React.FC<CampaignOverviewCardProps> = ({ campaign, onViewDetails }) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-white text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-[#1DDCD3]`;
      case 'draft':
        return `${baseClasses} bg-gray-600`;
      case 'completed':
        return `${baseClasses} bg-green-600`;
      case 'paused':
        return `${baseClasses} bg-yellow-600`;
      default:
        return `${baseClasses} bg-gray-400`;
    }
  };

  // Convert budget and spent from cents to dollars for display
  const budgetInDollars = Math.round(campaign.budget / 100);
  const spentInDollars = Math.round(campaign.spent / 100);
  const budgetUsed = budgetInDollars > 0 ? (spentInDollars / budgetInDollars) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-[#1a1f2e]">{campaign.title}</h3>
            <span className={getStatusBadge(campaign.status)}>
              {campaign.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {campaign.category} • Due: {campaign.dueDate}
          </p>
          <p className="text-sm text-gray-600">
            Platforms: {campaign.platforms.join(', ')}
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget Usage</span>
          <span className="text-sm font-bold text-[#1a1f2e]">
            ${spentInDollars.toLocaleString()} / ${budgetInDollars.toLocaleString()}
          </span>
        </div>
        <ProgressBar progress={budgetUsed} />
      </div>

      {/* Campaign Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Campaign Progress</span>
          <span className="text-sm font-bold text-[#1a1f2e]">{campaign.progress}%</span>
        </div>
        <ProgressBar progress={campaign.progress} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Applicants</p>
          <p className="text-lg font-bold text-[#1a1f2e]">{campaign.applicants}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Accepted</p>
          <p className="text-lg font-bold text-[#1DDCD3]">{campaign.accepted}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      {campaign.performance && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500">Reach</p>
            <p className="text-sm font-bold text-[#1a1f2e]">
              {campaign.performance.reach >= 1000 
                ? `${(campaign.performance.reach / 1000).toFixed(1)}K` 
                : campaign.performance.reach}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Engagement</p>
            <p className="text-sm font-bold text-[#1a1f2e]">{campaign.performance.engagement}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Clicks</p>
            <p className="text-sm font-bold text-[#1a1f2e]">{campaign.performance.clicks}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => onViewDetails(campaign.id)}
        className="w-full px-4 py-2 bg-[#1DDCD3] text-white rounded-lg hover:bg-[#00D4C7] transition-all duration-200 font-medium"
      >
        View Details
      </button>
    </div>
  );
};

export default CampaignOverviewCard;
