import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AIContentAnalysis from '@/components/shared/AIContentAnalysis';

interface ContentReviewSimplifiedProps {
  taskId: string;
  campaignId: string;
}

interface TaskUpload {
  id: string;
  filename: string;
  file_url: string;
  created_at: string;
  uploader_id: string;
}

interface ContentReview {
  id: string;
  upload_id: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  reviewed_by: string;
  reviewed_at: string;
}

interface PublishedContent {
  id: string;
  published_url: string;
  platform: string;
  notes?: string;
  created_at: string;
}

const ContentReviewSimplified: React.FC<ContentReviewSimplifiedProps> = ({
  taskId,
  campaignId
}) => {
  const [uploads, setUploads] = useState<TaskUpload[]>([]);
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [publishedContent, setPublishedContent] = useState<PublishedContent[]>([]);
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      // Fetch uploads
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('task_uploads')
        .select('*')
        .eq('task_id', taskId as any)
        .order('created_at', { ascending: false });

      if (uploadsError) throw uploadsError;
      setUploads((uploadsData as any) || []);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('task_content_reviews')
        .select('*')
        .eq('task_id', taskId as any)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      const typedReviews = ((reviewsData as any) || []).map((item: any) => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      }));
      setReviews(typedReviews);

      // Fetch published content
      const { data: publishedData, error: publishedError } = await supabase
        .from('task_published_content')
        .select('*')
        .eq('task_id', taskId as any)
        .order('created_at', { ascending: false });

      if (publishedError) throw publishedError;
      setPublishedContent((publishedData as any) || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleReview = async (uploadId: string, status: 'approved' | 'rejected') => {
    if (!user?.id) return;

    setLoading(prev => ({ ...prev, [uploadId]: true }));
    try {
      const { error } = await supabase
        .from('task_content_reviews')
        .upsert({
          task_id: taskId,
          upload_id: uploadId,
          status,
          feedback: feedback[uploadId] || '',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        } as any, {
          onConflict: 'upload_id'
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: `Content ${status === 'approved' ? 'approved' : 'rejected'} successfully.`
      });

      // Clear feedback for this upload
      setFeedback(prev => ({ ...prev, [uploadId]: '' }));
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [uploadId]: false }));
    }
  };

  const getReviewForUpload = (uploadId: string) => {
    return reviews.find(review => review.upload_id === uploadId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    }
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
        <CardContent className="space-y-6">
          {uploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No content uploaded yet</p>
              <p className="text-sm mt-1">Waiting for influencer to upload content for review</p>
            </div>
          ) : (
            uploads.map((upload) => {
              const review = getReviewForUpload(upload.id);
              const isReviewed = review && review.status !== 'pending';
              
              return (
                <div key={upload.id} className="space-y-4">
                  {/* Upload Info */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {upload.filename.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{upload.filename}</h4>
                            <p className="text-sm text-gray-500">
                              Uploaded {new Date(upload.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(review?.status || 'pending')}
                      </div>

                      {review && review.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Feedback:</p>
                          <p className="text-sm text-gray-900">{review.feedback}</p>
                        </div>
                      )}

                      {!isReviewed && (
                        <div className="mt-4 space-y-3">
                          <Textarea
                            value={feedback[upload.id] || ''}
                            onChange={(e) => setFeedback(prev => ({ ...prev, [upload.id]: e.target.value }))}
                            placeholder="Add feedback for the influencer (optional)..."
                            className="min-h-20"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReview(upload.id, 'approved')}
                              disabled={loading[upload.id]}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {loading[upload.id] ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              onClick={() => handleReview(upload.id, 'rejected')}
                              disabled={loading[upload.id]}
                              variant="destructive"
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              {loading[upload.id] ? 'Processing...' : 'Request Changes'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Analysis */}
                  <AIContentAnalysis 
                    uploadId={upload.id}
                    filename={upload.filename}
                    isVisible={true}
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Published Content Section */}
      {publishedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Published Content Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {publishedContent.map((content) => (
              <Card key={content.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-100 text-green-800">Published</Badge>
                        <span className="text-sm text-gray-600">{content.platform}</span>
                      </div>
                      <a 
                        href={content.published_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all text-sm"
                      >
                        {content.published_url}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">
                        Published {new Date(content.created_at).toLocaleDateString()}
                      </p>
                      {content.notes && (
                        <p className="text-sm text-gray-700 mt-2">{content.notes}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => window.open(content.published_url, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentReviewSimplified;