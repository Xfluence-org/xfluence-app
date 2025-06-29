
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useTaskWorkflow } from '@/hooks/useTaskWorkflow';
import ContentDraftEditor from '@/components/brand/ContentDraftEditor';
import ContentUploadPanel from './ContentUploadPanel';
import PublishAnalyticsView from '@/components/brand/PublishAnalyticsView';

interface TaskWorkflowViewProps {
  taskId: string;
  taskTitle: string;
}

const TaskWorkflowView: React.FC<TaskWorkflowViewProps> = ({ taskId, taskTitle }) => {
  const {
    workflowStates,
    workflowLoading,
    checkPhaseVisibility
  } = useTaskWorkflow(taskId);
  
  const [activeTab, setActiveTab] = useState('content_requirement');
  const [phaseVisibility, setPhaseVisibility] = useState<Record<string, boolean>>({});

  // Check phase visibility for influencer
  React.useEffect(() => {
    if (taskId && checkPhaseVisibility) {
      checkPhaseVisibility(
        { taskId, userType: 'influencer' },
        {
          onSuccess: (visibility) => {
            setPhaseVisibility(visibility);
            
            // Set active tab to first visible phase
            const visiblePhases = Object.entries(visibility)
              .filter(([_, isVisible]) => isVisible)
              .map(([phase]) => phase);
            
            if (visiblePhases.length > 0) {
              setActiveTab(visiblePhases[0]);
            }
          }
        }
      );
    }
  }, [taskId, checkPhaseVisibility]);

  const getPhaseStatus = (phase: string) => {
    const state = workflowStates?.find(s => s.phase === phase);
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

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'content_requirement':
        return <FileText className="h-4 w-4" />;
      case 'content_review':
        return <Eye className="h-4 w-4" />;
      case 'publish_analytics':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const phases = [
    {
      id: 'content_requirement',
      title: 'Content Requirements',
      description: 'Review content guidelines and requirements'
    },
    {
      id: 'content_review',
      title: 'Content Upload',
      description: 'Upload your content for brand review'
    },
    {
      id: 'publish_analytics',
      title: 'Publish & Analytics',
      description: 'Publish approved content and track analytics'
    }
  ];

  const handleRefresh = () => {
    // Refresh workflow data
    window.location.reload();
  };

  if (workflowLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500">Loading workflow...</p>
        </div>
      </div>
    );
  }

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
              const isVisible = phaseVisibility[phase.id] || status === 'in_progress';
              
              return (
                <div 
                  key={phase.id} 
                  className={`flex items-center gap-3 p-3 border rounded-lg min-w-0 ${
                    isVisible ? 'border-gray-200' : 'border-gray-100 opacity-50'
                  }`}
                >
                  {getPhaseIcon(phase.id)}
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{phase.title}</div>
                    <div className="mt-1">{getStatusBadge(status)}</div>
                    {!isVisible && status === 'not_started' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Waiting for brand to share requirements
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Only show tabs if user has visible phases */}
          {Object.values(phaseVisibility).some(visible => visible) ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                {phases.map((phase) => (
                  <TabsTrigger 
                    key={phase.id} 
                    value={phase.id}
                    disabled={!phaseVisibility[phase.id] && getPhaseStatus(phase.id) !== 'in_progress'}
                  >
                    {getPhaseIcon(phase.id)}
                    <span className="ml-2 hidden sm:inline">{phase.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="content_requirement" className="mt-6">
                {phaseVisibility.content_requirement ? (
                  <ContentDraftEditor
                    taskId={taskId}
                    onDraftShared={handleRefresh}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">
                        Waiting for Content Requirements
                      </h3>
                      <p className="text-gray-600">
                        The brand team is preparing your content requirements. 
                        You'll be notified when they're ready for review.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="content_review" className="mt-6">
                {phaseVisibility.content_review ? (
                  <ContentUploadPanel
                    taskId={taskId}
                    onContentUploaded={handleRefresh}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">
                        Upload Phase Not Available
                      </h3>
                      <p className="text-gray-600">
                        Complete the content requirements phase first to unlock content upload.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="publish_analytics" className="mt-6">
                {phaseVisibility.publish_analytics ? (
                  <PublishAnalyticsView taskId={taskId} />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">
                        Publishing Phase Not Available
                      </h3>
                      <p className="text-gray-600">
                        Complete content review and approval to unlock the publishing phase.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Workflow Initializing
                </h3>
                <p className="text-gray-600">
                  The brand team is setting up your workflow. You'll receive a notification 
                  when your first task is ready.
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
