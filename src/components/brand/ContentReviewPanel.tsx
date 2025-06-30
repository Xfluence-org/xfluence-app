
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X, MessageSquare } from 'lucide-react';
import { taskWorkflowService, ContentReview } from '@/services/taskWorkflowService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ContentReviewPanelProps {
  taskId: string;
  onReviewComplete?: () => void;
}

interface Upload {
  id: string;
  filename: string;
  file_url: string;
  created_at: string;
}

const ContentReviewPanel: React.FC<ContentReviewPanelProps> = ({
  taskId,
  onReviewComplete
}) => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [reviewingUpload, setReviewingUpload] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleReview = async (uploadId: string, status: 'approved' | 'rejected') => {
    if (!user?.id) return;

    // Create optimistic review
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

    // Optimistically update local state
    setReviews(prev => [...prev, optimisticReview]);
    setReviewingUpload(null);
    setFeedback('');
    
    // Show immediate toast feedback
    toast({
      title: status === 'approved' ? 'Content Approved' : 'Content Rejected',
      description: status === 'approved' 
        ? 'The content has been approved successfully.' 
        : 'The content has been rejected with feedback.',
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
      
      // Refresh actual data from server
      await fetchReviews();
      
      // Invalidate queries to refresh other components
      queryClient.invalidateQueries({ queryKey: ['brand-participant-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-tasks'] });
      
      onReviewComplete?.();
    } catch (error) {
      console.error('Error creating review:', error);
      
      // Rollback optimistic update on error
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

  const getReviewForUpload = (uploadId: string) => {
    return reviews.find(review => review.upload_id === uploadId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Content Review & Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length > 0 ? (
            <div className="space-y-4">
              {uploads.map((upload) => {
                const review = getReviewForUpload(upload.id);
                const isReviewing = reviewingUpload === upload.id;

                return (
                  <Card key={upload.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{upload.filename}</h4>
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
                                  : review.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending Review</Badge>
                          )}
                        </div>
                      </div>

                      {/* File preview/link */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Content file: <span className="font-medium">{upload.filename}</span>
                        </p>
                      </div>

                      {/* Review section */}
                      {!review && !isReviewing && (
                        <Button
                          onClick={() => setReviewingUpload(upload.id)}
                          variant="outline"
                          size="sm"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Review Content
                        </Button>
                      )}

                      {isReviewing && (
                        <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Review Feedback (Optional)
                            </label>
                            <Textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Add feedback for the influencer..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReview(upload.id, 'approved')}
                              disabled={isSubmitting}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleReview(upload.id, 'rejected')}
                              disabled={isSubmitting}
                              variant="destructive"
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </>
                              )}
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

                      {review && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  No content uploads yet
                </h3>
                <p className="text-gray-600">
                  The influencer hasn't uploaded any content for review yet. 
                  They will see this phase once you share content requirements.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentReviewPanel;
