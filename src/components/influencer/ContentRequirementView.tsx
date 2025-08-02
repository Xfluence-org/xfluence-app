
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, MessageSquare, Send, RefreshCw, Info, User, Building, CheckCircle } from 'lucide-react';
import { taskWorkflowService, ContentDraft, TaskFeedback } from '@/services/taskWorkflowService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPhaseName } from '@/utils/taskFormatters';
import { format } from 'date-fns';

interface ContentRequirementViewProps {
  taskId: string;
  onRequirementsAccepted?: () => void;
}

interface ConversationItem {
  id: string;
  type: 'requirement' | 'feedback';
  content: string;
  sender: 'brand' | 'influencer';
  timestamp: string;
  senderName?: string;
}

const ContentRequirementView: React.FC<ContentRequirementViewProps> = ({ taskId, onRequirementsAccepted }) => {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<TaskFeedback[]>([]);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (taskId) {
        try {
          setIsRefreshing(true);
          
          // Fetch drafts first
          console.log('Fetching content drafts for task:', taskId);
          const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
          console.log('All drafts:', allDrafts);
          const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
          console.log('Shared drafts:', sharedDrafts);
          setDrafts(sharedDrafts);
          
          // Then fetch feedback
          console.log('Fetching feedback history for task:', taskId);
          const feedback = await taskWorkflowService.getTaskFeedback(taskId, 'content_requirement');
          console.log('Feedback history:', feedback);
          setFeedbackHistory(feedback);
          
          // Build conversation with both
          buildConversation(sharedDrafts, feedback);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast({
            title: "Error",
            description: "Failed to load content requirements",
            variant: "destructive"
          });
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    fetchData();
  }, [taskId]);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    const conversationContainer = document.getElementById('conversation-container');
    if (conversationContainer) {
      conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }
  }, [conversation]);


  const buildConversation = (draftsList: ContentDraft[], feedbackList: TaskFeedback[]) => {
    const items: ConversationItem[] = [];
    
    // Add drafts as requirements
    draftsList.forEach(draft => {
      items.push({
        id: draft.id,
        type: 'requirement',
        content: draft.content,
        sender: 'brand',
        timestamp: draft.created_at,
        senderName: 'Brand'
      });
    });
    
    // Add feedback messages
    feedbackList.forEach(fb => {
      items.push({
        id: fb.id,
        type: 'feedback',
        content: fb.message,
        sender: fb.sender_type,
        timestamp: fb.created_at,
        senderName: fb.sender_type === 'brand' ? 'Brand' : 'You'
      });
    });
    
    // Sort by timestamp
    items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setConversation(items);
  };

  const acceptRequirements = async () => {
    try {
      console.log('Starting acceptRequirements for task:', taskId);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Step 1: Sending acceptance message...');
      // Send acceptance message
      const { error: feedbackError } = await supabase
        .from('task_feedback')
        .insert({
          task_id: taskId,
          sender_id: user.id,
          sender_type: 'influencer',
          message: 'I have reviewed and accepted the content requirements. Ready to proceed with content creation!',
          phase: 'content_requirement'
        });

      if (feedbackError) {
        console.error('Error sending feedback:', feedbackError);
        throw feedbackError;
      }

      console.log('Step 2: Checking current workflow state...');
      // First check current state of content_requirement phase
      const { data: currentState, error: stateError } = await supabase
        .from('task_workflow_states')
        .select('status')
        .eq('task_id', taskId)
        .eq('phase', 'content_requirement')
        .single();

      if (stateError) {
        console.error('Error checking workflow state:', stateError);
      }

      console.log('Current content_requirement status:', currentState?.status);

      // If it's 'not_started', update to 'in_progress' first
      if (currentState?.status === 'not_started') {
        console.log('Updating content_requirement from not_started to in_progress...');
        const { error: progressError } = await supabase
          .from('task_workflow_states')
          .update({ status: 'in_progress' })
          .eq('task_id', taskId)
          .eq('phase', 'content_requirement');

        if (progressError) {
          console.error('Error updating to in_progress:', progressError);
        }
      }

      console.log('Step 3: Updating workflow state to completed...');
      // Update workflow state to completed
      const { error: workflowError } = await supabase
        .from('task_workflow_states')
        .update({ 
          status: 'completed'
        })
        .eq('task_id', taskId)
        .eq('phase', 'content_requirement');

      if (workflowError) {
        console.error('Error completing workflow state:', workflowError);
        throw workflowError;
      }

      console.log('Step 4: Updating content_review phase...');
      // Update content_review phase to in_progress
      const { error: reviewError } = await supabase
        .from('task_workflow_states')
        .update({
          status: 'in_progress'
        })
        .eq('task_id', taskId)
        .eq('phase', 'content_review');

      if (reviewError) {
        console.error('Error updating content_review phase:', reviewError);
        // Phase might not exist, try to insert it
        const { error: insertError } = await supabase
          .from('task_workflow_states')
          .insert({
            task_id: taskId,
            phase: 'content_review',
            status: 'in_progress'
          });
        
        if (insertError) {
          console.error('Error inserting content_review phase:', insertError);
        }
      }

      console.log('Step 5: Getting campaign ID...');
      // Get campaign ID
      const { data: taskData } = await supabase
        .from('campaign_tasks')
        .select('campaign_id')
        .eq('id', taskId)
        .single();

      if (taskData?.campaign_id) {
        console.log('Step 6: Updating participant stage...');
        // Update participant current_stage
        const { error: participantError } = await supabase
          .from('campaign_participants')
          .update({ 
            current_stage: 'content_creation'
          })
          .eq('campaign_id', taskData.campaign_id)
          .eq('influencer_id', user.id);

        if (participantError) {
          console.error('Error updating participant stage:', participantError);
        }
      }

      console.log('Step 7: Updating task status...');
      // Update task status
      const { error: taskError } = await supabase
        .from('campaign_tasks')
        .update({ 
          status: 'content_review',
          progress: 33
        })
        .eq('id', taskId);

      if (taskError) {
        console.error('Error updating task:', taskError);
        throw taskError;
      }

      console.log('Successfully accepted requirements!');

      toast({
        title: "Requirements Accepted",
        description: "You can now proceed to upload your content!",
        className: "bg-green-50 border-green-200"
      });

      // Refresh the conversation to show the acceptance
      const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
      const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
      const feedbackData = await taskWorkflowService.getTaskFeedback(taskId, 'content_requirement');
      
      setDrafts(sharedDrafts);
      setFeedbackHistory(feedbackData);
      buildConversation(sharedDrafts, feedbackData);

      // Call the callback to update parent component
      if (onRequirementsAccepted) {
        setTimeout(() => {
          onRequirementsAccepted();
        }, 500); // Small delay to allow state updates
      }

    } catch (error) {
      console.error('Error accepting requirements:', error);
      toast({
        title: "Error",
        description: "Failed to accept requirements",
        variant: "destructive"
      });
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
      setShowFeedbackDialog(false);
      toast({
        title: "Feedback Sent",
        description: "Your feedback has been sent to the brand."
      });
      
      // Refresh the entire conversation to show the new message
      const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
      const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
      const feedbackData = await taskWorkflowService.getTaskFeedback(taskId, 'content_requirement');
      
      setDrafts(sharedDrafts);
      setFeedbackHistory(feedbackData);
      buildConversation(sharedDrafts, feedbackData);
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
            <Button onClick={async () => {
              try {
                setIsRefreshing(true);
                
                // Fetch drafts first
                const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
                const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
                setDrafts(sharedDrafts);
                
                // Then fetch feedback
                const feedback = await taskWorkflowService.getTaskFeedback(taskId, 'content_requirement');
                setFeedbackHistory(feedback);
                
                // Build conversation with both
                buildConversation(sharedDrafts, feedback);
              } catch (error) {
                console.error('Error refreshing data:', error);
              } finally {
                setIsRefreshing(false);
              }
            }} variant="outline" size="sm" disabled={isRefreshing}>
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
          ) : conversation.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="font-medium">No content requirements shared yet</p>
              <p className="text-sm mt-1">The brand will share content guidelines and requirements with you here</p>
              <Button onClick={async () => {
                try {
                  setIsRefreshing(true);
                  
                  // Fetch drafts first
                  const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
                  const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
                  setDrafts(sharedDrafts);
                  
                  // Then fetch feedback
                  const feedback = await taskWorkflowService.getTaskFeedback(taskId, 'content_requirement');
                  setFeedbackHistory(feedback);
                  
                  // Build conversation with both
                  buildConversation(sharedDrafts, feedback);
                } catch (error) {
                  console.error('Error checking for updates:', error);
                } finally {
                  setIsRefreshing(false);
                }
              }} className="mt-4" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for Updates
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Conversation History */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Conversation History</h4>
                <div id="conversation-container" className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {conversation.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${item.sender === 'influencer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${item.sender === 'influencer' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={item.sender === 'brand' ? 'bg-[#1DDCD3]' : 'bg-gray-500'}>
                            {item.sender === 'brand' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">
                              {item.senderName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          
                          <div className={`rounded-lg p-4 ${item.sender === 'brand' ? 'bg-gray-100' : 'bg-[#1DDCD3]/10'}`}>
                            {item.type === 'requirement' ? (
                              <div className="space-y-2">
                                <Badge variant="secondary" className="text-xs mb-2">Content Requirements</Badge>
                                <div className="text-sm whitespace-pre-wrap">{item.content}</div>
                              </div>
                            ) : (
                              <div className="text-sm">{item.content}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Actions - Only show if not already accepted */}
              {!conversation.some(item => 
                item.type === 'feedback' && 
                item.sender === 'influencer' && 
                item.content.includes('I have reviewed and accepted')
              ) && (
                <Card className="border-2 border-[#1DDCD3]">
                  <CardHeader>
                    <CardTitle className="text-lg">Review Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Please review the content requirements above. You can either accept them to proceed with content creation, or share your concerns.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            await acceptRequirements();
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Requirements & Proceed
                      </Button>
                      <Button
                        onClick={() => setShowFeedbackDialog(true)}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Share Concerns
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feedback Dialog */}
              {showFeedbackDialog && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Share Your Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Please share your concerns or suggestions about the content requirements..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={sendFeedback}
                        disabled={loading || !feedback.trim()}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {loading ? 'Sending...' : 'Send Feedback'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowFeedbackDialog(false);
                          setFeedback('');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
