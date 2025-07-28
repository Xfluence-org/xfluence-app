import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Send, User } from 'lucide-react';
import ShareContentRequirementsModal from './ShareContentRequirementsModal';
import { useSupabaseTypeCasts } from '@/hooks/useSupabaseTypeCasts';

interface ContentTypeWaitingSectionProps {
  campaignId: string;
  contentType: string;
}

interface WaitingParticipant {
  id: string;
  influencer_id: string;
  accepted_at: string;
  influencer_name: string;
  influencer_handle: string;
  followers_count: number;
  engagement_rate: number;
  influencer_profile_url?: string;
}

const ContentTypeWaitingSection: React.FC<ContentTypeWaitingSectionProps> = ({ 
  campaignId, 
  contentType 
}) => {
  const { castToUuid } = useSupabaseTypeCasts();
  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: waitingParticipants = [], isLoading, refetch } = useQuery({
    queryKey: ['content-type-waiting-participants', campaignId, contentType],
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      // Use direct database query instead of missing function
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', castToUuid(campaignId))
        .eq('status', 'accepted' as any)
        .eq('current_stage', 'waiting_for_requirements' as any);

      if (error) {
        console.error('Error fetching waiting participants:', error);
        return [];
      }

      // Ensure we have an array to work with
      const participantsList = Array.isArray(data) ? data : [];

      // Transform data - no need for fallbacks as the function handles it
      const transformed = participantsList.map((participant: any) => ({
        id: participant.id,
        influencer_id: participant.influencer_id,
        accepted_at: participant.accepted_at,
        influencer_name: participant.influencer_name,
        influencer_handle: participant.influencer_handle,
        followers_count: participant.followers_count || 25000,
        engagement_rate: participant.engagement_rate || 4.5,
        influencer_profile_url: participant.influencer_profile_url
      })) || [];
      
      return transformed;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">Loading participants...</p>
      </div>
    );
  }

  if (waitingParticipants.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <User className="h-10 w-10 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600 font-medium text-sm">No participants waiting for {contentType} requirements</p>
        <p className="text-gray-500 text-xs mt-1">
          Assigned participants will appear here until you share requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-md font-semibold text-[#1a1f2e]">
          Waiting for {contentType} Requirements ({waitingParticipants.length})
        </h5>
      </div>

      <div className="space-y-3">
        {waitingParticipants.map((participant) => (
          <Card key={participant.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src={participant.influencer_profile_url || `https://i.pravatar.cc/150?u=${participant.influencer_handle}`} 
                      alt={participant.influencer_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{participant.influencer_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {participant.influencer_handle ? (participant.influencer_handle.startsWith('@') ? participant.influencer_handle : `@${participant.influencer_handle}`) : '@user'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{participant.followers_count.toLocaleString()} followers</span>
                      <span>{participant.engagement_rate.toFixed(1)}% engagement</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedParticipant({
                    id: participant.id,
                    name: participant.influencer_name
                  })}
                  size="sm"
                  className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedParticipant && (
        <ShareContentRequirementsModal
          isOpen={!!selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
          campaignId={campaignId}
          participantId={selectedParticipant.id}
          influencerName={selectedParticipant.name}
          contentType={contentType}
          onRequirementsShared={() => {
            refetch();
            setSelectedParticipant(null);
          }}
        />
      )}
    </div>
  );
};

export default ContentTypeWaitingSection;