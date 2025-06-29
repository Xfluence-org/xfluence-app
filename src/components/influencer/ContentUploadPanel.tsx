
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { taskWorkflowService, ContentReview } from '@/services/taskWorkflowService';

interface ContentUploadPanelProps {
  taskId: string;
}

interface TaskUpload {
  id: string;
  filename: string;
  file_url: string;
  created_at: string;
}

const ContentUploadPanel: React.FC<ContentUploadPanelProps> = ({ taskId }) => {
  const [uploads, setUploads] = useState<TaskUpload[]>([]);
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [uploading, setUploading] = useState(false);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // In a real implementation, you would upload to Supabase Storage first
      // For now, we'll create database records with placeholder URLs
      const uploadPromises = Array.from(files).map(file => 
        supabase
          .from('task_uploads')
          .insert({
            task_id: taskId,
            uploader_id: 'current_user_id',
            filename: file.name,
            file_url: `placeholder-url-${file.name}`,
            file_size: file.size,
            mime_type: file.type
          })
      );
      
      await Promise.all(uploadPromises);
      await fetchUploads();
      
      toast({
        title: "Files Uploaded",
        description: "Your content has been uploaded for review."
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getUploadReview = (uploadId: string) => {
    return reviews.find(review => review.upload_id === uploadId);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
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
            <Upload className="h-5 w-5" />
            Upload Content for Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Upload your content files</p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button
                as="span"
                disabled={uploading}
                className="cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </Button>
            </label>
          </div>

          {uploads.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Uploaded Files</h4>
              {uploads.map((upload) => {
                const review = getUploadReview(upload.id);
                
                return (
                  <div key={upload.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-sm">{upload.filename}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(upload.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(review?.status)}
                      {getStatusBadge(review?.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(review.status)}
                    {getStatusBadge(review.status)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.reviewed_at).toLocaleString()}
                  </div>
                </div>
                
                {review.ai_commentary && (
                  <div className="bg-blue-50 rounded p-3 text-sm">
                    <strong>AI Analysis:</strong> {review.ai_commentary}
                  </div>
                )}
                
                {review.feedback && (
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <strong>Brand Feedback:</strong> {review.feedback}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentUploadPanel;
