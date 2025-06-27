
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationCard from './ApplicationCard';
import CampaignFilter from './CampaignFilter';
import { InfluencerApplication } from '@/types/brandDashboard';

// Hardcoded dummy data for initial implementation
const dummyApplications: InfluencerApplication[] = [
  {
    id: '1',
    campaignId: 'camp1',
    campaignTitle: 'Coca-Cola Summer Campaign',
    influencer: {
      name: 'Sarah Johnson',
      handle: 'sarahjfitness',
      followers: 125000,
      platform: 'Instagram',
      profileImage: undefined
    },
    appliedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
    engagementRate: 4.2,
    averageViews: 8500,
    niche: ['Fitness', 'Lifestyle', 'Health'],
    aiScore: 87
  },
  {
    id: '2',
    campaignId: 'camp2',
    campaignTitle: 'Travel Promo Adventure',
    influencer: {
      name: 'Mike Chen',
      handle: 'miketravels',
      followers: 89000,
      platform: 'Instagram'
    },
    appliedAt: '2024-01-14T15:45:00Z',
    status: 'approved',
    engagementRate: 3.8,
    averageViews: 6200,
    niche: ['Travel', 'Photography', 'Adventure'],
    aiScore: 92
  },
  {
    id: '3',
    campaignId: 'camp1',
    campaignTitle: 'Coca-Cola Summer Campaign',
    influencer: {
      name: 'Emma Wilson',
      handle: 'emmastyle',
      followers: 67000,
      platform: 'Instagram'
    },
    appliedAt: '2024-01-13T09:20:00Z',
    status: 'rejected',
    engagementRate: 2.9,
    averageViews: 4100,
    niche: ['Fashion', 'Lifestyle'],
    aiScore: 65
  },
  {
    id: '4',
    campaignId: 'camp3',
    campaignTitle: 'Tech Innovation Showcase',
    influencer: {
      name: 'Alex Rodriguez',
      handle: 'alextech',
      followers: 156000,
      platform: 'Instagram'
    },
    appliedAt: '2024-01-16T14:15:00Z',
    status: 'pending',
    engagementRate: 5.1,
    averageViews: 12000,
    niche: ['Technology', 'Innovation', 'Reviews'],
    aiScore: 94
  }
];

const ApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<InfluencerApplication[]>(dummyApplications);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('open');

  // Extract unique campaigns for filter dropdown
  const availableCampaigns = useMemo(() => {
    const campaigns = applications.map(app => ({
      id: app.campaignId,
      title: app.campaignTitle
    }));
    return Array.from(new Map(campaigns.map(c => [c.id, c])).values());
  }, [applications]);

  // Filter applications by campaign and status
  const filteredApplications = useMemo(() => {
    let filtered = applications;
    
    // Filter by campaign if selected
    if (selectedCampaign) {
      filtered = filtered.filter(app => app.campaignId === selectedCampaign);
    }
    
    return filtered;
  }, [applications, selectedCampaign]);

  // Separate applications by status
  const openApplications = filteredApplications.filter(app => app.status === 'pending');
  const approvedApplications = filteredApplications.filter(app => app.status === 'approved');
  const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected');

  // Handle application status updates
  const handleApproveApplication = (applicationId: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'approved' as const }
          : app
      )
    );
    console.log('Application approved:', applicationId);
  };

  const handleRejectApplication = (applicationId: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'rejected' as const }
          : app
      )
    );
    console.log('Application rejected:', applicationId);
  };

  const handleViewProfile = (applicationId: string) => {
    console.log('View profile for application:', applicationId);
    // TODO: Navigate to influencer profile page
  };

  return (
    <div className="space-y-6">
      {/* Campaign Filter */}
      <CampaignFilter
        campaigns={availableCampaigns}
        selectedCampaign={selectedCampaign}
        onCampaignChange={setSelectedCampaign}
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
                  <p className="text-gray-500">No open applications found.</p>
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
                  <p className="text-gray-500">No approved applications found.</p>
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
                  <p className="text-gray-500">No rejected applications found.</p>
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
