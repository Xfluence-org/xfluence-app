
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
          category,
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
        spent: 0, // This would come from actual spending data
        applicants: 0, // This would be calculated from campaign_participants
        accepted: 0, // This would be calculated from campaign_participants
        due_date: campaign.due_date,
        platforms: ['Instagram', 'TikTok'], // Default platforms
        category: Array.isArray(campaign.category) && campaign.category.length > 0 
          ? campaign.category[0] 
          : 'General', // Handle array category properly
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
