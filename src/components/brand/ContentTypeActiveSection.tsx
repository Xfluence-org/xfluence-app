import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye } from 'lucide-react';

interface ContentTypeActiveSectionProps {
  campaignId: string;
  contentType: string;
  onViewTasks?: (participantId: string, influencerId: string) => void;
}

interface ActiveParticipant {
  id: string;
  influencer_id: string;
  current_stage: string;
  influencer_name: string;
  influencer_handle: string;
  followers_count: number;
  engagement_rate: number;
  task_progress: number;
}

const ContentTypeActiveSection: React.FC<ContentTypeActiveSectionProps> = ({ 
  campaignId, 
  contentType,
  onViewTasks 
}) => {
  const { data: activeParticipants = [], isLoading } = useQuery({
    queryKey: ['content-type-active-participants', campaignId, contentType],
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const { data: participants, error: participantsError } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          influencer_id,
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
        console.error('Error fetching active participants:', participantsError);
        throw participantsError;
      }

      // Fetch tasks separately for each participant
      const participantsWithTasks = await Promise.all(
        (participants || []).map(async (participant) => {
          const { data: tasks } = await supabase
            .from('campaign_tasks')
            .select('id, status, progress, task_type')
            .eq('campaign_id', campaignId)
            .eq('influencer_id', participant.influencer_id);
          
          return {
            ...participant,
            campaign_tasks: tasks || []
          };
        })
      );

      const data = participantsWithTasks;

      // Transform data
      const transformed = data?.map((participant: any) => {
        const tasks = participant.campaign_tasks || [];
        const relevantTasks = tasks.filter((t: any) => 
          t.task_type === 'content_creation' || 
          t.task_type === contentType.toLowerCase()
        );
        const avgProgress = relevantTasks.length > 0 
          ? relevantTasks.reduce((sum: number, t: any) => sum + (t.progress || 0), 0) / relevantTasks.length 
          : 0;

        return {
          id: participant.id,
          influencer_id: participant.influencer_id,
          current_stage: participant.current_stage,
          influencer_name: participant.profiles?.name || 'Unknown Influencer',
          influencer_handle: `@${participant.profiles?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}`,
          followers_count: 15000 + Math.floor(Math.random() * 35000),
          engagement_rate: 3.0 + Math.random() * 4,
          task_progress: avgProgress
        };
      }) || [];
      
      return transformed;
    }
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'content_creation':
        return 'text-blue-600';
      case 'content_review':
        return 'text-yellow-600';
      case 'publish_analytics':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">Loading active participants...</p>
      </div>
    );
  }

  if (activeParticipants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h5 className="text-md font-semibold text-[#1a1f2e]">
        Working on {contentType} ({activeParticipants.length})
      </h5>

      <div className="space-y-3">
        {activeParticipants.map((participant) => (
          <Card key={participant.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#1DDCD3] text-white text-sm">
                      {participant.influencer_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{participant.influencer_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {participant.influencer_handle}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{participant.followers_count.toLocaleString()} followers</span>
                      <span className={`flex items-center gap-1 ${getStageColor(participant.current_stage)}`}>
                        <CheckCircle className="h-3 w-3" />
                        {participant.current_stage.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={participant.task_progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-gray-600">{participant.task_progress.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2"
                  onClick={() => onViewTasks?.(participant.id, participant.influencer_id)}
                  title="View Tasks"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentTypeActiveSection;