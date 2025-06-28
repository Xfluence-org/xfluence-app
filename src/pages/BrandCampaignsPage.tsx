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
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DDCD3] mx-auto mb-4"></div>
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
                <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Campaign Management</h1>
                <p className="text-gray-600">Manage your active, published, completed, and archived campaigns</p>
              </div>
              <Button onClick={handleCreateCampaign} className="bg-[#1a1f2e] hover:bg-[#2a2f3e] text-white">
                <Plus className="mr-2" />
                Create Campaign
              </Button>
            </div>
          </header>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CampaignView)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="active">Active Campaigns</TabsTrigger>
                <TabsTrigger value="published">Published Campaigns</TabsTrigger>
                <TabsTrigger value="completed">Completed Campaigns</TabsTrigger>
                <TabsTrigger value="archived">Archived Campaigns</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                <CampaignTabContent 
                  campaigns={campaigns}
                  onViewCampaign={handleViewCampaign}
                  onArchiveCampaign={handleArchiveCampaign}
                  showArchiveButton={true}
                  emptyMessage="No active campaigns found"
                  emptySubMessage="Active campaigns will appear here"
                />
              </TabsContent>

              <TabsContent value="published" className="mt-6">
                <CampaignTabContent 
                  campaigns={campaigns}
                  onViewCampaign={handleViewCampaign}
                  onArchiveCampaign={handleArchiveCampaign}
                  showArchiveButton={true}
                  emptyMessage="No published campaigns found"
                  emptySubMessage="Create a campaign to get started"
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <CampaignTabContent 
                  campaigns={campaigns}
                  onViewCampaign={handleViewCampaign}
                  onArchiveCampaign={handleArchiveCampaign}
                  showArchiveButton={true}
                  emptyMessage="No completed campaigns found"
                  emptySubMessage="Completed campaigns will appear here"
                />
              </TabsContent>

              <TabsContent value="archived" className="mt-6">
                <CampaignTabContent 
                  campaigns={campaigns}
                  onViewCampaign={handleViewCampaign}
                  onArchiveCampaign={handleArchiveCampaign}
                  showArchiveButton={false}
                  emptyMessage="No archived campaigns found"
                  emptySubMessage="Archived campaigns will appear here"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {selectedCampaignId && (
        <CampaignDetailModal
          isOpen={true}
          onClose={handleCloseCampaign}
          campaignId={selectedCampaignId}
          onUpdate={handleUpdateCampaign}
        />
      )}

      {isCreateModalOpen && (
        <CreateCampaignModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
        />
      )}
    </div>
  );
};

// Extracted component to reduce complexity and prevent rendering issues
interface CampaignTabContentProps {
  campaigns: any[];
  onViewCampaign: (id: string) => void;
  onArchiveCampaign: (id: string) => void;
  showArchiveButton: boolean;
  emptyMessage: string;
  emptySubMessage: string;
}

const CampaignTabContent: React.FC<CampaignTabContentProps> = ({
  campaigns,
  onViewCampaign,
  onArchiveCampaign,
  showArchiveButton,
  emptyMessage,
  emptySubMessage
}) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
        <p className="text-gray-400 mt-2">{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <BrandCampaignCard
            key={campaign.campaign_id}
            campaign={campaign}
            onView={onViewCampaign}
            onArchive={onArchiveCampaign}
            showArchiveButton={showArchiveButton}
          />
        ))}
      </div>
    </div>
  );
};

export default BrandCampaignsPage;
