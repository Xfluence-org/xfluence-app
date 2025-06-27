
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
  totalBudget: number;
  totalSpent: number;
  pendingApplications: number;
  totalReach: number;
  avgEngagementRate: number;
  completedCampaigns: number;
}

export const useBrandDashboardData = () => {
  // Fetch brand campaigns
  const { data: campaignsData = [], isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['brand-campaigns'],
    queryFn: async () => {
      console.log('Fetching brand campaigns');
      
      const { data, error } = await supabase.rpc('get_brand_campaigns', {
        brand_filter: 'all'
      });

      if (error) {
        console.error('Error fetching brand campaigns:', error);
        throw error;
      }

      console.log('Fetched brand campaigns:', data);
      return data || [];
    }
  });

  // Transform campaigns data to match component expectations
  const transformedCampaigns = campaignsData.map((campaign: BrandCampaignData) => ({
    id: campaign.campaign_id,
    title: campaign.campaign_title,
    status: campaign.campaign_status as 'active' | 'draft' | 'completed' | 'paused',
    budget: Math.floor((campaign.budget || 0) / 100), // Convert from cents
    spent: Math.floor((campaign.spent || 0) / 100), // Convert from cents  
    applicants: campaign.applicants,
    accepted: campaign.accepted,
    dueDate: campaign.due_date ? new Date(campaign.due_date).toLocaleDateString('en-GB') : 'TBD',
    platforms: campaign.platforms,
    category: campaign.category,
    progress: campaign.progress,
    performance: {
      reach: Math.floor(Math.random() * 200000) + 50000, // Mock data for now
      engagement: Math.random() * 2 + 3,
      clicks: Math.floor(Math.random() * 1000) + 500
    }
  }));

  // Calculate metrics from campaign data
  const metrics: BrandMetrics = {
    totalCampaigns: campaignsData.length,
    activeCampaigns: campaignsData.filter(c => c.campaign_status === 'active').length,
    totalBudget: campaignsData.reduce((sum, c) => sum + Math.floor((c.budget || 0) / 100), 0),
    totalSpent: campaignsData.reduce((sum, c) => sum + Math.floor((c.spent || 0) / 100), 0),
    pendingApplications: campaignsData.reduce((sum, c) => sum + (c.applicants - c.accepted), 0),
    totalReach: 1250000, // Mock data for now
    avgEngagementRate: 4.2, // Mock data for now
    completedCampaigns: campaignsData.filter(c => c.campaign_status === 'completed').length
  };

  return {
    campaigns: transformedCampaigns,
    metrics,
    loading: campaignsLoading,
    error: campaignsError?.message || null
  };
};
