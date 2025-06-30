import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Send, User } from 'lucide-react';
import ShareContentRequirementsModal from './ShareContentRequirementsModal';

interface WaitingParticipantsSectionProps {
  campaignId: string;
  contentTypes?: string[];
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

const WaitingParticipantsSection: React.FC<WaitingParticipantsSectionProps> = ({ campaignId, contentTypes }) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: waitingParticipants = [], isLoading, refetch } = useQuery({
    queryKey: ['waiting-participants', campaignId],
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_campaign_waiting_influencers', {
        campaign_id_param: campaignId
      });

      if (error) {
        console.error('Error fetching waiting participants:', error);
        throw error;
      }

      // console.log('Waiting participants query result:', data);

      // Transform data - no need for fallbacks as the function handles it
      const transformed = data?.map((participant: any) => ({
        id: participant.id,
        influencer_id: participant.influencer_id,
        accepted_at: participant.accepted_at,
        influencer_name: participant.influencer_name,
        influencer_handle: participant.influencer_handle,
        followers_count: participant.followers_count || 25000,
        engagement_rate: participant.engagement_rate || 4.5,
        influencer_profile_url: participant.influencer_profile_url
      })) || [];
      
      // console.log('Transformed waiting participants:', transformed);
      return transformed;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading participants...</p>
      </div>
    );
  }

  // console.log('WaitingParticipantsSection render - participants:', waitingParticipants);

  if (waitingParticipants.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium">No participants waiting for requirements</p>
        <p className="text-gray-500 text-sm mt-1">
          All accepted participants have received their content requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-[#1a1f2e]">
            All Participants Waiting for Content Requirements ({waitingParticipants.length})
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Share requirements for specific content types in the tabs below, or share all requirements at once here.
          </p>
        </div>
        <Button 
          onClick={() => refetch()} 
          size="sm" 
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {waitingParticipants.map((participant) => (
          <Card key={participant.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <img 
                      src={participant.influencer_profile_url || `https://i.pravatar.cc/150?u=${participant.influencer_handle}`} 
                      alt={participant.influencer_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{participant.influencer_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {participant.influencer_handle.startsWith('@') ? participant.influencer_handle : `@${participant.influencer_handle}`}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{participant.followers_count.toLocaleString()} followers</span>
                      <span>{participant.engagement_rate.toFixed(1)}% engagement</span>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                      <Clock className="h-3 w-3" />
                      <span>Waiting since {new Date(participant.accepted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {contentTypes && contentTypes.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {contentTypes.join(' • ')}
                    </Badge>
                  )}
                  <Button
                    onClick={() => setSelectedParticipant({
                      id: participant.id,
                      name: participant.influencer_name
                    })}
                    className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Share All Requirements
                  </Button>
                </div>
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
          onRequirementsShared={() => {
            refetch();
            setSelectedParticipant(null);
          }}
        />
      )}
    </div>
  );
};

export default WaitingParticipantsSection;