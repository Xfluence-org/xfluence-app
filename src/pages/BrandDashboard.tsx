
import React from 'react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import MetricsCard from '@/components/brand/MetricsCard';
import CampaignOverviewCard from '@/components/brand/CampaignOverviewCard';
import ApplicationCard from '@/components/brand/ApplicationCard';
import { InfluencerApplication } from '@/types/brandDashboard';
import { useBrandDashboardData } from '@/hooks/useBrandDashboardData';
import { useBrandApplications } from '@/hooks/useBrandApplications';

const BrandDashboard: React.FC = () => {
  const { campaigns, metrics, loading, error } = useBrandDashboardData();
  const { data: applicationsData = [], isLoading: applicationsLoading, error: applicationsError } = useBrandApplications(10);

  const recentApplications: InfluencerApplication[] = applicationsData.map((app: any) => ({
    id: app.application_id,
    campaignId: app.campaign_id,
    campaignTitle: app.campaign_title,
    influencer: {
      name: app.influencer_name,
      handle: app.influencer_handle,
      followers: app.followers_count,
      platform: app.platform
    },
    appliedAt: app.applied_at,
    status: app.application_status as 'pending' | 'approved' | 'rejected',
    engagementRate: parseFloat(app.engagement_rate.toString()),
    averageViews: app.average_views,
    niche: app.niche,
    aiScore: app.ai_score
  }));

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

  if (loading || applicationsLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-slate-900">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <div className="glass-card p-8 max-w-md mx-auto">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || applicationsError) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-slate-900">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <div className="glass-card p-8 max-w-md mx-auto">
                <p className="text-red-400 text-lg">Error loading dashboard</p>
                <p className="text-muted-foreground mt-2">{error || applicationsError?.message}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-slate-900">
      <BrandSidebar userName="Brand Team" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 fade-in">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground">Welcome back! Here's an overview of your campaigns.</p>
          </header>

          {/* Metrics Overview */}
          <section className="mb-12">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-8">Overview</h2>
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
                  value={recentApplications.length}
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
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-8">Active Campaigns</h2>
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
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-lg text-muted-foreground">No campaigns found. Create your first campaign to get started!</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Applications */}
          <section>
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Recent Applications</h2>
                <button className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200">
                  View All →
                </button>
              </div>
              {recentApplications.length > 0 ? (
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
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-lg text-muted-foreground">No recent applications found.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
