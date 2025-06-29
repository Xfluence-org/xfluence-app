
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, MessageSquare, Send } from 'lucide-react';
import { taskWorkflowService, ContentDraft } from '@/services/taskWorkflowService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContentRequirementViewProps {
  taskId: string;
}

const ContentRequirementView: React.FC<ContentRequirementViewProps> = ({ taskId }) => {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSharedDrafts();
  }, [taskId]);

  const fetchSharedDrafts = async () => {
    try {
      const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
      // Only show drafts that have been shared with influencer
      const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
      setDrafts(sharedDrafts);
    } catch (error) {
      console.error('Error fetching shared drafts:', error);
    }
  };

  const sendFeedback = async () => {
    if (!feedback.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('task_feedback')
        .insert({
          task_id: taskId,
          sender_id: 'current_user_id',
          sender_type: 'influencer',
          message: feedback,
          phase: 'content_requirement'
        });

      if (error) throw error;

      setFeedback('');
      toast({
        title: "Feedback Sent",
        description: "Your feedback has been sent to the brand."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No content requirements shared yet</p>
              <p className="text-sm mt-1">The brand will share content guidelines and drafts with you here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {drafts.map((draft) => (
                <div key={draft.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    {draft.ai_generated && (
                      <Badge variant="secondary">AI Generated</Badge>
                    )}
                    {draft.brand_edited && (
                      <Badge variant="outline">Brand Edited</Badge>
                    )}
                    <Badge className="bg-green-100 text-green-800">Shared</Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-4 text-sm whitespace-pre-wrap">
                    {draft.content}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Shared: {new Date(draft.created_at).toLocaleString()}
                  </div>
                </div>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Send Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts on the content requirements..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={sendFeedback}
                    disabled={loading || !feedback.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentRequirementView;
