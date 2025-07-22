import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, CheckCircle, XCircle, MessageSquare, Download, RefreshCw, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { useTaskWorkflow } from '@/hooks/useTaskWorkflow';
import AIContentAnalysis from '@/components/shared/AIContentAnalysis';

interface ContentReviewPanelEnhancedProps {
  taskId: string;
  onReviewComplete?: () => void;
}

interface Upload {
  id: string;
  filename: string;
  file_url: string;
  mime_type: string;
  created_at: string;
  caption?: string;
  hashtags?: string;
}

interface ContentReview {
  id: string;
  upload_id: string;
  status: 'approved' | 'rejected' | 'pending';
  feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

const ContentReviewPanelEnhanced: React.FC<ContentReviewPanelEnhancedProps> = ({
  taskId,
  onReviewComplete
}) => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingUploadId, setReviewingUploadId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();
  const { createContentReview } = useTaskWorkflow(taskId);

  useEffect(() => {
    fetchUploadsAndReviews();
  }, [taskId]);

  const fetchUploadsAndReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch uploads
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('task_uploads')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (uploadsError) throw uploadsError;

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('task_content_reviews')
        .select('*')
        .eq('task_id', taskId);

      if (reviewsError) throw reviewsError;

      setUploads(uploadsData || []);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching uploads and reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load content for review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (uploadId: string, status: 'approved' | 'rejected') => {
    try {
      setReviewingUploadId(uploadId);
      
      await createContentReview({
        taskId,
        uploadId,
        status,
        feedback: feedback.trim() || undefined,
        reviewedBy: 'brand'
      });

      toast({
        title: "Review Submitted",
        description: `Content has been ${status}`,
        className: "bg-green-50 border-green-200"
      });

      setFeedback('');
      await fetchUploadsAndReviews();
      onReviewComplete?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setReviewingUploadId(null);
    }
  };

  const getReviewForUpload = (uploadId: string) => {
    return reviews.find(review => review.upload_id === uploadId);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    } else if (mimeType?.startsWith('video/')) {
      return <Video className="h-5 w-5 text-purple-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFilePreview = (upload: Upload) => {
    if (upload.mime_type?.startsWith('image/')) {
      return (
        <div className="relative">
          <img
            src={upload.file_url}
            alt={upload.filename}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
      );
    } else if (upload.mime_type?.startsWith('video/')) {
      return (
        <div className="relative">
          <video
            src={upload.file_url}
            controls
            className="w-full h-48 object-cover rounded-lg"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      return (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{upload.filename}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.open(upload.file_url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      );
    }
  };

  const getStatusBadge = (review: ContentReview | undefined) => {
    if (!review) {
      return <Badge variant="outline">Pending Review</Badge>;
    }

    switch (review.status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading content for review...</p>
        </CardContent>
      </Card>
    );
  }

  if (uploads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Content Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Content to Review</h3>
            <p className="text-gray-600">
              The influencer hasn't uploaded any content yet. Content will appear here once uploaded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Review ({uploads.length} {uploads.length === 1 ? 'item' : 'items'})
            </CardTitle>
            <Button onClick={fetchUploadsAndReviews} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {uploads.map((upload) => {
            const review = getReviewForUpload(upload.id);
            const isReviewing = reviewingUploadId === upload.id;

            return (
              <div key={upload.id} className="border rounded-lg p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(upload.mime_type)}
                    <div>
                      <h3 className="font-medium">{upload.filename}</h3>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(upload.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(review)}
                </div>

                {/* Content Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* File Preview */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Content Preview</h4>
                    {getFilePreview(upload)}
                    
                    {/* Caption and Hashtags */}
                    {(upload.caption || upload.hashtags) && (
                      <div className="space-y-2">
                        {upload.caption && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Caption:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {upload.caption}
                            </p>
                          </div>
                        )}
                        {upload.hashtags && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Hashtags:</p>
                            <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              {upload.hashtags}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium">AI Content Analysis</h4>
                    <AIContentAnalysis
                      uploadId={upload.id}
                      filename={upload.filename}
                      fileUrl={upload.file_url}
                      isVisible={true}
                    />
                  </div>
                </div>

                {/* Review Section */}
                {!review && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Review Content</h4>
                    <Textarea
                      placeholder="Add feedback or comments (optional)..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReview(upload.id, 'approved')}
                        disabled={isReviewing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isReviewing ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleReview(upload.id, 'rejected')}
                        disabled={isReviewing}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {isReviewing ? 'Rejecting...' : 'Request Changes'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Existing Review */}
                {review && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Review Status:</span>
                          {getStatusBadge(review)}
                          {review.reviewed_at && (
                            <span className="text-xs text-gray-500">
                              {new Date(review.reviewed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {review.feedback && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {review.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentReviewPanelEnhanced;
