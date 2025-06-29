
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, Sparkles } from 'lucide-react';
import { taskWorkflowService, ContentDraft } from '@/services/taskWorkflowService';
import { useToast } from '@/components/ui/use-toast';

interface ContentDraftEditorProps {
  taskId: string;
  onDraftShared: () => void;
}

const ContentDraftEditor: React.FC<ContentDraftEditorProps> = ({ taskId, onDraftShared }) => {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrafts();
  }, [taskId]);

  const fetchDrafts = async () => {
    try {
      const fetchedDrafts = await taskWorkflowService.getContentDrafts(taskId);
      setDrafts(fetchedDrafts);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  };

  const generateAIDraft = async () => {
    setLoading(true);
    try {
      // Mock AI content generation
      const aiContent = `🎯 Exciting News! 

Just tried the amazing new [Product Name] and I'm absolutely loving it! The quality is incredible and it's exactly what I've been looking for. 

✨ What I love most:
• Premium quality that exceeds expectations
• Perfect for my daily routine
• Sustainable and eco-friendly approach

Swipe to see my honest review! What do you think? Let me know in the comments below 👇

#BrandPartnership #ProductReview #Authentic #Quality #Lifestyle

@brandname - Thank you for this amazing collaboration! 🙏`;

      setNewContent(aiContent);
      toast({
        title: "AI Draft Generated",
        description: "Review and edit the content before saving."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI draft",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      await taskWorkflowService.createContentDraft(taskId, newContent, 'current_user_id');
      setNewContent('');
      await fetchDrafts();
      toast({
        title: "Draft Saved",
        description: "Content draft has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const shareDraft = async (draftId: string) => {
    setSharing(draftId);
    try {
      await taskWorkflowService.shareContentDraft(draftId, taskId);
      await fetchDrafts();
      onDraftShared();
      toast({
        title: "Draft Shared",
        description: "Content draft has been shared with the influencer."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share draft",
        variant: "destructive"
      });
    } finally {
      setSharing(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Draft Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={generateAIDraft}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate AI Draft
            </Button>
          </div>

          <Textarea
            placeholder="Write content draft for the influencer..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={10}
            className="resize-none"
          />

          <Button
            onClick={saveDraft}
            disabled={loading || !newContent.trim()}
            className="w-full"
          >
            Save Draft
          </Button>
        </CardContent>
      </Card>

      {drafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {draft.ai_generated && (
                      <Badge variant="secondary">AI Generated</Badge>
                    )}
                    {draft.brand_edited && (
                      <Badge variant="outline">Brand Edited</Badge>
                    )}
                    {draft.shared_with_influencer && (
                      <Badge className="bg-green-100 text-green-800">Shared</Badge>
                    )}
                  </div>
                  {!draft.shared_with_influencer && (
                    <Button
                      size="sm"
                      onClick={() => shareDraft(draft.id)}
                      disabled={sharing === draft.id}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-3 w-3" />
                      Share with Influencer
                    </Button>
                  )}
                </div>
                <div className="bg-gray-50 rounded p-3 text-sm whitespace-pre-wrap">
                  {draft.content}
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(draft.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentDraftEditor;
