// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CampaignTab } from '@/types/campaigns';

export const useCampaignData = (tabFilter: CampaignTab) => {
  return useQuery({
    queryKey: ['campaigns', tabFilter],
    queryFn: async () => {
      const statusMap = {
        'Active': 'active',
        'Completed': 'completed', 
        'Requests': 'requests'
      };

      const { data, error } = await supabase.rpc('get_influencer_campaigns', {
        status_filter: statusMap[tabFilter] || 'active'
      });

      if (error) {
        console.error('Error fetching campaign data:', error);
        throw error;
      }

      // Transform RPC response to match DetailedCampaign interface
      const transformedData = (data || []).map((campaign: any) => ({
        id: campaign.campaign_id,
        title: campaign.campaign_title,
        brand: campaign.brand_name,
        status: campaign.campaign_status,
        progress: campaign.overall_progress,
        dueDate: campaign.due_date,
        tasks: campaign.tasks,
        platforms: campaign.platforms,
        amount: campaign.amount,
        taskCount: campaign.task_count,
        overallProgress: campaign.overall_progress,
        completedTasks: campaign.completed_tasks
      }));

      return transformedData;
    },
    enabled: true
  });
};