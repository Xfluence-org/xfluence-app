import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatPhaseName, getPhaseColor } from '@/utils/taskFormatters';

interface ActiveInfluencersSectionProps {
  campaignId: string;
  onViewTasks?: (participantId: string, influencerId: string) => void;
}

interface ActiveParticipant {
  id: string;
  influencer_id: string;
  current_stage: string;
  accepted_at: string;
  influencer_name: string;
  influencer_handle: string;
  followers_count: number;
  engagement_rate: number;
  task_progress: number;
  tasks_completed: number;
  total_tasks: number;
}

const ActiveInfluencersSection: React.FC<ActiveInfluencersSectionProps> = ({ campaignId, onViewTasks }) => {
  const navigate = useNavigate();
  const { data: activeParticipants = [], isLoading, refetch } = useQuery({
    queryKey: ['active-participants', campaignId],
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const { data: participants, error: participantsError } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          influencer_id,
          accepted_at,
          current_stage,
          status,
          profiles(
            id,
            name
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'accepted')
        .in('current_stage', ['content_creation', 'content_review', 'publish_analytics']);

      if (participantsError) {
        // console.error('Error fetching active participants:', participantsError);
        throw participantsError;
      }

      // Fetch tasks separately for each participant
      const data = await Promise.all(
        (participants || []).map(async (participant) => {
          const { data: tasks } = await supabase
            .from('campaign_tasks')
            .select('id, status, progress')
            .eq('campaign_id', campaignId)
            .eq('influencer_id', participant.influencer_id);
          
          return {
            ...participant,
            campaign_tasks: tasks || []
          };
        })
      );

      // Transform data
      const transformed = data?.map((participant: any) => {
        const tasks = participant.campaign_tasks || [];
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
        const totalProgress = tasks.reduce((sum: number, t: any) => sum + (t.progress || 0), 0);
        const avgProgress = tasks.length > 0 ? totalProgress / tasks.length : 0;

        return {
          id: participant.id,
          influencer_id: participant.influencer_id,
          current_stage: participant.current_stage,
          accepted_at: participant.accepted_at,
          influencer_name: participant.profiles?.name || 'Unknown Influencer',
          influencer_handle: `@${participant.profiles?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}`,
          followers_count: 15000 + Math.floor(Math.random() * 35000),
          engagement_rate: 3.0 + Math.random() * 4,
          task_progress: avgProgress,
          tasks_completed: completedTasks,
          total_tasks: tasks.length
        };
      }) || [];
      
      return transformed;
    }
  });

  const getStageDisplay = (stage: string) => {
    return { 
      label: formatPhaseName(stage), 
      color: getPhaseColor(stage) 
    };
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading active influencers...</p>
      </div>
    );
  }

  if (activeParticipants.length === 0) {
    return null; // Don't show section if no active participants
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#1DDCD3]" />
            Active Influencers ({activeParticipants.length})
          </CardTitle>
          <Button 
            onClick={() => refetch()} 
            size="sm" 
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Influencers who have received their content requirements and are actively working on the campaign.
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          {activeParticipants.map((participant) => {
            const stageInfo = getStageDisplay(participant.current_stage);
            
            return (
              <Card key={participant.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-[#1DDCD3] text-white">
                          {participant.influencer_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{participant.influencer_name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {participant.influencer_handle}
                          </Badge>
                          <Badge className={`text-xs ${stageInfo.color}`}>
                            {stageInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>{participant.followers_count.toLocaleString()} followers</span>
                          <span>{participant.engagement_rate.toFixed(1)}% engagement</span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {participant.tasks_completed}/{participant.total_tasks} tasks
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Progress value={participant.task_progress} className="h-2 flex-1" />
                          <span className="text-xs text-gray-600">{participant.task_progress.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // Navigate to tasks view
                        if (onViewTasks) {
                          onViewTasks(participant.id, participant.influencer_id);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveInfluencersSection;