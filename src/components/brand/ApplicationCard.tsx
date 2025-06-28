
import React, { useState } from 'react';
import { InfluencerApplication } from '@/types/brandDashboard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ApplicationCardProps {
  application: InfluencerApplication;
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onViewMessage: (applicationId: string, message?: string) => void;
  hideActions?: boolean;
  applicationMessage?: string;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ 
  application, 
  onApprove, 
  onReject, 
  onViewMessage,
  hideActions = false,
  applicationMessage
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'accepted':
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
            Rejected
          </span>
        );
      case 'pending':
      case 'applied':
      case 'invited':
      default:
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
          {application.influencer.profileImage ? (
            <img 
              src={application.influencer.profileImage} 
              alt={application.influencer.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-500 font-semibold">
              {application.influencer.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-[#1a1f2e] truncate">
                {application.influencer.name}
              </h4>
              <p className="text-sm text-gray-600">@{application.influencer.handle}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {getStatusBadge(application.status)}
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimeAgo(application.appliedAt)}
              </span>
            </div>
          </div>

          {/* Campaign */}
          <p className="text-sm text-gray-600 mb-3 truncate">
            Applied to: <span className="font-medium text-[#1a1f2e]">{application.campaignTitle}</span>
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
          {!hideActions && (
            <div className="flex gap-2">
              {/* View Message Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
                    View Message
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Application Message</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div>
                        <p className="mb-2"><strong>From:</strong> {application.influencer.name} (@{application.influencer.handle})</p>
                        <p className="mb-2"><strong>Campaign:</strong> {application.campaignTitle}</p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">
                            {applicationMessage || 'I would love to collaborate on this campaign!'}
                          </p>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Approve/Reject buttons only for pending applications */}
              {['pending', 'applied', 'invited'].includes(application.status.toLowerCase()) && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
                        Reject
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Application</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this application from {application.influencer.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onReject(application.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="px-3 py-2 bg-[#1DDCD3] text-white rounded-lg hover:bg-[#00D4C7] transition-all duration-200 text-sm font-medium">
                        Approve
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Application</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve this application from {application.influencer.name}? They will be notified and can start working on the campaign.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onApprove(application.id)}
                          className="bg-[#1DDCD3] hover:bg-[#00D4C7]"
                        >
                          Approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          )}
          
          {hideActions && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
                    View Message
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Application Message</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div>
                        <p className="mb-2"><strong>From:</strong> {application.influencer.name} (@{application.influencer.handle})</p>
                        <p className="mb-2"><strong>Campaign:</strong> {application.campaignTitle}</p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">
                            {applicationMessage || 'I would love to collaborate on this campaign!'}
                          </p>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
