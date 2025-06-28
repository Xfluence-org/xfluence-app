
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DetailedCampaign, CampaignTab } from '@/types/campaigns';

export const useCampaignData = (tabFilter?: CampaignTab) => {
  return useQuery({
    queryKey: ['campaigns', tabFilter],
    queryFn: async () => {
      console.log('Fetching campaigns data with tab filter:', tabFilter);
      
      // Convert CampaignTab to database function parameter
      const dbTabFilter = tabFilter ? tabFilter.toLowerCase() : 'active';
      
      // Call the database function to get filtered campaigns
      const { data: campaignData, error } = await supabase.rpc('get_influencer_campaigns', {
        tab_filter: dbTabFilter
      });

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }

      console.log('Raw campaign data from function:', campaignData);

      if (!campaignData || campaignData.length === 0) {
        console.log('No campaigns found for tab:', tabFilter);
        return [];
      }

      // Transform data to match DetailedCampaign interface
      const campaigns: DetailedCampaign[] = campaignData.map((row: any) => {
        // Format due date
        const formatDate = (dateStr: string) => {
          if (!dateStr) return 'TBD';
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
        };

        // Map database status to display status
        const getDisplayStatus = (dbStatus: string): 'invited' | 'active' | 'completed' | 'pending' | 'rejected' | 'approved' => {
          switch (dbStatus) {
            case 'invited':
              return 'invited';
            case 'applied':
            case 'pending':
              return 'pending';
            case 'approved':
            case 'accepted':
            case 'active':
              return 'active';
            case 'rejected':
              return 'rejected';
            case 'completed':
              return 'completed';
            default:
              return 'pending';
          }
        };

        // Parse tasks from JSONB
        const tasks = Array.isArray(row.tasks) ? row.tasks.map((task: any) => ({
          id: task.id,
          type: task.type as 'Posts' | 'Stories' | 'Reels',
          deliverable: task.deliverable,
          status: task.status as 'content review' | 'post content' | 'content draft' | 'completed' | 'pending',
          progress: task.progress || 0,
          nextDeadline: task.nextDeadline ? formatDate(task.nextDeadline) : 'TBD',
          feedback: task.feedback || undefined
        })) : [];

        return {
          id: row.campaign_id,
          title: row.campaign_title,
          brand: row.brand_name,
          status: getDisplayStatus(row.campaign_status),
          taskCount: Number(row.task_count),
          dueDate: formatDate(row.due_date),
          platforms: row.platforms || ['Instagram', 'TikTok'],
          amount: row.amount ? Math.floor(row.amount / 100) : 0,
          overallProgress: row.overall_progress || 0,
          completedTasks: Number(row.completed_tasks),
          tasks,
          originalStatus: row.campaign_status
        };
      });

      console.log('Transformed campaigns:', campaigns);
      return campaigns;
    }
  });
};
