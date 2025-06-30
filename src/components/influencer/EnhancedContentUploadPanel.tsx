import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  File, 
  X, 
  Check, 
  Save, 
  Send, 
  Image, 
  Video, 
  Edit2,
  Eye,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { activityLogService } from '@/services/activityLogService';

interface EnhancedContentUploadPanelProps {
  taskId: string;
  onUploadComplete: () => void;
}

interface ContentDraft {
  id?: string;
  caption: string;
  hashtags: string;
  mediaFiles: File[];
  mediaUrls: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  lastSaved?: Date;
}

interface UploadedContent {
  id: string;
  filename: string;
  file_url: string;
  mime_type: string;
  caption?: string;
  hashtags?: string;
  status: string;
  created_at: string;
  feedback?: string;
}

const EnhancedContentUploadPanel: React.FC<EnhancedContentUploadPanelProps> = ({
  taskId,
  onUploadComplete
}) => {
  const [activeTab, setActiveTab] = useState('create');
  const [draft, setDraft] = useState<ContentDraft>({
    caption: '',
    hashtags: '',
    mediaFiles: [],
    mediaUrls: [],
    status: 'draft'
  });
  const [uploads, setUploads] = useState<UploadedContent[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDraft();
    fetchUploads();
  }, [taskId]);

  const fetchDraft = async () => {
    try {
      // Check if there's a saved draft
      const { data, error } = await supabase
        .from('task_content_drafts')
        .select('*')
        .eq('task_id', taskId)
        .eq('created_by', user?.id)
        .single();

      if (data && !error) {
        setDraft({
          id: data.id,
          caption: data.caption || '',
          hashtags: data.hashtags || '',
          mediaFiles: [],
          mediaUrls: data.media_urls || [],
          status: data.status || 'draft',
          lastSaved: new Date(data.updated_at)
        });
      }
    } catch (error) {
      console.error('Error fetching draft:', error);
    }
  };

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('task_uploads')
        .select(`
          *,
          task_content_reviews(
            status,
            feedback
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = data?.map(upload => ({
        ...upload,
        status: upload.task_content_reviews?.[0]?.status || 'pending',
        feedback: upload.task_content_reviews?.[0]?.feedback
      })) || [];
      
      setUploads(transformedData);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setDraft(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...newFiles]
    }));

    // Create preview URLs
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setDraft(prev => ({
        ...prev,
        mediaUrls: [...prev.mediaUrls, url]
      }));
    });
  };

  const removeFile = (index: number) => {
    setDraft(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const draftData = {
        task_id: taskId,
        created_by: user?.id,
        caption: draft.caption,
        hashtags: draft.hashtags,
        media_urls: draft.mediaUrls,
        status: 'draft',
        content: `Caption: ${draft.caption}\n\nHashtags: ${draft.hashtags}`,
        shared_with_influencer: true
      };

      if (draft.id) {
        // Update existing draft
        await supabase
          .from('task_content_drafts')
          .update(draftData)
          .eq('id', draft.id);
      } else {
        // Create new draft
        const { data } = await supabase
          .from('task_content_drafts')
          .insert(draftData)
          .select()
          .single();
        
        if (data) {
          setDraft(prev => ({ ...prev, id: data.id }));
        }
      }

      toast({
        title: "Draft Saved",
        description: "Your content draft has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Save Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    if (!draft.caption || draft.mediaFiles.length === 0) {
      toast({
        title: "Incomplete Content",
        description: "Please add a caption and at least one media file",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Upload files to storage
      const uploadPromises = draft.mediaFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${taskId}-${Date.now()}.${fileExt}`;
        const filePath = `task-uploads/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('campaign-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('campaign-assets')
          .getPublicUrl(filePath);

        // Create upload record
        const { error: dbError } = await supabase
          .from('task_uploads')
          .insert({
            task_id: taskId,
            uploader_id: user?.id,
            filename: file.name,
            file_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            caption: draft.caption,
            hashtags: draft.hashtags
          });

        if (dbError) throw dbError;

        return publicUrl;
      });

      await Promise.all(uploadPromises);

      // Get campaign ID for activity logging
      const { data: taskData } = await supabase
        .from('campaign_tasks')
        .select('campaign_id')
        .eq('id', taskId)
        .single();

      // Log activity for each uploaded file
      if (taskData && user?.id) {
        for (const file of draft.mediaFiles) {
          await activityLogService.logContentUpload(
            taskId,
            taskData.campaign_id,
            user.id,
            file.name,
            file.type.startsWith('image/') ? 'image' : 'video'
          );
        }
      }

      // Update draft status
      if (draft.id) {
        await supabase
          .from('task_content_drafts')
          .update({ status: 'submitted' })
          .eq('id', draft.id);
      }

      // Update task workflow
      await supabase
        .from('task_workflow_states')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('task_id', taskId)
        .eq('phase', 'content_review');

      toast({
        title: "Content Submitted",
        description: "Your content has been submitted for brand review!"
      });

      onUploadComplete();
      setActiveTab('history');
      fetchUploads();
    } catch (error) {
      console.error('Error submitting content:', error);
      toast({
        title: "Submit Error",
        description: "Failed to submit content for review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
      'submitted': { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
      'pending': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
      'approved': { label: 'Approved', color: 'bg-green-100 text-green-700' },
      'rejected': { label: 'Needs Revision', color: 'bg-red-100 text-red-700' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Content Creation & Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Content</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 mt-6">
            {/* Caption Section */}
            <div>
              <label className="text-sm font-medium mb-2 block">Caption</label>
              <Textarea
                placeholder="Write your engaging caption here..."
                value={draft.caption}
                onChange={(e) => setDraft(prev => ({ ...prev, caption: e.target.value }))}
                rows={4}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {draft.caption.length} characters
              </p>
            </div>

            {/* Hashtags Section */}
            <div>
              <label className="text-sm font-medium mb-2 block">Hashtags</label>
              <Input
                placeholder="#example #hashtags"
                value={draft.hashtags}
                onChange={(e) => setDraft(prev => ({ ...prev, hashtags: e.target.value }))}
              />
            </div>

            {/* Media Upload Section */}
            <div>
              <label className="text-sm font-medium mb-2 block">Media Files</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {draft.mediaFiles.length === 0 ? (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Upload images or videos for your content
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {draft.mediaFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="mt-3"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Media Preview */}
            {draft.mediaUrls.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Preview</label>
                <div className="grid grid-cols-2 gap-4">
                  {draft.mediaUrls.map((url, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100">
                      {draft.mediaFiles[index]?.type.startsWith('image/') ? (
                        <img src={url} alt="Preview" className="w-full h-48 object-cover" />
                      ) : (
                        <video src={url} className="w-full h-48 object-cover" controls />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={saveDraft}
                disabled={saving}
                variant="outline"
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button
                onClick={submitForReview}
                disabled={submitting || !draft.caption || draft.mediaFiles.length === 0}
                className="flex-1 bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>

            {draft.lastSaved && (
              <p className="text-xs text-gray-500 text-center">
                Last saved: {draft.lastSaved.toLocaleString()}
              </p>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            {uploads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No content uploaded yet</p>
                <p className="text-sm mt-1">Create and submit content to see it here</p>
              </div>
            ) : (
              uploads.map((upload) => (
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
                      {getStatusBadge(upload.status)}
                    </div>

                    {upload.caption && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{upload.caption}</p>
                        {upload.hashtags && (
                          <p className="text-sm text-blue-600 mt-1">{upload.hashtags}</p>
                        )}
                      </div>
                    )}

                    {upload.feedback && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Brand Feedback:</p>
                        <p className="text-sm text-gray-900">{upload.feedback}</p>
                      </div>
                    )}

                    {upload.status === 'approved' && (
                      <div className="mt-3 flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Content approved! You can now proceed to publish.
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedContentUploadPanel;