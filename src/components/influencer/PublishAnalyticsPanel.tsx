import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ExternalLink,
  Send,
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Link2,
  RefreshCw,
  FileText,
  Loader2,
  Edit2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { activityLogService } from '@/services/activityLogService';

interface PublishAnalyticsPanelProps {
  taskId: string;
  onPublishComplete?: () => void;
}

interface PublishedContent {
  id: string;
  task_id: string;
  platform: string;
  published_url: string;
  created_at: string;
  updated_at?: string;
  influencer_id?: string;
  notes?: string;
  analytics_data?: any;
  task_analytics?: ContentAnalytics[];
  status: 'active' | 'completed' | 'archived';
}

interface ContentAnalytics {
  id: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
  reach: number;
  clicks: number;
  saves: number;
  last_updated: string;
}

interface AnalyticsFormData {
  impressions: string;
  likes: string;
  comments: string;
  shares: string;
  reach: string;
  clicks: string;
  saves: string;
}

const PublishAnalyticsPanel: React.FC<PublishAnalyticsPanelProps> = ({ 
  taskId,
  onPublishComplete 
}) => {
  const [activeTab, setActiveTab] = useState('publish');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [publishNotes, setPublishNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdatingAnalytics, setIsUpdatingAnalytics] = useState(false);
  const [analyticsForm, setAnalyticsForm] = useState<AnalyticsFormData>({
    impressions: '',
    likes: '',
    comments: '',
    shares: '',
    reach: '',
    clicks: '',
    saves: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch published content
  const { data: publishedContent, isLoading } = useQuery({
    queryKey: ['published-content', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_published_content')
        .select(`
          *,
          task_analytics(*)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Check if content is already published
  const isContentPublished = publishedContent && publishedContent.length > 0;
  const latestPublished = publishedContent?.[0];

  // Initialize analytics form with existing data
  useEffect(() => {
    if (latestPublished?.task_analytics?.[0]) {
      const analytics = latestPublished.task_analytics[0];
      setAnalyticsForm({
        impressions: analytics.impressions?.toString() || '',
        likes: analytics.likes?.toString() || '',
        comments: analytics.comments?.toString() || '',
        shares: analytics.shares?.toString() || '',
        reach: analytics.reach?.toString() || '',
        clicks: analytics.clicks?.toString() || '',
        saves: analytics.saves?.toString() || ''
      });
    }
  }, [latestPublished]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishedUrl.trim() || !platform) return;

    setIsPublishing(true);
    try {
      // Create published content record
      const { data: publishData, error: publishError } = await supabase
        .from('task_published_content')
        .insert({
          task_id: taskId,
          influencer_id: user?.id,
          platform,
          published_url: publishedUrl,
          notes: publishNotes.trim() || null,
          status: 'active'
        })
        .select()
        .single();

      if (publishError) throw publishError;

      // Update task workflow state
      await supabase
        .from('task_workflow_states')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('task_id', taskId)
        .eq('phase', 'publish_analytics');

      // Update task status
      await supabase
        .from('campaign_tasks')
        .update({
          status: 'published',
          progress: 100
        })
        .eq('id', taskId);

      // Get campaign ID for activity logging
      const { data: taskData } = await supabase
        .from('campaign_tasks')
        .select('campaign_id')
        .eq('id', taskId)
        .single();

      // Log activity
      if (taskData && user?.id) {
        await activityLogService.logContentPublish(
          taskId,
          taskData.campaign_id,
          user.id,
          platform,
          publishedUrl
        );
      }

      toast({
        title: "Content Published!",
        description: "Your content has been successfully published and tracked."
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['published-content', taskId] });
      setPublishedUrl('');
      setPlatform('');
      setPublishNotes('');
      setActiveTab('analytics');
      
      onPublishComplete?.();
    } catch (error) {
      console.error('Error publishing content:', error);
      toast({
        title: "Error",
        description: "Failed to publish content",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateAnalytics = async () => {
    if (!latestPublished) return;

    setIsUpdatingAnalytics(true);
    try {
      // Calculate engagement rate
      const impressions = parseInt(analyticsForm.impressions) || 0;
      const engagements = (parseInt(analyticsForm.likes) || 0) + 
                         (parseInt(analyticsForm.comments) || 0) + 
                         (parseInt(analyticsForm.shares) || 0);
      const engagementRate = impressions > 0 ? (engagements / impressions) * 100 : 0;

      const analyticsData = {
        published_content_id: latestPublished.id,
        impressions: parseInt(analyticsForm.impressions) || 0,
        likes: parseInt(analyticsForm.likes) || 0,
        comments: parseInt(analyticsForm.comments) || 0,
        shares: parseInt(analyticsForm.shares) || 0,
        reach: parseInt(analyticsForm.reach) || 0,
        clicks: parseInt(analyticsForm.clicks) || 0,
        saves: parseInt(analyticsForm.saves) || 0,
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
        last_updated: new Date().toISOString()
      };

      // Check if analytics record exists
      if (latestPublished.task_analytics?.length > 0) {
        // Update existing
        await supabase
          .from('task_analytics')
          .update(analyticsData)
          .eq('id', latestPublished.task_analytics[0].id);
      } else {
        // Create new
        await supabase
          .from('task_analytics')
          .insert(analyticsData);
      }

      toast({
        title: "Analytics Updated",
        description: "Your content analytics have been updated successfully."
      });

      queryClient.invalidateQueries({ queryKey: ['published-content', taskId] });
    } catch (error) {
      console.error('Error updating analytics:', error);
      toast({
        title: "Error",
        description: "Failed to update analytics",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingAnalytics(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      case 'youtube':
        return '📺';
      case 'twitter':
        return '🐦';
      case 'facebook':
        return '👥';
      default:
        return '🌐';
    }
  };

  const calculateEngagementRate = () => {
    if (!latestPublished?.task_analytics?.[0]) return 0;
    return latestPublished.task_analytics[0].engagement_rate || 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-gray-500 mt-2">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Publish & Analytics
          </span>
          {isContentPublished && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Published
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="publish">Publish</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="publish" className="space-y-6 mt-6">
            {isContentPublished ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">Content Already Published</p>
                      <p className="text-sm text-green-700 mt-1">
                        Published on {format(new Date(latestPublished.created_at), 'MMM d, yyyy')} 
                        on {latestPublished.platform}
                      </p>
                    </div>
                    <a
                      href={latestPublished.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Need to update the published URL?</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPublishedUrl(latestPublished.published_url);
                      setPlatform(latestPublished.platform);
                      setPublishNotes(latestPublished.notes || '');
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Publication Details
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">📷 Instagram</SelectItem>
                      <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                      <SelectItem value="youtube">📺 YouTube</SelectItem>
                      <SelectItem value="twitter">🐦 Twitter</SelectItem>
                      <SelectItem value="facebook">👥 Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="url">Published Content URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://..."
                    value={publishedUrl}
                    onChange={(e) => setPublishedUrl(e.target.value)}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the direct link to your published post
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about the published content..."
                    value={publishNotes}
                    onChange={(e) => setPublishNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isPublishing || !publishedUrl.trim() || !platform}
                  className="w-full"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Content
                    </>
                  )}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            {!isContentPublished ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No published content yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Publish your content first to track analytics
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Analytics Overview */}
                {latestPublished.task_analytics?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Impressions</p>
                            <p className="text-2xl font-bold">
                              {latestPublished.task_analytics[0].impressions.toLocaleString()}
                            </p>
                          </div>
                          <Eye className="h-8 w-8 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Engagement</p>
                            <p className="text-2xl font-bold">
                              {calculateEngagementRate().toFixed(1)}%
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Likes</p>
                            <p className="text-2xl font-bold">
                              {latestPublished.task_analytics[0].likes.toLocaleString()}
                            </p>
                          </div>
                          <Heart className="h-8 w-8 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Comments</p>
                            <p className="text-2xl font-bold">
                              {latestPublished.task_analytics[0].comments.toLocaleString()}
                            </p>
                          </div>
                          <MessageCircle className="h-8 w-8 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Update Analytics Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Update Analytics</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab('analytics')}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="impressions">Impressions</Label>
                        <Input
                          id="impressions"
                          type="number"
                          placeholder="0"
                          value={analyticsForm.impressions}
                          onChange={(e) => setAnalyticsForm(prev => ({ 
                            ...prev, 
                            impressions: e.target.value 
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reach">Reach</Label>
                        <Input
                          id="reach"
                          type="number"
                          placeholder="0"
                          value={analyticsForm.reach}
                          onChange={(e) => setAnalyticsForm(prev => ({ 
                            ...prev, 
                            reach: e.target.value 
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="likes">Likes</Label>
                        <Input
                          id="likes"
                          type="number"
                          placeholder="0"
                          value={analyticsForm.likes}
                          onChange={(e) => setAnalyticsForm(prev => ({ 
                            ...prev, 
                            likes: e.target.value 
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="comments">Comments</Label>
                        <Input
                          id="comments"
                          type="number"
                          placeholder="0"
                          value={analyticsForm.comments}
                          onChange={(e) => setAnalyticsForm(prev => ({ 
                            ...prev, 
                            comments: e.target.value 
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shares">Shares</Label>
                        <Input
                          id="shares"
                          type="number"
                          placeholder="0"
                          value={analyticsForm.shares}
                          onChange={(e) => setAnalyticsForm(prev => ({ 
                            ...prev, 
                            shares: e.target.value 
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clicks">Link Clicks</Label>
                        <Input
                          id="clicks"
                          type="number"
                          placeholder="0"
                          value={analyticsForm.clicks}
                          onChange={(e) => setAnalyticsForm(prev => ({ 
                            ...prev, 
                            clicks: e.target.value 
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="saves">Saves/Bookmarks</Label>
                        <Input
                          id="saves"
                          type="number"
                          placeholder="0"
                          value={analyticsForm.saves}
                          onChange={(e) => setAnalyticsForm(prev => ({ 
                            ...prev, 
                            saves: e.target.value 
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleUpdateAnalytics}
                      disabled={isUpdatingAnalytics}
                      className="w-full"
                    >
                      {isUpdatingAnalytics ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Update Analytics
                        </>
                      )}
                    </Button>

                    {latestPublished.task_analytics?.[0]?.last_updated && (
                      <p className="text-xs text-gray-500 text-center">
                        Last updated: {format(
                          new Date(latestPublished.task_analytics[0].last_updated), 
                          'MMM d, yyyy h:mm a'
                        )}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            {!publishedContent || publishedContent.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No publication history yet</p>
              </div>
            ) : (
              publishedContent.map((content: PublishedContent) => (
                <Card key={content.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getPlatformIcon(content.platform)}</span>
                          <div>
                            <h4 className="font-medium capitalize">{content.platform}</h4>
                            <p className="text-sm text-gray-500">
                              Published {format(new Date(content.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>

                        {content.notes && (
                          <p className="text-sm text-gray-600 mb-2">{content.notes}</p>
                        )}

                        {content.analytics && (
                          <div className="grid grid-cols-4 gap-4 mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Impressions</p>
                              <p className="font-medium">{content.analytics.impressions.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Engagement</p>
                              <p className="font-medium">{content.analytics.engagement_rate}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Likes</p>
                              <p className="font-medium">{content.analytics.likes.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Comments</p>
                              <p className="font-medium">{content.analytics.comments.toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <a
                        href={content.published_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 ml-4"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PublishAnalyticsPanel;