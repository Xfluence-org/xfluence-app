
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';
import { taskWorkflowService, ContentReview } from '@/services/taskWorkflowService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContentReviewPanelProps {
  taskId: string;
  onReviewComplete: () => void;
}

interface TaskUpload {
  id: string;
  filename: string;
  file_url: string;
  created_at: string;
}

const ContentReviewPanel: React.FC<ContentReviewPanelProps> = ({ taskId, onReviewComplete }) => {
  const [uploads, setUploads] = useState<TaskUpload[]>([]);
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [reviewingUpload, setReviewingUpload] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const fetchedReviews = await taskWorkflowService.getContentReviews(taskId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async (uploadId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await taskWorkflowService.createContentReview(
        taskId,
        uploadId,
        status,
        feedback,
        'current_user_id'
      );
      
      setFeedback('');
      setReviewingUpload(null);
      await fetchReviews();
      onReviewComplete();
      
      toast({
        title: status === 'approved' ? "Content Approved" : "Content Rejected",
        description: `Content has been ${status} and influencer has been notified.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUploadReview = (uploadId: string) => {
    return reviews.find(review => review.upload_id === uploadId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      default:
        return <Badge variant="outline">No Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Content Review Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No content uploaded yet</p>
              <p className="text-sm mt-1">Waiting for influencer to upload content for review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload) => {
                const review = getUploadReview(upload.id);
                const isReviewing = reviewingUpload === upload.id;

                return (
                  <div key={upload.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{upload.filename}</span>
                        {getStatusBadge(review?.status || 'pending')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(upload.created_at).toLocaleString()}
                      </div>
                    </div>

                    {review?.ai_commentary && (
                      <div className="bg-blue-50 rounded p-3 text-sm">
                        <strong>AI Analysis:</strong> {review.ai_commentary}
                      </div>
                    )}

                    {review?.feedback && (
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <strong>Review Feedback:</strong> {review.feedback}
                      </div>
                    )}

                    {!review && !isReviewing && (
                      <Button
                        onClick={() => setReviewingUpload(upload.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Review Content
                      </Button>
                    )}

                    {isReviewing && (
                      <div className="space-y-3 border-t pt-3">
                        <Textarea
                          placeholder="Add your review feedback..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => submitReview(upload.id, 'approved')}
                            disabled={loading}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => submitReview(upload.id, 'rejected')}
                            disabled={loading}
                            variant="destructive"
                            className="flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
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
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentReviewPanel;
