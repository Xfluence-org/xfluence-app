
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, BarChart3 } from 'lucide-react';
import { taskWorkflowService } from '@/services/taskWorkflowService';
import { useToast } from '@/components/ui/use-toast';

interface TaskWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  workflowStates: any[];
  onRefresh: () => void;
}

const TaskWorkflowModal: React.FC<TaskWorkflowModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  workflowStates,
  onRefresh
}) => {
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getPhaseStatus = (phase: string) => {
    const state = workflowStates.find(s => s.phase === phase);
    return state?.status || 'not_started';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Needs Revision</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleShareRequirements = async () => {
    if (!requirements.trim()) {
      toast({
        title: "Error",
        description: "Please enter content requirements before sharing",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await taskWorkflowService.shareContentRequirements(taskId, requirements);
      
      toast({
        title: "Requirements Shared",
        description: "Content requirements have been shared with the influencer!"
      });
      
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error sharing requirements:', error);
      toast({
        title: "Error",
        description: "Failed to share content requirements",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const phases = [
    {
      id: 'content_requirement',
      title: 'Content Requirements',
      icon: FileText,
      description: 'Create and share content requirements'
    },
    {
      id: 'content_review',
      title: 'Content Review',
      icon: Eye,
      description: 'Review and approve content'
    },
    {
      id: 'publish_analytics',
      title: 'Publish & Analytics',
      icon: BarChart3,
      description: 'Monitor published content'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Workflow: {taskTitle}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content_requirement" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {phases.map((phase) => {
              const status = getPhaseStatus(phase.id);
              const Icon = phase.icon;
              
              return (
                <TabsTrigger key={phase.id} value={phase.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {phase.title}
                  {getStatusBadge(status)}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="content_requirement" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Content Requirements</h3>
                {getStatusBadge(getPhaseStatus('content_requirement'))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Requirements & Guidelines
                </label>
                <Textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Enter detailed content requirements, guidelines, key messages, hashtags, mentions, etc."
                  rows={10}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleShareRequirements}
                  disabled={isSubmitting || !requirements.trim()}
                  className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                >
                  {isSubmitting ? 'Sharing...' : 'Share Requirements with Influencer'}
                </Button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Once you share these requirements, the influencer will be able to see them 
                  and both of you will move to the Content Review phase where they can upload content for your approval.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content_review" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Content Review</h3>
                {getStatusBadge(getPhaseStatus('content_review'))}
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>Content review will be available after requirements are shared</p>
                <p className="text-sm">Influencer will upload content here for your approval</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publish_analytics" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Publish & Analytics</h3>
                {getStatusBadge(getPhaseStatus('publish_analytics'))}
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>Analytics will be available after content is published</p>
                <p className="text-sm">Monitor published content performance here</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaskWorkflowModal;
