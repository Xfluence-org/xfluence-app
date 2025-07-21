
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X, User, Eye } from 'lucide-react';

interface ApplicationsManagementSectionProps {
  campaignId: string;
  onUpdate?: () => void;
}

interface Application {
  id: string;
  influencer_id: string;
  status: string;
  application_message: string;
  ai_match_score: number;
  created_at: string;
  influencer_name: string;
  influencer_handle: string;
  followers_count: number;
  engagement_rate: number;
  platform?: string;
  niche?: string[];
  influencer_profile_url?: string;
}

type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

const ApplicationsManagementSection: React.FC<ApplicationsManagementSectionProps> = ({
  campaignId,
  onUpdate
}) => {
  const [processingApplication, setProcessingApplication] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['campaign-applications', campaignId],
    queryFn: async () => {
      console.log('Fetching applications for campaign:', campaignId);
      
      // Use existing get_brand_applications_all function and filter
      const { data, error } = await supabase.rpc('get_brand_applications_all', {
        limit_count: 100
      });

      if (error) {
        console.error('Error fetching applications:', error);
        return [];
      }

      console.log('Raw applications data:', data);

      // Filter for this campaign and ensure we have an array
      const campaignApps = Array.isArray(data) ? data.filter((app: any) => app.campaign_id === campaignId) : [];

      // Transform data to match component expectations
      return campaignApps.map((app: any) => ({
        id: app.application_id,
        influencer_id: app.influencer_id,
        status: app.application_status,
        application_message: app.application_message,
        ai_match_score: app.ai_score,
        created_at: app.applied_at,
        influencer_name: app.influencer_name,
        influencer_handle: app.influencer_handle,
        followers_count: app.followers_count,
        engagement_rate: app.engagement_rate,
        platform: app.platform,
        niche: app.niche || [],
        influencer_profile_url: `https://i.pravatar.cc/150?u=${app.influencer_handle}` // Fallback profile image
      }));
    }
  });

  const handleApplicationAction = async (applicationId: string, action: 'approved' | 'rejected') => {
    setProcessingApplication(applicationId);
    try {
      // Update the application status
      const { error: updateError } = await supabase
        .from('campaign_participants')
        .update({ 
          status: action === 'approved' ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString(),
          accepted_at: action === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating application:', updateError);
        toast({
          title: "Error",
          description: "Failed to update application status.",
          variant: "destructive"
        });
        return;
      }

      // If approved, set the participant to waiting for content requirements
      if (action === 'approved') {
        await supabase
          .from('campaign_participants')
          .update({ 
            current_stage: 'waiting_for_requirements'
          })
          .eq('id', applicationId);
      }

      toast({
        title: "Success",
        description: `Application ${action} successfully.`,
      });

      // Refresh applications list
      queryClient.invalidateQueries({ queryKey: ['campaign-applications', campaignId] });
      
      // Notify parent component to refresh
      onUpdate?.();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setProcessingApplication(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'invited':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Invited</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterApplicationsByStatus = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return applications.filter(app => ['applied', 'pending', 'invited'].includes(app.status));
      case 'accepted':
        return applications.filter(app => ['approved', 'accepted'].includes(app.status));
      case 'rejected':
        return applications.filter(app => app.status === 'rejected');
      default:
        return applications;
    }
  };

  const renderApplicationsList = (filteredApplications: Application[], showActions: boolean = false) => {
    if (filteredApplications.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No applications in this category</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src={application.influencer_profile_url || `https://i.pravatar.cc/150?u=${application.influencer_handle}`} 
                      alt={application.influencer_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{application.influencer_name}</h5>
                    <p className="text-sm text-gray-600">{application.influencer_handle ? (application.influencer_handle.startsWith('@') ? application.influencer_handle : `@${application.influencer_handle}`) : '@user'}</p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Followers:</span>
                    <p className="font-medium">{application.followers_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Engagement:</span>
                    <p className="font-medium">{application.engagement_rate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">AI Match:</span>
                    <p className="font-medium">{application.ai_match_score}/100</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-gray-500 text-sm">Application Message:</span>
                  <p className="text-gray-700 mt-1">{application.application_message}</p>
                </div>
                
                <div className="text-xs text-gray-500">
                  Applied: {new Date(application.created_at).toLocaleDateString()}
                </div>
              </div>
              
              {showActions ? (
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleApplicationAction(application.id, 'approved')}
                    disabled={processingApplication === application.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplicationAction(application.id, 'rejected')}
                    disabled={processingApplication === application.id}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  const pendingApplications = filterApplicationsByStatus('pending');
  const acceptedApplications = filterApplicationsByStatus('accepted');
  const rejectedApplications = filterApplicationsByStatus('rejected');

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-[#1a1f2e] mb-4">
        Campaign Applications ({applications.length})
      </h4>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ApplicationStatus)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {renderApplicationsList(pendingApplications, true)}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {renderApplicationsList(acceptedApplications, false)}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {renderApplicationsList(rejectedApplications, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationsManagementSection;
