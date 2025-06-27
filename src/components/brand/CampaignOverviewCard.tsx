
import React from 'react';
import { BrandCampaign } from '@/types/brandDashboard';
import ProgressBar from '@/components/dashboard/ProgressBar';

interface CampaignOverviewCardProps {
  campaign: BrandCampaign;
  onViewDetails: (campaignId: string) => void;
}

const CampaignOverviewCard: React.FC<CampaignOverviewCardProps> = ({ campaign, onViewDetails }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full px-3 py-1 text-xs font-medium';
      case 'paused':
        return 'status-pending';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full px-3 py-1 text-xs font-medium';
    }
  };

  const budgetUsed = (campaign.spent / campaign.budget) * 100;

  return (
    <div className="interactive-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-bold text-white">{campaign.title}</h3>
            <span className={getStatusBadge(campaign.status)}>
              {campaign.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {campaign.category} • Due: {campaign.dueDate}
          </p>
          <p className="text-sm text-muted-foreground">
            Platforms: {campaign.platforms.join(', ')}
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Budget Usage</span>
          <span className="text-sm font-bold text-white">
            ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
          </span>
        </div>
        <ProgressBar progress={budgetUsed} />
      </div>

      {/* Campaign Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Campaign Progress</span>
          <span className="text-sm font-bold text-white">{campaign.progress}%</span>
        </div>
        <ProgressBar progress={campaign.progress} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-muted-foreground">Applicants</p>
          <p className="text-lg font-bold text-white">{campaign.applicants}</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-muted-foreground">Accepted</p>
          <p className="text-lg font-bold text-gradient">{campaign.accepted}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      {campaign.performance && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/5 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Reach</p>
            <p className="text-sm font-bold text-white">
              {campaign.performance.reach >= 1000 
                ? `${(campaign.performance.reach / 1000).toFixed(1)}K` 
                : campaign.performance.reach}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Engagement</p>
            <p className="text-sm font-bold text-white">{campaign.performance.engagement}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Clicks</p>
            <p className="text-sm font-bold text-white">{campaign.performance.clicks}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => onViewDetails(campaign.id)}
        className="w-full btn-gradient"
      >
        View Details
      </button>
    </div>
  );
};

export default CampaignOverviewCard;
