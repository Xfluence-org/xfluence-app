
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, Video, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContentUploadPanelProps {
  taskId: string;
  onContentUploaded: () => void;
}

interface UploadedFile {
  id: string;
  filename: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

const ContentUploadPanel: React.FC<ContentUploadPanelProps> = ({ 
  taskId, 
  onContentUploaded 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  // Fetch existing uploads
  React.useEffect(() => {
    fetchUploads();
  }, [taskId]);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('task_uploads')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploadedFiles(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        // Simulate file upload (in a real app, you'd upload to Supabase Storage)
        const mockFileUrl = `https://example.com/uploads/${file.name}`;
        
        const { data, error } = await supabase
          .from('task_uploads')
          .insert({
            task_id: taskId,
            filename: file.name,
            file_url: mockFileUrl,
            file_size: file.size,
            mime_type: file.type,
            uploader_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (error) throw error;
        
        setUploadedFiles(prev => [data, ...prev]);
      }

      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) uploaded for review`,
      });

      onContentUploaded();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('task_uploads')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast({
        title: "File removed",
        description: "File has been removed from your uploads",
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: "Remove failed",
        description: "There was an error removing the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-[#1DDCD3]" />
          Upload Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop your content files here, or click to browse
          </p>
          <Input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
            className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Description (Optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any notes or descriptions about your content..."
            rows={3}
          />
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Uploaded Files</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.mime_type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Uploaded
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Upload Guidelines</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload high-quality images (JPG, PNG) or videos (MP4, MOV)</li>
            <li>• Include multiple angles or variations if applicable</li>
            <li>• Add descriptions to provide context for your content</li>
            <li>• Wait for brand approval before publishing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentUploadPanel;
