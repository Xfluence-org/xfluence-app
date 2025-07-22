
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Send } from 'lucide-react';
import { taskWorkflowService } from '@/services/taskWorkflowService';
import { useToast } from '@/hooks/use-toast';

interface PublishContentFormProps {
  taskId: string;
  onPublishComplete: () => void;
}

const PublishContentForm: React.FC<PublishContentFormProps> = ({ taskId, onPublishComplete }) => {
  const [publishedUrl, setPublishedUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishedUrl.trim() || !platform) return;

    setLoading(true);
    try {
      await taskWorkflowService.submitPublishedContent(taskId, publishedUrl, platform);
      
      setPublishedUrl('');
      setPlatform('');
      onPublishComplete();
      
      toast({
        title: "Content Published",
        description: "Your published content has been submitted successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit published content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Submit Published Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="published-url">Published Content URL</Label>
            <Input
              id="published-url"
              type="url"
              placeholder="https://..."
              value={publishedUrl}
              onChange={(e) => setPublishedUrl(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !publishedUrl.trim() || !platform}
            className="w-full flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Submitting...' : 'Submit Published Content'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PublishContentForm;
