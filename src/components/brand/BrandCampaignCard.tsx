
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
import { Eye, Archive, Calendar, Users } from 'lucide-react';

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
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full px-3 py-1 text-xs font-medium';
      case 'published':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-3 py-1 text-xs font-medium';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full px-3 py-1 text-xs font-medium';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  return (
    <div className="interactive-card p-6">
      {/* Campaign Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-white">{campaign.campaign_title}</h3>
            <span className={getStatusBadge(campaign.campaign_status)}>
              {campaign.campaign_status}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-2">
            {campaign.category} • {campaign.platforms.join(', ')}
          </p>
        </div>
      </div>

      {/* Campaign Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-primary">💰</span>
            <p className="text-sm text-muted-foreground">Budget</p>
          </div>
          <p className="font-semibold text-white">${campaign.budget.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">Applicants</p>
          </div>
          <p className="font-semibold text-white">{campaign.applicants} ({campaign.accepted} accepted)</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">Due Date</p>
          </div>
          <p className="font-semibold text-white">{formatDate(campaign.due_date)}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300" 
                style={{ width: `${campaign.progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gradient">{campaign.progress}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <Button 
          variant="outline" 
          className="flex-1 border-white/20 text-white hover:bg-white/10"
          onClick={() => onView(campaign.campaign_id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        
        {showArchiveButton && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-orange-400 border-orange-400/30 hover:bg-orange-400/10">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Archive Campaign</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to archive "{campaign.campaign_title}"? This will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Remove it from opportunities</li>
                    <li>Auto-reject all pending applications</li>
                    <li>Move it to the archived campaigns section</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onArchive(campaign.campaign_id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
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
