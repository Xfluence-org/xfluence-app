
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, BarChart3, RefreshCw, Upload } from 'lucide-react';
import { taskWorkflowService, WorkflowState } from '@/services/taskWorkflowService';
import { useAuth } from '@/contexts/AuthContext';
import ContentRequirementView from './ContentRequirementView';
import ContentUploadPanel from './ContentUploadPanel';
import PublishContentForm from './PublishContentForm';
import TaskFeedbackSection from '../brand/TaskFeedbackSection';

interface TaskWorkflowViewProps {
  taskId: string;
  taskTitle: string;
}

const TaskWorkflowView: React.FC<TaskWorkflowViewProps> = ({ 
  taskId, 
  taskTitle
}) => {
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([]);
  const [activeTab, setActiveTab] = useState('content_requirement');
  const [loading, setLoading] = useState(true);
  const [phaseVisibility, setPhaseVisibility] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (taskId) {
      fetchData();
    }
  }, [taskId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchWorkflowStates();
      await checkPhaseVisibility();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowStates = async () => {
    try {
      const states = await taskWorkflowService.getWorkflowStates(taskId);
      setWorkflowStates(states);
    } catch (error) {
      console.error('Error fetching workflow states:', error);
      setWorkflowStates([]);
    }
  };

  const checkPhaseVisibility = async () => {
    try {
      const visibility = await taskWorkflowService.checkPhaseVisibility(taskId, 'influencer');
      setPhaseVisibility(visibility);
    } catch (error) {
      console.error('Error checking phase visibility:', error);
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
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const phases = [
    {
      id: 'content_requirement',
      title: 'Content Requirements',
      icon: FileText,
      description: 'Review content guidelines'
    },
    {
      id: 'content_review',
      title: 'Content Review',
      icon: Upload,
      description: 'Upload content for approval'
    },
    {
      id: 'publish_analytics',
      title: 'Publish & Analytics',
      icon: BarChart3,
      description: 'Submit published content and analytics'
    }
  ];

  const availablePhases = phases.filter(phase => phaseVisibility[phase.id]);

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
            <CardTitle>Task: {taskTitle}</CardTitle>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
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
                const isVisible = phaseVisibility[phase.id];
                
                return (
                  <div 
                    key={phase.id} 
                    className={`flex items-center gap-4 p-3 border rounded-lg ${
                      !isVisible ? 'opacity-50 bg-gray-50' : 
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

          {availablePhases.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availablePhases.length}, 1fr)` }}>
                {availablePhases.map((phase) => (
                  <TabsTrigger key={phase.id} value={phase.id}>
                    {phase.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="content_requirement" className="mt-6 space-y-6">
                <ContentRequirementView taskId={taskId} />
                <TaskFeedbackSection
                  taskId={taskId}
                  phase="content_requirement"
                  userType="influencer"
                />
              </TabsContent>

              <TabsContent value="content_review" className="mt-6 space-y-6">
                <ContentUploadPanel taskId={taskId} onUploadComplete={fetchData} />
                <TaskFeedbackSection
                  taskId={taskId}
                  phase="content_review"
                  userType="influencer"
                />
              </TabsContent>

              <TabsContent value="publish_analytics" className="mt-6 space-y-6">
                <PublishContentForm taskId={taskId} onPublishComplete={fetchData} />
                <TaskFeedbackSection
                  taskId={taskId}
                  phase="publish_analytics"
                  userType="influencer"
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  Waiting for brand to share content requirements with you.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskWorkflowView;
