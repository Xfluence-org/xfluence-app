
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    if (token) {
      fetchInvitationData();
    }
  }, [token]);

  useEffect(() => {
    if (user && invitationData && !invitationData.invitation_claimed_at) {
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
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Invalid or expired invitation link');
        } else {
          throw error;
        }
        return;
      }

      if (!data) {
        setError('Invitation not found');
        return;
      }

      let assignmentData;
      try {
        assignmentData = JSON.parse(data.application_message || '{}');
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
    if (!user || !invitationData) return;
    
    setClaiming(true);
    try {
      // Update the campaign participant with the user's ID
      const { error: updateError } = await supabase
        .from('campaign_participants')
        .update({
          influencer_id: user.id,
          invitation_claimed_at: new Date().toISOString(),
          status: 'accepted'
        })
        .eq('id', invitationData.id);

      if (updateError) throw updateError;

      // Update the invitation email record
      const { error: emailError } = await supabase
        .from('invitation_emails')
        .update({
          clicked_at: new Date().toISOString()
        })
        .eq('campaign_participant_id', invitationData.id);

      if (emailError) console.error('Error updating email record:', emailError);

      toast({
        title: "Success",
        description: "You've successfully joined the campaign! Redirecting to your dashboard...",
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error claiming invitation:', error);
      toast({
        title: "Error",
        description: "Failed to join campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setClaiming(false);
    }
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
              You're Invited to Join a Campaign!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {invitationData.campaign.brand.name} has invited you to collaborate on their campaign
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campaign Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{invitationData.campaign.title}</h3>
              {invitationData.campaign.description && (
                <p className="text-gray-600 mb-4">{invitationData.campaign.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{invitationData.assignmentData.category}</Badge>
                <Badge className={getTierColor(invitationData.assignmentData.tier)}>
                  {invitationData.assignmentData.tier.charAt(0).toUpperCase() + invitationData.assignmentData.tier.slice(1)} Tier
                </Badge>
                <Badge variant="secondary">{invitationData.assignmentData.contentType}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                {invitationData.campaign.amount > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${invitationData.campaign.amount}</span>
                  </div>
                )}
                {invitationData.campaign.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(invitationData.campaign.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Details */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Your Assignment Details</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Content Type:</span> {invitationData.assignmentData.contentType}</p>
                <p><span className="font-medium">Category:</span> {invitationData.assignmentData.category}</p>
                <p><span className="font-medium">Tier:</span> {invitationData.assignmentData.tier}</p>
                {invitationData.assignmentData.influencerDetails?.handle && (
                  <p><span className="font-medium">Handle:</span> {invitationData.assignmentData.influencerDetails.handle}</p>
                )}
              </div>
            </div>

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
  );
};

export default InvitationLandingPage;
