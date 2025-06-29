
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, BarChart3 } from 'lucide-react';
import { taskWorkflowService, WorkflowState } from '@/services/taskWorkflowService';
import ContentDraftEditor from './ContentDraftEditor';
import ContentReviewPanel from './ContentReviewPanel';
import PublishAnalyticsView from './PublishAnalyticsView';

interface TaskWorkflowManagerProps {
  taskId: string;
  taskTitle: string;
}

const TaskWorkflowManager: React.FC<TaskWorkflowManagerProps> = ({ taskId, taskTitle }) => {
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([]);
  const [activeTab, setActiveTab] = useState('content_requirement');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchWorkflowStates();
  }, [taskId, refreshKey]);

  const fetchWorkflowStates = async () => {
    try {
      const states = await taskWorkflowService.getWorkflowStates(taskId);
      setWorkflowStates(states);
    } catch (error) {
      console.error('Error fetching workflow states:', error);
    }
  };

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
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const phases = [
    {
      id: 'content_requirement',
      title: 'Content Requirements',
      icon: FileText,
      description: 'Create and share content drafts with influencer'
    },
    {
      id: 'content_review',
      title: 'Content Review',
      icon: Eye,
      description: 'Review and approve influencer content'
    },
    {
      id: 'publish_analytics',
      title: 'Publish & Analytics',
      icon: BarChart3,
      description: 'Monitor published content and analytics'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Workflow: {taskTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            {phases.map((phase) => {
              const status = getPhaseStatus(phase.id);
              const Icon = phase.icon;
              
              return (
                <div key={phase.id} className="flex items-center gap-3 p-3 border rounded-lg min-w-0">
                  <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{phase.title}</div>
                    <div className="mt-1">{getStatusBadge(status)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content_requirement">Requirements</TabsTrigger>
              <TabsTrigger value="content_review">Review</TabsTrigger>
              <TabsTrigger value="publish_analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="content_requirement" className="mt-6">
              <ContentDraftEditor
                taskId={taskId}
                onDraftShared={handleRefresh}
              />
            </TabsContent>

            <TabsContent value="content_review" className="mt-6">
              <ContentReviewPanel
                taskId={taskId}
                onReviewComplete={handleRefresh}
              />
            </TabsContent>

            <TabsContent value="publish_analytics" className="mt-6">
              <PublishAnalyticsView taskId={taskId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskWorkflowManager;
