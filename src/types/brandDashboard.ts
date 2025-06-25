
export interface BrandCampaign {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  budget: number;
  spent: number;
  applicants: number;
  accepted: number;
  dueDate: string;
  platforms: string[];
  category: string;
  progress: number;
  performance?: {
    reach: number;
    engagement: number;
    clicks: number;
  };
}

export interface InfluencerApplication {
  id: string;
  campaignId: string;
  campaignTitle: string;
  influencer: {
    name: string;
    handle: string;
    followers: number;
    platform: string;
    profileImage?: string;
  };
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  engagementRate: number;
  averageViews: number;
  niche: string[];
  aiScore: number;
}

export interface DashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  pendingApplications: number;
  totalReach: number;
  avgEngagementRate: number;
  completedCampaigns: number;
}
