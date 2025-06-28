import React, { useState } from 'react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBrandCampaignsData } from '@/hooks/useBrandCampaignsData';
import BrandCampaignCard from '@/components/brand/BrandCampaignCard';
import CampaignDetailModal from '@/components/brand/CampaignDetailModal';
import CreateCampaignModal from '@/components/brand/CreateCampaignModal';

type CampaignView = 'active' | 'published' | 'completed' | 'archived';

const BrandCampaignsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CampaignView>('active');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { 
    campaigns, 
    loading, 
    error, 
    archiveCampaign,
    updateCampaign 
  } = useBrandCampaignsData(activeTab);

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

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-text-secondary text-body-lg">Loading campaigns...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-error text-body-lg">Error loading campaigns</p>
              <p className="text-text-secondary text-body mt-2">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <BrandSidebar userName="Brand Team" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-h1 font-semibold text-text-primary mb-2">Campaign Management</h1>
                <p className="text-body text-text-secondary">Manage your active, published, completed, and archived campaigns</p>
              </div>
              <Button onClick={handleCreateCampaign} className="btn-primary">
                <Plus className="mr-2" />
                Create Campaign
              </Button>
            </div>
          </header>

          <div className="card-base">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CampaignView)}>
              <TabsList className="grid w-full grid-cols-4 bg-background-tertiary rounded-md p-1">
                <TabsTrigger 
                  value="active" 
                  className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-text-secondary rounded-md transition-smooth"
                >
                  Active Campaigns
                </TabsTrigger>
                <TabsTrigger 
                  value="published"
                  className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-text-secondary rounded-md transition-smooth"
                >
                  Published Campaigns
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-text-secondary rounded-md transition-smooth"
                >
                  Completed Campaigns
                </TabsTrigger>
                <TabsTrigger 
                  value="archived"
                  className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-text-secondary rounded-md transition-smooth"
                >
                  Archived Campaigns
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
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
                      <p className="text-text-secondary text-body-lg">No active campaigns found</p>
                      <p className="text-text-tertiary text-body mt-2">Active campaigns will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

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
                      <p className="text-text-secondary text-body-lg">No published campaigns found</p>
                      <p className="text-text-tertiary text-body mt-2">Create a campaign to get started</p>
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
                      <p className="text-text-secondary text-body-lg">No completed campaigns found</p>
                      <p className="text-text-tertiary text-body mt-2">Completed campaigns will appear here</p>
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
                      <p className="text-text-secondary text-body-lg">No archived campaigns found</p>
                      <p className="text-text-tertiary text-body mt-2">Archived campaigns will appear here</p>
                    </div>
                  )}
                </div>
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
