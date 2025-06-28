
import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import CampaignCard from '@/components/dashboard/CampaignCard';
import InvitationCard from '@/components/dashboard/InvitationCard';
import ProgressBar from '@/components/dashboard/ProgressBar';
import { useToast } from '@/components/ui/use-toast';

const InfluencerDashboard = () => {
  const { user, profile, loading } = useAuth();
  const { 
    invitations, 
    activeCampaigns, 
    loading: dashboardLoading, 
    acceptInvitation, 
    declineInvitation 
  } = useDashboardData();
  const { toast } = useToast();

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1DDCD3]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.user_type !== 'Influencer') {
    return <Navigate to="/brand-dashboard" replace />;
  }

  const handleAcceptInvitation = async (campaignId: string) => {
    const result = await acceptInvitation(campaignId);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  const handleDeclineInvitation = async (campaignId: string) => {
    const result = await declineInvitation(campaignId);
    toast({
      title: result.success ? "Success" : "Error", 
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userName={profile?.name} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">
              Welcome back, {profile?.name || 'Influencer'}! 👋
            </h1>
            <p className="text-gray-600">Here's what's happening with your campaigns today.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-[#1DDCD3]/10 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-[#1a1f2e]">
                    {activeCampaigns?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-[#1DDCD3]/10 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-[#1a1f2e]">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-[#1DDCD3]/10 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-[#1a1f2e]">$0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-[#1DDCD3]/10 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-[#1a1f2e]">0%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Campaigns */}
            <div>
              <h2 className="text-xl font-semibold text-[#1a1f2e] mb-4">Active Campaigns</h2>
              <div className="space-y-4">
                {activeCampaigns?.length > 0 ? (
                  activeCampaigns.map((campaign: any) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-lg p-6 text-center">
                    <p className="text-gray-500">No active campaigns</p>
                    <p className="text-sm text-gray-400 mt-1">Check out available opportunities!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Invitations */}
            <div>
              <h2 className="text-xl font-semibold text-[#1a1f2e] mb-4">Recent Invitations</h2>
              <div className="space-y-4">
                {invitations?.length > 0 ? (
                  invitations.map((campaign: any) => (
                    <InvitationCard
                      key={campaign.id}
                      campaign={campaign}
                      onAccept={handleAcceptInvitation}
                      onDecline={handleDeclineInvitation}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-lg p-6 text-center">
                    <p className="text-gray-500">No recent invitations</p>
                    <p className="text-sm text-gray-400 mt-1">New opportunities will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Overview - Only show if there are active campaigns */}
          {activeCampaigns?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-[#1a1f2e] mb-4">Overall Progress</h2>
              <div className="bg-white rounded-lg p-6">
                <ProgressBar progress={75} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
