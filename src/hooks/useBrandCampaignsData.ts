
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CampaignView = 'published' | 'completed' | 'archived';

export const useBrandCampaignsData = (view: CampaignView) => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: loading, error } = useQuery({
    queryKey: ['brand-campaigns-management', view],
    queryFn: async () => {
      console.log('Fetching brand campaigns for view:', view);
      
      // Map view to database filter
      let brandFilter: string;
      switch (view) {
        case 'published':
          brandFilter = 'active'; // 'active' filter includes published
          break;
        case 'completed':
          brandFilter = 'completed';
          break;
        case 'archived':
          brandFilter = 'archived';
          break;
        default:
          brandFilter = 'active';
      }

      // Use the RPC function to get campaigns with proper progress calculation
      const { data, error } = await supabase.rpc('get_brand_campaigns', {
        brand_filter: brandFilter
      });

      if (error) {
        console.error('Error fetching brand campaigns:', error);
        throw error;
      }

      console.log('Fetched brand campaigns from RPC:', data);
      
      // Filter by specific status if needed (since 'active' filter returns multiple statuses)
      let filteredData = data || [];
      if (view === 'published' && brandFilter === 'active') {
        filteredData = filteredData.filter((c: any) => c.campaign_status === 'published');
      }
      
      // Data from RPC already has the correct structure
      return filteredData;
    }
  });

  const archiveCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      console.log('Archiving campaign:', campaignId);
      
      // Update campaign status to archived and set is_public to false
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
      
      // Convert category string back to array format for database
      const processedUpdates = {
        ...updates,
        category: updates.category ? [updates.category] : ['General']
      };
      
      const { error } = await supabase
        .from('campaigns')
        .update(processedUpdates)
        .eq('id', campaignId);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns-management'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-detail'] });
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
