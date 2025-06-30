
import React from 'react';
import { InfluencerApplication } from '@/types/brandDashboard';

interface ApplicationCardProps {
  application: InfluencerApplication;
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onViewProfile: (applicationId: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ 
  application, 
  onApprove, 
  onReject, 
  onViewProfile 
}) => {
  const formatFollowers = (followers: number) => {
    if (followers >= 1000000) {
      return `${(followers / 1000000).toFixed(1)}M`;
    } else if (followers >= 1000) {
      return `${(followers / 1000).toFixed(1)}K`;
    }
    return followers.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const applied = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - applied.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden">
          <img 
            src={application.influencer.profileImage || `https://i.pravatar.cc/150?u=${application.influencer.handle}`} 
            alt={application.influencer.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-[#1a1f2e] truncate">
                {application.influencer.name}
              </h4>
              <p className="text-sm text-gray-600">{application.influencer.handle.startsWith('@') ? application.influencer.handle : `@${application.influencer.handle}`}</p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatTimeAgo(application.appliedAt)}
            </span>
          </div>

          {/* Campaign */}
          <p className="text-sm text-gray-600 mb-3 truncate">
            Applied to: {application.campaignTitle}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div>
              <span className="text-gray-500">Followers:</span>
              <span className="font-medium text-[#1a1f2e] ml-1">
                {formatFollowers(application.influencer.followers)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Engagement:</span>
              <span className="font-medium text-[#1a1f2e] ml-1">
                {application.engagementRate}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Avg Views:</span>
              <span className="font-medium text-[#1a1f2e] ml-1">
                {application.averageViews >= 1000 
                  ? `${(application.averageViews / 1000).toFixed(1)}K` 
                  : application.averageViews}
              </span>
            </div>
            <div>
              <span className="text-gray-500">AI Score:</span>
              <span className="font-medium text-[#1DDCD3] ml-1">
                {application.aiScore}/100
              </span>
            </div>
          </div>

          {/* Niche Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {application.niche.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {application.niche.length > 3 && (
              <span className="text-xs text-gray-500">
                +{application.niche.length - 3} more
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onReject(application.id)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(application.id)}
              className="flex-1 px-3 py-2 bg-[#1DDCD3] text-white rounded-lg hover:bg-[#00D4C7] transition-all duration-200 text-sm font-medium"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
