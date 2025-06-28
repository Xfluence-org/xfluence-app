
import React from 'react';
import { CampaignTask } from '@/types/campaigns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: CampaignTask;
  onViewDetails: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'content review':
        return 'bg-blue-500';
      case 'post content':
        return 'bg-green-500';
      case 'content draft':
        return 'bg-[#1DDCD3]';
      case 'completed':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[#1a1f2e] mb-1">{task.type}</h3>
          <p className="text-sm text-gray-600">{task.deliverable}</p>
        </div>
        <button
          onClick={() => onViewDetails(task.id)}
          className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#1DDCD3] transition-all duration-200 text-gray-600 hover:text-[#1a1f2e]"
        >
          View Details
        </button>
      </div>

      {/* Status and Progress */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <span className="text-sm text-gray-500">Progress</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={cn(
            "px-3 py-1 rounded-full text-white text-xs font-medium",
            getStatusColor(task.status)
          )}>
            {task.status}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-[#1a1f2e] text-xs font-medium">
            {task.progress}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Next deadline</span>
          <span className="text-sm text-[#1a1f2e] font-medium">{task.nextDeadline}</span>
        </div>
      </div>

      {/* Feedback */}
      {task.feedback && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3">
          <h4 className="text-sm font-medium text-[#1a1f2e] mb-1">Feedback</h4>
          <p className="text-sm text-gray-600">{task.feedback}</p>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
