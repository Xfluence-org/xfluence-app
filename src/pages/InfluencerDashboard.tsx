
import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import CampaignCard from '@/components/dashboard/CampaignCard';
import InvitationCard from '@/components/dashboard/InvitationCard';
import ProgressBar from '@/components/dashboard/ProgressBar';

const InfluencerDashboard = () => {
  const { user, profile, loading } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeItem="dashboard" userName={profile?.name} />
      
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
                    {dashboardData?.activeCampaigns?.length || 0}
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
                  <p className="text-2xl font-bold text-[#1a1f2e]">
                    {dashboardData?.completedCampaigns?.length || 0}
                  </p>
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
                  <p className="text-2xl font-bold text-[#1a1f2e]">
                    ${dashboardData?.totalEarnings?.toLocaleString() || '0'}
                  </p>
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
                  <p className="text-2xl font-bold text-[#1a1f2e]">
                    {dashboardData?.successRate || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Campaigns */}
            <div>
              <h2 className="text-xl font-semibold text-[#1a1f2e] mb-4">Active Campaigns</h2>
              <div className="space-y-4">
                {dashboardData?.activeCampaigns?.length > 0 ? (
                  dashboardData.activeCampaigns.map((campaign: any) => (
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
                {dashboardData?.recentInvitations?.length > 0 ? (
                  dashboardData.recentInvitations.map((invitation: any) => (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
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

          {/* Progress Overview */}
          {dashboardData?.progressData && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-[#1a1f2e] mb-4">Monthly Progress</h2>
              <div className="bg-white rounded-lg p-6">
                <ProgressBar data={dashboardData.progressData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
