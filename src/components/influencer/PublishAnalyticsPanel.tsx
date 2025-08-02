// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';

interface PublishAnalyticsPanelProps {
  taskId: string;
  onAnalyticsSubmitted?: () => void;
  onPublishComplete?: () => void;
}

interface PublishedContent {
  id: string;
  published_url: string;
  platform: string;
  created_at: string;
  analytics_data?: any;
}

const PublishAnalyticsPanel: React.FC<PublishAnalyticsPanelProps> = ({
  taskId,
  onAnalyticsSubmitted
}) => {
  const [publishedContent, setPublishedContent] = useState<PublishedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState({
    reach: '',
    impressions: '',
    likes: '',
    comments: '',
    shares: '',
    clicks: '',
    saves: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPublishedContent();
  }, [taskId]);

  const fetchPublishedContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_published_content')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublishedContent(data || []);
      
      // Auto-select the first content if available
      if (data && data.length > 0 && !selectedContent) {
        setSelectedContent(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching published content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnalytics = async () => {
    if (!selectedContent || !user?.id) return;

    setSubmitting(true);
    try {
      // Convert string values to numbers
      const analyticsPayload = {
        reach: parseInt(analyticsData.reach) || 0,
        impressions: parseInt(analyticsData.impressions) || 0,
        likes: parseInt(analyticsData.likes) || 0,
        comments: parseInt(analyticsData.comments) || 0,
        shares: parseInt(analyticsData.shares) || 0,
        clicks: parseInt(analyticsData.clicks) || 0,
        saves: parseInt(analyticsData.saves) || 0,
        engagement_rate: 0, // Will be calculated
        reported_at: new Date().toISOString(),
        reported_by: user.id
      };

      // Calculate engagement rate
      const totalEngagements = analyticsPayload.likes + analyticsPayload.comments + analyticsPayload.shares + analyticsPayload.saves;
      if (analyticsPayload.reach > 0) {
        analyticsPayload.engagement_rate = (totalEngagements / analyticsPayload.reach) * 100;
      }

      // Update the published content with analytics data
      const { error: updateError } = await supabase
        .from('task_published_content')
        .update({
          analytics_data: analyticsPayload,
          notes: notes,
          status: 'completed'
        })
        .eq('id', selectedContent);

      if (updateError) throw updateError;

      // Also create an entry in task_analytics table
      const { error: analyticsError } = await supabase
        .from('task_analytics')
        .insert({
          published_content_id: selectedContent,
          impressions: analyticsPayload.impressions,
          likes: analyticsPayload.likes,
          comments: analyticsPayload.comments,
          shares: analyticsPayload.shares,
          reach: analyticsPayload.reach,
          clicks: analyticsPayload.clicks,
          saves: analyticsPayload.saves,
          engagement_rate: analyticsPayload.engagement_rate
        });

      if (analyticsError) console.error('Analytics table error:', analyticsError);

      // Complete the publish_analytics workflow phase
      const { error: workflowError } = await supabase
        .from('task_workflow_states')
        .update({ status: 'completed' })
        .eq('task_id', taskId)
        .eq('phase', 'publish_analytics');

      if (workflowError) console.error('Workflow update error:', workflowError);

      // Update task completion
      const { error: taskError } = await supabase
        .from('campaign_tasks')
        .update({ 
          status: 'completed',
          progress: 100
        })
        .eq('id', taskId);

      if (taskError) console.error('Task update error:', taskError);

      toast({
        title: "Analytics Submitted",
        description: "Your content analytics have been submitted successfully!"
      });

      // Reset form
      setAnalyticsData({
        reach: '',
        impressions: '',
        likes: '',
        comments: '',
        shares: '',
        clicks: '',
        saves: ''
      });
      setNotes('');
      
      // Refresh data
      await fetchPublishedContent();
      
      if (onAnalyticsSubmitted) {
        onAnalyticsSubmitted();
      }

    } catch (error) {
      console.error('Error submitting analytics:', error);
      toast({
        title: "Error",
        description: "Failed to submit analytics",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedContentData = publishedContent.find(c => c.id === selectedContent);
  const hasAnalytics = selectedContentData?.analytics_data;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading published content...</p>
        </CardContent>
      </Card>
    );
  }

  if (publishedContent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Submit Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No Published Content</h3>
          <p className="text-gray-600">
            You need to publish content first before you can submit analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Submit Content Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Published Content Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Select Published Content
          </Label>
          <div className="space-y-2">
            {publishedContent.map((content) => (
              <div
                key={content.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedContent === content.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedContent(content.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{content.platform}</p>
                    <p className="text-sm text-gray-500">
                      Published {new Date(content.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={content.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {content.analytics_data && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Analytics Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedContentData && (
          <>
            {hasAnalytics ? (
              /* Show submitted analytics */
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-3">Analytics Already Submitted</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedContentData.analytics_data.reach?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-600">Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedContentData.analytics_data.impressions?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-600">Impressions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedContentData.analytics_data.likes?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedContentData.analytics_data.comments?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-600">Comments</div>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  Analytics have been submitted for this content. The brand can now view the performance data.
                </p>
              </div>
            ) : (
              /* Analytics submission form */
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Submit Analytics Data</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="reach">Reach</Label>
                    <Input
                      id="reach"
                      type="number"
                      placeholder="0"
                      value={analyticsData.reach}
                      onChange={(e) => setAnalyticsData(prev => ({ ...prev, reach: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="impressions">Impressions</Label>
                    <Input
                      id="impressions"
                      type="number"
                      placeholder="0"
                      value={analyticsData.impressions}
                      onChange={(e) => setAnalyticsData(prev => ({ ...prev, impressions: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="likes">Likes</Label>
                    <Input
                      id="likes"
                      type="number"
                      placeholder="0"
                      value={analyticsData.likes}
                      onChange={(e) => setAnalyticsData(prev => ({ ...prev, likes: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="comments">Comments</Label>
                    <Input
                      id="comments"
                      type="number"
                      placeholder="0"
                      value={analyticsData.comments}
                      onChange={(e) => setAnalyticsData(prev => ({ ...prev, comments: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="shares">Shares</Label>
                    <Input
                      id="shares"
                      type="number"
                      placeholder="0"
                      value={analyticsData.shares}
                      onChange={(e) => setAnalyticsData(prev => ({ ...prev, shares: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="saves">Saves</Label>
                    <Input
                      id="saves"
                      type="number"
                      placeholder="0"
                      value={analyticsData.saves}
                      onChange={(e) => setAnalyticsData(prev => ({ ...prev, saves: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional insights or notes about the content performance..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button
                  onClick={handleSubmitAnalytics}
                  disabled={submitting || !selectedContent}
                  className="w-full"
                >
                  {submitting ? 'Submitting Analytics...' : 'Submit Analytics'}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PublishAnalyticsPanel;