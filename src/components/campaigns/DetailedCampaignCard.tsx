
import React from 'react';
import { DetailedCampaign } from '@/types/campaigns';
import TaskCard from './TaskCard';
import ProgressBar from '@/components/dashboard/ProgressBar';
import { formatStatus } from '@/utils/taskFormatters';

interface DetailedCampaignCardProps {
  campaign: DetailedCampaign;
  onViewTaskDetails: (taskId: string) => void;
}

const DetailedCampaignCard: React.FC<DetailedCampaignCardProps> = ({ 
  campaign, 
  onViewTaskDetails 
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-white text-xs font-medium";
    switch (status) {
      case 'invited':
        return `${baseClasses} bg-blue-500`;
      case 'active':
        return `${baseClasses} bg-[#1DDCD3]`;
      case 'completed':
        return `${baseClasses} bg-emerald-500`;
      default:
        return `${baseClasses} bg-gray-400`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-lg hover:shadow-xl transition-all duration-200">
      {/* Campaign Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {/* Brand Logo Placeholder */}
          <div className="w-12 h-12 bg-gradient-to-br from-[#1DDCD3] to-[#1DDCD3]/70 rounded-xl flex-shrink-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{campaign.brand?.charAt(0) || '?'}</span>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-[#1a1f2e]">{campaign.title}</h2>
              <span className={getStatusBadge(campaign.status)}>
                {formatStatus(campaign.status)}
              </span>
            </div>
            <p className="text-gray-600 mb-1">
              {campaign.brand || 'Unknown Brand'} • {campaign.taskCount} tasks • Due {campaign.dueDate}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                <span className="font-medium">Platforms:</span> {campaign.platforms.join(', ')}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-[#1DDCD3]">
            ${(campaign.amount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-[#1a1f2e]">{campaign.overallProgress}% Progress</span>
        </div>
        <ProgressBar progress={campaign.overallProgress} />
      </div>

      {/* Tasks Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#1a1f2e]">Tasks</h3>
          {!campaign.isWaitingForRequirements && (
            <span className="text-sm text-gray-600">
              {campaign.completedTasks}/{campaign.taskCount} Tasks complete
            </span>
          )}
        </div>

        {campaign.isWaitingForRequirements ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-800 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Waiting for Content Requirements</span>
            </div>
            <p className="text-sm text-yellow-700">
              The brand will share specific content requirements for this campaign soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaign.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onViewDetails={onViewTaskDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedCampaignCard;
