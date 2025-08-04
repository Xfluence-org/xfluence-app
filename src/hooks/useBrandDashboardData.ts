
// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BrandCampaignData {
  campaign_id: string;
  campaign_title: string;
  campaign_status: string;
  budget: number;
  spent: number;
  applicants: number;
  accepted: number;
  due_date: string;
  platforms: string[];
  category: string;
  progress: number;
}

interface BrandMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  publishedCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  pendingApplications: number;
  totalInfluencers: number; // Changed from totalReach
  acceptanceRate: number; // Changed from avgEngagementRate
  completedCampaigns: number;
  publishedBudget: number;
  publishedSpent: number;
}

export const useBrandDashboardData = () => {
  // Fetch brand campaigns using the database function
  const { data: campaignsData = [], isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['brand-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_brand_campaigns', {
        brand_filter: 'all'
      });

      if (error) {
        throw error;
      }

      return data || [];
    }
  });

  // Transform campaigns data to match component expectations
  const transformedCampaigns = campaignsData.map((campaign: BrandCampaignData) => ({
    id: campaign.campaign_id,
    title: campaign.campaign_title,
    status: campaign.campaign_status as 'active' | 'draft' | 'completed' | 'paused',
    budget: campaign.budget || 0, // Budget from database function is in dollars
    spent: campaign.spent || 0, // Spent from database function is in dollars
    applicants: campaign.applicants,
    accepted: campaign.accepted,
    dueDate: campaign.due_date ? new Date(campaign.due_date).toLocaleDateString('en-GB') : 'TBD',
    platforms: campaign.platforms,
    category: campaign.category, // Now expecting a single category string from database function
    progress: campaign.progress,
    performance: {
      reach: 0, // Will be calculated from actual influencer data
      engagement: 0, // Will be calculated from actual engagement data
      clicks: 0 // Will be calculated from actual click data
    }
  }));

  // Calculate metrics from campaign data
  const publishedCampaigns = campaignsData.filter(c => c.campaign_status === 'published');
  const activeCampaigns = campaignsData.filter(c => c.campaign_status === 'active');
  
  
  // Calculate total applicants and accepted for acceptance rate
  const totalApplicants = campaignsData.reduce((sum, c) => sum + (c.applicants || 0), 0);
  const totalAccepted = campaignsData.reduce((sum, c) => sum + (c.accepted || 0), 0);
  
  const metrics: BrandMetrics = {
    totalCampaigns: campaignsData.length,
    activeCampaigns: activeCampaigns.length,
    publishedCampaigns: publishedCampaigns.length,
    totalBudget: campaignsData.reduce((sum, c) => sum + (c.budget || 0), 0),
    totalSpent: campaignsData.reduce((sum, c) => sum + (c.spent || 0), 0),
    pendingApplications: campaignsData.reduce((sum, c) => sum + (c.applicants - c.accepted), 0),
    // Total influencers who have been accepted across all campaigns
    totalInfluencers: totalAccepted,
    // Acceptance rate as a percentage
    acceptanceRate: totalApplicants > 0 ? (totalAccepted / totalApplicants) * 100 : 0,
    completedCampaigns: campaignsData.filter(c => c.campaign_status === 'completed').length,
    publishedBudget: publishedCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
    publishedSpent: publishedCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0)
  };

  return {
    campaigns: transformedCampaigns,
    metrics,
    loading: campaignsLoading,
    error: campaignsError?.message || null
  };
};
