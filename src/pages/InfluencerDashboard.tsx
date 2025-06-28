
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/dashboard/Sidebar';
import InvitationCard from '@/components/dashboard/InvitationCard';
import CampaignCard from '@/components/dashboard/CampaignCard';

const InfluencerDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    invitations, 
    activeCampaigns, 
    loading, 
    error, 
    acceptInvitation, 
    declineInvitation 
  } = useDashboardData();

  const handleCampaignClick = (campaignId: string) => {
    // Navigate to campaigns page with active tab
    navigate('/campaigns?tab=Active');
  };

  const handleAcceptInvitation = async (campaignId: string) => {
    const result = await acceptInvitation(campaignId);
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['dashboard-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-active-campaigns'] });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleDeclineInvitation = async (campaignId: string) => {
    const result = await declineInvitation(campaignId);
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['dashboard-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-active-campaigns'] });
    } else {
      toast({
        title: "Error", 
        description: result.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">
              Welcome back, {profile?.name || 'Influencer'}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your campaigns today.
            </p>
          </div>

          {/* Campaign Invitations */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a1f2e]">Campaign Invitations</h2>
              {invitations.length > 0 && (
                <span className="px-3 py-1 bg-[#1DDCD3] text-white rounded-full text-sm font-medium">
                  {invitations.length} new
                </span>
              )}
            </div>
            
            {invitations.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No new campaign invitations at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.map((campaign) => (
                  <InvitationCard
                    key={campaign.id}
                    campaign={campaign}
                    onAccept={handleAcceptInvitation}
                    onDecline={handleDeclineInvitation}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Active Campaigns */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a1f2e]">Active Campaigns</h2>
              {activeCampaigns.length > 0 && (
                <span className="text-sm text-gray-600">
                  {activeCampaigns.length} active
                </span>
              )}
            </div>
            
            {activeCampaigns.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No active campaigns. Accept an invitation to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onClick={handleCampaignClick}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default InfluencerDashboard;
