
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [invitations, setInvitations] = useState<Campaign[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('No user found, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard data for user:', user.id);

      // Fetch campaign participations with campaign and brand data
      const { data: participations, error: participationsError } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          status,
          progress,
          current_stage,
          campaigns (
            id,
            title,
            amount,
            due_date,
            requirements,
            brands (
              name
            )
          )
        `)
        .eq('influencer_id', user.id);

      if (participationsError) {
        console.error('Error fetching participations:', participationsError);
        throw participationsError;
      }

      console.log('Raw participations data:', participations);

      // Transform data to match component expectations
      const transformedData = participations?.map(participation => {
        console.log('Processing participation:', participation);
        return {
          id: participation.campaigns.id,
          brand: participation.campaigns.brands.name,
          title: participation.campaigns.title,
          amount: Math.floor(participation.campaigns.amount / 100), // Convert cents to dollars
          dueDate: new Date(participation.campaigns.due_date).toLocaleDateString('en-GB'),
          requirements: participation.campaigns.requirements as {
            posts?: number;
            stories?: number;
            reels?: number;
          },
          progress: participation.progress,
          status: participation.status as 'invited' | 'accepted' | 'active' | 'completed' | 'declined',
          currentStage: participation.current_stage
        };
      }) || [];

      console.log('Transformed data:', transformedData);

      // Split into invitations and active campaigns
      const invitationsData = transformedData.filter(campaign => 
        campaign.status === 'invited'
      );
      
      const activeCampaignsData = transformedData.filter(campaign => 
        campaign.status === 'accepted' || campaign.status === 'active'
      );

      console.log('Invitations:', invitationsData);
      console.log('Active campaigns:', activeCampaignsData);

      setInvitations(invitationsData);
      setActiveCampaigns(activeCampaignsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const acceptInvitation = async (campaignId: string) => {
    if (!user) return { success: false, message: 'User not authenticated' };

    try {
      console.log('Accepting invitation for campaign:', campaignId);
      const { error } = await supabase
        .from('campaign_participants')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)
        .eq('influencer_id', user.id);

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();
      return { success: true, message: 'Invitation accepted successfully!' };
    } catch (err) {
      console.error('Error accepting invitation:', err);
      return { success: false, message: 'Failed to accept invitation' };
    }
  };

  const declineInvitation = async (campaignId: string) => {
    if (!user) return { success: false, message: 'User not authenticated' };

    try {
      console.log('Declining invitation for campaign:', campaignId);
      const { error } = await supabase
        .from('campaign_participants')
        .update({ status: 'declined' })
        .eq('campaign_id', campaignId)
        .eq('influencer_id', user.id);

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();
      return { success: true, message: 'Invitation declined' };
    } catch (err) {
      console.error('Error declining invitation:', err);
      return { success: false, message: 'Failed to decline invitation' };
    }
  };

  return {
    invitations,
    activeCampaigns,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    refetch: fetchDashboardData
  };
};
