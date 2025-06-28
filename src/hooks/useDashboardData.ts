
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

const validateCampaignData = (data: any): boolean => {
  if (!data || typeof data !== 'object') {
    console.error('Invalid campaign data - not an object:', data);
    return false;
  }
  
  if (!data.campaign_id || !data.brand_name || !data.campaign_title) {
    console.error('Missing required campaign fields:', data);
    return false;
  }
  
  return true;
};

export const useDashboardData = () => {
  // Fetch invitations (requests tab)
  const { data: invitationsData = [], isLoading: invitationsLoading, error: invitationsError } = useQuery({
    queryKey: ['dashboard-invitations'],
    queryFn: async () => {
      console.log('Fetching invitations for dashboard');
      
      try {
        const { data: campaignData, error } = await supabase.rpc('get_influencer_campaigns', {
          tab_filter: 'requests'
        });

        if (error) {
          console.error('Error fetching invitations:', error);
          throw error;
        }

        console.log('Raw invitations data:', campaignData);

        if (!Array.isArray(campaignData)) {
          console.error('Invalid invitations data - not an array:', campaignData);
          return [];
        }

        // Filter and validate data
        const validData = campaignData.filter(validateCampaignData);
        console.log('Valid invitations after filtering:', validData.length, 'out of', campaignData.length);

        // Transform data to match invitation component expectations
        return validData.map((row: any): Invitation => {
          try {
            return {
              id: String(row.campaign_id || ''),
              brand: String(row.brand_name || 'Unknown Brand'),
              title: String(row.campaign_title || 'Untitled Campaign'),
              amount: row.amount ? Math.floor(Number(row.amount) / 100) : 0,
              dueDate: row.due_date ? new Date(row.due_date).toLocaleDateString('en-GB') : 'TBD',
              requirements: {
                posts: 1,
                stories: 1,
                reels: 1
              },
              progress: Number(row.overall_progress || 0),
              status: (row.campaign_status as 'invited' | 'pending' | 'rejected' | 'approved') || 'pending',
              currentStage: 'content_requirement'
            };
          } catch (error) {
            console.error('Error transforming invitation data:', error, row);
            return null;
          }
        }).filter(Boolean);
      } catch (error) {
        console.error('Error in invitations query:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  // Fetch active campaigns (active tab) - only approved/accepted campaigns
  const { data: activeCampaignsData = [], isLoading: activeCampaignsLoading, error: activeCampaignsError } = useQuery({
    queryKey: ['dashboard-active-campaigns'],
    queryFn: async () => {
      console.log('Fetching active campaigns for dashboard');
      
      try {
        const { data: campaignData, error } = await supabase.rpc('get_influencer_campaigns', {
          tab_filter: 'active'
        });

        if (error) {
          console.error('Error fetching active campaigns:', error);
          throw error;
        }

        console.log('Raw active campaigns data:', campaignData);

        if (!Array.isArray(campaignData)) {
          console.error('Invalid active campaigns data - not an array:', campaignData);
          return [];
        }

        // Filter and validate data
        const validData = campaignData.filter(validateCampaignData);
        console.log('Valid active campaigns after filtering:', validData.length, 'out of', campaignData.length);

        // Transform data to match campaign component expectations
        return validData.map((row: any): Campaign => {
          try {
            return {
              id: String(row.campaign_id || ''),
              brand: String(row.brand_name || 'Unknown Brand'),
              title: String(row.campaign_title || 'Untitled Campaign'),
              amount: row.amount ? Math.floor(Number(row.amount) / 100) : 0,
              dueDate: row.due_date ? new Date(row.due_date).toLocaleDateString('en-GB') : 'TBD',
              requirements: {
                posts: 1,
                stories: 1,
                reels: 1
              },
              progress: Number(row.overall_progress || 0),
              status: 'active' as const,
              currentStage: 'content_requirement'
            };
          } catch (error) {
            console.error('Error transforming campaign data:', error, row);
            return null;
          }
        }).filter(Boolean);
      } catch (error) {
        console.error('Error in active campaigns query:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  const loading = invitationsLoading || activeCampaignsLoading;
  const error = invitationsError?.message || activeCampaignsError?.message || null;

  const acceptInvitation = async (campaignId: string) => {
    try {
      console.log('Accepting invitation for campaign:', campaignId);
      
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('campaign_participants')
        .update({ 
          status: 'approved',
          accepted_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)
        .eq('influencer_id', userData.user.id);

      if (error) {
        console.error('Error accepting invitation:', error);
        throw error;
      }

      console.log('Invitation accepted successfully');
      return { success: true, message: 'Invitation accepted successfully!' };
    } catch (err) {
      console.error('Error accepting invitation:', err);
      return { success: false, message: 'Failed to accept invitation' };
    }
  };

  const declineInvitation = async (campaignId: string) => {
    try {
      console.log('Declining invitation for campaign:', campaignId);
      
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('campaign_participants')
        .update({ status: 'rejected' })
        .eq('campaign_id', campaignId)
        .eq('influencer_id', userData.user.id);

      if (error) {
        console.error('Error declining invitation:', error);
        throw error;
      }

      console.log('Invitation declined successfully');
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
    invitations: Array.isArray(invitationsData) ? invitationsData : [],
    activeCampaigns: Array.isArray(activeCampaignsData) ? activeCampaignsData : [],
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    refetch
  };
};
