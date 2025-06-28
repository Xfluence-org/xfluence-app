
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import InvitationCard from '@/components/dashboard/InvitationCard';
import CampaignCard from '@/components/dashboard/CampaignCard';
import MetricCard from '@/components/dashboard/MetricCard';
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-destructive">Error: {error}</div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Active Campaigns',
      value: activeCampaigns.length.toString(),
      subtitle: `${invitations.length} pending invitations`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Total Earnings',
      value: '$2,450',
      subtitle: 'This month',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'Engagement Rate',
      value: '8.5%',
      subtitle: 'Average across campaigns',
      icon: <TrendingUp className="h-5 w-5" />,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Completed Campaigns',
      value: '24',
      subtitle: 'All time',
      icon: <Award className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <ModernSidebar userName={profile?.name || 'Influencer'} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {profile?.name || 'Influencer'}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your campaigns today.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                subtitle={metric.subtitle}
                icon={metric.icon}
                trend={metric.trend}
              />
            ))}
          </div>

          {/* Campaign Invitations */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Campaign Invitations</h2>
              {invitations.length > 0 && (
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {invitations.length} new
                </span>
              )}
            </div>
            
            {invitations.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground">No new campaign invitations at the moment.</p>
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
              <h2 className="text-2xl font-bold text-foreground">Active Campaigns</h2>
              {activeCampaigns.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {activeCampaigns.length} active
                </span>
              )}
            </div>
            
            {activeCampaigns.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground">No active campaigns. Accept an invitation to get started!</p>
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
