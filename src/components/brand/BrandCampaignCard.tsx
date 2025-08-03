
// @ts-nocheck
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
import { Eye, Archive, Calendar, Users, DollarSign, Globe, Lock, TrendingUp, Badge } from 'lucide-react';
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

  // Convert budget from cents to dollars for display
  const budgetInDollars = Math.round(campaign.budget / 100);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border";
    switch (status.toLowerCase()) {
      case 'active':
        return `${baseClasses} bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-700 border-teal-300/50`;
      case 'completed':
        return `${baseClasses} bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 border-emerald-300/50`;
      case 'archived':
        return `${baseClasses} bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 border-gray-300/50`;
      case 'published':
        return `${baseClasses} bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 border-purple-300/50`;
      default:
        return `${baseClasses} bg-gray-100/50 text-gray-700 border-gray-300/50`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fashion': 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border-purple-300/50',
      'Beauty': 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-700 border-pink-300/50',
      'Tech': 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-300/50',
      'Technology': 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-300/50',
      'Food': 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 border-orange-300/50',
      'Food & Drinks': 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 border-orange-300/50',
      'Lifestyle': 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-green-300/50',
      'Travel': 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-700 border-sky-300/50',
      'Fitness': 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-700 border-red-300/50',
      'Gaming': 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 border-violet-300/50',
      'General': 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 border-gray-300/50'
    };
    return colors[category] || colors['General'];
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
    <div className="glass border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-300/30">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{campaign.campaign_title}</h3>
              <span className={getStatusBadge(campaign.campaign_status)}>
                {campaign.campaign_status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getCategoryColor(campaign.category)}`}>
                {campaign.category}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>Due {formatDate(campaign.due_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Metrics */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-light rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <Users className="h-3.5 w-3.5 text-purple-600" />
              <span>Influencers</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {campaign.accepted || 0}
              <span className="text-sm font-normal text-gray-600 ml-1">/ {campaign.applicants}</span>
            </p>
          </div>
          
          <div className="glass-light rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-purple-600" />
              <span>Budget</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              ${budgetInDollars.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Campaign Progress</span>
            <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {campaign.progress || 0}%
            </span>
          </div>
          <div className="relative h-2 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" 
              style={{ width: `${campaign.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Success Badge */}
        {campaign.progress === 100 && (
          <div className="flex items-center justify-center pt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border border-green-300/50 backdrop-blur-sm">
              Successfully Completed
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all"
          onClick={() => onView(campaign.campaign_id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        
        {showArchiveButton && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-orange-50/70 text-orange-600 hover:text-orange-700 transition-all">
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
