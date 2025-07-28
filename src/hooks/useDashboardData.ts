
// @ts-nocheck

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardData = () => {
  // For waiting for requirements campaigns
  const { data: waitingCampaigns = [], isLoading: isLoadingWaiting } = useQuery({
    queryKey: ['dashboard-waiting'],
    queryFn: async () => {
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
        .eq('influencer_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'accepted')
        .eq('current_stage', 'waiting_for_requirements');

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.campaign_id,
        title: item.campaigns.title,
        brand: item.campaigns.brands.name,
        amount: item.campaigns.amount,
        waitingSince: item.accepted_at
      }));
    }
  });

  // For invitations - now includes both traditional applications and claimed invitations
  const { data: invitations = [], isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['dashboard-invitations'],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      const { data, error } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          campaign_id,
          created_at,
          status,
          invitation_claimed_at,
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
        .in('status', ['applied', 'pending', 'invited', 'accepted']);

      if (error) throw error;

      // Separate invitations from applications
      const applicationStatuses = ['applied', 'pending'];
      const invitationStatuses = ['invited', 'accepted'];

      return (data || [])
        .filter((item: any) => {
          // Show applications that are still pending
          if (applicationStatuses.includes(item.status)) {
            return true;
          }
          // Show invitations that were recently claimed (within last 30 days) and not in waiting_for_requirements
          if (invitationStatuses.includes(item.status) && item.invitation_claimed_at) {
            const claimedDate = new Date(item.invitation_claimed_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return claimedDate > thirtyDaysAgo;
          }
          return false;
        })
        .map((item: any) => ({
          id: item.campaign_id,
          title: item.campaigns.title,
          brand: item.campaigns.brands.name,
          amount: item.campaigns.amount,
          appliedAt: item.created_at,
          status: item.status,
          isInvitation: item.invitation_claimed_at !== null
        }));
    }
  });

  // For active campaigns - using get_influencer_campaigns function for better data
  const { data: activeCampaigns = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ['dashboard-active-campaigns'],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      // First try to get campaigns using the existing function
      const { data, error } = await supabase.rpc('get_influencer_campaigns', {
        status_filter: 'active'
      });

      if (error) {
        console.error('Error fetching active campaigns:', error);
        // Fallback to direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('campaign_participants')
          .select(`
            id,
            campaign_id,
            current_stage,
            accepted_at,
            campaigns!inner(
              id,
              title,
              amount,
              due_date,
              brands!inner(
                name
              )
            )
          `)
          .eq('influencer_id', user.id)
          .eq('status', 'accepted');

        if (fallbackError) throw fallbackError;

        return (fallbackData || []).map((item: any) => ({
          campaign_id: item.campaign_id,
          campaign_title: item.campaigns.title,
          brand_name: item.campaigns.brands.name,
          amount: item.campaigns.amount,
          due_date: item.campaigns.due_date,
          current_stage: item.current_stage,
          accepted_at: item.accepted_at,
          overall_progress: 0,
          task_count: 0,
          completed_tasks: 0,
          tasks: []
        }));
      }

      return data || [];
    }
  });

  // Real implementation for accepting invitations
  const acceptInvitation = async (campaignId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('campaign_participants')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          current_stage: 'waiting_for_requirements'
        })
        .eq('campaign_id', campaignId)
        .eq('influencer_id', user.id)
        .in('status', ['invited', 'applied', 'pending']);

      if (error) throw error;

      return { success: true, message: 'Invitation accepted successfully' };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { success: false, message: 'Failed to accept invitation' };
    }
  };

  const declineInvitation = async (campaignId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('campaign_participants')
        .update({
          status: 'rejected'
        })
        .eq('campaign_id', campaignId)
        .eq('influencer_id', user.id)
        .in('status', ['invited', 'applied', 'pending']);

      if (error) throw error;

      return { success: true, message: 'Invitation declined successfully' };
    } catch (error) {
      console.error('Error declining invitation:', error);
      return { success: false, message: 'Failed to decline invitation' };
    }
  };

  return {
    waitingCampaigns,
    invitations,
    activeCampaigns,
    pendingApplications: [], // Added for compatibility
    loading: isLoadingWaiting || isLoadingInvitations || isLoadingActive, // Added for compatibility
    isLoading: isLoadingWaiting || isLoadingInvitations || isLoadingActive,
    acceptInvitation,
    declineInvitation
  };
};
