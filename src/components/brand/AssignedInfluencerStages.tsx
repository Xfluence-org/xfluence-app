import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Edit, 
  Eye, 
  Send, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Instagram,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

      // Combine assignment data with influencer profiles
      const enrichedAssignments: AssignedInfluencer[] = assignments?.map(assignment => {
        const profile = influencerProfiles.find(p => p.id === assignment.influencer_id);
        const manualData = assignment.manual_data as unknown as ManualInfluencerData | null;
        
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
          tasks: assignment.campaign_tasks || []
        };
      }) || [];

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

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'content_requirement': return <FileText className="h-4 w-4" />;
      case 'content_draft': return <Edit className="h-4 w-4" />;
      case 'content_review': return <Eye className="h-4 w-4" />;
      case 'post_content': return <Send className="h-4 w-4" />;
      case 'report_analytics': return <BarChart3 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'content_requirement': return 'bg-blue-100 text-blue-800';
      case 'content_draft': return 'bg-yellow-100 text-yellow-800';
      case 'content_review': return 'bg-purple-100 text-purple-800';
      case 'post_content': return 'bg-green-100 text-green-800';
      case 'report_analytics': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageName = (status: string) => {
    switch (status) {
      case 'content_requirement': return 'Requirements Review';
      case 'content_draft': return 'Content Draft';
      case 'content_review': return 'Content Review';
      case 'post_content': return 'Publish Content';
      case 'report_analytics': return 'Report Analytics';
      case 'completed': return 'Completed';
      default: return 'Pending';
    }
  };

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
      {assignedInfluencers.map((influencer) => (
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
                  <Progress 
                    value={influencer.tasks.length > 0 ? 
                      influencer.tasks.reduce((acc, task) => acc + task.progress, 0) / influencer.tasks.length : 0
                    } 
                    className="w-24" 
                  />
                  <span className="text-sm text-gray-600">
                    {influencer.tasks.length > 0 ? 
                      Math.round(influencer.tasks.reduce((acc, task) => acc + task.progress, 0) / influencer.tasks.length) : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 mb-3">Campaign Stages</h4>
              
              {influencer.tasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No tasks created yet</p>
                  <p className="text-sm">Tasks will appear once the assignment is processed</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {influencer.tasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      className="bg-gray-50 rounded-lg p-3 border transition-colors hover:bg-gray-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStageIcon(task.status)}
                          <span className="font-medium text-sm">{getStageName(task.status)}</span>
                        </div>
                        <Badge className={`text-xs ${getStageColor(task.status)}`}>
                          {task.progress > 0 ? `${task.progress}%` : 'Pending'}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Progress value={task.progress} className="flex-1 mr-2" />
                        {task.progress === 100 && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
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
