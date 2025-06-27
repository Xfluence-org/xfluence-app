
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Eye, Archive, Calendar, Users, DollarSign } from 'lucide-react';

interface BrandCampaign {
  campaign_id: string;
  campaign_title: string;
  campaign_status: string;
  budget: number;
  spent: number;
  applicants: number;
  accepted: number;
  due_date: string;
  platforms: string[];
  category: string;
  progress: number;
}

interface BrandCampaignCardProps {
  campaign: BrandCampaign;
  onView: (campaignId: string) => void;
  onArchive: (campaignId: string) => void;
  showArchiveButton: boolean;
}

const BrandCampaignCard: React.FC<BrandCampaignCardProps> = ({
  campaign,
  onView,
  onArchive,
  showArchiveButton
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-white text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'active':
        return `${baseClasses} bg-[#1DDCD3]`;
      case 'completed':
        return `${baseClasses} bg-emerald-500`;
      case 'archived':
        return `${baseClasses} bg-gray-500`;
      case 'published':
        return `${baseClasses} bg-blue-500`;
      default:
        return `${baseClasses} bg-gray-400`;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
      {/* Campaign Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-[#1a1f2e]">{campaign.campaign_title}</h3>
            <span className={getStatusBadge(campaign.campaign_status)}>
              {campaign.campaign_status}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            {campaign.category} • {campaign.platforms.join(', ')}
          </p>
        </div>
      </div>

      {/* Campaign Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#1DDCD3]" />
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="font-semibold">${campaign.budget.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#1DDCD3]" />
          <div>
            <p className="text-sm text-gray-600">Applicants</p>
            <p className="font-semibold">{campaign.applicants} ({campaign.accepted} accepted)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#1DDCD3]" />
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-semibold">{formatDate(campaign.due_date)}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#1DDCD3] h-2 rounded-full" 
                style={{ width: `${campaign.progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{campaign.progress}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onView(campaign.campaign_id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        
        {showArchiveButton && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-orange-600 hover:text-orange-700">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive Campaign</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to archive "{campaign.campaign_title}"? This will:
                  <ul className="list-disc list-inside mt-2">
                    <li>Remove it from opportunities</li>
                    <li>Auto-reject all pending applications</li>
                    <li>Move it to the archived campaigns section</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onArchive(campaign.campaign_id)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Archive Campaign
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default BrandCampaignCard;
