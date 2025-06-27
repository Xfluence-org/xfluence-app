
import React from 'react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import MetricsCard from '@/components/brand/MetricsCard';
import CampaignOverviewCard from '@/components/brand/CampaignOverviewCard';
import ApplicationCard from '@/components/brand/ApplicationCard';
import { InfluencerApplication } from '@/types/brandDashboard';
import { useBrandDashboardData } from '@/hooks/useBrandDashboardData';

const BrandDashboard: React.FC = () => {
  const { campaigns, metrics, loading, error } = useBrandDashboardData();

  // Mock recent applications - this would come from another API call
  const recentApplications: InfluencerApplication[] = [
    {
      id: '1',
      campaignId: campaigns[0]?.id || '1',
      campaignTitle: campaigns[0]?.title || 'Summer Fitness Collection',
      influencer: {
        name: 'Sarah Johnson',
        handle: 'sarahfitslife',
        followers: 45000,
        platform: 'Instagram'
      },
      appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      engagementRate: 5.2,
      averageViews: 12000,
      niche: ['Fitness', 'Lifestyle', 'Wellness'],
      aiScore: 92
    },
    {
      id: '2',
      campaignId: campaigns[1]?.id || '2',
      campaignTitle: campaigns[1]?.title || 'Back to School Campaign',
      influencer: {
        name: 'Mike Chen',
        handle: 'miketech',
        followers: 78000,
        platform: 'TikTok'
      },
      appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      engagementRate: 6.1,
      averageViews: 25000,
      niche: ['Tech', 'Lifestyle', 'Education'],
      aiScore: 88
    }
  ];

  const handleViewCampaignDetails = (campaignId: string) => {
    console.log('View campaign details:', campaignId);
    // Navigate to campaign details page
  };

  const handleApproveApplication = (applicationId: string) => {
    console.log('Approve application:', applicationId);
    // Handle application approval
  };

  const handleRejectApplication = (applicationId: string) => {
    console.log('Reject application:', applicationId);
    // Handle application rejection
  };

  const handleViewProfile = (applicationId: string) => {
    console.log('View influencer profile:', applicationId);
    // Navigate to influencer profile
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error loading dashboard</p>
              <p className="text-gray-500 mt-2">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BrandSidebar userName="Brand Team" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's an overview of your campaigns.</p>
          </header>

          {/* Metrics Overview */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                  title="Active Campaigns"
                  value={metrics.activeCampaigns}
                  subtitle={`${metrics.totalCampaigns} total campaigns`}
                  trend={{ value: 12, isPositive: true }}
                  icon="📱"
                />
                <MetricsCard
                  title="Total Budget"
                  value={`$${metrics.totalBudget.toLocaleString()}`}
                  subtitle={`$${metrics.totalSpent.toLocaleString()} spent`}
                  trend={{ value: 8, isPositive: true }}
                  icon="💰"
                />
                <MetricsCard
                  title="Pending Applications"
                  value={metrics.pendingApplications}
                  subtitle="Awaiting review"
                  icon="📝"
                />
                <MetricsCard
                  title="Total Reach"
                  value={`${(metrics.totalReach / 1000000).toFixed(1)}M`}
                  subtitle={`${metrics.avgEngagementRate}% avg engagement`}
                  trend={{ value: 15, isPositive: true }}
                  icon="📈"
                />
              </div>
            </div>
          </section>

          {/* Active Campaigns */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6">Active Campaigns</h2>
              {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {campaigns.map((campaign) => (
                    <CampaignOverviewCard
                      key={campaign.id}
                      campaign={campaign}
                      onViewDetails={handleViewCampaignDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No campaigns found. Create your first campaign to get started!</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Applications */}
          <section>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1a1f2e]">Recent Applications</h2>
                <button className="text-gray-600 hover:text-[#1DDCD3] font-medium transition-colors duration-200">
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onApprove={handleApproveApplication}
                    onReject={handleRejectApplication}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
