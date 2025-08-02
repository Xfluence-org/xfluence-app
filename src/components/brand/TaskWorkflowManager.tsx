import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, BarChart3, RefreshCw, CheckCircle2 } from 'lucide-react';
import { taskWorkflowService, WorkflowState } from '@/services/taskWorkflowService';
import { useAuth } from '@/contexts/SimpleAuthContext';
import ContentRequirementEditorEnhanced from './ContentRequirementEditorEnhanced';
import ContentReviewPanelEnhanced from './ContentReviewPanelEnhanced';
import PublishAnalyticsView from './PublishAnalyticsView';
import TaskFeedbackSection from './TaskFeedbackSection';

interface TaskWorkflowManagerProps {
  taskId: string;
  taskTitle: string;
  userType?: 'brand' | 'influencer';
}

const TaskWorkflowManager: React.FC<TaskWorkflowManagerProps> = ({ 
  taskId, 
  taskTitle, 
  userType = 'brand' 
}) => {
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([]);
  const [activeTab, setActiveTab] = useState('content_requirement');
  const [loading, setLoading] = useState(true);
  const [phaseVisibility, setPhaseVisibility] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (taskId) {
      initializeAndFetchData();
    }

    // Listen for refresh events
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail?.taskId === taskId) {
        initializeAndFetchData();
      }
    };

    window.addEventListener('refreshTaskData', handleRefresh as EventListener);
    return () => window.removeEventListener('refreshTaskData', handleRefresh as EventListener);
  }, [taskId]);

  const initializeAndFetchData = async () => {
    try {
      setLoading(true);
      console.log('Initializing workflow for task:', taskId);
      
      await taskWorkflowService.initializeWorkflow(taskId);
      await fetchWorkflowStates();
      await checkPhaseVisibility();
      
    } catch (error) {
      console.error('Error initializing workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowStates = async () => {
    try {
      const states = await taskWorkflowService.getWorkflowStates(taskId);
      console.log('Fetched workflow states:', states);
      setWorkflowStates(states);
    } catch (error) {
      console.error('Error fetching workflow states:', error);
      setWorkflowStates([]);
    }
  };

  const checkPhaseVisibility = async () => {
    try {
      const visibility = await taskWorkflowService.checkPhaseVisibility(taskId, userType);
      console.log('Phase visibility:', visibility);
      setPhaseVisibility(visibility);
    } catch (error) {
      console.error('Error checking phase visibility:', error);
      setPhaseVisibility({
        content_requirement: true,
        content_review: false,
        publish_analytics: false
      });
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
        return <Badge className="bg-red-100 text-red-800">Needs Revision</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleRefresh = async () => {
    await initializeAndFetchData();
  };

  const phases = [
    {
      id: 'content_requirement',
      title: 'Content Requirements',
      icon: FileText,
      description: 'Create and share content requirements with influencer'
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading workflow...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Workflow: {taskTitle}</CardTitle>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Task Progress</h3>
            <div className="space-y-3">
              {phases.map((phase, index) => {
                const status = getPhaseStatus(phase.id);
                const Icon = phase.icon;
                
                return (
                  <div 
                    key={phase.id} 
                    className={`flex items-center gap-4 p-3 border rounded-lg ${
                      status === 'in_progress' ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                      {status === 'completed' ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full" />
                      ) : status === 'in_progress' ? (
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{phase.title}</span>
                        {getStatusBadge(status)}
                      </div>
                      <p className="text-sm text-gray-600">{phase.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workflow Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {phases.map((phase) => (
                <TabsTrigger key={phase.id} value={phase.id}>
                  {phase.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="content_requirement" className="mt-6 space-y-6">
              {getPhaseStatus('content_requirement') === 'completed' ? (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Content Requirements Shared</p>
                      <p className="text-sm text-green-700">
                        Requirements have been shared with the influencer. You can view the conversation below.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ContentRequirementEditorEnhanced
                  taskId={taskId}
                  onRequirementsShared={handleRefresh}
                />
              )}
              
              <TaskFeedbackSection
                taskId={taskId}
                phase="content_requirement"
                userType={userType}
              />
            </TabsContent>

            <TabsContent value="content_review" className="mt-6 space-y-6">
              <ContentReviewPanelEnhanced
                taskId={taskId}
                onReviewComplete={handleRefresh}
              />
              <TaskFeedbackSection
                taskId={taskId}
                phase="content_review"
                userType={userType}
              />
            </TabsContent>

            <TabsContent value="publish_analytics" className="mt-6 space-y-6">
              <PublishAnalyticsView taskId={taskId} />
              <TaskFeedbackSection
                taskId={taskId}
                phase="publish_analytics"
                userType={userType}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskWorkflowManager;
