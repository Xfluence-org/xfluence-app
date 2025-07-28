
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';
import AIContentAnalysis from '@/components/shared/AIContentAnalysis';
import PublishLinkForm from '@/components/influencer/PublishLinkForm';

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
  file_size?: number;
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
  const [publishedLink, setPublishedLink] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUploads();
    fetchReviews();
    fetchPublishedLink();
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
      
      const typedReviews = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      }));
      
      setReviews(typedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchPublishedLink = async () => {
    try {
      const { data, error } = await supabase
        .from('task_published_content')
        .select('published_url')
        .eq('task_id', taskId)
        .maybeSingle();

      if (error) throw error;
      setPublishedLink(data?.published_url || '');
    } catch (error) {
      console.error('Error fetching published link:', error);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    // Create a unique filename with timestamp and user ID
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${taskId}/${user?.id}/${timestamp}_${file.name}`;

    console.log('Uploading file to storage:', uniqueFilename);

    const { data, error } = await supabase.storage
      .from('campaign-assets')
      .upload(uniqueFilename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('campaign-assets')
      .getPublicUrl(uniqueFilename);

    console.log('File uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload file to storage first
        const fileUrl = await uploadFileToStorage(file);

        // Then create database record
        const { error } = await supabase
          .from('task_uploads')
          .insert({
            task_id: taskId,
            uploader_id: user.id,
            filename: file.name,
            file_url: fileUrl,
            file_size: file.size,
            mime_type: file.type
          });

        if (error) {
          console.error('Database insert error:', error);
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      await fetchUploads();
      await fetchReviews();
      onUploadComplete();

      toast({
        title: "Content Uploaded",
        description: "Your content has been uploaded successfully and is ready for review!"
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload content",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const deleteUpload = async (uploadId: string, fileUrl: string) => {
    try {
      // Extract the file path from the URL for storage deletion
      const urlParts = fileUrl.split('/');
      const bucketPath = urlParts.slice(-3).join('/'); // Get last 3 parts: taskId/userId/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('campaign-assets')
        .remove([bucketPath]);

      if (storageError) {
        console.warn('Storage deletion error (file may not exist):', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('task_uploads')
        .delete()
        .eq('id', uploadId);

      if (dbError) throw dbError;

      await fetchUploads();
      await fetchReviews();

      toast({
        title: "File Deleted",
        description: "The file has been removed successfully."
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete the file",
        variant: "destructive"
      });
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

  const hasApprovedContent = reviews.some(review => review.status === 'approved');

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
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading files...
            </div>
          )}
        </div>

        {/* Uploaded Files */}
        {uploads.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Uploaded Content</h3>
            {uploads.map((upload) => {
              const review = getReviewForUpload(upload.id);
              
              return (
                <div key={upload.id} className="space-y-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">{upload.filename}</h4>
                            <p className="text-sm text-gray-500">
                              Uploaded {new Date(upload.created_at).toLocaleDateString()}
                              {upload.file_size && (
                                <span className="ml-2">
                                  ({Math.round(upload.file_size / 1024)} KB)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(review?.status || 'pending')}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUpload(upload.id, upload.file_url)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Show preview for images */}
                      {upload.mime_type?.startsWith('image/') && (
                        <div className="mb-3">
                          <img 
                            src={upload.file_url} 
                            alt={upload.filename}
                            className="max-w-xs rounded-lg shadow-sm"
                            onError={(e) => {
                              console.log('Image load error for:', upload.file_url);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

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

                  {/* AI Analysis appears after upload */}
                  <AIContentAnalysis 
                    uploadId={upload.id}
                    filename={upload.filename}
                    fileUrl={upload.file_url}
                    isVisible={true}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Publish Link Form - appears when content is approved */}
        {uploads.length > 0 && (
          <PublishLinkForm
            taskId={taskId}
            isApproved={hasApprovedContent}
            existingLink={publishedLink}
            onLinkSubmitted={fetchPublishedLink}
          />
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
