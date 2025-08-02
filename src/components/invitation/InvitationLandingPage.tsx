
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';
import CampaignAcceptanceAnimation from '@/components/animations/CampaignAcceptanceAnimation';

interface InvitationData {
  id: string;
  campaign: {
    id: string;
    title: string;
    description: string;
    amount: number;
    due_date: string;
    brand: {
      name: string;
      logo_url?: string;
    };
  };
  assignmentData: {
    tier: string;
    category: string;
    contentType: string;
    influencerDetails: {
      category: string;
      handle: string;
      email: string;
      platform: string;
    };
  };
  status: string;
  invitation_claimed_at?: string;
}

const InvitationLandingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [campaignCategory, setCampaignCategory] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetchInvitationData();
    }
  }, [token]);

  useEffect(() => {
    console.log('Invitation useEffect triggered:', { 
      user: !!user, 
      invitationData: !!invitationData, 
      claimedAt: invitationData?.invitation_claimed_at,
      userId: user?.id,
      invitationId: invitationData?.id
    });
    
    if (user && invitationData && !invitationData.invitation_claimed_at) {
      console.log('Attempting to claim invitation...');
      handleClaimInvitation();
    }
  }, [user, invitationData]);

  const fetchInvitationData = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          status,
          invitation_claimed_at,
          application_message,
          campaigns!inner(
            id,
            title,
            description,
            amount,
            due_date,
            brands!inner(
              name,
              logo_url
            )
          )
        `)
        .eq('invitation_token', token)
        .maybeSingle();

      if (error) {
        console.error('Error fetching invitation:', error);
        setError('Failed to load invitation details');
        return;
      }

      if (!data) {
        setError('Invitation not found');
        return;
      }

      let assignmentData;
      try {
        assignmentData = JSON.parse(data.application_message || '{}');
        // Extract category from assignment data
        if (assignmentData.category) {
          setCampaignCategory(assignmentData.category);
        } else if (assignmentData.influencerDetails?.category) {
          setCampaignCategory(assignmentData.influencerDetails.category);
        }
      } catch {
        assignmentData = {};
      }

      setInvitationData({
        id: data.id,
        campaign: {
          id: data.campaigns.id,
          title: data.campaigns.title,
          description: data.campaigns.description || '',
          amount: data.campaigns.amount || 0,
          due_date: data.campaigns.due_date,
          brand: {
            name: data.campaigns.brands.name,
            logo_url: data.campaigns.brands.logo_url
          }
        },
        assignmentData,
        status: data.status,
        invitation_claimed_at: data.invitation_claimed_at
      });
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimInvitation = async () => {
    if (!user || !invitationData) {
      console.log('Cannot claim invitation - missing user or invitation data:', { user: !!user, invitationData: !!invitationData });
      return;
    }
    
    console.log('Starting invitation claim process for:', { userId: user.id, invitationId: invitationData.id });
    setClaiming(true);
    try {
      // Update the campaign participant with the user's ID and set current_stage
      const { error: updateError } = await supabase
        .from('campaign_participants')
        .update({
          influencer_id: user.id,
          invitation_claimed_at: new Date().toISOString(),
          status: 'accepted',
          current_stage: 'waiting_for_requirements'
        })
        .eq('id', invitationData.id);

      if (updateError) {
        console.error('Error updating campaign participant:', updateError);
        throw updateError;
      }
      
      console.log('Successfully updated campaign participant');

      // Extract and store Instagram profile data if available in application_message
      let instagramData = null;
      try {
        if (invitationData.application_message) {
          const parsedMessage = JSON.parse(invitationData.application_message);
          instagramData = parsedMessage.instagramData;
        }
      } catch (e) {
        // No Instagram data found in invitation
      }

      // If we have Instagram data, store it in the instagram_accounts table
      if (instagramData && user.id) {
        
        const { error: instagramError } = await supabase
          .from('instagram_accounts')
          .upsert({
            user_id: user.id,
            username: instagramData.username,
            profile_picture: instagramData.profile_picture,
            followers_count: instagramData.followers_count || 0,
            engagement_rate: instagramData.engagement_rate || 0,
            media_count: instagramData.media_count || 0,
            instagram_user_id: instagramData.username || 'unknown' // Using username as fallback
          }, {
            onConflict: 'user_id'
          });

        if (instagramError) {
          // Non-critical error - continue with invitation acceptance
        }
      }

      // For now, just make sure the participant is linked properly
      // Tasks will be created later when content requirements are shared by the brand

      // Update the invitation email record
      const { error: emailError } = await supabase
        .from('invitation_emails')
        .update({
          clicked_at: new Date().toISOString()
        })
        .eq('campaign_participant_id', invitationData.id);

      if (emailError) {
        // Non-critical error - continue
      }

      toast({
        title: "Success",
        description: "You've successfully joined the campaign!",
      });

      // Show animation
      setShowAnimation(true);

      // Invalidate queries to refresh dashboard data
      window.dispatchEvent(new CustomEvent('refreshDashboard'));

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setClaiming(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    navigate('/dashboard');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading invitation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationData) {
    return null;
  }

  // If already claimed and user is logged in
  if (invitationData.invitation_claimed_at && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Joined!</h2>
            <p className="text-gray-600 mb-4">
              You've already joined this campaign. Check your dashboard for details.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showAnimation && (
        <CampaignAcceptanceAnimation 
          category={campaignCategory || 'general'} 
          onComplete={handleAnimationComplete}
        />
      )}
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {invitationData.campaign.brand.logo_url ? (
                <img 
                  src={invitationData.campaign.brand.logo_url} 
                  alt={invitationData.campaign.brand.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#1DDCD3] flex items-center justify-center text-white font-bold text-xl">
                  {invitationData.campaign.brand.name.charAt(0)}
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {invitationData.campaign.title}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              You're invited to join this campaign by {invitationData.campaign.brand.name}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Action Section */}
            {!user ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  To join this campaign, you need to sign in or create an account.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => navigate('/', { state: { returnTo: `/invite/${token}` }})}
                    className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                  >
                    Sign In / Sign Up
                  </Button>
                </div>
              </div>
            ) : claiming ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Joining campaign...</span>
                </div>
                <p className="text-sm text-gray-600">Please wait while we add you to the campaign.</p>
              </div>
            ) : (
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Joining campaign automatically...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
};

export default InvitationLandingPage;
