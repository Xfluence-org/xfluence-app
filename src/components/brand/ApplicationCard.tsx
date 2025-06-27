
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
    <div className="interactive-card p-5">
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex-shrink-0 flex items-center justify-center border border-white/10">
          {application.influencer.profileImage ? (
            <img 
              src={application.influencer.profileImage} 
              alt={application.influencer.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {application.influencer.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-white truncate">
                {application.influencer.name}
              </h4>
              <p className="text-sm text-muted-foreground">@{application.influencer.handle}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatTimeAgo(application.appliedAt)}
            </span>
          </div>

          {/* Campaign */}
          <p className="text-sm text-muted-foreground mb-3 truncate">
            Applied to: <span className="text-white">{application.campaignTitle}</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-muted-foreground block text-xs">Followers</span>
              <span className="font-semibold text-white">
                {formatFollowers(application.influencer.followers)}
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-muted-foreground block text-xs">Engagement</span>
              <span className="font-semibold text-white">
                {application.engagementRate}%
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-muted-foreground block text-xs">Avg Views</span>
              <span className="font-semibold text-white">
                {application.averageViews >= 1000 
                  ? `${(application.averageViews / 1000).toFixed(1)}K` 
                  : application.averageViews}
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-muted-foreground block text-xs">AI Score</span>
              <span className="font-semibold text-gradient">
                {application.aiScore}/100
              </span>
            </div>
          </div>

          {/* Niche Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {application.niche.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
              >
                {tag}
              </span>
            ))}
            {application.niche.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{application.niche.length - 3} more
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewProfile(application.id)}
              className="flex-1 px-3 py-2 border border-white/20 text-muted-foreground rounded-lg hover:bg-white/5 transition-all duration-200 text-sm font-medium"
            >
              View Profile
            </button>
            <button
              onClick={() => onReject(application.id)}
              className="px-3 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(application.id)}
              className="px-3 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:scale-105 transition-all duration-200 text-sm font-medium shadow-lg shadow-primary/25"
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
