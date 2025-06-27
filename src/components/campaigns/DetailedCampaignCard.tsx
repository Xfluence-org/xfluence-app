
import React from 'react';
import { DetailedCampaign } from '@/types/campaigns';
import TaskCard from './TaskCard';
import ProgressBar from '@/components/dashboard/ProgressBar';

interface DetailedCampaignCardProps {
  campaign: DetailedCampaign;
  onViewTaskDetails: (taskId: string) => void;
}

const DetailedCampaignCard: React.FC<DetailedCampaignCardProps> = ({ 
  campaign, 
  onViewTaskDetails 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-3 py-1 text-xs font-medium';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full px-3 py-1 text-xs font-medium';
    }
  };

  return (
    <div className="interactive-card p-8 mb-6">
      {/* Campaign Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {/* Brand Logo Placeholder */}
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-white font-bold text-xl">{campaign.brand.charAt(0)}</span>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{campaign.title}</h2>
              <span className={getStatusBadge(campaign.status)}>
                {campaign.status}
              </span>
            </div>
            <p className="text-muted-foreground mb-2">
              <span className="text-white font-medium">{campaign.brand}</span> • {campaign.taskCount} tasks • Due {campaign.dueDate}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                <span className="font-medium text-white">Platforms:</span> {campaign.platforms.join(', ')}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-gradient">
            ${campaign.amount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-white">{campaign.overallProgress}% Progress</span>
        </div>
        <ProgressBar progress={campaign.overallProgress} />
      </div>

      {/* Tasks Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Tasks</h3>
          <span className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
            {campaign.completedTasks}/{campaign.taskCount} Tasks complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaign.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onViewDetails={onViewTaskDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailedCampaignCard;
