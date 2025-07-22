import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBrandCampaignsData } from '@/hooks/useBrandCampaignsData';
import BrandCampaignCard from '@/components/brand/BrandCampaignCard';
import CampaignDetailModal from '@/components/brand/CampaignDetailModal';
import CreateCampaignModal from '@/components/brand/CreateCampaignModal';


type CampaignView = 'published' | 'completed' | 'archived';

const BrandCampaignsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [campaignTab, setCampaignTab] = useState<CampaignView>('published');
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
    const campaignParam = searchParams.get('campaign') as CampaignView;
    const viewParam = searchParams.get('view');
    
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
                  Campaign Management
                </h1>
                <p className="text-gray-600">
                  Manage your published, completed, and archived campaigns
                </p>
              </div>
              <Button onClick={handleCreateCampaign} className="bg-[#1a1f2e] hover:bg-[#2a2f3e] text-white">
                <Plus className="mr-2" />
                Create Campaign
              </Button>
            </div>
          </header>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            {renderCampaignContent()}
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
