
import React from 'react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import MetricCard from '@/components/dashboard/MetricCard';
import CampaignOverviewCard from '@/components/brand/CampaignOverviewCard';
import ApplicationCard from '@/components/brand/ApplicationCard';
import { InfluencerApplication } from '@/types/brandDashboard';
import { useBrandDashboardData } from '@/hooks/useBrandDashboardData';
import { useBrandApplications } from '@/hooks/useBrandApplications';
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

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
  };

  const handleApproveApplication = (applicationId: string) => {
    console.log('Approve application:', applicationId);
  };

  const handleRejectApplication = (applicationId: string) => {
    console.log('Reject application:', applicationId);
  };

  const handleViewProfile = (applicationId: string) => {
    console.log('View influencer profile:', applicationId);
  };

  if (loading || applicationsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || applicationsError) {
    return (
      <div className="flex h-screen bg-background">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-destructive text-lg">Error loading dashboard</p>
              <p className="text-muted-foreground mt-2">{error || applicationsError?.message}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const dashboardMetrics = [
    {
      title: 'Active Campaigns',
      value: metrics.activeCampaigns,
      subtitle: `${metrics.totalCampaigns} total campaigns`,
      trend: { value: 12, isPositive: true },
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Total Budget',
      value: `$${metrics.totalBudget.toLocaleString()}`,
      subtitle: `$${metrics.totalSpent.toLocaleString()} spent`,
      trend: { value: 8, isPositive: true },
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: 'Pending Applications',
      value: recentApplications.length,
      subtitle: 'Awaiting review',
      icon: <Award className="h-5 w-5" />
    },
    {
      title: 'Total Reach',
      value: `${(metrics.totalReach / 1000000).toFixed(1)}M`,
      subtitle: `${metrics.avgEngagementRate}% avg engagement`,
      trend: { value: 15, isPositive: true },
      icon: <TrendingUp className="h-5 w-5" />
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <BrandSidebar userName="Brand Team" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your campaigns.</p>
          </header>

          {/* Metrics Overview */}
          <section className="mb-12">
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardMetrics.map((metric, index) => (
                  <MetricCard
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    subtitle={metric.subtitle}
                    trend={metric.trend}
                    icon={metric.icon}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Active Campaigns */}
          <section className="mb-12">
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Active Campaigns</h2>
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
                  <p className="text-muted-foreground">No campaigns found. Create your first campaign to get started!</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Applications */}
          <section>
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Recent Applications</h2>
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent applications found.</p>
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
