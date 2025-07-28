
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, Check, Mail, Clock, CheckCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface InvitationData {
  id: string;
  email: string;
  sent_at: string;
  clicked_at?: string;
  participant_id: string;
  campaign_title: string;
  campaign_id: string;
  status: string;
  invitation_token: string;
  invitation_claimed_at?: string;
  influencer_name?: string;
}

interface InvitationManagementProps {
  campaignId?: string;
}

const InvitationManagement: React.FC<InvitationManagementProps> = ({ campaignId }) => {
  const [copiedTokens, setCopiedTokens] = useState<Set<string>>(new Set());
  const [expandedInvitations, setExpandedInvitations] = useState<Set<string>>(new Set());
  const [showMore, setShowMore] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InvitationData | null>(null);

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['brand-invitations', campaignId],
    queryFn: async () => {
      let query = supabase
        .from('invitation_emails')
        .select(`
          id,
          email,
          sent_at,
          clicked_at,
          campaign_participant_id,
          campaign_participants!inner(
            id,
            status,
            invitation_token,
            invitation_claimed_at,
            influencer_id,
            campaigns!inner(
              id,
              title
            ),
            profiles(
              name
            )
          )
        `)
        .order('sent_at', { ascending: false });

      // If campaignId is provided, filter by that campaign
      if (campaignId) {
        const { data, error } = await query;
        if (error) throw error;
        
        // Filter results to only include invitations for the specific campaign
        const filteredData = (data || []).filter((item: any) => 
          item.campaign_participants.campaigns.id === campaignId
        );
        
        return filteredData.map((item: any) => ({
          id: item.id,
          email: item.email,
          sent_at: item.sent_at,
          clicked_at: item.clicked_at,
          participant_id: item.campaign_participants.id,
          campaign_title: item.campaign_participants.campaigns.title,
          campaign_id: item.campaign_participants.campaigns.id,
          status: item.campaign_participants.status,
          invitation_token: item.campaign_participants.invitation_token,
          invitation_claimed_at: item.campaign_participants.invitation_claimed_at,
          influencer_name: item.campaign_participants.profiles?.name
        }));
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        email: item.email,
        sent_at: item.sent_at,
        clicked_at: item.clicked_at,
        participant_id: item.campaign_participants.id,
        campaign_title: item.campaign_participants.campaigns.title,
        campaign_id: item.campaign_participants.campaigns.id,
        status: item.campaign_participants.status,
        invitation_token: item.campaign_participants.invitation_token,
        invitation_claimed_at: item.campaign_participants.invitation_claimed_at,
        influencer_name: item.campaign_participants.profiles?.name
      }));
    }
  });

  const copyToClipboard = async (token: string) => {
    const invitationLink = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopiedTokens(prev => new Set(prev).add(token));
      setTimeout(() => {
        setCopiedTokens(prev => {
          const newSet = new Set(prev);
          newSet.delete(token);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusBadge = (invitation: InvitationData) => {
    if (invitation.invitation_claimed_at) {
      return <Badge className="bg-green-100 text-green-800">Joined</Badge>;
    }
    if (invitation.clicked_at) {
      return <Badge className="bg-blue-100 text-blue-800">Clicked</Badge>;
    }
    return <Badge variant="outline">Sent</Badge>;
  };

  const getStatusIcon = (invitation: InvitationData) => {
    if (invitation.invitation_claimed_at) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (invitation.clicked_at) {
      return <Mail className="h-4 w-4 text-blue-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const toggleExpanded = (invitationId: string) => {
    setExpandedInvitations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invitationId)) {
        newSet.delete(invitationId);
      } else {
        newSet.add(invitationId);
      }
      return newSet;
    });
  };

  const displayedInvitations = showMore ? invitations : invitations.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading invitations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No invitations sent yet
          </div>
        ) : (
          <div className="space-y-4">
            {displayedInvitations.map((invitation) => (
              <div key={invitation.id} className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(invitation)}
                    <div className="flex-1">
                      <h4 className="font-medium">{invitation.email}</h4>
                      <p className="text-sm text-gray-600">
                        {!campaignId && invitation.campaign_title}
                        {invitation.influencer_name && (
                          <span>{!campaignId ? ' • ' : ''}{invitation.influencer_name}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sent: {new Date(invitation.sent_at).toLocaleDateString()}
                        {invitation.clicked_at && (
                          <span> • Clicked: {new Date(invitation.clicked_at).toLocaleDateString()}</span>
                        )}
                        {invitation.invitation_claimed_at && (
                          <span> • Joined: {new Date(invitation.invitation_claimed_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation)}
                    {invitation.influencer_name && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Influencer Profile</DialogTitle>
                          </DialogHeader>
                          <div className="flex items-center gap-4 p-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {invitation.influencer_name?.charAt(0) || invitation.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{invitation.influencer_name}</h3>
                              <p className="text-sm text-gray-600">{invitation.email}</p>
                              <p className="text-xs text-gray-500">
                                Status: {invitation.status}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {!invitation.invitation_claimed_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(invitation.invitation_token)}
                        className="flex items-center gap-1"
                      >
                        {copiedTokens.has(invitation.invitation_token) ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(invitation.id)}
                    >
                      {expandedInvitations.has(invitation.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {expandedInvitations.has(invitation.id) && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Campaign:</span> {invitation.campaign_title}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {invitation.status}
                      </div>
                      <div>
                        <span className="font-medium">Invitation Token:</span>
                        <code className="ml-2 text-xs bg-white px-2 py-1 rounded">
                          {invitation.invitation_token}
                        </code>
                      </div>
                      {invitation.clicked_at && (
                        <div>
                          <span className="font-medium">Clicked At:</span> {new Date(invitation.clicked_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {invitations.length > 3 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowMore(!showMore)}
                  className="flex items-center gap-2"
                >
                  {showMore ? 'Show Less' : `Show More (${invitations.length - 3} more)`}
                  {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationManagement;
