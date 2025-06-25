
import React, { useState } from 'react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import MetricsCard from '@/components/brand/MetricsCard';
import CampaignOverviewCard from '@/components/brand/CampaignOverviewCard';
import ApplicationCard from '@/components/brand/ApplicationCard';
import { BrandCampaign, InfluencerApplication, DashboardMetrics } from '@/types/brandDashboard';

const BrandDashboard: React.FC = () => {
  // Mock data - replace with actual API calls
  const [metrics] = useState<DashboardMetrics>({
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalBudget: 85000,
    totalSpent: 42300,
    pendingApplications: 23,
    totalReach: 1250000,
    avgEngagementRate: 4.2,
    completedCampaigns: 7
  });

  const [activeCampaigns] = useState<BrandCampaign[]>([
    {
      id: '1',
      title: 'Summer Fitness Collection',
      status: 'active',
      budget: 15000,
      spent: 8500,
      applicants: 45,
      accepted: 8,
      dueDate: '15/07/2025',
      platforms: ['Instagram', 'TikTok'],
      category: 'Fitness',
      progress: 65,
      performance: {
        reach: 180000,
        engagement: 4.8,
        clicks: 1250
      }
    },
    {
      id: '2',
      title: 'Back to School Campaign',
      status: 'active',
      budget: 20000,
      spent: 5200,
      applicants: 67,
      accepted: 12,
      dueDate: '30/08/2025',
      platforms: ['Instagram', 'YouTube'],
      category: 'Lifestyle',
      progress: 25,
      performance: {
        reach: 95000,
        engagement: 3.9,
        clicks: 780
      }
    }
  ]);

  const [recentApplications] = useState<InfluencerApplication[]>([
    {
      id: '1',
      campaignId: '1',
      campaignTitle: 'Summer Fitness Collection',
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
      campaignId: '2',
      campaignTitle: 'Back to School Campaign',
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
    },
    {
      id: '3',
      campaignId: '1',
      campaignTitle: 'Summer Fitness Collection',
      influencer: {
        name: 'Emma Rodriguez',
        handle: 'emmaworkouts',
        followers: 32000,
        platform: 'Instagram'
      },
      appliedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      engagementRate: 4.7,
      averageViews: 8500,
      niche: ['Fitness', 'Health', 'Nutrition'],
      aiScore: 85
    }
  ]);

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BrandSidebar userName="Nike Brand Team" />
      
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCampaigns.map((campaign) => (
                  <CampaignOverviewCard
                    key={campaign.id}
                    campaign={campaign}
                    onViewDetails={handleViewCampaignDetails}
                  />
                ))}
              </div>
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
