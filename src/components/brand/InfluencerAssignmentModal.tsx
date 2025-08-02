
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UserPlus, Instagram, X, Copy, Check, Loader2, ChevronDown, Eye, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useInstagramProfile } from '@/hooks/useInstagramProfile';
import { useSupabaseTypeCasts } from '@/hooks/useSupabaseTypeCasts';

interface AssignmentRequest {
  contentType: string;
  category: string;
  tier: string;
  requiredCount: number;
}

interface InfluencerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  assignmentRequest: AssignmentRequest;
  onAssignmentComplete: (assignments: any[]) => void;
  campaignCategories: string[];
}

interface ManualInfluencer {
  id: string;
  category: string;
  handle: string;
  email: string;
  platform: string;
  instagramProfile?: any;
}

interface GeneratedInvitation {
  id: string;
  email: string;
  handle: string;
  category: string;
  invitationLink: string;
  token: string;
  instagramProfile?: any;
}

const InfluencerAssignmentModal: React.FC<InfluencerAssignmentModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  assignmentRequest,
  onAssignmentComplete,
  campaignCategories
}) => {
  const [manualInfluencers, setManualInfluencers] = useState<ManualInfluencer[]>([]);
  const [generatedInvitations, setGeneratedInvitations] = useState<GeneratedInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState<Set<string>>(new Set());
  const [newInfluencer, setNewInfluencer] = useState({
    category: '',
    handle: '',
    email: ''
  });
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [instagramProfile, setInstagramProfile] = useState<any>(null);
  const [showInvitations, setShowInvitations] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { fetchProfile, loading: profileLoading, error: profileError } = useInstagramProfile();
  const { castForUpdate, isValidResult } = useSupabaseTypeCasts();

  const handleFetchInstagramProfile = async () => {
    if (!newInfluencer.handle.trim()) {
      toast({
        title: "Error",
        description: "Please enter an Instagram handle first",
        variant: "destructive"
      });
      return;
    }

    console.log('Fetching profile for handle:', newInfluencer.handle);
    setFetchingProfile(true);
    setInstagramProfile(null);
    
    try {
      const profile = await fetchProfile(newInfluencer.handle.replace('@', ''));
      console.log('Profile fetch result:', profile);
      
      if (profile) {
        setInstagramProfile(profile);
        toast({
          title: "Success",
          description: `Found Instagram profile for @${profile.username} with ${profile.followers_count?.toLocaleString() || 0} followers`,
        });
      } else {
        const errorMsg = profileError || "Profile not found. You can still add the influencer manually.";
        console.log('Profile fetch failed:', errorMsg);
        toast({
          title: profileError ? "Error" : "Warning",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching Instagram profile:', error);
      const errorMsg = profileError || (error instanceof Error ? error.message : "Failed to fetch Instagram profile. You can still add the influencer manually.");
      toast({
        title: "Error", 
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleAddManualInfluencer = () => {
    if (newInfluencer.category && newInfluencer.handle && newInfluencer.email) {
      const influencer: ManualInfluencer = {
        id: `manual-${Date.now()}`,
        category: newInfluencer.category,
        handle: newInfluencer.handle.startsWith('@') ? newInfluencer.handle : `@${newInfluencer.handle}`,
        email: newInfluencer.email,
        platform: 'Instagram',
        instagramProfile: instagramProfile
      };
      
      setManualInfluencers(prev => [...prev, influencer]);
      setNewInfluencer({ category: '', handle: '', email: '' });
      setInstagramProfile(null);
    }
  };

  const handleRemoveInfluencer = (id: string) => {
    setManualInfluencers(prev => prev.filter(inf => inf.id !== id));
  };

  const copyToClipboard = async (text: string, token: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

  const handleAssignmentSubmit = async () => {
    setLoading(true);
    try {
      const invitations: GeneratedInvitation[] = [];
      
      for (const manualInfluencer of manualInfluencers) {
        // Create campaign participant with invitation data including Instagram profile
        const assignmentData = {
          tier: assignmentRequest.tier,
          category: assignmentRequest.category,
          contentType: assignmentRequest.contentType,
          influencerDetails: {
            category: manualInfluencer.category,
            handle: manualInfluencer.handle,
            email: manualInfluencer.email,
            platform: manualInfluencer.platform
          },
          // Store the fetched Instagram profile data if available
          instagramData: manualInfluencer.instagramProfile || instagramProfile
        };
        
        // Create invitation record
        const { data: participantData, error: participantError } = await supabase
          .from('campaign_participants')
          .insert(castForUpdate({
            campaign_id: campaignId,
            influencer_id: null, // Will be set when influencer claims invitation
            status: 'invited',
            current_stage: 'waiting_for_requirements',
            application_message: JSON.stringify(assignmentData)
          }))
          .select('id, invitation_token')
          .single();

        if (participantError) throw participantError;

        // Create invitation email tracking record
        const { error: emailError } = await supabase
          .from('invitation_emails')
          .insert(castForUpdate({
            campaign_participant_id: isValidResult(participantData) ? (participantData as any).id : null,
            email: manualInfluencer.email
          }));

        if (emailError) throw emailError;

        // Generate invitation link
        const validParticipantData = isValidResult(participantData) ? (participantData as any) : null;
        if (validParticipantData) {
          const invitationLink = `${window.location.origin}/invite/${validParticipantData.invitation_token}`;
          
          invitations.push({
            id: validParticipantData.id,
            email: manualInfluencer.email,
            handle: manualInfluencer.handle,
            category: manualInfluencer.category,
            invitationLink,
            token: validParticipantData.invitation_token,
            instagramProfile: manualInfluencer.instagramProfile
          });
        }
      }

      setGeneratedInvitations(invitations);
      setShowInvitations(true);

      toast({
        title: "Success",
        description: `Successfully created ${invitations.length} invitation(s) for ${assignmentRequest.contentType}`,
      });

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['waiting-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['active-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['invitations', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });

      onAssignmentComplete([]);
      
      // Reset form
      setManualInfluencers([]);
      
    } catch (error) {
      console.error('Error creating invitations:', error);
      toast({
        title: "Error",
        description: "Failed to create invitations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setManualInfluencers([]);
    setGeneratedInvitations([]);
    setCopiedTokens(new Set());
    setInstagramProfile(null);
    setNewInfluencer({ category: '', handle: '', email: '' });
    onClose();
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'nano': return 'bg-green-100 text-green-800';
      case 'micro': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-purple-100 text-purple-800';
      case 'macro': return 'bg-orange-100 text-orange-800';
      case 'mega': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add Influencers for {assignmentRequest.contentType.charAt(0).toUpperCase() + assignmentRequest.contentType.slice(1)}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{assignmentRequest.category}</Badge>
            <Badge className={getTierColor(assignmentRequest.tier)}>
              {assignmentRequest.tier.charAt(0).toUpperCase() + assignmentRequest.tier.slice(1)} Tier
            </Badge>
            <Badge variant="secondary">Need {assignmentRequest.requiredCount} influencers</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generated Invitations */}
          {generatedInvitations.length > 0 && (
            <Collapsible open={showInvitations} onOpenChange={setShowInvitations}>
              <div className="bg-green-50 rounded-lg p-6">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer">
                    <h3 className="text-lg font-semibold text-green-800">
                      🎉 Invitation Links Generated ({generatedInvitations.length})
                    </h3>
                    <Button variant="ghost" size="sm" className="text-green-700">
                      <ChevronDown className={`h-4 w-4 transition-transform ${showInvitations ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-sm text-green-700 mb-4 mt-4">
                    Copy these links and send them to your influencers. They can use these to sign up and automatically join your campaign.
                  </p>
                  <div className="space-y-3">
                    {generatedInvitations.map((invitation) => (
                      <Card key={invitation.id} className="border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {invitation.instagramProfile?.profile_picture ? (
                                <img 
                                  src={invitation.instagramProfile.profile_picture} 
                                  alt={invitation.handle}
                                  className="h-10 w-10 rounded-full object-cover border-2 border-green-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`h-10 w-10 rounded-full bg-green-100 flex items-center justify-center ${invitation.instagramProfile?.profile_picture ? 'hidden' : ''}`}>
                                <Instagram className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-green-800">{invitation.handle}</h4>
                                <p className="text-sm text-green-600">{invitation.email} • {invitation.category}</p>
                                {invitation.instagramProfile && (
                                  <p className="text-xs text-green-500">
                                    {invitation.instagramProfile.followers_count?.toLocaleString()} followers
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {invitation.instagramProfile && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPreviewProfile(invitation.instagramProfile)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  Preview
                                </Button>
                              )}
                              <div className="bg-white rounded px-3 py-1 text-xs font-mono border border-green-200 max-w-xs truncate">
                                {invitation.invitationLink}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(invitation.invitationLink, invitation.token)}
                                className="flex items-center gap-1"
                              >
                                {copiedTokens.has(invitation.token) ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Add Manual Influencer Form */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="h-5 w-5 text-[#1DDCD3]" />
              <h3 className="text-lg font-semibold">Add Influencer</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <Select
                  value={newInfluencer.category}
                  onValueChange={(value) => setNewInfluencer(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Handle *
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={newInfluencer.handle}
                      onChange={(e) => setNewInfluencer(prev => ({ ...prev, handle: e.target.value }))}
                      placeholder="username (without @)"
                      className="pl-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFetchInstagramProfile}
                    disabled={!newInfluencer.handle.trim() || fetchingProfile}
                    className="w-full"
                  >
                    {fetchingProfile ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Fetching Profile...
                      </>
                    ) : (
                      <>
                        <Instagram className="h-3 w-3 mr-2" />
                        Fetch Instagram Profile
                      </>
                    )}
                  </Button>
                  {instagramProfile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                         {instagramProfile.profile_picture ? (
                          <img 
                            src={instagramProfile.profile_picture} 
                            alt={`@${instagramProfile.username}`}
                            className="h-12 w-12 rounded-full object-cover border-2 border-green-200"
                            onError={(e) => {
                              console.log('Profile picture failed to load:', instagramProfile.profile_picture);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`h-12 w-12 rounded-full bg-green-100 flex items-center justify-center ${instagramProfile.profile_picture ? 'hidden' : ''}`}>
                          <Instagram className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-800">@{instagramProfile.username}</p>
                          <div className="text-sm text-green-600 space-y-1">
                            <div className="flex items-center gap-4">
                              <span>
                                <strong>{instagramProfile.followers_count?.toLocaleString() || 'N/A'}</strong> followers
                              </span>
                              <span>
                                <strong>{instagramProfile.following?.toLocaleString() || 'N/A'}</strong> following
                              </span>
                            </div>
                            <div>
                              <strong>{instagramProfile.media_count?.toLocaleString() || 'N/A'}</strong> posts
                            </div>
                            {instagramProfile.engagement_rate && (
                              <div>
                                Engagement: <strong>{instagramProfile.engagement_rate}%</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={newInfluencer.email}
                  onChange={(e) => setNewInfluencer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            
            <Button
              onClick={handleAddManualInfluencer}
              disabled={!newInfluencer.category || !newInfluencer.handle || !newInfluencer.email}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Influencer
            </Button>
          </div>

          {/* Added Influencers List */}
          {manualInfluencers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Added Influencers ({manualInfluencers.length})</h3>
              <div className="space-y-3">
                {manualInfluencers.map((influencer) => (
                  <Card key={influencer.id}>
                    <CardContent className="p-4">
                       <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {influencer.instagramProfile?.profile_picture ? (
                            <img 
                              src={influencer.instagramProfile.profile_picture} 
                              alt={influencer.handle}
                              className="h-10 w-10 rounded-full object-cover border-2 border-[#1DDCD3]"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`h-10 w-10 rounded-full bg-[#1DDCD3] flex items-center justify-center ${influencer.instagramProfile?.profile_picture ? 'hidden' : ''}`}>
                            <Instagram className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{influencer.category}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{influencer.handle}</span>
                              <span>•</span>
                              <span>{influencer.email}</span>
                            </div>
                            {influencer.instagramProfile && (
                              <p className="text-xs text-gray-500">
                                {influencer.instagramProfile.followers_count?.toLocaleString()} followers
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {influencer.instagramProfile && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewProfile(influencer.instagramProfile)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveInfluencer(influencer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              {generatedInvitations.length > 0 ? 'Done' : 'Cancel'}
            </Button>
            {manualInfluencers.length > 0 && (
              <Button
                onClick={handleAssignmentSubmit}
                disabled={loading}
                className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
              >
                {loading ? 'Creating Invitations...' : `Create ${manualInfluencers.length} Invitation${manualInfluencers.length !== 1 ? 's' : ''}`}
              </Button>
            )}
          </div>

          {/* Profile Preview Modal */}
          {previewProfile && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Instagram Profile Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewProfile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {previewProfile.profile_picture ? (
                      <img 
                        src={previewProfile.profile_picture} 
                        alt={`@${previewProfile.username}`}
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center ${previewProfile.profile_picture ? 'hidden' : ''}`}>
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">@{previewProfile.username}</h4>
                      <p className="text-sm text-gray-600">Instagram Profile</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-lg">
                        {previewProfile.followers_count?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-gray-600">Followers</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-lg">
                        {previewProfile.following?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-gray-600">Following</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-lg">
                        {previewProfile.media_count?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-gray-600">Posts</div>
                    </div>
                    {previewProfile.engagement_rate && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-lg">
                          {previewProfile.engagement_rate}%
                        </div>
                        <div className="text-gray-600">Engagement</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerAssignmentModal;
