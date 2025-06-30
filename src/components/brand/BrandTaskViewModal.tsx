import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import TaskProgressTracker from '@/components/shared/TaskProgressTracker';
import ContentReviewPanel from '@/components/brand/ContentReviewPanel';
import TaskFeedbackSection from '@/components/brand/TaskFeedbackSection';
import FormattedContentRequirements from '@/components/brand/FormattedContentRequirements';
import {
  FileText,
  Upload,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  Download,
  ChevronRight,
  X,
  CheckCircle2
} from 'lucide-react';

interface BrandTaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  influencerId: string;
  campaignId: string;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  task_type: string;
  phase_visibility: any;
  created_at: string;
  due_date?: string;
  workflow_states: any[];
  content_drafts: any[];
  task_feedback: any[];
  task_uploads?: any[];
}

const BrandTaskViewModal: React.FC<BrandTaskViewModalProps> = ({
  isOpen,
  onClose,
  participantId,
  influencerId,
  campaignId
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Fetch participant details and tasks
  const { data: participantData, isLoading, error } = useQuery({
    queryKey: ['brand-participant-tasks', participantId, influencerId, campaignId],
    enabled: isOpen && !!participantId && !!influencerId && !!campaignId,
    queryFn: async () => {
      // console.log('Fetching tasks for:', { participantId, influencerId, campaignId });
      
      try {
        // Get participant details
        const { data: participant, error: participantError } = await supabase
          .from('campaign_participants')
          .select(`
            *,
            profiles!campaign_participants_influencer_id_fkey(
              id,
              name,
              email
            )
          `)
          .eq('id', participantId)
          .single();

        if (participantError) {
          // console.error('Error fetching participant:', participantError);
          throw participantError;
        }

        // Get tasks for this influencer in this campaign
        const { data: tasks, error: tasksError } = await supabase
          .from('campaign_tasks')
          .select(`
            *,
            task_workflow_states(
              id,
              phase,
              status,
              created_at
            ),
            task_content_drafts(
              id,
              content,
              ai_generated,
              brand_edited,
              shared_with_influencer,
              created_at,
              updated_at
            ),
            task_feedback(
              id,
              message,
              sender_type,
              phase,
              created_at
            ),
            task_uploads(
              id,
              file_url,
              filename,
              mime_type,
              file_size,
              caption,
              hashtags,
              created_at,
              uploader_id
            )
          `)
          .eq('campaign_id', campaignId)
          .eq('influencer_id', influencerId);

        if (tasksError) {
          // console.error('Error fetching tasks:', tasksError);
          // Don't throw error if it's just empty results
          if (tasksError.code !== 'PGRST116') {
            throw tasksError;
          }
        }

        // console.log('Fetched tasks:', tasks);

        return {
          participant,
          tasks: tasks || []
        };
      } catch (error) {
        // console.error('Error in queryFn:', error);
        throw error;
      }
    }
  });

  const getPhaseStatus = (task: TaskData, phase: string) => {
    const workflowState = task.workflow_states?.find(ws => ws.phase === phase);
    return workflowState?.status || 'pending';
  };

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <div className="h-5 w-5 rounded-full bg-blue-600 animate-pulse" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'content_requirement': { label: 'Requirements Phase', color: 'bg-blue-100 text-blue-700' },
      'content_review': { label: 'Content Review', color: 'bg-yellow-100 text-yellow-700' },
      'publish_analytics': { label: 'Publishing', color: 'bg-green-100 text-green-700' },
      'completed': { label: 'Completed', color: 'bg-green-100 text-green-700' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Task Progress...</DialogTitle>
            <DialogDescription>Please wait while we load the task information</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DDCD3]"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error Loading Tasks</DialogTitle>
            <DialogDescription>Unable to load task information at this time</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load task information.</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { participant, tasks } = participantData || { participant: null, tasks: [] };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{participant?.profiles?.name || 'Influencer'} - Task Progress</span>
              <Badge variant="outline">
                {participant?.current_stage?.replace('_', ' ') || 'Unknown Stage'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              View and manage tasks for this influencer
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participant Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium">{participant?.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Stage</p>
                      <p className="font-medium">{participant?.current_stage?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accepted Date</p>
                      <p className="font-medium">
                        {participant?.accepted_at 
                          ? new Date(participant.accepted_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={participant?.progress || 0} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{participant?.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {tasks.length} task(s) assigned
                  </p>
                  {tasks.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No tasks created yet</p>
                      <p className="text-sm text-gray-400 mt-1">Share content requirements to create tasks for this influencer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task: TaskData) => {
                        const isExpanded = expandedTaskId === task.id;
                        const requirementsAccepted = task.workflow_states?.find(ws => ws.phase === 'content_requirement')?.status === 'completed';
                        const isInReviewPhase = task.status === 'content_review' || getPhaseStatus(task, 'content_review') === 'active';
                        
                        return (
                          <Card key={task.id} className="overflow-hidden">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{task.title}</h4>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(task.status)}
                                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                              </div>
                              {/* Show requirements acceptance status */}
                              {requirementsAccepted && (
                                <div className="flex items-center gap-1 text-xs text-green-600 mb-2">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Requirements accepted by influencer</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-3">
                                <Progress value={task.progress} className="h-2 flex-1" />
                                <span className="text-sm text-gray-600">{task.progress}%</span>
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                {task.task_feedback && task.task_feedback.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MessageSquare className="h-3 w-3" />
                                    {task.task_feedback.length} feedback message{task.task_feedback.length > 1 ? 's' : ''}
                                  </div>
                                )}
                                {isInReviewPhase && task.task_uploads && task.task_uploads.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-orange-600">
                                    <Eye className="h-3 w-3" />
                                    Content awaiting review
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="border-t bg-gray-50">
                                <Tabs defaultValue="feedback" className="w-full">
                                  <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
                                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                                    <TabsTrigger value="review" disabled={!isInReviewPhase}>
                                      {isInReviewPhase ? 'Review Content' : 'Review (Locked)'}
                                    </TabsTrigger>
                                    <TabsTrigger value="details">Task Details</TabsTrigger>
                                  </TabsList>
                                  
                                  <div className="p-4">
                                    <TabsContent value="feedback" className="mt-0">
                                      <TaskFeedbackSection
                                        taskId={task.id}
                                        phase={task.status === 'publish_analytics' ? 'publish_analytics' : 
                                               task.status === 'content_review' ? 'content_review' : 
                                               'content_requirement'}
                                        userType="brand"
                                      />
                                    </TabsContent>
                                    
                                    <TabsContent value="review" className="mt-0">
                                      {isInReviewPhase ? (
                                        <ContentReviewPanel
                                          taskId={task.id}
                                          onReviewComplete={() => {
                                            // Refresh data
                                            window.location.reload();
                                          }}
                                        />
                                      ) : (
                                        <div className="text-center py-8 text-gray-500">
                                          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                          <p className="font-medium mb-2">Content Review Not Available</p>
                                          <p className="text-sm">
                                            {!requirementsAccepted 
                                              ? "Waiting for influencer to accept content requirements"
                                              : "Waiting for influencer to upload content for review"}
                                          </p>
                                        </div>
                                      )}
                                    </TabsContent>
                                    
                                    <TabsContent value="details" className="mt-0">
                                      <div className="space-y-4">
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-3">Content Requirements</p>
                                          <FormattedContentRequirements content={task.description} />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-2">Workflow Status</p>
                                          <div className="space-y-2">
                                            {['content_requirement', 'content_review', 'publish_analytics'].map((phase) => {
                                              const status = getPhaseStatus(task, phase);
                                              return (
                                                <div key={phase} className="flex items-center gap-2">
                                                  {getPhaseIcon(status)}
                                                  <span className="text-sm">{phase.replace(/_/g, ' ')}</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </TabsContent>
                                  </div>
                                </Tabs>
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-4">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No tasks assigned yet</p>
                      <p className="text-sm text-gray-400 mt-2">Share content requirements to create tasks for this influencer</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task: TaskData) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        {getStatusBadge(task.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-3 font-medium">Content Requirements</p>
                        <FormattedContentRequirements content={task.description} />
                      </div>

                      {/* Workflow Phases */}
                      <div>
                        <p className="text-sm font-medium mb-3">Workflow Progress</p>
                        <div className="space-y-2">
                          {['content_requirement', 'content_review', 'publish_analytics'].map((phase) => {
                            const status = getPhaseStatus(task, phase);
                            const phaseNames = {
                              content_requirement: 'Content Requirements',
                              content_review: 'Content Review',
                              publish_analytics: 'Publish & Analytics'
                            };
                            
                            return (
                              <div key={phase} className="flex items-center gap-3">
                                {getPhaseIcon(status)}
                                <span className={`text-sm ${
                                  status === 'active' ? 'font-medium text-blue-700' : 
                                  status === 'completed' ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                  {phaseNames[phase]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content Drafts */}
                      {task.content_drafts?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Content Requirements</p>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              {task.content_drafts.filter(d => d.shared_with_influencer).length} requirement(s) shared
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Feedback Count */}
                      {task.task_feedback?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                          <span>{task.task_feedback.length} feedback message(s)</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-4 mt-4">
              {tasks.length > 0 ? (
                tasks.map((task: TaskData) => (
                  <TaskProgressTracker
                    key={task.id}
                    taskId={task.id}
                    campaignId={campaignId}
                    influencerId={influencerId}
                  />
                ))
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No tasks to track progress for
                </p>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-gray-500">
                    Activity timeline coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default BrandTaskViewModal;