import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Image,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
  Download,
  Sparkles,
  FileText,
  Send,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { activityLogService } from '@/services/activityLogService';

interface ContentReviewDashboardProps {
  campaignId: string;
}

interface SubmittedContent {
  id: string;
  task_id: string;
  filename: string;
  file_url: string;
  mime_type: string;
  caption?: string;
  hashtags?: string;
  created_at: string;
  uploader: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    title: string;
    task_type: string;
  };
  review?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback?: string;
    reviewed_at?: string;
  };
}

const ContentReviewDashboard: React.FC<ContentReviewDashboardProps> = ({ campaignId }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedContent, setSelectedContent] = useState<SubmittedContent | null>(null);
  const [feedback, setFeedback] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch submitted content for review
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['content-submissions', campaignId],
    queryFn: async () => {
      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id, user?.email);
      // Check if current user has access to this campaign through brand_users
      const { data: brandAccess } = await supabase
        .from('campaigns')
        .select(`
          id,
          brand_id,
          brands!inner(
            id,
            brand_users!inner(
              user_id
            )
          )
        `)
        .eq('id', campaignId)
        .eq('brands.brand_users.user_id', user?.id)
        .single();
      
      console.log('Brand access check:', brandAccess);

      const { data: tasks, error: tasksError } = await supabase
        .from('campaign_tasks')
        .select('id')
        .eq('campaign_id', campaignId);

      console.log('Campaign tasks for review:', tasks, 'Error:', tasksError);

      if (!tasks || tasks.length === 0) return [];

      const taskIds = tasks.map(t => t.id);
      console.log('Task IDs to check:', taskIds);

      // First, let's check if uploads exist
      const { data: uploadsCheck, error: uploadsError } = await supabase
        .from('task_uploads')
        .select('*')
        .in('task_id', taskIds);
      
      console.log('Uploads check:', uploadsCheck, 'Error:', uploadsError);

      const { data, error } = await supabase
        .from('task_uploads')
        .select(`
          *,
          profiles:uploader_id(id, name),
          task_content_reviews(
            id,
            status,
            feedback,
            created_at
          )
        `)
        .in('task_id', taskIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content submissions:', error);
        throw error;
      }

      console.log('Content submissions raw data:', data);

      // Fetch task details separately
      const tasksMap = new Map();
      for (const task of tasks) {
        const { data: taskDetail } = await supabase
          .from('campaign_tasks')
          .select('id, title, task_type')
          .eq('id', task.id)
          .single();
        
        if (taskDetail) {
          tasksMap.set(taskDetail.id, taskDetail);
        }
      }

      return data?.map(item => ({
        id: item.id,
        task_id: item.task_id,
        filename: item.filename,
        file_url: item.file_url,
        mime_type: item.mime_type,
        caption: item.caption,
        hashtags: item.hashtags,
        created_at: item.created_at,
        uploader: {
          id: item.profiles?.id || item.uploader_id,
          name: item.profiles?.name || 'Unknown'
        },
        task: tasksMap.get(item.task_id) || {
          id: item.task_id,
          title: 'Task',
          task_type: 'content_creation'
        },
        review: item.task_content_reviews?.[0]
      })) || [];
    }
  });

  const pendingSubmissions = submissions.filter(s => !s.review || s.review.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.review?.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.review?.status === 'rejected');

  const generateAIAnalysis = async (content: SubmittedContent) => {
    setIsGeneratingAI(true);
    try {
      // Simulated AI analysis - in production, this would call an AI service
      const analysis = `AI Content Analysis:

✅ Brand Alignment: The content aligns well with brand guidelines and messaging.

📊 Quality Score: 8.5/10
- Image/Video quality: Excellent
- Caption engagement: Strong
- Hashtag relevance: Good

💡 Suggestions:
- Consider adding a call-to-action at the end
- The lighting could be slightly improved
- Great use of brand colors

🎯 Target Audience Match: 92%
The content appeals to the intended demographic effectively.`;

      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI analysis",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedContent) return;

    if (status === 'rejected' && !feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback when rejecting content",
        variant: "destructive"
      });
      return;
    }

    setIsReviewing(true);
    try {
      // Create or update review
      if (selectedContent.review) {
        await supabase
          .from('task_content_reviews')
          .update({
            status,
            feedback: feedback.trim(),
            reviewed_at: new Date().toISOString()
          })
          .eq('id', selectedContent.review.id);
      } else {
        const { error: insertError } = await supabase
          .from('task_content_reviews')
          .insert({
            task_id: selectedContent.task_id,
            upload_id: selectedContent.id,
            reviewed_by: (await supabase.auth.getUser()).data.user?.id,
            status,
            feedback: feedback.trim(),
            reviewed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error creating review:', insertError);
          throw insertError;
        }
      }

      // Update task workflow if approved
      if (status === 'approved') {
        await supabase
          .from('task_workflow_states')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('task_id', selectedContent.task_id)
          .eq('phase', 'content_review');

        // Activate next phase
        await supabase
          .from('task_workflow_states')
          .insert({
            task_id: selectedContent.task_id,
            phase: 'publish_analytics',
            status: 'active'
          });
      }

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await activityLogService.logContentReview(
          selectedContent.task_id,
          campaignId,
          user.id,
          status,
          feedback.trim() || undefined
        );
      }

      toast({
        title: status === 'approved' ? "Content Approved" : "Revision Requested",
        description: status === 'approved' 
          ? "The content has been approved and the influencer can proceed to publish."
          : "Feedback has been sent to the influencer for revisions."
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['content-submissions', campaignId] });
      setSelectedContent(null);
      setFeedback('');
      setAiAnalysis('');
    } catch (error) {
      console.error('Error reviewing content:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const getMediaPreview = (content: SubmittedContent) => {
    if (content.mime_type.startsWith('image/')) {
      return (
        <img 
          src={content.file_url} 
          alt="Content preview" 
          className="w-full h-64 object-cover rounded-lg"
        />
      );
    } else if (content.mime_type.startsWith('video/')) {
      return (
        <video 
          src={content.file_url} 
          controls 
          className="w-full h-64 rounded-lg"
        />
      );
    }
    return null;
  };

  const ContentCard = ({ content }: { content: SubmittedContent }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedContent(content)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {content.mime_type.startsWith('image/') ? (
              <Image className="h-5 w-5 text-gray-500" />
            ) : (
              <Video className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <h4 className="font-medium">{content.uploader.name}</h4>
              <p className="text-sm text-gray-500">{content.task.title}</p>
            </div>
          </div>
          <Badge variant="outline">
            {new Date(content.created_at).toLocaleDateString()}
          </Badge>
        </div>

        {/* Media Preview Thumbnail */}
        <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 h-48">
          {content.mime_type.startsWith('image/') ? (
            <img src={content.file_url} alt="Thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {content.caption && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-2">{content.caption}</p>
        )}

        <Button className="w-full" variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Review Content
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Review Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved ({approvedSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Needs Revision ({rejectedSubmissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No content pending review</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingSubmissions.map(content => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              {approvedSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No approved content yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedSubmissions.map(content => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              {rejectedSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No content needs revision</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedSubmissions.map(content => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Content</DialogTitle>
            <DialogDescription>
              Review submitted content from {selectedContent?.uploader.name}
            </DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-6">
              {/* Media Preview */}
              <div>
                <label className="text-sm font-medium mb-2 block">Media Preview</label>
                {getMediaPreview(selectedContent)}
              </div>

              {/* Caption & Hashtags */}
              {selectedContent.caption && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Caption</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedContent.caption}</p>
                    {selectedContent.hashtags && (
                      <p className="text-sm text-blue-600 mt-2">{selectedContent.hashtags}</p>
                    )}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">AI Analysis</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateAIAnalysis(selectedContent)}
                    disabled={isGeneratingAI}
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Analysis
                      </>
                    )}
                  </Button>
                </div>
                {aiAnalysis ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{aiAnalysis}</pre>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                    <p className="text-sm">Click "Generate Analysis" for AI-powered content review</p>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Feedback {activeTab === 'pending' && '(Required for rejection)'}
                </label>
                <Textarea
                  placeholder="Provide feedback for the influencer..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              {(!selectedContent.review || selectedContent.review.status === 'pending') && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReview('rejected')}
                    disabled={isReviewing}
                    variant="outline"
                    className="flex-1"
                  >
                    {isReviewing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Request Revision
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReview('approved')}
                    disabled={isReviewing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isReviewing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Content
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Existing Review Status */}
              {selectedContent.review && selectedContent.review.status !== 'pending' && (
                <div className={`p-4 rounded-lg ${
                  selectedContent.review.status === 'approved' 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">
                    {selectedContent.review.status === 'approved' ? 'Content Approved' : 'Revision Requested'}
                  </p>
                  {selectedContent.review.feedback && (
                    <p className="text-sm mt-1">{selectedContent.review.feedback}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentReviewDashboard;