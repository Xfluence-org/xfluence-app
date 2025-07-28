// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';

export interface PublishedCampaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  published_at: string;
  total_influencers: number;
  total_reach: number;
  avg_engagement_rate: number;
  completion_rate: number;
}

export const usePublishedCampaigns = (limit?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['published-campaigns', limit],
    enabled: !!user,
    queryFn: async () => {
      // First get the brands associated with the current user
      const { data: userBrands, error: brandsError } = await supabase
        .from('brand_users')
        .select('brand_id')
        .eq('user_id', user?.id);

      if (brandsError) {
        console.error('Error fetching user brands:', brandsError);
        throw brandsError;
      }

      if (!userBrands || userBrands.length === 0) {
        console.log('No brands found for current user');
        return [];
      }

      const brandIds = userBrands.map(ub => ub.brand_id);

      // Get published campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          description,
          budget,
          category,
          status,
          created_at,
          is_public,
          brand_id
        `)
        .eq('status', 'published')
        .in('brand_id', brandIds)
        .order('created_at', { ascending: false })
        .limit(limit || 10);

      if (campaignsError) throw campaignsError;

      console.log('Published campaigns fetched:', campaigns);

      // Get campaign statistics
      const publishedCampaigns = await Promise.all(
        (campaigns || []).map(async (campaign) => {
          // Get participant count
          const { count: participantCount } = await supabase
            .from('campaign_participants')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('status', 'accepted');

          // Get tasks statistics with workflow states
          const { data: tasks } = await supabase
            .from('campaign_tasks')
            .select(`
              id,
              progress,
              status,
              task_workflow_states(
                phase,
                status
              )
            `)
            .eq('campaign_id', campaign.id);

          // Calculate completion rate based on average progress (matching influencer view)
          const totalProgress = tasks?.reduce((sum, task) => sum + (task.progress || 0), 0) || 0;
          const totalTasks = tasks?.length || 0;
          const completionRate = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

          // Mock some additional metrics (in a real app, these would come from analytics)
          const totalReach = (participantCount || 0) * (50000 + Math.floor(Math.random() * 100000));
          const avgEngagementRate = 3.5 + Math.random() * 2.5;

          return {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description || '',
            budget: campaign.budget || 0,
            category: Array.isArray(campaign.category) ? campaign.category[0] : campaign.category || 'General',
            published_at: campaign.created_at,
            total_influencers: participantCount || 0,
            total_reach: totalReach,
            avg_engagement_rate: avgEngagementRate,
            completion_rate: completionRate
          } as PublishedCampaign;
        })
      );

      return publishedCampaigns;
    }
  });
};