
// @ts-nocheck
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Globe, Lock } from 'lucide-react';

interface PublicCampaignToggleProps {
  campaignId: string;
  isPublic: boolean;
  onToggle: (isPublic: boolean) => void;
}

const PublicCampaignToggle: React.FC<PublicCampaignToggleProps> = ({
  campaignId,
  isPublic,
  onToggle
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ is_public: checked })
        .eq('id', campaignId);

      if (error) {
        console.error('Error updating campaign visibility:', error);
        toast({
          title: "Error",
          description: "Failed to update campaign visibility.",
          variant: "destructive"
        });
        return;
      }

      onToggle(checked);
      toast({
        title: "Success",
        description: checked 
          ? "Campaign is now public and visible in the marketplace" 
          : "Campaign is now private",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {isPublic ? (
          <Globe className="h-5 w-5 text-[#1DDCD3]" />
        ) : (
          <Lock className="h-5 w-5 text-gray-500" />
        )}
        <div>
          <h4 className="font-medium text-gray-900">
            {isPublic ? 'Public Campaign' : 'Private Campaign'}
          </h4>
          <p className="text-sm text-gray-600">
            {isPublic 
              ? 'Visible to influencers in the marketplace' 
              : 'Only visible to invited influencers'
            }
          </p>
        </div>
      </div>
      <Switch
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
    </div>
  );
};

export default PublicCampaignToggle;
