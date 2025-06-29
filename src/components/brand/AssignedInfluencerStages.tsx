
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Eye, 
  BarChart3, 
  Users,
  Instagram
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { taskWorkflowService, WorkflowState } from '@/services/taskWorkflowService';
import { useNavigate } from 'react-router-dom';

interface ManualInfluencerData {
  name: string;
  handle: string;
  followers?: number;
  engagementRate?: number;
  platform?: string;
  category?: string;
}

interface AssignedInfluencer {
  id: string;
  influencer_id: string | null;
  assignment_type: 'applicant' | 'manual';
  manual_data: ManualInfluencerData | null;
  influencer_name?: string;
  influencer_handle?: string;
  tasks: Task[];
  workflowStates: WorkflowState[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  task_type: string;
}

interface AssignedInfluencerStagesProps {
  campaignId: string;
  contentType: string;
  category: string;
  tier: string;
  onRefresh?: () => void;
}

const AssignedInfluencerStages: React.FC<AssignedInfluencerStagesProps> = ({
  campaignId,
  contentType,
  category,
  tier,
  onRefresh
}) => {
  const [assignedInfluencers, setAssignedInfluencers] = useState<AssignedInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAssignedInfluencers = async () => {
    try {
      setLoading(true);
      
      // Fetch assignments for this specific content type, category, and tier
      const { data: assignments, error: assignmentError } = await supabase
        .from('campaign_content_assignments')
        .select(`
          id,
          influencer_id,
          assignment_type,
          manual_data,
          campaign_tasks (
            id,
            title,
            description,
            status,
            progress,
            task_type
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('content_type', contentType)
        .eq('category', category)
        .eq('tier', tier);

      if (assignmentError) {
        console.error('Error fetching assignments:', assignmentError);
        return;
      }

      // Get influencer details for applicant-type assignments
      const influencerIds = assignments
        ?.filter(a => a.assignment_type === 'applicant' && a.influencer_id)
        .map(a => a.influencer_id) || [];

      let influencerProfiles: any[] = [];
      if (influencerIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', influencerIds);

        if (!profileError) {
          influencerProfiles = profiles || [];
        }
      }

      // Get workflow states for each task
      const enrichedAssignments: AssignedInfluencer[] = await Promise.all(
        assignments?.map(async (assignment) => {
          const profile = influencerProfiles.find(p => p.id === assignment.influencer_id);
          const manualData = assignment.manual_data as unknown as ManualInfluencerData | null;
          
          // Get workflow states for the first task (assuming one task per assignment for now)
          let workflowStates: WorkflowState[] = [];
          if (assignment.campaign_tasks && assignment.campaign_tasks.length > 0) {
            try {
              workflowStates = await taskWorkflowService.getWorkflowStates(assignment.campaign_tasks[0].id);
            } catch (error) {
              console.error('Error fetching workflow states:', error);
            }
          }
          
          return {
            id: assignment.id,
            influencer_id: assignment.influencer_id,
            assignment_type: assignment.assignment_type as 'applicant' | 'manual',
            manual_data: manualData,
            influencer_name: assignment.assignment_type === 'applicant' 
              ? profile?.name || 'Unknown User'
              : manualData?.name || 'Manual Entry',
            influencer_handle: assignment.assignment_type === 'applicant'
              ? `user_${assignment.influencer_id?.slice(0, 8)}`
              : manualData?.handle || 'unknown',
            tasks: assignment.campaign_tasks || [],
            workflowStates
          };
        }) || []
      );

      setAssignedInfluencers(enrichedAssignments);
    } catch (error) {
      console.error('Error fetching assigned influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedInfluencers();
  }, [campaignId, contentType, category, tier]);

  const getPhaseStatus = (workflowStates: WorkflowState[], phase: string) => {
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

  const getPhaseProgress = (status: string) => {
    switch (status) {
      case 'completed': return 100;
      case 'in_progress': return 50;
      case 'rejected': return 25;
      default: return 0;
    }
  };

  const handleManageTask = (taskId: string) => {
    navigate(`/brand/task-workflow/${taskId}`);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DDCD3] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading assigned influencers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignedInfluencers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No influencers assigned yet</p>
            <p className="text-gray-400 text-sm">Use the assign button above to add influencers to this content type</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignedInfluencers.map((influencer) => {
        const overallProgress = influencer.workflowStates.length > 0 ? 
          influencer.workflowStates.reduce((acc, state) => acc + getPhaseProgress(state.status), 0) / influencer.workflowStates.length : 0;

        return (
          <Card key={influencer.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#1DDCD3] text-white">
                      {influencer.influencer_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{influencer.influencer_name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Instagram className="h-3 w-3" />
                      @{influencer.influencer_handle}
                      <Badge variant="outline" className="text-xs">
                        {influencer.assignment_type === 'manual' ? 'Manual' : 'Applied'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Overall Progress</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={overallProgress} className="w-24" />
                    <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">Workflow Stages</h4>
                  {influencer.tasks.length > 0 && (
                    <Button
                      onClick={() => handleManageTask(influencer.tasks[0].id)}
                      size="sm"
                      className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                    >
                      Manage Workflow
                    </Button>
                  )}
                </div>
                
                {influencer.tasks.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No tasks created yet</p>
                    <p className="text-sm">Tasks will appear once the assignment is processed</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {phases.map((phase) => {
                      const status = getPhaseStatus(influencer.workflowStates, phase.id);
                      const progress = getPhaseProgress(status);
                      const Icon = phase.icon;
                      
                      return (
                        <div 
                          key={phase.id} 
                          className="bg-gray-50 rounded-lg p-4 border transition-colors hover:bg-gray-100"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-sm">{phase.title}</span>
                            </div>
                            {getStatusBadge(status)}
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-3">
                            {phase.description}
                          </p>
                          
                          <Progress value={progress} className="w-full" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {assignedInfluencers.length > 0 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => {
              fetchAssignedInfluencers();
              onRefresh?.();
            }}
          >
            Refresh Status
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssignedInfluencerStages;
