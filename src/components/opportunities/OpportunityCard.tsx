
import React from 'react';
import { Opportunity } from '@/types/opportunities';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (id: string) => void;
  onApplyNow: (id: string) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ 
  opportunity, 
  onViewDetails, 
  onApplyNow 
}) => {
  const formatCompensation = () => {
    if (opportunity.compensation.type === 'range' && opportunity.compensation.min) {
      return `$${opportunity.compensation.min.toLocaleString()} - $${opportunity.compensation.max.toLocaleString()}`;
    }
    return `up to $${opportunity.compensation.max.toLocaleString()}`;
  };

  const formatDeliverables = () => {
    const parts = [];
    if (opportunity.deliverables.posts) {
      parts.push(`${opportunity.deliverables.posts} Posts`);
    }
    if (opportunity.deliverables.stories) {
      parts.push(`${opportunity.deliverables.stories} Stories`);
    }
    if (opportunity.deliverables.reels) {
      parts.push(`${opportunity.deliverables.reels} reel`);
    }
    return parts.join(', ');
  };

  const formatTimeAgo = (postedAt: string) => {
    const now = new Date();
    const posted = new Date(postedAt);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#1DDCD3]/20 transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#1a1f2e] mb-1">{opportunity.title}</h3>
          <p className="text-gray-600 mb-2">
            Compensation: <span className="text-[#1DDCD3] font-semibold">{formatCompensation()}</span>
          </p>
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
          {formatTimeAgo(opportunity.postedAt)}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Deliverables */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Deliverables</h4>
          <p className="text-[#1a1f2e] font-medium">{formatDeliverables()}</p>
        </div>

        {/* Platforms */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Platforms</h4>
          <p className="text-[#1a1f2e] font-medium">{opportunity.platforms.join(', ')}</p>
        </div>

        {/* Category */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
          <p className="text-[#1a1f2e] font-medium">{opportunity.category.join(', ')}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(opportunity.id)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[#1DDCD3] transition-all duration-200 font-medium"
        >
          View Details
        </button>
        <button
          onClick={() => onApplyNow(opportunity.id)}
          className="flex-1 px-4 py-2 bg-[#1DDCD3] text-white rounded-lg hover:bg-[#00D4C7] transition-all duration-200 font-medium shadow-sm"
        >
          Apply now
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard;
