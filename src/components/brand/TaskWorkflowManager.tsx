
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, BarChart3 } from 'lucide-react';
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [phaseVisibility, setPhaseVisibility] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchWorkflowStates();
    checkPhaseVisibility();
  }, [taskId, refreshKey]);

  const fetchWorkflowStates = async () => {
    try {
      const states = await taskWorkflowService.getWorkflowStates(taskId);
      setWorkflowStates(states);
    } catch (error) {
      console.error('Error fetching workflow states:', error);
    }
  };

  const checkPhaseVisibility = async () => {
    try {
      const visibility = await taskWorkflowService.checkPhaseVisibility(taskId, userType);
      setPhaseVisibility(visibility);
      
      // Set active tab to first available phase for influencers
      if (userType === 'influencer') {
        const visiblePhases = Object.entries(visibility)
          .filter(([_, isVisible]) => isVisible)
          .map(([phase]) => phase);
        
        if (visiblePhases.length > 0) {
          setActiveTab(visiblePhases[0]);
        }
      }
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

  // Filter phases based on user type and visibility
  const availablePhases = phases.filter(phase => {
    if (userType === 'brand') return true;
    return phaseVisibility[phase.id] || getPhaseStatus(phase.id) === 'in_progress';
  });

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
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskWorkflowManager;
