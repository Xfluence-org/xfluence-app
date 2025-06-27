
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CampaignView = 'active' | 'published' | 'completed' | 'archived';

export const useBrandCampaignsData = (view: CampaignView) => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: loading, error } = useQuery({
    queryKey: ['brand-campaigns-management', view],
    queryFn: async () => {
      console.log('Fetching brand campaigns for view:', view);
      
      // Map view to database status
      let statusFilter: string;
      switch (view) {
        case 'active':
          statusFilter = 'active';
          break;
        case 'published':
          statusFilter = 'published';
          break;
        case 'completed':
          statusFilter = 'completed';
          break;
        case 'archived':
          statusFilter = 'archived';
          break;
        default:
          statusFilter = 'active';
      }

      // First get the brands associated with the current user
      const { data: userBrands, error: brandsError } = await supabase
        .from('brand_users')
        .select('brand_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (brandsError) {
        console.error('Error fetching user brands:', brandsError);
        throw brandsError;
      }

      if (!userBrands || userBrands.length === 0) {
        console.log('No brands found for current user');
        return [];
      }

      const brandIds = userBrands.map(ub => ub.brand_id);

      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          status,
          budget,
          amount,
          due_date,
          categories,
          created_at,
          is_public,
          brand_id,
          brands (
            name
          )
        `)
        .eq('status', statusFilter)
        .in('brand_id', brandIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching brand campaigns:', error);
        throw error;
      }

      console.log('Fetched brand campaigns:', data);
      
      // Transform data to match expected interface
      return (data || []).map(campaign => ({
        campaign_id: campaign.id,
        campaign_title: campaign.title,
        campaign_status: campaign.status,
        budget: campaign.budget || campaign.amount || 0,
        spent: 0,
        applicants: 0,
        accepted: 0,
        due_date: campaign.due_date,
        platforms: ['Instagram', 'TikTok'],
        category: Array.isArray(campaign.categories) ? campaign.categories.join(', ') : 'General',
        progress: campaign.status === 'completed' ? 100 : 
                 campaign.status === 'active' ? 75 : 
                 campaign.status === 'published' ? 50 : 25
      }));
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
