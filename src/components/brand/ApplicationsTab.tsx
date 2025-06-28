
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationCard from './ApplicationCard';
import CampaignSearch from './CampaignSearch';
import { InfluencerApplication } from '@/types/brandDashboard';
import { useBrandApplications } from '@/hooks/useBrandApplications';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ApplicationsTabProps {
  applications?: InfluencerApplication[];
}

const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ applications: propApplications }) => {
  const { data: fetchedApplications = [], isLoading, error, refetch } = useBrandApplications(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('open');
  const queryClient = useQueryClient();

  // Use fetched applications from database (prioritize database over props)
  const applications = useMemo(() => {
    return fetchedApplications.map((app: any) => ({
      id: app.application_id,
      campaignId: app.campaign_id,
      campaignTitle: app.campaign_title,
      influencer: {
        name: app.influencer_name,
        handle: app.influencer_handle,
        followers: app.followers_count,
        platform: app.platform
      },
      appliedAt: app.applied_at,
      status: app.application_status as 'pending' | 'approved' | 'rejected',
      engagementRate: parseFloat(app.engagement_rate?.toString() || '0'),
      averageViews: app.average_views || 0,
      niche: Array.isArray(app.niche) ? app.niche : [],
      aiScore: app.ai_score || 0
    }));
  }, [fetchedApplications]);

  // Filter applications by search query
  const filteredApplications = useMemo(() => {
    let filtered = applications;
    
    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(app => 
        app.campaignTitle.toLowerCase().includes(query) ||
        app.influencer.name.toLowerCase().includes(query) ||
        app.influencer.handle.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [applications, searchQuery]);

  // Separate applications by status
  const openApplications = filteredApplications.filter(app => 
    ['pending', 'applied', 'invited'].includes(app.status)
  );
  const approvedApplications = filteredApplications.filter(app => 
    ['approved', 'accepted', 'active'].includes(app.status)
  );
  const rejectedApplications = filteredApplications.filter(app => 
    app.status === 'rejected'
  );

  // Handle application status updates
  const handleApproveApplication = async (applicationId: string) => {
    try {
      console.log('Approving application:', applicationId);
      
      const { error } = await supabase
        .from('campaign_participants')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error approving application:', error);
        throw error;
      }

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['brand-applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-active-campaigns'] });
      refetch();
      
      console.log('Application approved successfully');
    } catch (err) {
      console.error('Failed to approve application:', err);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      console.log('Rejecting application:', applicationId);
      
      const { error } = await supabase
        .from('campaign_participants')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error rejecting application:', error);
        throw error;
      }

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['brand-applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-active-campaigns'] });
      refetch();
      
      console.log('Application rejected successfully');
    } catch (err) {
      console.error('Failed to reject application:', err);
    }
  };

  const handleViewProfile = (applicationId: string) => {
    console.log('View profile for application:', applicationId);
    // TODO: Navigate to influencer profile page
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500">Error loading applications</p>
          <p className="text-gray-500 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Search */}
      <CampaignSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Applications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open">
            Open Applications ({openApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#1a1f2e]">
                Open Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {openApplications.length > 0 ? (
                <div className="space-y-4">
                  {openApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onApprove={handleApproveApplication}
                      onReject={handleRejectApplication}
                      onViewProfile={handleViewProfile}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery ? 'No applications found matching your search.' : 'No open applications found.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#1a1f2e]">
                Approved Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedApplications.length > 0 ? (
                <div className="space-y-4">
                  {approvedApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onApprove={handleApproveApplication}
                      onReject={handleRejectApplication}
                      onViewProfile={handleViewProfile}
                      hideActions={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery ? 'No approved applications found matching your search.' : 'No approved applications found.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#1a1f2e]">
                Rejected Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedApplications.length > 0 ? (
                <div className="space-y-4">
                  {rejectedApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onApprove={handleApproveApplication}
                      onReject={handleRejectApplication}
                      onViewProfile={handleViewProfile}
                      hideActions={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery ? 'No rejected applications found matching your search.' : 'No rejected applications found.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationsTab;
