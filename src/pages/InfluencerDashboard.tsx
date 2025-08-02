
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import CampaignCard from '@/components/dashboard/CampaignCard';
import InvitationCard from '@/components/dashboard/InvitationCard';
import WaitingForRequirementsCard from '@/components/dashboard/WaitingForRequirementsCard';
import PendingApplicationCard from '@/components/dashboard/PendingApplicationCard';
import TaskWorkflowCard from '@/components/campaigns/TaskWorkflowCard';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const InfluencerDashboard = () => {
  const { user, profile, loading } = useAuth();
  const { 
    invitations, 
    activeCampaigns,
    waitingCampaigns,
    pendingApplications, 
    loading: dashboardLoading, 
    acceptInvitation, 
    declineInvitation 
  } = useDashboardData();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleViewTaskDetails = (taskId: string) => {
    // Navigate to campaigns page with task parameter to open the modal
    navigate(`/campaigns?tab=Active&task=${taskId}`);
  };


  return (
    <div className="flex h-screen relative">
      <Sidebar userName={profile?.name} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">
              Welcome back, {profile?.name || 'Influencer'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your campaigns today.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/20">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-[#1a1f2e]">
                    {activeCampaigns?.length || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/20">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-[#1a1f2e]">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/20">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-[#1a1f2e]">$0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/20">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-[#1a1f2e]">0%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pending Applications */}
          {pendingApplications?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1a1f2e] mb-4">Pending Applications</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingApplications.map((campaign: any) => (
                  <PendingApplicationCard
                    key={campaign.id}
                    campaign={campaign}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Campaigns Waiting for Requirements */}
          {waitingCampaigns?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1a1f2e] mb-4">Waiting for Content Requirements</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {waitingCampaigns.map((campaign: any) => (
                  <WaitingForRequirementsCard
                    key={campaign.id}
                    campaignTitle={campaign.campaignTitle}
                    brandName={campaign.brandName}
                    acceptedDate={campaign.acceptedDate}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Campaigns */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1a1f2e]">Active Campaigns</h2>
                {activeCampaigns?.length > 2 && (
                  <button 
                    onClick={() => navigate('/campaigns?tab=Active')}
                    className="text-gray-600 hover:text-[#1DDCD3] font-medium transition-colors duration-200 text-sm"
                  >
                    View more →
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {activeCampaigns?.length > 0 ? (
                  activeCampaigns.slice(0, 2).map((campaign: any) => {
                    
                    // Check if campaign has tasks to show the workflow card
                    if (campaign.tasks?.length > 0) {
                      return (
                        <TaskWorkflowCard
                          key={campaign.id}
                          campaign={{
                            id: campaign.campaign_id,
                            title: campaign.campaign_title,
                            brand: campaign.brand_name,
                            status: campaign.campaign_status,
                            taskCount: campaign.task_count || 0,
                            platforms: campaign.platforms || [],
                            amount: campaign.amount,
                            dueDate: campaign.due_date,
                            overall_progress: campaign.overall_progress,
                            tasks: campaign.tasks,
                            completedTasks: campaign.completed_tasks || 0
                          }}
                          onViewTaskDetails={handleViewTaskDetails}
                        />
                      );
                    }
                    
                    // Otherwise show the simple card
                    return (
                      <Card key={campaign.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-[#1a1f2e] mb-1">
                              {campaign.campaign_title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              by {campaign.brand_name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {campaign.campaign_status}
                              </span>
                              {campaign.platforms?.map((platform: string, index: number) => (
                                <span key={`${campaign.id}-platform-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Compensation</p>
                            <p className="font-semibold text-[#1a1f2e]">${campaign.amount}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{campaign.overall_progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#1DDCD3] h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${campaign.overall_progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Due: {new Date(campaign.due_date).toLocaleDateString()}
                          </span>
                          <span className="text-gray-600">
                            {campaign.completed_tasks}/{campaign.task_count} tasks completed
                          </span>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500">No active campaigns</p>
                    <p className="text-sm text-gray-400 mt-1">New campaigns will appear here when you're invited!</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Invitations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1a1f2e]">Recent Invitations</h2>
                {invitations?.length > 2 && (
                  <button 
                    onClick={() => navigate('/campaigns?tab=Invitations')}
                    className="text-gray-600 hover:text-[#1DDCD3] font-medium transition-colors duration-200 text-sm"
                  >
                    View more →
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {invitations?.length > 0 ? (
                  invitations.slice(0, 2).map((campaign: any) => (
                    <InvitationCard
                      key={campaign.id}
                      campaign={campaign}
                      onAccept={handleAcceptInvitation}
                      onDecline={handleDeclineInvitation}
                    />
                  ))
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500">No recent invitations</p>
                    <p className="text-sm text-gray-400 mt-1">New opportunities will appear here</p>
                  </Card>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
