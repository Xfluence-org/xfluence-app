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
  showArchiveButton: boolean;
}

const BrandCampaignCard: React.FC<BrandCampaignCardProps> = ({
  campaign,
  onView,
  onArchive,
  showArchiveButton
}) => {
  const [isPublic, setIsPublic] = useState(campaign.is_public || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-body-sm font-medium";
    switch (status.toLowerCase()) {
      case 'active':
        return `${baseClasses} status-info`;
      case 'completed':
        return `${baseClasses} status-success`;
      case 'archived':
        return `${baseClasses} bg-text-secondary/10 text-text-secondary border border-text-secondary/20`;
      case 'published':
        return `${baseClasses} status-info`;
      default:
        return `${baseClasses} bg-text-secondary/10 text-text-secondary border border-text-secondary/20`;
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
    <div className="card-base hover-lift">
      {/* Campaign Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-h3 font-semibold text-text-primary">{campaign.campaign_title}</h3>
            <span className={getStatusBadge(campaign.campaign_status)}>
              {campaign.campaign_status}
            </span>
          </div>
          <p className="text-body text-text-secondary mb-2">
            {campaign.category} • {campaign.platforms.join(', ')}
          </p>
        </div>
        
        {/* Visibility Toggle - Only show for published campaigns */}
        {campaign.campaign_status.toLowerCase() === 'published' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center text-body text-text-secondary">
              {isPublic ? (
                <Globe className="h-4 w-4 mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {isPublic ? 'Public' : 'Private'}
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleVisibilityToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        )}
      </div>

      {/* Campaign Metrics */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <p className="text-body-sm text-text-secondary">Budget</p>
            <p className="text-h4 font-semibold text-text-primary">${campaign.budget.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="text-body-sm text-text-secondary">Applicants</p>
            <p className="text-h4 font-semibold text-text-primary">{campaign.applicants} ({campaign.accepted} accepted)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-body-sm text-text-secondary">Due Date</p>
            <p className="text-h4 font-semibold text-text-primary">{formatDate(campaign.due_date)}</p>
          </div>
        </div>
        <div>
          <p className="text-body-sm text-text-secondary mb-2">Progress</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-background-tertiary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-smooth" 
                style={{ width: `${campaign.progress}%` }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">{campaign.progress}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-border">
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
              <Button variant="outline" className="text-warning hover:text-warning">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border border-border rounded-lg shadow-card-hover">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-h3 font-semibold text-text-primary">Archive Campaign</AlertDialogTitle>
                <AlertDialogDescription className="text-body text-text-secondary">
                  Are you sure you want to archive "{campaign.campaign_title}"? This will:
                  <ul className="list-disc list-inside mt-3 space-y-1">
                    <li>Remove it from opportunities</li>
                    <li>Auto-reject all pending applications</li>
                    <li>Move it to the archived campaigns section</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onArchive(campaign.campaign_id)}
                  className="bg-warning hover:bg-warning/90 text-white"
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
