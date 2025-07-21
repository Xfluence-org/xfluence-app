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

  // For invitations/applications
  const { data: invitations = [], isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['dashboard-invitations'],
    queryFn: async () => {
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
        .eq('influencer_id', (await supabase.auth.getUser()).data.user?.id)
        .in('status', ['applied', 'pending']);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.campaign_id,
        title: item.campaigns.title,
        brand: item.campaigns.brands.name,
        amount: item.campaigns.amount,
        appliedAt: item.created_at
      }));
    }
  });

  // For active campaigns - temporarily disabled
  const { data: activeCampaigns = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ['dashboard-active-campaigns'],
    queryFn: async () => {
      console.log('Active campaigns temporarily disabled for marketplace hiding');
      return [];
    }
  });

  // Placeholder functions for missing functionality
  const acceptInvitation = async (campaignId: string) => {
    console.log('acceptInvitation temporarily disabled');
    return { success: true, message: 'Function temporarily disabled' };
  };

  const declineInvitation = async (campaignId: string) => {
    console.log('declineInvitation temporarily disabled');
    return { success: true, message: 'Function temporarily disabled' };
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