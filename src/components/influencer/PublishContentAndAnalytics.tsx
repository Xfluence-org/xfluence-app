// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, ExternalLink, Send, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';

interface PublishContentAndAnalyticsProps {
  taskId: string;
  onComplete?: () => void;
}

interface PublishedContent {
  id: string;
  published_url: string;
  platform: string;
  created_at: string;
  analytics_data?: any;
}

const PublishContentAndAnalytics: React.FC<PublishContentAndAnalyticsProps> = ({
  taskId,
  onComplete
}) => {
  const [step, setStep] = useState<'publish' | 'analytics'>('publish');
  const [publishedContent, setPublishedContent] = useState<PublishedContent[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Publish form state
  const [publishedUrl, setPublishedUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [submittingPublish, setSubmittingPublish] = useState(false);
  
  // Analytics form state
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState({
    reach: '',
    impressions: '',
    likes: '',
    comments: '',
    shares: '',
    saves: ''
  });
  const [notes, setNotes] = useState('');
  const [submittingAnalytics, setSubmittingAnalytics] = useState(false);
  
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
      
      // Auto-select the first content for analytics
      if (data && data.length > 0) {
        setSelectedContent(data[0].id);
        setStep('analytics'); // Move to analytics if content already published
      }
    } catch (error) {
      console.error('Error fetching published content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishedUrl.trim() || !platform || !user?.id) return;

    setSubmittingPublish(true);
    try {
      const { error } = await supabase
        .from('task_published_content')
        .insert({
          task_id: taskId,
          influencer_id: user.id,
          published_url: publishedUrl,
          platform: platform,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Content Published",
        description: "Your published content has been submitted successfully!"
      });

      // Reset form and move to analytics
      setPublishedUrl('');
      setPlatform('');
      await fetchPublishedContent();
      setStep('analytics');
      
    } catch (error) {
      console.error('Error submitting published content:', error);
      toast({
        title: "Error",
        description: "Failed to submit published content",
        variant: "destructive"
      });
    } finally {
      setSubmittingPublish(false);
    }
  };

  const handleAnalyticsSubmit = async () => {
    if (!selectedContent || !user?.id) return;

    setSubmittingAnalytics(true);
    try {
      // Convert string values to numbers
      const analyticsPayload = {
        reach: parseInt(analyticsData.reach) || 0,
        impressions: parseInt(analyticsData.impressions) || 0,
        likes: parseInt(analyticsData.likes) || 0,
        comments: parseInt(analyticsData.comments) || 0,
        shares: parseInt(analyticsData.shares) || 0,
        saves: parseInt(analyticsData.saves) || 0,
        engagement_rate: 0,
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

      // Create entry in task_analytics table
      const { error: analyticsError } = await supabase
        .from('task_analytics')
        .insert({
          published_content_id: selectedContent,
          impressions: analyticsPayload.impressions,
          likes: analyticsPayload.likes,
          comments: analyticsPayload.comments,
          shares: analyticsPayload.shares,
          reach: analyticsPayload.reach,
          saves: analyticsPayload.saves,
          engagement_rate: analyticsPayload.engagement_rate
        });

      if (analyticsError) console.error('Analytics table error:', analyticsError);

      // Complete the workflow
      await Promise.all([
        supabase
          .from('task_workflow_states')
          .update({ status: 'completed' })
          .eq('task_id', taskId)
          .eq('phase', 'publish_analytics'),
        
        supabase
          .from('campaign_tasks')
          .update({ 
            status: 'completed',
            progress: 100
          })
          .eq('id', taskId)
      ]);

      toast({
        title: "Task Completed!",
        description: "Your analytics have been submitted and the task is now complete!"
      });

      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      console.error('Error submitting analytics:', error);
      toast({
        title: "Error",
        description: "Failed to submit analytics",
        variant: "destructive"
      });
    } finally {
      setSubmittingAnalytics(false);
    }
  };

  const selectedContentData = publishedContent.find(c => c.id === selectedContent);
  const hasAnalytics = selectedContentData?.analytics_data;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Publish Content */}
      {step === 'publish' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Step 1: Submit Published Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePublishSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="published-url">Published Content URL</Label>
                <Input
                  id="published-url"
                  type="url"
                  placeholder="https://..."
                  value={publishedUrl}
                  onChange={(e) => setPublishedUrl(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submittingPublish || !publishedUrl.trim() || !platform}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {submittingPublish ? 'Submitting...' : 'Submit Published Content'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Submit Analytics */}
      {step === 'analytics' && publishedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Step 2: Submit Content Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Published Content Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Published Content
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
                            Complete
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
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-green-800">Task Completed!</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Analytics have been submitted for this content. The brand can now view the performance data.
                    </p>
                  </div>
                ) : (
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
                      onClick={handleAnalyticsSubmit}
                      disabled={submittingAnalytics || !selectedContent}
                      className="w-full"
                    >
                      {submittingAnalytics ? 'Completing Task...' : 'Complete Task'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublishContentAndAnalytics;