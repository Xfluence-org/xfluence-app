
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ContentUploadPanelProps {
  taskId: string;
  onUploadComplete: () => void;
}

interface TaskUpload {
  id: string;
  filename: string;
  file_url: string;
  created_at: string;
  mime_type?: string;
}

interface ContentReview {
  id: string;
  upload_id: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  created_at: string;
}

const ContentUploadPanel: React.FC<ContentUploadPanelProps> = ({
  taskId,
  onUploadComplete
}) => {
  const [uploads, setUploads] = useState<TaskUpload[]>([]);
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
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
      const { data, error } = await supabase
        .from('task_content_reviews')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { error } = await supabase
          .from('task_uploads')
          .insert({
            task_id: taskId,
            uploader_id: user.id,
            filename: file.name,
            file_url: `placeholder-url-${file.name}`, // In real app, upload to storage first
            file_size: file.size,
            mime_type: file.type
          });

        if (error) throw error;
      });

      await Promise.all(uploadPromises);
      await fetchUploads();
      onUploadComplete();

      toast({
        title: "Content Uploaded",
        description: "Your content has been uploaded for review!"
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload content",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
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
        return <Badge className="bg-red-100 text-red-800">Needs Revision</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      default:
        return <Badge variant="outline">Pending Review</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Content for Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Upload your content files for brand review
          </p>
          <Input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-xs mx-auto"
          />
          {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
        </div>

        {/* Uploaded Files */}
        {uploads.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Uploaded Content</h3>
            {uploads.map((upload) => {
              const review = getReviewForUpload(upload.id);
              
              return (
                <Card key={upload.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-gray-500" />
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
                        <p className="text-sm font-medium text-gray-700 mb-1">Brand Feedback:</p>
                        <p className="text-sm text-gray-900">{review.feedback}</p>
                      </div>
                    )}

                    {review?.status === 'approved' && (
                      <div className="mt-3 flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Content approved! You can now proceed to publish.</span>
                      </div>
                    )}

                    {review?.status === 'rejected' && (
                      <div className="mt-3 flex items-center gap-2 text-red-600">
                        <X className="h-4 w-4" />
                        <span className="text-sm font-medium">Please address the feedback and upload revised content.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {uploads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No content uploaded yet</p>
            <p className="text-sm mt-1">Upload your content files to get started with the review process</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentUploadPanel;
