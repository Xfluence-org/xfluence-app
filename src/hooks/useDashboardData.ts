
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: string;
  brand: string;
  title: string;
  amount: number;
  dueDate: string;
  requirements: {
    posts?: number;
    stories?: number;
    reels?: number;
  };
  progress?: number;
  status: 'invited' | 'accepted' | 'active' | 'completed' | 'declined';
  currentStage?: string;
}

export const useDashboardData = () => {
  // Fetch campaigns waiting for requirements
  const { data: waitingCampaigns = [], isLoading: waitingLoading, error: waitingError } = useQuery({
    queryKey: ['dashboard-waiting-campaigns'],
    queryFn: async () => {
      console.log('Fetching campaigns waiting for requirements');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          campaign_id,
          accepted_at,
          current_stage,
          campaigns!inner(
            id,
            title,
            due_date,
            amount,
            brands!inner(
              name
            )
          )
        `)
        .eq('influencer_id', user.id)
        .eq('status', 'accepted')
        .eq('current_stage', 'waiting_for_requirements');

      if (error) {
        console.error('Error fetching waiting campaigns:', error);
        throw error;
      }

      return data?.map((participant: any) => ({
        id: participant.campaign_id,
        campaignTitle: participant.campaigns.title,
        brandName: participant.campaigns.brands.name,
        acceptedDate: participant.accepted_at,
        amount: participant.campaigns.amount ? Math.floor(participant.campaigns.amount / 100) : 0,
        dueDate: participant.campaigns.due_date
      })) || [];
    }
  });

  // Fetch invitations (requests tab)
  const { data: invitationsData = [], isLoading: invitationsLoading, error: invitationsError } = useQuery({
    queryKey: ['dashboard-invitations'],
    queryFn: async () => {
      console.log('Fetching invitations for dashboard');
      
      const { data: campaignData, error } = await supabase.rpc('get_influencer_campaigns', {
        tab_filter: 'requests'
      });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }

      console.log('Raw invitations data:', campaignData);

      if (!campaignData || campaignData.length === 0) {
        return [];
      }

      // Only show actual invitations (status = 'invited'), not applications (status = 'applied' or 'pending')
      const actualInvitations = campaignData.filter((row: any) => 
        row.campaign_status === 'invited'
      );

      // Transform data to match dashboard component expectations
      return actualInvitations.map((row: any) => ({
        id: row.campaign_id,
        brand: row.brand_name,
        title: row.campaign_title,
        amount: row.amount ? Math.floor(row.amount / 100) : 0, // Convert from cents
        dueDate: row.due_date ? new Date(row.due_date).toLocaleDateString('en-GB') : 'TBD',
        requirements: {
          posts: 1, // Default values since we don't have this data in the function
          stories: 1,
          reels: 1
        },
        progress: row.overall_progress || 0,
        status: 'invited' as const,
        currentStage: 'content_requirement'
      }));
    }
  });

  // Fetch pending applications
  const { data: pendingApplications = [], isLoading: pendingLoading, error: pendingError } = useQuery({
    queryKey: ['dashboard-pending-applications'],
    queryFn: async () => {
      console.log('Fetching pending applications');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          campaign_id,
          created_at,
          campaigns!inner(
            id,
            title,
            amount,
            brands!inner(
              name
            )
          )
        `)
        .eq('influencer_id', user.id)
        .in('status', ['applied', 'pending']);

      if (error) {
        console.error('Error fetching pending applications:', error);
        throw error;
      }

      return data?.map((participant: any) => ({
        id: participant.campaign_id,
        title: participant.campaigns.title,
        brand: participant.campaigns.brands.name,
        amount: participant.campaigns.amount ? Math.floor(participant.campaigns.amount / 100) : 0,
        appliedDate: participant.created_at
      })) || [];
    }
  });

  // Fetch active campaigns (active tab)
  const { data: activeCampaignsData = [], isLoading: activeCampaignsLoading, error: activeCampaignsError } = useQuery({
    queryKey: ['dashboard-active-campaigns'],
    queryFn: async () => {
      console.log('Fetching active campaigns for dashboard');
      
      const { data: campaignData, error } = await supabase.rpc('get_influencer_campaigns', {
        tab_filter: 'active'
      });

      if (error) {
        console.error('Error fetching active campaigns:', error);
        throw error;
      }

      console.log('Raw active campaigns data:', campaignData);

      if (!campaignData || campaignData.length === 0) {
        return [];
      }

      // Get current user to check participant stage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Check participant stages for each campaign
      const campaignIds = campaignData.map((c: any) => c.campaign_id);
      const { data: participants } = await supabase
        .from('campaign_participants')
        .select('campaign_id, current_stage')
        .eq('influencer_id', user.id)
        .in('campaign_id', campaignIds);

      const participantStageMap = new Map(
        participants?.map(p => [p.campaign_id, p.current_stage]) || []
      );

      // Transform data to match dashboard component expectations
      return campaignData.map((row: any) => {
        // Check if participant is waiting for requirements
        const currentStage = participantStageMap.get(row.campaign_id);
        const isWaitingForRequirements = currentStage === 'waiting_for_requirements';

        // Parse tasks from JSONB - but empty array if waiting for requirements
        const tasks = isWaitingForRequirements ? [] : 
          (Array.isArray(row.tasks) ? row.tasks.map((task: any) => ({
            id: task.id,
            title: `${task.type} for ${row.campaign_title}`,
            type: task.type,
            status: task.status,
            progress: task.progress || 0,
            dueDate: task.nextDeadline || row.due_date,
            phase: task.phase || 'content_requirement',
            has_content_requirements: task.has_content_requirements || false
          })) : []);

        return {
          id: row.campaign_id,
          campaign_id: row.campaign_id,
          campaign_title: row.campaign_title,
          brand_name: row.brand_name,
          campaign_status: row.campaign_status,
          platforms: row.platforms || ['Instagram', 'TikTok'],
          amount: row.amount ? Math.floor(row.amount / 100) : 0,
          due_date: row.due_date,
          overall_progress: isWaitingForRequirements ? 0 : (row.overall_progress || 0),
          task_count: isWaitingForRequirements ? 0 : Number(row.task_count),
          completed_tasks: isWaitingForRequirements ? 0 : Number(row.completed_tasks),
          tasks,
          isWaitingForRequirements
        };
      });
    }
  });

  const loading = invitationsLoading || activeCampaignsLoading || waitingLoading || pendingLoading;
  const error = invitationsError?.message || activeCampaignsError?.message || waitingError?.message || pendingError?.message || null;

  const acceptInvitation = async (campaignId: string) => {
    try {
      console.log('Accepting invitation for campaign:', campaignId);
      
      const { error } = await supabase
        .from('campaign_participants')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          current_stage: 'waiting_for_requirements'
        })
        .eq('campaign_id', campaignId)
        .eq('influencer_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error accepting invitation:', error);
        throw error;
      }

      return { success: true, message: 'Invitation accepted successfully!' };
    } catch (err) {
      console.error('Error accepting invitation:', err);
      return { success: false, message: 'Failed to accept invitation' };
    }
  };

  const declineInvitation = async (campaignId: string) => {
    try {
      console.log('Declining invitation for campaign:', campaignId);
      
      const { error } = await supabase
        .from('campaign_participants')
        .update({ status: 'declined' })
        .eq('campaign_id', campaignId)
        .eq('influencer_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error declining invitation:', error);
        throw error;
      }

      return { success: true, message: 'Invitation declined' };
    } catch (err) {
      console.error('Error declining invitation:', err);
      return { success: false, message: 'Failed to decline invitation' };
    }
  };

  const refetch = () => {
    // Note: With React Query, we don't need manual refetch as the queries will invalidate automatically
    console.log('Refetch called - queries will update automatically');
  };

  return {
    invitations: invitationsData,
    activeCampaigns: activeCampaignsData,
    waitingCampaigns,
    pendingApplications,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    refetch
  };
};
