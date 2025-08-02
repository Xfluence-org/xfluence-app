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
  application_message?: string;
  influencer_name?: string;
  influencer_id?: string;
  profile_picture?: string;
  username?: string;
  followers_count?: number;
  engagement_rate?: number;
}

interface InfluencerProfile {
  username: string;
  followers_count: number;
  engagement_rate: number;
  profile_picture: string;
}

interface InvitationManagementProps {
  campaignId?: string;
}

const InvitationManagement: React.FC<InvitationManagementProps> = ({ campaignId }) => {
  const [copiedTokens, setCopiedTokens] = useState<Set<string>>(new Set());
  const [expandedInvitations, setExpandedInvitations] = useState<Set<string>>(new Set());
  const [showMore, setShowMore] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InvitationData | null>(null);
  const [influencerProfile, setInfluencerProfile] = useState<InfluencerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const { data: invitations = [], isLoading, refetch } = useQuery({
    queryKey: ['invitations', campaignId],
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
            application_message,
            influencer_id,
            campaigns!inner(
              id,
              title
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
        
        // Get the basic invitation data first
        const invitationData = filteredData.map((item: any) => ({
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
          application_message: item.campaign_participants.application_message,
          influencer_name: null,
          influencer_id: item.campaign_participants.influencer_id,
          profile_picture: undefined,
          username: undefined,
          followers_count: undefined,
          engagement_rate: undefined
        }));

        // Fetch Instagram data for users who have joined (have influencer_id)
        const joinedUsers = invitationData.filter(inv => inv.influencer_id);
        if (joinedUsers.length > 0) {
          const userIds = joinedUsers.map(inv => inv.influencer_id);
          
          // Get profiles data
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds);

          // Get Instagram data
          const { data: instagramData } = await supabase
            .from('instagram_accounts')
            .select('user_id, username, profile_picture, followers_count, engagement_rate')
            .in('user_id', userIds);

          // Merge the data
          invitationData.forEach(invitation => {
            if (invitation.influencer_id) {
              const profile = profilesData?.find(p => p.id === invitation.influencer_id);
              const instagram = instagramData?.find(ig => ig.user_id === invitation.influencer_id);
              
              if (profile) {
                invitation.influencer_name = profile.name;
              }
              if (instagram) {
                invitation.profile_picture = instagram.profile_picture;
                invitation.username = instagram.username;
                invitation.followers_count = instagram.followers_count;
                invitation.engagement_rate = instagram.engagement_rate;
              }
            }
          });
        }

        return invitationData;
      }

      const { data, error } = await query;

      if (error) throw error;

      // For general query, just return basic data
      const invitationData = (data || []).map((item: any) => ({
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
        application_message: item.campaign_participants.application_message,
        influencer_name: null,
        influencer_id: item.campaign_participants.influencer_id,
        profile_picture: undefined,
        username: undefined,
        followers_count: undefined,
        engagement_rate: undefined
      }));

      // For general view, we can fetch Instagram data for all joined users
      const joinedUsers = invitationData.filter(inv => inv.influencer_id);
      if (joinedUsers.length > 0) {
        const userIds = joinedUsers.map(inv => inv.influencer_id);
        
        // Get profiles data
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        // Get Instagram data
        const { data: instagramData } = await supabase
          .from('instagram_accounts')
          .select('user_id, username, profile_picture, followers_count, engagement_rate')
          .in('user_id', userIds);

        // Merge the data and handle pending invitations
        invitationData.forEach(invitation => {
          if (invitation.influencer_id) {
            // For accepted invitations with linked user accounts
            const profile = profilesData?.find(p => p.id === invitation.influencer_id);
            const instagram = instagramData?.find(ig => ig.user_id === invitation.influencer_id);
            
            if (profile) {
              invitation.influencer_name = profile.name;
            }
            if (instagram) {
              invitation.profile_picture = instagram.profile_picture;
              invitation.username = instagram.username;
              invitation.followers_count = instagram.followers_count;
              invitation.engagement_rate = instagram.engagement_rate;
            }
          } else {
            // For pending invitations, extract data from application_message
            try {
              if (invitation.application_message) {
                const parsedMessage = JSON.parse(invitation.application_message);
                if (parsedMessage.instagramData) {
                  invitation.profile_picture = parsedMessage.instagramData.profile_picture;
                  invitation.username = parsedMessage.instagramData.username;
                  invitation.followers_count = parsedMessage.instagramData.followers_count;
                  invitation.engagement_rate = parsedMessage.instagramData.engagement_rate;
                  invitation.influencer_name = parsedMessage.instagramData.username;
                }
              }
            } catch (e) {
              console.log('Could not parse application message for invitation', invitation.id);
            }
          }
        });
      }

      return invitationData;
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

  const fetchInfluencerProfile = async (influencerId: string, email: string) => {
    if (!influencerId) return;
    
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('username, followers_count, engagement_rate, profile_picture')
        .eq('user_id', influencerId)
        .single();
      
      if (!error && data) {
        setInfluencerProfile(data);
      } else {
        // Try to fetch from Instagram API
        const response = await supabase.functions.invoke('fetch-instagram-profile', {
          body: { handle: email.split('@')[0] }
        });
        
        if (response.data && !response.error) {
          setInfluencerProfile({
            username: response.data.username || email.split('@')[0],
            followers_count: response.data.followers_count || 0,
            engagement_rate: response.data.engagement_rate || 0,
            profile_picture: response.data.profile_picture || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching influencer profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePreviewClick = (invitation: InvitationData) => {
    setSelectedInfluencer(invitation);
    // Use the data we already have from the invitation
    if (invitation.profile_picture || invitation.username || invitation.followers_count) {
      setInfluencerProfile({
        username: invitation.username || invitation.email.split('@')[0],
        followers_count: invitation.followers_count || 0,
        engagement_rate: invitation.engagement_rate || 0,
        profile_picture: invitation.profile_picture || ''
      });
    } else if (invitation.influencer_id) {
      // Fallback to fetching if we don't have the data
      fetchInfluencerProfile(invitation.influencer_id, invitation.email);
    }
  };

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
                    <Avatar className="h-10 w-10">
                      {invitation.profile_picture ? (
                        <AvatarImage 
                          src={invitation.profile_picture} 
                          alt={invitation.influencer_name || invitation.email}
                        />
                      ) : (
                        <AvatarFallback>
                          {invitation.influencer_name?.charAt(0) || invitation.email.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {getStatusIcon(invitation)}
                    <div className="flex-1">
                      <h4 className="font-medium">{invitation.email}</h4>
                      <p className="text-sm text-gray-600">
                        {!campaignId && invitation.campaign_title}
                        {invitation.influencer_name && (
                          <span>{!campaignId ? ' • ' : ''}{invitation.influencer_name}</span>
                        )}
                        {invitation.username && (
                          <span> • @{invitation.username}</span>
                        )}
                      </p>
                      {invitation.followers_count && (
                        <p className="text-xs text-gray-500">
                          {invitation.followers_count.toLocaleString()} followers
                          {invitation.engagement_rate && ` • ${invitation.engagement_rate.toFixed(1)}% engagement`}
                        </p>
                      )}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(invitation.id)}
                      className="ml-2"
                    >
                      {expandedInvitations.has(invitation.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(invitation.invitation_token)}
                    >
                      {copiedTokens.has(invitation.invitation_token) ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedTokens.has(invitation.invitation_token) ? 'Copied!' : 'Copy Link'}
                    </Button>
                    {(invitation.influencer_name || invitation.profile_picture || invitation.followers_count) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePreviewClick(invitation)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Influencer Profile</DialogTitle>
                          </DialogHeader>
                          {loadingProfile ? (
                            <div className="flex items-center justify-center p-8">
                              <div className="text-center">Loading profile...</div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 p-4">
                                <Avatar className="h-16 w-16">
                                  {influencerProfile?.profile_picture ? (
                                    <AvatarImage 
                                      src={influencerProfile.profile_picture} 
                                      alt={invitation.influencer_name}
                                    />
                                  ) : (
                                    <AvatarFallback>
                                      {invitation.influencer_name?.charAt(0) || invitation.email.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">{invitation.influencer_name}</h3>
                                  <p className="text-sm text-gray-600">@{influencerProfile?.username || invitation.email.split('@')[0]}</p>
                                  <p className="text-xs text-gray-500">{invitation.email}</p>
                                </div>
                              </div>
                              {influencerProfile && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                  <div className="text-center">
                                    <div className="font-semibold text-lg">{influencerProfile.followers_count.toLocaleString()}</div>
                                    <div className="text-xs text-gray-600">Followers</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-lg">{influencerProfile.engagement_rate.toFixed(1)}%</div>
                                    <div className="text-xs text-gray-600">Engagement</div>
                                  </div>
                                </div>
                              )}
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="text-sm">
                                  <span className="font-medium">Status:</span> {invitation.status}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Campaign:</span> {invitation.campaign_title}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Token:</span> {invitation.invitation_token}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
                {expandedInvitations.has(invitation.id) && (
                  <div className="px-4 pb-4 border-t bg-muted/20">
                    <div className="pt-4 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Campaign:</span> {invitation.campaign_title}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Status:</span> {invitation.status}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Token:</span> {invitation.invitation_token}
                      </div>
                      {/* Show Instagram profile preview if available */}
                      {(invitation.profile_picture || invitation.username || invitation.followers_count) && (
                        <div className="mt-3 p-3 bg-background rounded-lg border">
                          <div className="text-sm font-medium mb-2">Instagram Profile Preview</div>
                          <div className="flex items-center gap-3">
                            {invitation.profile_picture && (
                              <img 
                                src={invitation.profile_picture}
                                alt="Instagram profile"
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                @{invitation.username || invitation.email.split('@')[0]}
                              </div>
                              {invitation.followers_count && (
                                <div className="text-xs text-muted-foreground">
                                  {invitation.followers_count.toLocaleString()} followers
                                  {invitation.engagement_rate && 
                                    ` • ${invitation.engagement_rate.toFixed(1)}% engagement`
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {invitations.length > 3 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? 'Show Less' : `Show ${invitations.length - 3} More`}
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