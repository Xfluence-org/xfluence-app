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
  const { castToUuid, isValidArrayResult, isValidResult, filterValidResults } = useSupabaseTypeCasts();

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

      // Ensure we have a valid array result
      if (!isValidArrayResult(influencers) || influencers.length === 0) {
        setActiveInfluencers([]);
        return;
      }

      // Get task counts and progress for each influencer
      const influencersWithTasks = await Promise.all(
        influencers.map(async (influencer) => {
          if (!isValidResult(influencer)) {
            return null;
          }

          const { data: tasks, error: tasksError } = await supabase
            .from('campaign_tasks')
            .select('id, progress')
            .eq('campaign_id', castToUuid(campaignId))
            .eq('influencer_id', castToUuid(influencer.influencer_id));

          if (tasksError) {
            console.error('Error fetching tasks:', tasksError);
          }

          const validTasks = tasks ? filterValidResults(tasks) : [];
          const taskCount = validTasks.length;
          const avgProgress = validTasks.length > 0 
            ? Math.round(validTasks.reduce((sum, task) => {
                return sum + (isValidResult(task) && typeof task.progress === 'number' ? task.progress : 0);
              }, 0) / validTasks.length)
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

      // Filter out null results
      const validInfluencers = influencersWithTasks.filter((inf): inf is ActiveInfluencer => inf !== null);
      setActiveInfluencers(validInfluencers);
    } catch (error) {
      console.error('Error in fetchActiveInfluencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-amber-600';
    return 'text-red-500';
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading active influencers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeInfluencers.length === 0) {
    return (
      <Card className="card-elevated border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-6 w-6 text-primary" />
            Active Influencers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No active influencers yet</p>
            <p className="text-muted-foreground/70 text-sm">Accept applications to see influencers here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Users className="h-6 w-6 text-primary" />
          Active Influencers ({activeInfluencers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeInfluencers.map((influencer) => (
          <div key={influencer.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-semibold">
                  {influencer.influencer_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-lg">{influencer.influencer_name}</h4>
                <p className="text-sm text-muted-foreground font-medium">{influencer.influencer_handle}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {influencer.followers_count?.toLocaleString()} followers
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {influencer.engagement_rate}% engagement
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1">
                {getStageDisplay(influencer.current_stage)}
              </Badge>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <span className={`font-semibold text-lg ${getProgressColor(influencer.progress)}`}>
                    {influencer.progress}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                  {influencer.task_count} {influencer.task_count === 1 ? 'task' : 'tasks'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onViewDetails && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails(influencer.influencer_id)}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveInfluencersSection;
