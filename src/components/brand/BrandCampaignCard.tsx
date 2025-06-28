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
import { Eye, Archive, Calendar, Users, DollarSign, Globe, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  is_public?: boolean;
}

interface BrandCampaignCardProps {
  campaign: BrandCampaign;
  onView: (campaignId: string) => void;
  onArchive: (campaignId: string) => void;
  onPublish?: (campaignId: string) => void;
  showArchiveButton: boolean;
  showPublishButton?: boolean;
}

const BrandCampaignCard: React.FC<BrandCampaignCardProps> = ({
  campaign,
  onView,
  onArchive,
  onPublish,
  showArchiveButton,
  showPublishButton = false
}) => {
  const [isPublic, setIsPublic] = useState(campaign.is_public || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Convert budget from cents to dollars for display
  const budgetInDollars = Math.round(campaign.budget / 100);

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

  const handleVisibilityToggle = async (newValue: boolean) => {
    // If setting to private and there are applicants, show a warning
    if (!newValue && campaign.applicants > 0) {
      const confirmChange = window.confirm(
        `This campaign has ${campaign.applicants} applicant(s). Making it private will:\n\n` +
        `• Hide it from new influencers\n` +
        `• Existing applicants will still see it in their "Applied" section\n` +
        `• You can still review and approve existing applications\n\n` +
        `Continue?`
      );
      
      if (!confirmChange) {
        return;
      }
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ is_public: newValue })
        .eq('id', campaign.campaign_id);

      if (error) {
        throw error;
      }

      setIsPublic(newValue);
      toast({
        title: newValue ? "Campaign is now public" : "Campaign is now private",
        description: newValue 
          ? "This campaign will appear in opportunities for influencers to discover"
          : campaign.applicants > 0 
            ? "Campaign hidden from new influencers. Existing applications remain active."
            : "This campaign is now hidden from opportunities. Only invited influencers can apply.",
      });
    } catch (error) {
      console.error('Error updating campaign visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign visibility",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
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
        
        {/* Visibility Toggle - Only show for published campaigns */}
        {campaign.campaign_status.toLowerCase() === 'published' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm text-gray-600">
              {isPublic ? (
                <Globe className="h-4 w-4 mr-1" />
              ) : (
                <Lock className="h-4 w-4 mr-1" />
              )}
              {isPublic ? 'Public' : 'Private'}
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleVisibilityToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-[#1DDCD3]"
            />
          </div>
        )}
      </div>

      {/* Campaign Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#1DDCD3]" />
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="font-semibold">${budgetInDollars.toLocaleString()}</p>
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
        
        {showPublishButton && onPublish && (
          <Button 
            onClick={() => onPublish(campaign.campaign_id)}
            className="bg-[#1DDCD3] hover:bg-[#00D4C7] text-white"
          >
            Publish
          </Button>
        )}
        
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
