
import React from 'react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import MetricsCard from '@/components/brand/MetricsCard';
import { useBrandDashboardData } from '@/hooks/useBrandDashboardData';
import { usePublishedCampaigns } from '@/hooks/usePublishedCampaigns';
import PublishedCampaignCard from '@/components/brand/PublishedCampaignCard';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/SimpleAuthContext';

const BrandDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { metrics: dashboardMetrics, loading, error } = useBrandDashboardData();
  const { data: publishedCampaigns = [], isLoading: publishedLoading } = usePublishedCampaigns(10);

  
  // Calculate metrics from published campaigns since get_brand_campaigns is returning empty
  const metrics = {
    ...dashboardMetrics,
    publishedCampaigns: publishedCampaigns.length,
    totalCampaigns: publishedCampaigns.length, // For now, showing only published
    publishedBudget: publishedCampaigns.reduce((sum, c) => sum + (c.budget / 100 || 0), 0), // Convert from cents
    publishedSpent: publishedCampaigns.reduce((sum, c) => sum + ((c.budget / 100) * 0.8 || 0), 0), // Estimate 80% spent
    totalReach: publishedCampaigns.reduce((sum, c) => sum + (c.total_reach || 0), 0),
    avgEngagementRate: publishedCampaigns.length > 0 
      ? publishedCampaigns.reduce((sum, c) => sum + c.avg_engagement_rate, 0) / publishedCampaigns.length 
      : 0
  };


  if (loading || publishedLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName={profile?.name || 'Brand'} />
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
        <BrandSidebar userName={profile?.name || 'Brand'} />
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
    <div className="flex h-screen relative">
      <BrandSidebar userName={profile?.name || 'Brand'} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's an overview of your campaigns.</p>
          </header>

          {/* Metrics Overview */}
          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                  title="Published Campaigns"
                  value={metrics.publishedCampaigns || 0}
                  subtitle={`${metrics.totalCampaigns || 0} total campaigns`}
                  trend={{ value: 12, isPositive: true }}
                  icon="campaigns"
                />
                <MetricsCard
                  title="Published Budget"
                  value={`$${(metrics.publishedBudget || 0).toLocaleString()}`}
                  subtitle={`$${(metrics.publishedSpent || 0).toLocaleString()} spent`}
                  trend={{ value: 8, isPositive: true }}
                  icon="budget"
                />
                <MetricsCard
                  title="Active Campaigns"
                  value={metrics.publishedCampaigns || 0}
                  subtitle="In progress"
                  icon="active"
                />
                <MetricsCard
                  title="Total Reach"
                  value={metrics.totalReach > 0 ? `${(metrics.totalReach / 1000000).toFixed(1)}M` : '0'}
                  subtitle={`${metrics.avgEngagementRate.toFixed(1)}% avg engagement`}
                  trend={{ value: 15, isPositive: true }}
                  icon="reach"
                />
              </div>
            </Card>
          </section>



          {/* Published Campaigns */}
          <section className="mb-12">
            <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#1a1f2e]">Published Campaigns</h2>
                  <button 
                    onClick={() => navigate('/brand/campaigns?tab=published')}
                    className="text-gray-600 hover:text-[#1DDCD3] font-medium transition-colors duration-200"
                  >
                    View more →
                  </button>
                </div>
                {publishedCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {publishedCampaigns.slice(0, 2).map((campaign) => (
                      <PublishedCampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onViewDetails={(campaignId) => navigate('/brand/campaigns', { state: { openCampaignId: campaignId } })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No published campaigns yet. Complete your active campaigns to see them here!</p>
                  </div>
                )}
              </Card>
            </section>

        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
