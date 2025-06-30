import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Download,
  RefreshCw,
  Users,
  DollarSign,
  Target,
  Award,
  Calendar,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CampaignAnalyticsDashboardProps {
  campaignId: string;
}

interface PlatformStats {
  platform: string;
  count: number;
  impressions: number;
  engagement: number;
  avgEngagementRate: number;
}

interface InfluencerPerformance {
  influencerId: string;
  influencerName: string;
  platform: string;
  impressions: number;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  publishedUrl: string;
  publishedAt: string;
}

const CampaignAnalyticsDashboard: React.FC<CampaignAnalyticsDashboardProps> = ({ campaignId }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('all');

  // Fetch campaign analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['campaign-analytics', campaignId],
    enabled: !!campaignId,
    queryFn: async () => {
      console.log('Fetching analytics for campaign:', campaignId);
      
      // First get tasks for this campaign
      const { data: campaignTasks, error: tasksError } = await supabase
        .from('campaign_tasks')
        .select('id')
        .eq('campaign_id', campaignId);
        
      if (tasksError) {
        console.error('Error fetching campaign tasks:', tasksError);
        throw tasksError;
      }
      
      const taskIds = campaignTasks?.map(t => t.id) || [];
      
      console.log('Found task IDs for campaign:', taskIds);
      
      // If no tasks found, return empty data
      if (taskIds.length === 0) {
        console.log('No tasks found for campaign:', campaignId);
        return {
          publishedContent: [],
          summary: {
            totalPosts: 0,
            totalImpressions: 0,
            totalEngagements: 0,
            avgEngagementRate: 0,
            totalClicks: 0,
            totalReach: 0
          },
          platformStats: []
        };
      }
      
      // Get all published content with analytics for these tasks
      const { data: publishedContent, error } = await supabase
        .from('task_published_content')
        .select(`
          *,
          task_analytics(*)
        `)
        .in('task_id', taskIds)
        .order('created_at', { ascending: false });
        
      // Get influencer info separately
      const tasksWithInfluencers = await Promise.all(
        (publishedContent || []).map(async (content) => {
          const { data: task } = await supabase
            .from('campaign_tasks')
            .select(`
              id,
              title,
              influencer:profiles!campaign_tasks_influencer_id_fkey(
                id,
                name
              )
            `)
            .eq('id', content.task_id)
            .single();
            
          return {
            ...content,
            campaign_tasks: task
          };
        })
      );

      if (error) {
        console.error('Error fetching published content:', error);
        throw error;
      }
      
      console.log('Campaign tasks:', campaignTasks);
      console.log('Published content:', publishedContent);

      // Use the processed data with influencer info
      const publishedContentData = tasksWithInfluencers;

      // Process the data
      const totalImpressions = publishedContentData?.reduce((sum, item) => 
        sum + (item.task_analytics?.[0]?.impressions || 0), 0
      ) || 0;

      const totalEngagements = publishedContentData?.reduce((sum, item) => {
        const analytics = item.task_analytics?.[0];
        if (!analytics) return sum;
        return sum + analytics.likes + analytics.comments + analytics.shares;
      }, 0) || 0;

      const avgEngagementRate = publishedContentData?.reduce((sum, item) => 
        sum + (item.task_analytics?.[0]?.engagement_rate || 0), 0
      ) / (publishedContentData?.length || 1) || 0;

      const totalClicks = publishedContentData?.reduce((sum, item) => 
        sum + (item.task_analytics?.[0]?.clicks || 0), 0
      ) || 0;

      // Platform breakdown
      const platformStats: Record<string, PlatformStats> = {};
      publishedContentData?.forEach(item => {
        const platform = item.platform;
        const analytics = item.task_analytics?.[0];
        
        if (!platformStats[platform]) {
          platformStats[platform] = {
            platform,
            count: 0,
            impressions: 0,
            engagement: 0,
            avgEngagementRate: 0
          };
        }
        
        platformStats[platform].count++;
        platformStats[platform].impressions += analytics?.impressions || 0;
        platformStats[platform].engagement += (analytics?.likes || 0) + 
                                            (analytics?.comments || 0) + 
                                            (analytics?.shares || 0);
      });

      // Calculate average engagement rate per platform
      Object.values(platformStats).forEach(stat => {
        stat.avgEngagementRate = stat.impressions > 0 
          ? (stat.engagement / stat.impressions) * 100 
          : 0;
      });

      return {
        publishedContent: publishedContentData || [],
        summary: {
          totalPosts: publishedContentData?.length || 0,
          totalImpressions,
          totalEngagements,
          avgEngagementRate,
          totalClicks,
          totalReach: publishedContentData?.reduce((sum, item) => 
            sum + (item.task_analytics?.[0]?.reach || 0), 0
          ) || 0
        },
        platformStats: Object.values(platformStats)
      };
    }
  });

  const { publishedContent = [], summary = {}, platformStats = [] } = analyticsData || {};

  // Filter data based on selections
  const filteredContent = publishedContent.filter(item => {
    const matchesPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
    const matchesInfluencer = selectedInfluencer === 'all' || 
                             item.campaign_tasks?.influencer?.id === selectedInfluencer;
    return matchesPlatform && matchesInfluencer;
  });

  // Get unique influencers
  const uniqueInfluencers = Array.from(
    new Set(publishedContent.map(item => item.campaign_tasks?.influencer?.id))
  ).map(id => {
    const item = publishedContent.find(p => p.campaign_tasks?.influencer?.id === id);
    return {
      id,
      name: item?.campaign_tasks?.influencer?.name || 'Unknown'
    };
  }).filter(i => i.id);

  // Prepare chart data
  const engagementByPlatform = platformStats.map(stat => ({
    name: stat.platform.charAt(0).toUpperCase() + stat.platform.slice(1),
    engagementRate: parseFloat(stat.avgEngagementRate.toFixed(2)),
    posts: stat.count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold">Campaign Analytics</h3>
          <p className="text-sm text-gray-600">Track performance across all published content</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedInfluencer} onValueChange={setSelectedInfluencer}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Influencers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Influencers</SelectItem>
              {uniqueInfluencers.map(influencer => (
                <SelectItem key={influencer.id} value={influencer.id}>
                  {influencer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Posts</p>
                <p className="text-xl font-bold">{summary.totalPosts || 0}</p>
              </div>
              <Award className="h-6 w-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Impressions</p>
                <p className="text-xl font-bold">
                  {(summary.totalImpressions || 0).toLocaleString()}
                </p>
              </div>
              <Eye className="h-6 w-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Engagements</p>
                <p className="text-xl font-bold">
                  {(summary.totalEngagements || 0).toLocaleString()}
                </p>
              </div>
              <Heart className="h-6 w-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Avg Engagement</p>
                <p className="text-xl font-bold">
                  {(summary.avgEngagementRate || 0).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Reach</p>
                <p className="text-xl font-bold">
                  {(summary.totalReach || 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-6 w-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Link Clicks</p>
                <p className="text-xl font-bold">
                  {(summary.totalClicks || 0).toLocaleString()}
                </p>
              </div>
              <Target className="h-6 w-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="byInfluencer">By Influencer</TabsTrigger>
          <TabsTrigger value="byPlatform">By Platform</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Engagement Rate by Platform Chart */}
          {engagementByPlatform.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement Rate by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementByPlatform}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="engagementRate" fill="#1DDCD3" name="Engagement Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Platform Distribution Pie Chart */}
          {platformStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformStats.map(stat => ({
                        name: stat.platform.charAt(0).toUpperCase() + stat.platform.slice(1),
                        value: stat.count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="byInfluencer" className="space-y-4">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No published content found
              </CardContent>
            </Card>
          ) : (
            filteredContent.map(item => {
              const analytics = item.task_analytics?.[0];
              if (!analytics) return null;

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h4 className="font-medium">
                              {item.campaign_tasks?.influencer?.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge variant="outline" className="capitalize">
                                {item.platform}
                              </Badge>
                              <span>•</span>
                              <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600">Impressions</p>
                            <p className="font-semibold">{analytics.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Engagement</p>
                            <p className="font-semibold">{analytics.engagement_rate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Likes</p>
                            <p className="font-semibold">{analytics.likes.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Comments</p>
                            <p className="font-semibold">{analytics.comments.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Shares</p>
                            <p className="font-semibold">{analytics.shares.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Clicks</p>
                            <p className="font-semibold">{analytics.clicks.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Engagement Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Engagement Rate</span>
                            <span className="font-medium">{analytics.engagement_rate}%</span>
                          </div>
                          <Progress value={analytics.engagement_rate} className="h-2" />
                        </div>
                      </div>

                      <a
                        href={item.published_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="byPlatform" className="space-y-4">
          {platformStats.map(stat => (
            <Card key={stat.platform}>
              <CardHeader>
                <CardTitle className="text-lg capitalize flex items-center justify-between">
                  <span>{stat.platform}</span>
                  <Badge>{stat.count} posts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Impressions</p>
                    <p className="text-xl font-bold">{stat.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Engagement</p>
                    <p className="text-xl font-bold">{stat.engagement.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Engagement Rate</p>
                    <p className="text-xl font-bold">{stat.avgEngagementRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Posts Published</p>
                    <p className="text-xl font-bold">{stat.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignAnalyticsDashboard;