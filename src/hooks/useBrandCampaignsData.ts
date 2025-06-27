
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CampaignView = 'active' | 'completed' | 'archived';

export const useBrandCampaignsData = (view: CampaignView) => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: loading, error } = useQuery({
    queryKey: ['brand-campaigns-management', view],
    queryFn: async () => {
      console.log('Fetching brand campaigns for view:', view);
      
      const { data, error } = await supabase.rpc('get_brand_campaigns', {
        brand_filter: view
      });

      if (error) {
        console.error('Error fetching brand campaigns:', error);
        throw error;
      }

      console.log('Fetched brand campaigns:', data);
      return data || [];
    }
  });

  const archiveCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      console.log('Archiving campaign:', campaignId);
      
      // Update campaign status to archived
      const { error: campaignError } = await supabase
        .from('campaigns')
        .update({ 
          status: 'archived',
          is_public: false 
        })
        .eq('id', campaignId);

      if (campaignError) throw campaignError;

      // Auto-reject pending applications
      const { error: applicationsError } = await supabase
        .from('campaign_participants')
        .update({ status: 'rejected' })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending');

      if (applicationsError) throw applicationsError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns-management'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, updates }: { campaignId: string; updates: any }) => {
      console.log('Updating campaign:', campaignId, updates);
      
      const { error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns-management'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
    }
  });

  return {
    campaigns,
    loading,
    error: error?.message || null,
    archiveCampaign: archiveCampaignMutation.mutate,
    updateCampaign: (campaignId: string, updates: any) => 
      updateCampaignMutation.mutate({ campaignId, updates })
  };
};
