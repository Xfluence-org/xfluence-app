import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { useBrandCampaignsData } from '@/hooks/useBrandCampaignsData';
import BrandCampaignCard from '@/components/brand/BrandCampaignCard';
import CampaignDetailModal from '@/components/brand/CampaignDetailModal';
import CreateCampaignModal from '@/components/brand/CreateCampaignModal';
import InvitationManagement from '@/components/brand/InvitationManagement';

type MainView = 'campaigns' | 'influencers';
type CampaignView = 'published' | 'completed' | 'archived';
type InfluencerView = 'invitations' | 'active' | 'performance';

const BrandCampaignsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [mainView, setMainView] = useState<MainView>('campaigns');
  const [campaignTab, setCampaignTab] = useState<CampaignView>('published');
  const [influencerTab, setInfluencerTab] = useState<InfluencerView>('invitations');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { 
    campaigns, 
    loading, 
    error, 
    archiveCampaign,
    updateCampaign 
  } = useBrandCampaignsData(campaignTab);

  // Handle URL parameters for tab and campaign view
  useEffect(() => {
    const mainParam = searchParams.get('main') as MainView;
    const campaignParam = searchParams.get('campaign') as CampaignView;
    const viewParam = searchParams.get('view');
    
    if (mainParam && ['campaigns', 'influencers'].includes(mainParam)) {
      setMainView(mainParam);
    }
    
    if (campaignParam && ['published', 'completed', 'archived'].includes(campaignParam)) {
      setCampaignTab(campaignParam);
    }
    
    if (viewParam) {
      setSelectedCampaignId(viewParam);
      // Clear the URL parameters after opening the modal
      setSearchParams({});
    }
    
    // Handle navigation from dashboard
    if (location.state?.openCampaignId) {
      setSelectedCampaignId(location.state.openCampaignId);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [searchParams, setSearchParams, location.state]);

  const handleViewCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
  };

  const handleCloseCampaign = () => {
    setSelectedCampaignId(null);
  };

  const handleArchiveCampaign = async (campaignId: string) => {
    await archiveCampaign(campaignId);
  };

  const handleUpdateCampaign = async (campaignId: string, updates: any) => {
    await updateCampaign(campaignId, updates);
  };

  const handleCreateCampaign = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const renderCampaignContent = () => {
    return (
      <Tabs value={campaignTab} onValueChange={(value) => setCampaignTab(value as CampaignView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-6">
          <div className="space-y-6">
            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns.map((campaign) => (
                  <BrandCampaignCard
                    key={campaign.campaign_id}
                    campaign={campaign}
                    onView={handleViewCampaign}
                    onArchive={handleArchiveCampaign}
                    showArchiveButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No published campaigns found</p>
                <p className="text-gray-400 mt-2">Create a campaign to get started</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-6">
            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns.map((campaign) => (
                  <BrandCampaignCard
                    key={campaign.campaign_id}
                    campaign={campaign}
                    onView={handleViewCampaign}
                    onArchive={handleArchiveCampaign}
                    showArchiveButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No completed campaigns found</p>
                <p className="text-gray-400 mt-2">Completed campaigns will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <div className="space-y-6">
            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns.map((campaign) => (
                  <BrandCampaignCard
                    key={campaign.campaign_id}
                    campaign={campaign}
                    onView={handleViewCampaign}
                    onArchive={handleArchiveCampaign}
                    showArchiveButton={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No archived campaigns found</p>
                <p className="text-gray-400 mt-2">Archived campaigns will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  const renderInfluencerContent = () => {
    return (
      <Tabs value={influencerTab} onValueChange={(value) => setInfluencerTab(value as InfluencerView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sent Invitations</h3>
                <p className="text-gray-600 mt-1">Manage your sent invitations and copy invitation links</p>
              </div>
            </div>
            <InvitationManagement />
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Active influencers coming soon</p>
            <p className="text-gray-400 mt-2">View active influencers and their progress</p>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Performance analytics coming soon</p>
            <p className="text-gray-400 mt-2">Track influencer performance metrics</p>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading campaigns...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error loading campaigns</p>
              <p className="text-gray-500 mt-2">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BrandSidebar userName="Brand Team" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">
                  {mainView === 'campaigns' ? 'Campaign Management' : 'Influencer Management'}
                </h1>
                <p className="text-gray-600">
                  {mainView === 'campaigns' 
                    ? 'Manage your published, completed, and archived campaigns' 
                    : 'Manage your influencers, invitations, and performance'
                  }
                </p>
              </div>
              {mainView === 'campaigns' && (
                <Button onClick={handleCreateCampaign} className="bg-[#1a1f2e] hover:bg-[#2a2f3e] text-white">
                  <Plus className="mr-2" />
                  Create Campaign
                </Button>
              )}
            </div>
          </header>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            {/* Main Navigation */}
            <Tabs value={mainView} onValueChange={(value) => setMainView(value as MainView)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="influencers">
                  <Users className="mr-2 h-4 w-4" />
                  Influencers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="campaigns" className="mt-0">
                {renderCampaignContent()}
              </TabsContent>

              <TabsContent value="influencers" className="mt-0">
                {renderInfluencerContent()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <CampaignDetailModal
        isOpen={!!selectedCampaignId}
        onClose={handleCloseCampaign}
        campaignId={selectedCampaignId}
        onUpdate={handleUpdateCampaign}
      />

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </div>
  );
};

export default BrandCampaignsPage;
