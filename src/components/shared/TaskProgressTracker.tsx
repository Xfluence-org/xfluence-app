import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Activity,
  FileText,
  Upload,
  Share2,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';

interface TaskProgressTrackerProps {
  taskId: string;
  campaignId: string;
  influencerId?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  actor_name: string;
  actor_type: 'brand' | 'influencer' | 'system';
  created_at: string;
  metadata?: any;
}

interface TaskStatus {
  phase: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'rejected';
  started_at?: string;
  completed_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

const TaskProgressTracker: React.FC<TaskProgressTrackerProps> = ({
  taskId,
  campaignId,
  influencerId
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch task details
  const { data: task } = useQuery({
    queryKey: ['task-details', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_tasks')
        .select(`
          *,
          campaign:campaigns(
            id,
            title,
            brand_id
          )
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch workflow states
  const { data: workflowStates = [] } = useQuery({
    queryKey: ['task-workflow-states', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_workflow_states')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch activity logs (simulated for now)
  const { data: activities = [] } = useQuery({
    queryKey: ['task-activities', taskId],
    queryFn: async () => {
      // Simulate activity logs based on workflow states and other events
      const logs: ActivityLog[] = [];

      // Add workflow state changes as activities
      for (const state of workflowStates) {
        if (state.started_at) {
          logs.push({
            id: `${state.id}-started`,
            action: 'phase_started',
            description: `Started ${state.phase.replace('_', ' ')} phase`,
            actor_name: 'System',
            actor_type: 'system',
            created_at: state.started_at,
            metadata: { phase: state.phase }
          });
        }
        if (state.completed_at) {
          logs.push({
            id: `${state.id}-completed`,
            action: 'phase_completed',
            description: `Completed ${state.phase.replace('_', ' ')} phase`,
            actor_name: 'System',
            actor_type: 'system',
            created_at: state.completed_at,
            metadata: { phase: state.phase }
          });
        }
      }

      // Add task creation
      if (task?.created_at) {
        logs.push({
          id: 'task-created',
          action: 'task_created',
          description: 'Task was created',
          actor_name: 'Brand',
          actor_type: 'brand',
          created_at: task.created_at
        });
      }

      // Sort by created_at descending
      return logs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!task && workflowStates.length > 0
  });

  // Calculate progress
  const calculateProgress = () => {
    const phases = ['content_requirement', 'content_review', 'publish_analytics'];
    const completedPhases = workflowStates.filter(s => s.status === 'completed').length;
    return (completedPhases / phases.length) * 100;
  };

  // Get current phase
  const getCurrentPhase = () => {
    const activeState = workflowStates.find(s => s.status === 'in_progress' || s.status === 'active');
    return activeState?.phase || 'content_requirement';
  };

  // Get phase details
  const getPhaseDetails = (phaseId: string) => {
    const state = workflowStates.find(s => s.phase === phaseId);
    return {
      status: state?.status || 'not_started',
      startedAt: state?.started_at,
      completedAt: state?.completed_at,
      rejectedAt: state?.rejected_at,
      rejectionReason: state?.rejection_reason
    };
  };

  // Phase configuration
  const phases = [
    {
      id: 'content_requirement',
      title: 'Content Requirements',
      description: 'Review and understand content guidelines',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: 'content_review',
      title: 'Content Creation & Review',
      description: 'Create and submit content for approval',
      icon: Upload,
      color: 'text-blue-600'
    },
    {
      id: 'publish_analytics',
      title: 'Publish & Analytics',
      description: 'Publish content and track performance',
      icon: TrendingUp,
      color: 'text-green-600'
    }
  ];

  const getPhaseIcon = (phase: any, status: string) => {
    const Icon = phase.icon;
    switch (status) {
      case 'completed':
        return <CheckCircle className={`h-5 w-5 ${phase.color}`} />;
      case 'in_progress':
      case 'active':
        return <Clock className={`h-5 w-5 ${phase.color} animate-pulse`} />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'phase_started':
        return <Activity className="h-4 w-4" />;
      case 'phase_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'content_uploaded':
        return <Upload className="h-4 w-4" />;
      case 'content_reviewed':
        return <FileText className="h-4 w-4" />;
      case 'message_sent':
        return <MessageSquare className="h-4 w-4" />;
      case 'content_published':
        return <Share2 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const progress = calculateProgress();
  const currentPhase = getCurrentPhase();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Task Progress Tracking
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {task?.title || 'Loading...'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Overall Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Phase Cards */}
            <div className="space-y-4">
              {phases.map((phase, index) => {
                const details = getPhaseDetails(phase.id);
                const isActive = currentPhase === phase.id;
                
                return (
                  <div
                    key={phase.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isActive 
                        ? 'border-primary bg-primary/5' 
                        : details.status === 'completed'
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getPhaseIcon(phase, details.status)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{phase.title}</h4>
                          {getStatusBadge(details.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {phase.description}
                        </p>
                        
                        {details.startedAt && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Started {format(new Date(details.startedAt), 'MMM d, yyyy')}
                            </span>
                            {details.completedAt && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Completed {formatDistanceToNow(new Date(details.completedAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 text-sm font-medium text-muted-foreground">
                        {index + 1}/3
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                {phases.map((phase, index) => {
                  const details = getPhaseDetails(phase.id);
                  
                  return (
                    <div key={phase.id} className="relative flex items-start gap-4">
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${
                        details.status === 'completed' 
                          ? 'border-green-500' 
                          : details.status === 'in_progress' || details.status === 'active'
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {getPhaseIcon(phase, details.status)}
                      </div>
                      
                      <div className="flex-1 pb-8">
                        <h4 className="font-medium mb-1">{phase.title}</h4>
                        
                        {details.status !== 'not_started' && (
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {details.startedAt && (
                              <p>Started: {format(new Date(details.startedAt), 'MMM d, yyyy h:mm a')}</p>
                            )}
                            {details.completedAt && (
                              <p>Completed: {format(new Date(details.completedAt), 'MMM d, yyyy h:mm a')}</p>
                            )}
                            {details.rejectedAt && (
                              <p className="text-red-600">
                                Rejected: {format(new Date(details.rejectedAt), 'MMM d, yyyy h:mm a')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No activity recorded yet
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.action)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.actor_name}
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskProgressTracker;