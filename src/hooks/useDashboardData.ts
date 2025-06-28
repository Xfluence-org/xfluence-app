
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Invitation {
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
  status: 'invited' | 'pending' | 'rejected' | 'approved';
  currentStage?: string;
}

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

      // Transform data to match invitation component expectations
      return campaignData.map((row: any): Invitation => ({
        id: row.campaign_id,
        brand: row.brand_name,
        title: row.campaign_title,
        amount: row.amount ? Math.floor(row.amount / 100) : 0,
        dueDate: row.due_date ? new Date(row.due_date).toLocaleDateString('en-GB') : 'TBD',
        requirements: {
          posts: 1,
          stories: 1,
          reels: 1
        },
        progress: row.overall_progress || 0,
        status: row.campaign_status as 'invited' | 'pending' | 'rejected' | 'approved',
        currentStage: 'content_requirement'
      }));
    }
  });

  // Fetch active campaigns (active tab) - only approved/accepted campaigns
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

      // Transform data to match campaign component expectations
      return campaignData.map((row: any): Campaign => ({
        id: row.campaign_id,
        brand: row.brand_name,
        title: row.campaign_title,
        amount: row.amount ? Math.floor(row.amount / 100) : 0,
        dueDate: row.due_date ? new Date(row.due_date).toLocaleDateString('en-GB') : 'TBD',
        requirements: {
          posts: 1,
          stories: 1,
          reels: 1
        },
        progress: row.overall_progress || 0,
        status: 'active' as const,
        currentStage: 'content_requirement'
      }));
    }
  });

  const loading = invitationsLoading || activeCampaignsLoading;
  const error = invitationsError?.message || activeCampaignsError?.message || null;

  const acceptInvitation = async (campaignId: string) => {
    try {
      console.log('Accepting invitation for campaign:', campaignId);
      
      const { error } = await supabase
        .from('campaign_participants')
        .update({ 
          status: 'approved',
          accepted_at: new Date().toISOString()
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
        .update({ status: 'rejected' })
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
    console.log('Refetch called - queries will update automatically');
  };

  return {
    invitations: invitationsData,
    activeCampaigns: activeCampaignsData,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    refetch
  };
};
