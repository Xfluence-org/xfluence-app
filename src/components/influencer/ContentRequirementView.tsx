
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, MessageSquare, Send, RefreshCw } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (taskId) {
      fetchSharedDrafts();
    }
  }, [taskId]);

  const fetchSharedDrafts = async () => {
    try {
      setIsRefreshing(true);
      console.log('Fetching content drafts for task:', taskId);
      const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
      console.log('All drafts:', allDrafts);
      
      // Only show drafts that have been shared with influencer
      const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
      console.log('Shared drafts:', sharedDrafts);
      setDrafts(sharedDrafts);
    } catch (error) {
      console.error('Error fetching shared drafts:', error);
      toast({
        title: "Error",
        description: "Failed to load content requirements",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const sendFeedback = async () => {
    if (!feedback.trim()) return;

    setLoading(true);
    try {
      // Get current user ID (this should be replaced with actual auth context)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('task_feedback')
        .insert({
          task_id: taskId,
          sender_id: user.id,
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
      console.error('Error sending feedback:', error);
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Requirements
            </CardTitle>
            <Button onClick={fetchSharedDrafts} variant="outline" size="sm" disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isRefreshing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DDCD3] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading content requirements...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="font-medium">No content requirements shared yet</p>
              <p className="text-sm mt-1">The brand will share content guidelines and requirements with you here</p>
              <Button onClick={fetchSharedDrafts} className="mt-4" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for Updates
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {drafts.map((draft) => (
                <div key={draft.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {draft.ai_generated && (
                      <Badge variant="secondary">AI Generated</Badge>
                    )}
                    {draft.brand_edited && (
                      <Badge variant="outline">Brand Edited</Badge>
                    )}
                    <Badge className="bg-green-100 text-green-800">Shared with You</Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-4 text-sm whitespace-pre-wrap">
                    {draft.content}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Shared: {new Date(draft.created_at).toLocaleString()}
                    {draft.updated_at !== draft.created_at && (
                      <span> • Updated: {new Date(draft.updated_at).toLocaleString()}</span>
                    )}
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
                    placeholder="Share your thoughts on the content requirements, ask questions, or request clarifications..."
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
                    {loading ? 'Sending...' : 'Send Feedback'}
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> Once you've reviewed the requirements and are ready to create content, 
                  you'll be able to upload your content in the Content Review phase.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentRequirementView;
