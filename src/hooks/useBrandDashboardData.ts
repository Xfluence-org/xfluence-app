
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
  // Fetch brand campaigns for the specific brand/agency
  const { data: campaignsData = [], isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['brand-campaigns'],
    queryFn: async () => {
      console.log('Fetching brand campaigns for dashboard');
      
      // First get the brands associated with the current user
      const { data: userBrands, error: brandsError } = await supabase
        .from('brand_users')
        .select('brand_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (brandsError) {
        console.error('Error fetching user brands:', brandsError);
        throw brandsError;
      }

      if (!userBrands || userBrands.length === 0) {
        console.log('No brands found for current user');
        return [];
      }

      const brandIds = userBrands.map(ub => ub.brand_id);

      // Fetch campaigns for the user's brands
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          status,
          budget,
          amount,
          due_date,
          category,
          created_at,
          brand_id
        `)
        .in('brand_id', brandIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching brand campaigns:', error);
        throw error;
      }

      console.log('Fetched brand campaigns for dashboard:', data);
      
      // Transform to match expected interface
      return (data || []).map(campaign => ({
        campaign_id: campaign.id,
        campaign_title: campaign.title,
        campaign_status: campaign.status,
        budget: campaign.budget || campaign.amount || 0,
        spent: 0, // Mock data for now
        applicants: 0, // This would be calculated from campaign_participants
        accepted: 0, // This would be calculated from campaign_participants
        due_date: campaign.due_date,
        platforms: ['Instagram', 'TikTok'],
        category: campaign.category || 'General',
        progress: campaign.status === 'completed' ? 100 : 
                 campaign.status === 'active' ? 75 : 
                 campaign.status === 'published' ? 50 : 25
      }));
    }
  });

  // Transform campaigns data to match component expectations
  const transformedCampaigns = campaignsData.map((campaign: BrandCampaignData) => ({
    id: campaign.campaign_id,
    title: campaign.campaign_title,
    status: campaign.campaign_status as 'active' | 'draft' | 'completed' | 'paused',
    budget: campaign.budget || 0, // Budget is now already in dollars from the database
    spent: campaign.spent || 0, // Spent is already in dollars
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
    totalBudget: campaignsData.reduce((sum, c) => sum + (c.budget || 0), 0),
    totalSpent: campaignsData.reduce((sum, c) => sum + (c.spent || 0), 0),
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
