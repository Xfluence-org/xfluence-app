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
      const { data, error } = await supabase
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
        .eq('current_stage', 'waiting_for_requirements');

      if (error) {
        console.error('Error fetching waiting participants:', error);
        throw error;
      }

      // console.log('Waiting participants query result:', data);

      // Transform data to include mock data for display
      const transformed = data?.map((participant: any) => ({
        id: participant.id,
        influencer_id: participant.influencer_id,
        accepted_at: participant.accepted_at,
        influencer_name: participant.profiles?.name || 'Unknown Influencer',
        influencer_handle: `@${participant.profiles?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}`,
        followers_count: 15000 + Math.floor(Math.random() * 35000),
        engagement_rate: 3.0 + Math.random() * 4
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
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#1DDCD3] text-white">
                      {participant.influencer_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{participant.influencer_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {participant.influencer_handle}
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