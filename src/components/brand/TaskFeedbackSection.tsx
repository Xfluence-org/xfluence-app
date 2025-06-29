import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { taskWorkflowService, TaskFeedback } from '@/services/taskWorkflowService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface TaskFeedbackSectionProps {
  taskId: string;
  phase: 'content_requirement' | 'content_review' | 'publish_analytics';
  userType: 'brand' | 'influencer';
}

const TaskFeedbackSection: React.FC<TaskFeedbackSectionProps> = ({
  taskId,
  phase,
  userType
}) => {
  const [feedbacks, setFeedbacks] = useState<TaskFeedback[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbacks();
  }, [taskId, phase]);

  const fetchFeedbacks = async () => {
    try {
      const data = await taskWorkflowService.getTaskFeedback(taskId, phase);
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
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
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Phase Feedback & Communication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Messages */}
        {feedbacks.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className={`p-3 rounded-lg ${
                  feedback.sender_type === userType
                    ? 'bg-blue-50 ml-8'
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {feedback.sender_type === 'brand' ? 'Brand' : 'Influencer'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(feedback.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-900">{feedback.message}</p>
              </div>
            ))}
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
