
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Link, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface PublishLinkFormProps {
  taskId: string;
  isApproved: boolean;
  existingLink?: string;
  onLinkSubmitted: () => void;
}

const PublishLinkForm: React.FC<PublishLinkFormProps> = ({
  taskId,
  isApproved,
  existingLink,
  onLinkSubmitted
}) => {
  const [publishUrl, setPublishUrl] = useState(existingLink || '');
  const [platform, setPlatform] = useState('Instagram');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitLink = async () => {
    if (!publishUrl.trim() || !user?.id || !platform) return;

    setSubmitting(true);
    try {
      // Create or update published content record
      const { error } = await supabase
        .from('task_published_content')
        .upsert({
          task_id: taskId,
          influencer_id: user.id,
          published_url: publishUrl.trim(),
          platform: platform,
          status: 'active',
          notes: 'Content published by influencer'
        }, {
          onConflict: 'task_id,influencer_id'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your published content link has been submitted to the brand."
      });

      onLinkSubmitted();
    } catch (error) {
      console.error('Error submitting publish link:', error);
      toast({
        title: "Error",
        description: "Failed to submit your published link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isApproved) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <ExternalLink className="h-4 w-4" />
            <p className="text-sm font-medium">
              Publish link submission will be available once your content is approved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <ExternalLink className="h-5 w-5" />
          Submit Published Content Link
          <Badge className="bg-green-100 text-green-800 text-xs">Content Approved</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Platform</label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Post URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={publishUrl}
                onChange={(e) => setPublishUrl(e.target.value)}
                placeholder="https://instagram.com/p/your-post-id"
                className="pl-10"
                disabled={submitting}
              />
            </div>
            <Button
              onClick={handleSubmitLink}
              disabled={!publishUrl.trim() || !platform || submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Submitting...' : 'Submit Link'}
            </Button>
          </div>
        </div>

        {existingLink && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Current Published Link:</p>
              <a 
                href={existingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 break-all"
              >
                {existingLink}
              </a>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>• Copy the full URL of your published post</p>
          <p>• Make sure the post is public and accessible</p>
          <p>• The brand will review your published content</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishLinkForm;
