import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye } from 'lucide-react';
import { useSupabaseTypeCasts } from '@/hooks/useSupabaseTypeCasts';

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
  influencer_profile_url?: string;
}

const ContentTypeActiveSection: React.FC<ContentTypeActiveSectionProps> = ({ 
  campaignId, 
  contentType,
  onViewTasks 
}) => {
  const { castToUuid, isValidResult } = useSupabaseTypeCasts();
  const { data: activeParticipants = [], isLoading } = useQuery({
    queryKey: ['content-type-active-participants', campaignId, contentType],
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      // Use direct database query instead of missing function
      const { data: participants, error: participantsError } = await supabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', castToUuid(campaignId))
        .eq('status', 'accepted' as any);

      if (participantsError) {
        console.error('Error fetching active participants:', participantsError);
        throw participantsError;
      }

      // Fetch tasks separately for each participant
      const participantsWithTasks = await Promise.all(
        (participants || []).filter(isValidResult).map(async (participant: any) => {
          const { data: tasks } = await supabase
            .from('campaign_tasks')
            .select('id, status, progress, task_type')
            .eq('campaign_id', castToUuid(campaignId))
            .eq('influencer_id', castToUuid(participant.influencer_id));
          
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
          influencer_name: participant.influencer_name,
          influencer_handle: participant.influencer_handle,
          followers_count: participant.followers_count,
          engagement_rate: participant.engagement_rate,
          task_progress: avgProgress,
          influencer_profile_url: participant.influencer_profile_url
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
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src={participant.influencer_profile_url || `https://i.pravatar.cc/150?u=${participant.influencer_handle}`} 
                      alt={participant.influencer_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{participant.influencer_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {participant.influencer_handle ? (participant.influencer_handle.startsWith('@') ? participant.influencer_handle : `@${participant.influencer_handle}`) : '@user'}
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