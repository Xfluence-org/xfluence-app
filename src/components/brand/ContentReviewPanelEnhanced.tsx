// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Maximize2,
  X,
  Clock,
  Calendar
} from 'lucide-react';
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
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const { toast } = useToast();
  const { createContentReview } = useTaskWorkflow(taskId);

  useEffect(() => {
    if (taskId) {
      fetchUploadsAndReviews();
    } else {
      setLoading(false);
    }
  }, [taskId]);

  const fetchUploadsAndReviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching uploads for taskId:', taskId);
      
      // Fetch uploads
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('task_uploads')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (uploadsError) {
        console.error('Upload fetch error:', uploadsError);
        throw uploadsError;
      }

      console.log('Uploads fetched:', uploadsData);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('task_content_reviews')
        .select('*')
        .eq('task_id', taskId);

      if (reviewsError) {
        console.error('Reviews fetch error:', reviewsError);
        throw reviewsError;
      }

      console.log('Reviews fetched:', reviewsData);

      setUploads(uploadsData || []);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching uploads and reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load content for review",
        variant: "destructive"
      });
      setUploads([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (uploadId: string, status: 'approved' | 'rejected') => {
    try {
      setReviewingUploadId(uploadId);
      
      const currentFeedback = feedbacks[uploadId] || '';
      
      await createContentReview({
        taskId,
        uploadId,
        status,
        feedback: currentFeedback.trim() || undefined,
        // Use the actual brand user ID instead of the string "brand"
        reviewedBy: undefined // Let the backend handle this
      });

      toast({
        title: "Review Submitted",
        description: `Content has been ${status}`,
        className: "bg-green-50 border-green-200"
      });

      // Clear feedback for this upload
      setFeedbacks(prev => {
        const updated = { ...prev };
        delete updated[uploadId];
        return updated;
      });
      
      await fetchUploadsAndReviews();
      
      // Trigger refresh of parent components
      onReviewComplete?.();
      
      // Dispatch custom event to refresh dashboard/workflow data
      window.dispatchEvent(new CustomEvent('refreshTaskData', { detail: { taskId } }));
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

  const handleDownload = async (upload: Upload) => {
    try {
      window.open(upload.file_url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const openFullScreen = (upload: Upload) => {
    setSelectedUpload(upload);
    setIsFullScreenOpen(true);
  };

  const getReviewForUpload = (uploadId: string) => {
    return reviews.find(review => review.upload_id === uploadId);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-[#1DDCD3]" />;
    } else if (mimeType?.startsWith('video/')) {
      return <Video className="h-5 w-5 text-purple-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFilePreview = (upload: Upload, isClickable = true) => {
    const handleClick = isClickable ? () => openFullScreen(upload) : undefined;

    if (upload.mime_type?.startsWith('image/')) {
      return (
        <div 
          className="relative group cursor-pointer overflow-hidden rounded-xl"
          onClick={handleClick}
        >
          <img
            src={upload.file_url}
            alt={upload.filename}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          {isClickable && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      );
    } else if (upload.mime_type?.startsWith('video/')) {
      return (
        <div className="relative group cursor-pointer overflow-hidden rounded-xl" onClick={handleClick}>
          <video
            src={upload.file_url}
            controls
            className="w-full h-64 object-cover rounded-xl"
            preload="metadata"
            onClick={(e) => e.stopPropagation()}
          >
            Your browser does not support the video tag.
          </video>
          {isClickable && (
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  openFullScreen(upload);
                }}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">{upload.filename}</p>
            <p className="text-xs text-gray-500 mb-4">Click to download</p>
          </div>
        </div>
      );
    }
  };

  const getStatusBadge = (review: ContentReview | undefined) => {
    if (!review) {
      return (
        <Badge className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      );
    }

    switch (review.status) {
      case 'approved':
        return (
          <Badge className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 text-[#1DDCD3] mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading content for review...</p>
        </CardContent>
      </Card>
    );
  }

  if (uploads.length === 0) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-[#1a1f2e]">
            <Eye className="h-5 w-5 text-[#1DDCD3]" />
            Content Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1DDCD3]/10 rounded-full mb-4">
              <Eye className="h-8 w-8 text-[#1DDCD3]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1a1f2e] mb-2">No Content to Review</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              The influencer hasn't uploaded any content yet. Content will appear here once uploaded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#1a1f2e]">
                <Eye className="h-5 w-5 text-[#1DDCD3]" />
                Content Review
                <Badge variant="secondary" className="ml-2">
                  {uploads.length} {uploads.length === 1 ? 'item' : 'items'}
                </Badge>
              </CardTitle>
              <Button 
                onClick={fetchUploadsAndReviews} 
                variant="outline" 
                size="sm"
                className="border-[#1DDCD3]/20 hover:border-[#1DDCD3]/40 text-[#1a1f2e]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {uploads.map((upload) => {
              const review = getReviewForUpload(upload.id);
              const isReviewing = reviewingUploadId === upload.id;

              return (
                <div key={upload.id} className="bg-gray-50 rounded-xl p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {getFileIcon(upload.mime_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1a1f2e] text-lg">{upload.filename}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          Uploaded {new Date(upload.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(review)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(upload)}
                        className="border-[#1DDCD3]/20 hover:border-[#1DDCD3]/40"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* File Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-[#1a1f2e]">Content Preview</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openFullScreen(upload)}
                          className="text-[#1DDCD3] hover:text-[#1DDCD3]/80"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          View Full Screen
                        </Button>
                      </div>
                      {getFilePreview(upload)}
                      
                      {/* Caption and Hashtags */}
                      {(upload.caption || upload.hashtags) && (
                        <div className="space-y-3">
                          {upload.caption && (
                            <div>
                              <p className="text-sm font-medium text-[#1a1f2e] mb-1">Caption:</p>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                {upload.caption}
                              </p>
                            </div>
                          )}
                          {upload.hashtags && (
                            <div>
                              <p className="text-sm font-medium text-[#1a1f2e] mb-1">Hashtags:</p>
                              <p className="text-sm text-[#1DDCD3] bg-[#1DDCD3]/5 p-3 rounded-lg border border-[#1DDCD3]/20">
                                {upload.hashtags}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AI Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-[#1a1f2e]">AI Content Analysis</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <AIContentAnalysis
                          uploadId={upload.id}
                          filename={upload.filename}
                          fileUrl={upload.file_url}
                          isVisible={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Review Section */}
                  {!review && (
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-[#1a1f2e]">Review Content</h4>
                      <Textarea
                        placeholder="Add feedback or comments (optional)..."
                        value={feedbacks[upload.id] || ''}
                        onChange={(e) => setFeedbacks(prev => ({ ...prev, [upload.id]: e.target.value }))}
                        rows={3}
                        className="bg-white border-gray-300"
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleReview(upload.id, 'approved')}
                          disabled={isReviewing}
                          className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isReviewing ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReview(upload.id, 'rejected')}
                          disabled={isReviewing}
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {isReviewing ? 'Rejecting...' : 'Request Changes'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Existing Review */}
                  {review && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <MessageSquare className="h-4 w-4 text-[#1DDCD3]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-[#1a1f2e]">Review Status:</span>
                            {getStatusBadge(review)}
                            {review.reviewed_at && (
                              <span className="text-xs text-gray-500">
                                {new Date(review.reviewed_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                          {review.feedback && (
                            <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
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

      {/* Full Screen Modal */}
      <Dialog open={isFullScreenOpen} onOpenChange={setIsFullScreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-white">
            <DialogTitle className="flex items-center justify-between pr-10">
              <span className="text-[#1a1f2e] truncate max-w-[60%]">{selectedUpload?.filename}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedUpload && handleDownload(selectedUpload)}
                  className="border-[#1DDCD3]/20 hover:border-[#1DDCD3]/40"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-50" style={{ maxHeight: 'calc(95vh - 80px)' }}>
            {selectedUpload && (
              <div className="min-h-full flex flex-col">
                {/* Media Content Container */}
                <div className="flex-1 flex items-center justify-center p-6 bg-black/5">
                  {selectedUpload.mime_type?.startsWith('image/') && (
                    <div className="relative max-w-full max-h-full flex items-center justify-center">
                      <img
                        src={selectedUpload.file_url}
                        alt={selectedUpload.filename}
                        className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                        style={{ maxHeight: 'calc(95vh - 200px)' }}
                      />
                    </div>
                  )}
                  {selectedUpload.mime_type?.startsWith('video/') && (
                    <div className="relative w-full max-w-4xl">
                      <video
                        src={selectedUpload.file_url}
                        controls
                        className="w-full h-auto max-h-[70vh] rounded-lg shadow-2xl bg-black"
                        autoPlay
                        style={{ maxHeight: 'calc(95vh - 200px)' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {!selectedUpload.mime_type?.startsWith('image/') && 
                   !selectedUpload.mime_type?.startsWith('video/') && (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm px-12">
                      <FileText className="h-32 w-32 text-gray-300 mx-auto mb-6" />
                      <p className="text-xl font-medium text-gray-700 mb-2">{selectedUpload.filename}</p>
                      <p className="text-sm text-gray-500 mb-6">This file type cannot be previewed</p>
                      <Button
                        onClick={() => handleDownload(selectedUpload)}
                        className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90 text-white"
                        size="lg"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download File
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Caption and Hashtags */}
                {(selectedUpload.caption || selectedUpload.hashtags) && (
                  <div className="bg-white border-t p-6 space-y-4">
                    <div className="max-w-4xl mx-auto w-full">
                      {selectedUpload.caption && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-[#1a1f2e] mb-2 text-sm uppercase tracking-wider">Caption</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedUpload.caption}</p>
                        </div>
                      )}
                      {selectedUpload.hashtags && (
                        <div>
                          <h4 className="font-semibold text-[#1a1f2e] mb-2 text-sm uppercase tracking-wider">Hashtags</h4>
                          <p className="text-[#1DDCD3] bg-[#1DDCD3]/5 p-4 rounded-lg font-medium">{selectedUpload.hashtags}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentReviewPanelEnhanced;