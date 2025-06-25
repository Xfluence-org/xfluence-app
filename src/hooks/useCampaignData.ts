
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DetailedCampaign } from '@/types/campaigns';

export const useCampaignData = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      console.log('Fetching campaigns data...');
      
      // Get campaigns with their participants and tasks
      const { data: campaignParticipants, error: participantsError } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          status,
          progress,
          accepted_at,
          completed_at,
          current_stage,
          campaigns (
            id,
            title,
            due_date,
            amount,
            requirements,
            brands (
              name
            )
          )
        `)
        .eq('influencer_id', '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'); // Using test user ID

      if (participantsError) {
        console.error('Error fetching campaign participants:', participantsError);
        throw participantsError;
      }

      console.log('Raw campaign participants data:', campaignParticipants);

      if (!campaignParticipants || campaignParticipants.length === 0) {
        console.log('No campaign participants found');
        return [];
      }

      // Get all tasks for these campaigns
      const campaignIds = campaignParticipants
        .map(p => p.campaigns?.id)
        .filter(Boolean);

      const { data: campaignTasks, error: tasksError } = await supabase
        .from('campaign_tasks')
        .select(`
          id,
          campaign_id,
          task_type,
          title,
          status,
          progress,
          next_deadline,
          deliverable_count
        `)
        .in('campaign_id', campaignIds)
        .eq('influencer_id', '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab');

      if (tasksError) {
        console.error('Error fetching campaign tasks:', tasksError);
        throw tasksError;
      }

      console.log('Campaign tasks:', campaignTasks);

      // Transform data to match DetailedCampaign interface
      const campaigns: DetailedCampaign[] = campaignParticipants.map(participant => {
        const campaign = participant.campaigns;
        const tasks = campaignTasks?.filter(task => task.campaign_id === campaign?.id) || [];
        const requirements = campaign?.requirements as any || {};
        
        // Calculate overall progress based on task progress
        const overallProgress = tasks.length > 0 
          ? Math.round(tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length)
          : participant.progress || 0;

        // Count completed tasks
        const completedTasks = tasks.filter(task => task.status === 'completed').length;

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

        return {
          id: campaign?.id || '',
          title: campaign?.title || 'Untitled Campaign',
          brand: campaign?.brands?.name || 'Unknown Brand',
          status: participant.status as 'invited' | 'active' | 'completed' | 'pending',
          taskCount: tasks.length,
          dueDate: formatDate(campaign?.due_date),
          platforms: requirements.platforms || ['Instagram', 'TikTok'],
          amount: campaign?.amount ? Math.floor(campaign.amount / 100) : 0, // Convert from cents
          overallProgress,
          completedTasks,
          tasks: tasks.map(task => ({
            id: task.id,
            type: task.task_type as 'Posts' | 'Stories' | 'Reels',
            deliverable: `${task.deliverable_count || 1} ${task.task_type}`,
            status: task.status as 'content review' | 'post content' | 'content draft' | 'completed' | 'pending',
            progress: task.progress || 0,
            nextDeadline: task.next_deadline ? formatDate(task.next_deadline) : 'TBD'
          }))
        };
      }).filter(campaign => campaign.id); // Filter out campaigns with no ID

      console.log('Transformed campaigns:', campaigns);
      return campaigns;
    }
  });
};
