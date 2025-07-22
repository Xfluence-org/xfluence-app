
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, ChevronRight } from 'lucide-react';
import { useSupabaseTypeCasts } from '@/hooks/useSupabaseTypeCasts';

interface ActiveInfluencer {
  id: string;
  influencer_id: string;
  current_stage: string;
  accepted_at: string;
  status: string;
  influencer_name: string;
  influencer_handle: string;
  followers_count: number;
  engagement_rate: number;
  task_count: number;
  progress: number;
}

interface ActiveInfluencersSectionProps {
  campaignId: string;
  onViewDetails?: (influencerId: string) => void;
}

const ActiveInfluencersSection: React.FC<ActiveInfluencersSectionProps> = ({
  campaignId,
  onViewDetails
}) => {
  const [activeInfluencers, setActiveInfluencers] = useState<ActiveInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const { castToUuid } = useSupabaseTypeCasts();

  useEffect(() => {
    fetchActiveInfluencers();
  }, [campaignId]);

  const fetchActiveInfluencers = async () => {
    try {
      setLoading(true);
      
      // Get active influencers using the existing database function
      const { data: influencers, error: influencersError } = await supabase
        .rpc('get_campaign_active_influencers', { 
          campaign_id_param: castToUuid(campaignId) 
        });

      if (influencersError) {
        console.error('Error fetching active influencers:', influencersError);
        return;
      }

      if (!influencers || influencers.length === 0) {
        setActiveInfluencers([]);
        return;
      }

      // Get task counts and progress for each influencer
      const influencersWithTasks = await Promise.all(
        influencers.map(async (influencer) => {
          const { data: tasks, error: tasksError } = await supabase
            .from('campaign_tasks')
            .select('id, progress')
            .eq('campaign_id', castToUuid(campaignId))
            .eq('influencer_id', castToUuid(influencer.influencer_id));

          const taskCount = tasks?.length || 0;
          const avgProgress = tasks?.length > 0 
            ? Math.round(tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length)
            : 0;

          return {
            id: influencer.id,
            influencer_id: influencer.influencer_id,
            current_stage: influencer.current_stage,
            accepted_at: influencer.accepted_at,
            status: influencer.status,
            influencer_name: influencer.influencer_name,
            influencer_handle: influencer.influencer_handle,
            followers_count: influencer.followers_count,
            engagement_rate: influencer.engagement_rate,
            task_count: taskCount,
            progress: avgProgress
          };
        })
      );

      setActiveInfluencers(influencersWithTasks);
    } catch (error) {
      console.error('Error in fetchActiveInfluencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStageDisplay = (stage: string) => {
    switch (stage) {
      case 'content_creation': return 'Creating Content';
      case 'content_review': return 'Under Review';
      case 'publish_analytics': return 'Published';
      default: return 'In Progress';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DDCD3] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading active influencers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeInfluencers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Influencers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No active influencers yet</p>
            <p className="text-gray-400 text-sm">Accept applications to see influencers here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Influencers ({activeInfluencers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeInfluencers.map((influencer) => (
          <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[#1DDCD3] text-white">
                  {influencer.influencer_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{influencer.influencer_name}</h4>
                <p className="text-sm text-gray-500">{influencer.influencer_handle}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">
                    {influencer.followers_count?.toLocaleString()} followers
                  </span>
                  <span className="text-xs text-gray-500">
                    {influencer.engagement_rate}% engagement
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                {getStageDisplay(influencer.current_stage)}
              </Badge>
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Progress:</span>
                  <span className={`font-medium ${getProgressColor(influencer.progress)}`}>
                    {influencer.progress}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {influencer.task_count} {influencer.task_count === 1 ? 'task' : 'tasks'}
                </div>
              </div>
            </div>

            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(influencer.influencer_id)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveInfluencersSection;
