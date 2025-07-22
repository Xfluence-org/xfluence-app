import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Check, X, MessageSquare, Brain, Sparkles, BarChart3, Download } from 'lucide-react';
import { taskWorkflowService, ContentReview } from '@/services/taskWorkflowService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import AIContentAnalysis from '../shared/AIContentAnalysis';

interface ContentReviewPanelEnhancedProps {
  taskId: string;
  onReviewComplete?: () => void;
}

interface Upload {
  id: string;
  filename: string;
  file_url: string;
  created_at: string;
  caption?: string;
  hashtags?: string;
}

const ContentReviewPanelEnhanced: React.FC<ContentReviewPanelEnhancedProps> = ({
  taskId,
  onReviewComplete
}) => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [reviewingUpload, setReviewingUpload] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchUploads();
    fetchReviews();
  }, [taskId]);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('task_uploads')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploads(data || []);
      
      // Auto-select first upload if none selected
      if (data && data.length > 0 && !selectedUpload) {
        setSelectedUpload(data[0]);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await taskWorkflowService.getContentReviews(taskId);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const toggleAIAnalysis = (uploadId: string) => {
    setShowAIAnalysis(prev => ({
      ...prev,
      [uploadId]: !prev[uploadId]
    }));
  };

  const handleReview = async (uploadId: string, status: 'approved' | 'rejected') => {
    if (!user?.id) return;

    const optimisticReview: ContentReview = {
      id: `temp-${Date.now()}`,
      task_id: taskId,
      upload_id: uploadId,
      ai_commentary: '',
      status: status as 'approved' | 'rejected',
      feedback: feedback,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    setReviews(prev => [...prev, optimisticReview]);
    setReviewingUpload(null);
    setFeedback('');
    
    toast({
      title: status === 'approved' ? 'Content Approved' : 'Content Rejected',
      description: status === 'approved' 
        ? 'The content has been approved and influencer can now publish it.' 
        : 'The content has been rejected with feedback for revision.',
    });

    try {
      setIsSubmitting(true);
      await taskWorkflowService.createContentReview(
        taskId,
        uploadId,
        status,
        feedback,
        user.id
      );
      
      await fetchReviews();
      queryClient.invalidateQueries({ queryKey: ['brand-participant-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-tasks'] });
      
      onReviewComplete?.();
    } catch (error) {
      console.error('Error creating review:', error);
      setReviews(prev => prev.filter(r => r.id !== optimisticReview.id));
      
      toast({
        title: 'Error',
        description: 'Failed to save review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    const unreviewed = uploads.filter(upload => !getReviewForUpload(upload.id));
    
    for (const upload of unreviewed) {
      await handleReview(upload.id, 'approved');
    }
    
    toast({
      title: 'Bulk Approval Complete',
      description: `Approved ${unreviewed.length} content uploads.`,
      className: "bg-green-50 border-green-200"
    });
  };

  const getReviewForUpload = (uploadId: string) => {
    return reviews.find(review => review.upload_id === uploadId);
  };

  const getUploadStatusStats = () => {
    const total = uploads.length;
    const approved = uploads.filter(upload => {
      const review = getReviewForUpload(upload.id);
      return review?.status === 'approved';
    }).length;
    const rejected = uploads.filter(upload => {
      const review = getReviewForUpload(upload.id);
      return review?.status === 'rejected';
    }).length;
    const pending = total - approved - rejected;

    return { total, approved, rejected, pending };
  };

  const stats = getUploadStatusStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Review & AI Analysis
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </CardTitle>
            
            {stats.pending > 0 && (
              <Button 
                onClick={handleBulkApprove}
                variant="outline"
                size="sm"
                className="bg-green-50 border-green-200 hover:bg-green-100"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve All ({stats.pending})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          {uploads.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="border border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Uploads</div>
                </CardContent>
              </Card>
              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
                  <div className="text-sm text-green-600">Approved</div>
                </CardContent>
              </Card>
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
                  <div className="text-sm text-red-600">Rejected</div>
                </CardContent>
              </Card>
              <Card className="border border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </CardContent>
              </Card>
            </div>
          )}

          {uploads.length > 0 ? (
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploads.map((upload) => {
                    const review = getReviewForUpload(upload.id);
                    const isReviewing = reviewingUpload === upload.id;

                    return (
                      <Card key={upload.id} className={`border-l-4 ${
                        review?.status === 'approved' ? 'border-l-green-500' :
                        review?.status === 'rejected' ? 'border-l-red-500' : 'border-l-blue-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 truncate">{upload.filename}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(upload.created_at).toLocaleDateString()}
                              </p>
                              {upload.caption && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  "{upload.caption}"
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {review ? (
                                <Badge 
                                  className={
                                    review.status === 'approved' 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="space-y-2">
                            <Button
                              onClick={() => toggleAIAnalysis(upload.id)}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Brain className="h-3 w-3 mr-1" />
                              {showAIAnalysis[upload.id] ? 'Hide' : 'Show'} AI Analysis
                            </Button>

                            {!review && !isReviewing && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleReview(upload.id, 'approved')}
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => setReviewingUpload(upload.id)}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Review
                                </Button>
                              </div>
                            )}

                            {isReviewing && (
                              <div className="space-y-2">
                                <Textarea
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Add feedback..."
                                  rows={2}
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleReview(upload.id, 'approved')}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleReview(upload.id, 'rejected')}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setReviewingUpload(null);
                                      setFeedback('');
                                    }}
                                    size="sm"
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* AI Analysis */}
                          {showAIAnalysis[upload.id] && (
                            <div className="mt-4">
                              <AIContentAnalysis 
                                uploadId={upload.id} 
                                filename={upload.filename} 
                                isVisible={true}
                              />
                            </div>
                          )}

                          {/* Review Display */}
                          {review && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Review</span>
                                <Badge 
                                  className={
                                    review.status === 'approved' 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                </Badge>
                              </div>
                              {review.feedback && (
                                <p className="text-sm text-gray-900">{review.feedback}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Reviewed {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-6">
                {uploads.map((upload) => {
                  const review = getReviewForUpload(upload.id);
                  const isReviewing = reviewingUpload === upload.id;

                  return (
                    <Card key={upload.id} className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{upload.filename}</CardTitle>
                            <p className="text-sm text-gray-500">
                              Uploaded {new Date(upload.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {review ? (
                              <Badge 
                                className={
                                  review.status === 'approved' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              >
                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Pending Review</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Content Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-1">Content File</p>
                              <p className="text-sm text-gray-600">{upload.filename}</p>
                            </div>
                            
                            {upload.caption && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">Caption</p>
                                <p className="text-sm text-gray-600">"{upload.caption}"</p>
                              </div>
                            )}
                            
                            {upload.hashtags && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">Hashtags</p>
                                <p className="text-sm text-gray-600">{upload.hashtags}</p>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <AIContentAnalysis 
                              uploadId={upload.id} 
                              filename={upload.filename} 
                              isVisible={true}
                            />
                          </div>
                        </div>

                        {/* Review Actions */}
                        {!review && !isReviewing && (
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleReview(upload.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve Content
                            </Button>
                            <Button
                              onClick={() => setReviewingUpload(upload.id)}
                              variant="outline"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Review with Feedback
                            </Button>
                          </div>
                        )}

                        {isReviewing && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Review Feedback
                              </label>
                              <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide detailed feedback for the influencer..."
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReview(upload.id, 'approved')}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReview(upload.id, 'rejected')}
                                disabled={isSubmitting}
                                variant="destructive"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Request Changes
                              </Button>
                              <Button
                                onClick={() => {
                                  setReviewingUpload(null);
                                  setFeedback('');
                                }}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Review Display */}
                        {review && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-700">Review Decision</span>
                              <Badge 
                                className={
                                  review.status === 'approved' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              >
                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                              </Badge>
                            </div>
                            {review.feedback && (
                              <p className="text-sm text-gray-900 mb-2">{review.feedback}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Reviewed on {new Date(review.created_at).toLocaleDateString()} at {new Date(review.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  No content uploads yet
                </h3>
                <p className="text-gray-600 mb-4">
                  The influencer hasn't uploaded any content for review yet. 
                  They will see this phase once you share content requirements.
                </p>
                <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>AI-powered content analysis will appear here</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Automated scoring and recommendations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentReviewPanelEnhanced;