import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  hasRealData: boolean;
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
        return [];
      }

      // Ensure we have an array and transform data
      const participantsList = Array.isArray(data) ? data : [];
      
      // Get additional profile data including Instagram accounts
      const participantIds = participantsList.map(p => p.influencer_id).filter(Boolean);
      
      let instagramData: any[] = [];
      if (participantIds.length > 0) {
        const { data: igData } = await supabase
          .from('instagram_accounts')
          .select('user_id, username, profile_picture, followers_count, engagement_rate')
          .in('user_id', participantIds);
        instagramData = igData || [];
      }
      
      return participantsList.map((participant: any) => {
        const instagram = instagramData.find(ig => ig.user_id === participant.influencer_id);
        
        // Don't use fake generated data - use real data or show N/A
        const isGeneratedHandle = participant.influencer_handle?.includes('@user_');
        const isGeneratedFollowers = !instagram?.followers_count && participant.followers_count;
        
        return {
          id: participant.id,
          influencer_id: participant.influencer_id,
          accepted_at: participant.accepted_at,
          influencer_name: instagram?.username || participant.influencer_name || 'Unknown',
          influencer_handle: instagram?.username ? `@${instagram.username}` : (isGeneratedHandle ? 'N/A' : participant.influencer_handle),
          followers_count: instagram?.followers_count || 0,
          engagement_rate: instagram?.engagement_rate || 0,
          influencer_profile_url: instagram?.profile_picture,
          hasRealData: !!instagram
        };
      });
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading participants...</p>
      </div>
    );
  }


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
                    {participant.influencer_profile_url && (
                      <AvatarImage 
                        src={participant.influencer_profile_url} 
                        alt={participant.influencer_name}
                      />
                    )}
                    <AvatarFallback className="bg-[#1DDCD3] text-white">
                      {participant.influencer_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{participant.influencer_name}</h4>
                      {participant.influencer_handle !== 'N/A' && (
                        <Badge variant="outline" className="text-xs">
                          {participant.influencer_handle.startsWith('@') ? participant.influencer_handle : `@${participant.influencer_handle}`}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {participant.hasRealData ? (
                        <>
                          <span>{participant.followers_count.toLocaleString()} followers</span>
                          <span>{participant.engagement_rate.toFixed(1)}% engagement</span>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Instagram data not available</span>
                      )}
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
                    Share Content Requirements
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