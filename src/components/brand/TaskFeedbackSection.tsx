import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, User, Building, RefreshCw } from 'lucide-react';
import { taskWorkflowService, TaskFeedback, ContentDraft } from '@/services/taskWorkflowService';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface TaskFeedbackSectionProps {
  taskId: string;
  phase: 'content_requirement' | 'content_review' | 'publish_analytics';
  userType: 'brand' | 'influencer';
}

interface ConversationItem {
  id: string;
  type: 'requirement' | 'feedback';
  content: string;
  sender: 'brand' | 'influencer';
  timestamp: string;
  senderName?: string;
}

const TaskFeedbackSection: React.FC<TaskFeedbackSectionProps> = ({
  taskId,
  phase,
  userType
}) => {
  const [feedbacks, setFeedbacks] = useState<TaskFeedback[]>([]);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch content requirements (drafts) to show the initial requirements
        const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
        const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
        setDrafts(sharedDrafts);
        
        // For content_requirement phase, fetch that phase's feedback
        // For other phases, fetch both content_requirement feedback AND current phase feedback
        if (phase === 'content_requirement') {
          const feedbackData = await taskWorkflowService.getTaskFeedback(taskId, phase);
          setFeedbacks(feedbackData);
          buildConversation(sharedDrafts, feedbackData);
        } else {
          // Fetch feedback from both content_requirement phase and current phase
          const [requirementsFeedback, currentPhaseFeedback] = await Promise.all([
            taskWorkflowService.getTaskFeedback(taskId, 'content_requirement'),
            taskWorkflowService.getTaskFeedback(taskId, phase)
          ]);
          
          // Combine both feedback arrays
          const allFeedback = [...requirementsFeedback, ...currentPhaseFeedback];
          setFeedbacks(allFeedback);
          buildConversation(sharedDrafts, allFeedback);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [taskId, phase]);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    const conversationContainer = document.getElementById('brand-conversation-container');
    if (conversationContainer) {
      conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }
  }, [conversation]);

  const fetchDrafts = async () => {
    try {
      const allDrafts = await taskWorkflowService.getContentDrafts(taskId);
      const sharedDrafts = allDrafts.filter(draft => draft.shared_with_influencer);
      setDrafts(sharedDrafts);
      return sharedDrafts;
    } catch (error) {
      console.error('Error fetching drafts:', error);
      return [];
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch drafts first
      const sharedDrafts = await fetchDrafts();
      
      // Fetch feedback based on phase
      let allFeedback;
      if (phase === 'content_requirement') {
        allFeedback = await taskWorkflowService.getTaskFeedback(taskId, phase);
      } else {
        // Fetch feedback from both content_requirement phase and current phase
        const [requirementsFeedback, currentPhaseFeedback] = await Promise.all([
          taskWorkflowService.getTaskFeedback(taskId, 'content_requirement'),
          taskWorkflowService.getTaskFeedback(taskId, phase)
        ]);
        allFeedback = [...requirementsFeedback, ...currentPhaseFeedback];
      }
      
      setFeedbacks(allFeedback);
      buildConversation(sharedDrafts, allFeedback);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const buildConversation = (draftsList: ContentDraft[], feedbackList: TaskFeedback[]) => {
    // console.log('Building conversation with:', { draftsList, feedbackList, phase });
    const items: ConversationItem[] = [];
    
    // Always add drafts as requirements (they are the starting point of the conversation)
    draftsList.forEach(draft => {
      items.push({
        id: draft.id,
        type: 'requirement',
        content: draft.content,
        sender: 'brand',
        timestamp: draft.created_at,
        senderName: userType === 'brand' ? 'You' : 'Brand'
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
        senderName: fb.sender_type === userType ? 'You' : (fb.sender_type === 'brand' ? 'Brand' : 'Influencer')
      });
    });
    
    // Sort by timestamp
    items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    // console.log('Final conversation items:', items);
    setConversation(items);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    try {
      setLoading(true);
      await taskWorkflowService.sendTaskFeedback(
        taskId,
        user.id,
        userType,
        newMessage.trim(),
        phase
      );
      
      setNewMessage('');
      
      // Refresh the conversation
      await fetchFeedbacks();
      
      toast({
        title: "Message Sent",
        description: "Your feedback has been sent successfully!"
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {phase === 'content_requirement' ? 'Requirements & Feedback' : 'Phase Communication'}
          </CardTitle>
          <Button
            onClick={() => {
              fetchFeedbacks();
            }}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conversation History */}
        {conversation.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Conversation History</h4>
            <div id="brand-conversation-container" className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {conversation.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${item.sender === userType ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${item.sender === userType ? 'flex-row-reverse' : ''}`}>
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
                      
                      <div className={`rounded-lg p-4 ${item.sender === userType ? 'bg-[#1DDCD3]/10' : 'bg-gray-100'}`}>
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
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No messages yet</p>
            {phase === 'content_requirement' && (
              <p className="text-xs mt-1">Share requirements to start the conversation</p>
            )}
          </div>
        )}

        {/* New Message Input */}
        <div className="space-y-3 border-t pt-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Add feedback for this phase...`}
            rows={3}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskFeedbackSection;
