
import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import CampaignCard from '@/components/dashboard/CampaignCard';
import InvitationCard from '@/components/dashboard/InvitationCard';
import WaitingForRequirementsCard from '@/components/dashboard/WaitingForRequirementsCard';
import PendingApplicationCard from '@/components/dashboard/PendingApplicationCard';
import TaskWorkflowCard from '@/components/campaigns/TaskWorkflowCard';
import { useNavigate } from 'react-router-dom';
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
    // Navigate to campaigns page with the task detail modal open
    navigate(`/campaigns?tab=Active&task=${taskId}`);
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
                      <div key={campaign.id} className="bg-white rounded-lg p-6 shadow-sm border">
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
                              {campaign.platforms?.map((platform: string) => (
                                <span key={platform} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
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
                      </div>
                    );
                  })
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
                  <div className="bg-white rounded-lg p-6 text-center">
                    <p className="text-gray-500">No recent invitations</p>
                    <p className="text-sm text-gray-400 mt-1">New opportunities will appear here</p>
                  </div>
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
