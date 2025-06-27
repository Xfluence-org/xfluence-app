
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
    navigate('/campaigns?tab=Active');
  };

  const handleAcceptInvitation = async (campaignId: string) => {
    const result = await acceptInvitation(campaignId);
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-white">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="glass-card p-8 text-center">
          <div className="text-lg text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-900 flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto fade-in">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">
              Welcome back, <span className="text-gradient">{profile?.name || 'Influencer'}</span>!
            </h1>
            <p className="text-lg text-muted-foreground">
              Here's what's happening with your campaigns today.
            </p>
          </div>

          {/* Campaign Invitations */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Campaign Invitations</h2>
              {invitations.length > 0 && (
                <span className="status-active">
                  {invitations.length} new
                </span>
              )}
            </div>
            
            {invitations.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">📬</div>
                <p className="text-lg text-muted-foreground">No new campaign invitations at the moment.</p>
                <p className="text-sm text-muted-foreground mt-2">New opportunities will appear here when available.</p>
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Active Campaigns</h2>
              {activeCampaigns.length > 0 && (
                <span className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                  {activeCampaigns.length} active
                </span>
              )}
            </div>
            
            {activeCampaigns.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-lg text-muted-foreground">No active campaigns. Accept an invitation to get started!</p>
                <p className="text-sm text-muted-foreground mt-2">Your active campaigns will be displayed here.</p>
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
