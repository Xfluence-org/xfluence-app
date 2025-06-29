
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, BarChart3, RefreshCw } from 'lucide-react';
import { taskWorkflowService, WorkflowState } from '@/services/taskWorkflowService';
import { useAuth } from '@/contexts/AuthContext';
import ContentDraftEditor from './ContentDraftEditor';
import ContentReviewPanel from './ContentReviewPanel';
import PublishAnalyticsView from './PublishAnalyticsView';

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
  const [isInitializing, setIsInitializing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (taskId) {
      initializeAndFetchData();
    }
  }, [taskId]);

  const initializeAndFetchData = async () => {
    try {
      setLoading(true);
      console.log('Initializing workflow for task:', taskId);
      
      // First, try to initialize the workflow
      await taskWorkflowService.initializeWorkflow(taskId);
      
      // Then fetch the data
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
      // Default visibility for brand users
      if (userType === 'brand') {
        setPhaseVisibility({
          content_requirement: true,
          content_review: true,
          publish_analytics: true
        });
      }
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

  const handleRefresh = async () => {
    await initializeAndFetchData();
  };

  const handleForceInitialize = async () => {
    try {
      setIsInitializing(true);
      console.log('Force initializing workflow...');
      await taskWorkflowService.initializeWorkflow(taskId);
      await handleRefresh();
    } catch (error) {
      console.error('Error force initializing:', error);
    } finally {
      setIsInitializing(false);
    }
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

  // Filter phases based on user type and visibility
  const availablePhases = phases.filter(phase => {
    if (userType === 'brand') return true;
    return phaseVisibility[phase.id] || getPhaseStatus(phase.id) === 'in_progress';
  });

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
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {workflowStates.length === 0 && (
                <Button
                  onClick={handleForceInitialize}
                  variant="outline"
                  size="sm"
                  disabled={isInitializing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
                  Initialize Workflow
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {workflowStates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No workflow states found for this task.</p>
              <Button
                onClick={handleForceInitialize}
                disabled={isInitializing}
                className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Initialize Workflow'
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 mb-6">
                {phases.map((phase) => {
                  const status = getPhaseStatus(phase.id);
                  const Icon = phase.icon;
                  const isAvailable = userType === 'brand' || phaseVisibility[phase.id] || status === 'in_progress';
                  
                  return (
                    <div 
                      key={phase.id} 
                      className={`flex items-center gap-3 p-3 border rounded-lg min-w-0 ${
                        isAvailable ? '' : 'opacity-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{phase.title}</div>
                        <div className="mt-1">{getStatusBadge(status)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {availablePhases.length > 0 ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availablePhases.length}, 1fr)` }}>
                    {availablePhases.map((phase) => (
                      <TabsTrigger key={phase.id} value={phase.id}>
                        {phase.title}
                      </TabsTrigger>
                    ))}
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
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">
                      {userType === 'influencer' 
                        ? 'Waiting for brand to share workflow phases with you.'
                        : 'No workflow phases available.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskWorkflowManager;
