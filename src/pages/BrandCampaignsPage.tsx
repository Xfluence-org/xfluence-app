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
import InvitationManagement from '@/components/brand/InvitationManagement';
import { useAuth } from '@/contexts/SimpleAuthContext';
import SearchFilter from '@/components/campaigns/SearchFilter';
import FilterModal, { FilterOptions } from '@/components/campaigns/FilterModal';


type CampaignView = 'published' | 'completed' | 'archived' | 'invitations';

const BrandCampaignsPage: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [campaignTab, setCampaignTab] = useState<CampaignView>('published');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  
  const { 
    campaigns, 
    loading, 
    error, 
    archiveCampaign,
    updateCampaign 
  } = useBrandCampaignsData(campaignTab === 'invitations' ? 'published' : campaignTab);

  // Handle URL parameters for tab and campaign view
  useEffect(() => {
    const campaignParam = searchParams.get('campaign') as CampaignView;
    const viewParam = searchParams.get('view');
    
    if (campaignParam && ['published', 'completed', 'archived', 'invitations'].includes(campaignParam)) {
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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Filter campaigns based on search and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        campaign.campaign_title.toLowerCase().includes(query) ||
        (campaign.category && campaign.category.toLowerCase().includes(query)) ||
        (campaign.platforms && campaign.platforms.some(p => p.toLowerCase().includes(query)));
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (campaign.campaign_status !== filters.status) return false;
    }

    // Platform filter
    if (filters.platform && filters.platform !== 'all') {
      if (!campaign.platforms || !campaign.platforms.includes(filters.platform)) return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (!campaign.category || campaign.category !== filters.category) return false;
    }

    // Budget filter
    if (filters.budgetRange) {
      const budget = campaign.budget || 0;
      if (budget < filters.budgetRange[0] || budget > filters.budgetRange[1]) return false;
    }

    // Date filter
    if (filters.dateRange) {
      const dueDate = campaign.due_date ? new Date(campaign.due_date) : null;
      if (dueDate) {
        if (filters.dateRange.from && dueDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && dueDate > filters.dateRange.to) return false;
      }
    }

    return true;
  });

  const renderCampaignContent = () => {
    return (
      <Tabs value={campaignTab} onValueChange={(value) => setCampaignTab(value as CampaignView)}>
        <TabsList className="grid w-full grid-cols-4 bg-muted border border-border p-1 gap-1">
          <TabsTrigger value="published" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-primary-foreground text-foreground font-medium">Published</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-primary-foreground text-foreground font-medium">Completed</TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-primary-foreground text-foreground font-medium">Archived</TabsTrigger>
          <TabsTrigger value="invitations" className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-primary-foreground text-foreground font-medium">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-6">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onFilterClick={handleFilterClick}
            placeholder="Search by title, category, or platform..."
          />
          <div className="space-y-6">
            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => (
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
                <p className="text-muted-foreground text-lg">
                  {searchQuery || Object.keys(filters).length > 0 
                    ? 'No campaigns match your search criteria' 
                    : 'No published campaigns found'}
                </p>
                <p className="text-muted-foreground/70 mt-2">
                  {searchQuery || Object.keys(filters).length > 0 
                    ? 'Try adjusting your filters' 
                    : 'Create a campaign to get started'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onFilterClick={handleFilterClick}
            placeholder="Search by title, category, or platform..."
          />
          <div className="space-y-6">
            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => (
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
                <p className="text-muted-foreground text-lg">No completed campaigns found</p>
                <p className="text-muted-foreground/70 mt-2">Completed campaigns will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onFilterClick={handleFilterClick}
            placeholder="Search by title, category, or platform..."
          />
          <div className="space-y-6">
            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => (
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
                <p className="text-muted-foreground text-lg">No archived campaigns found</p>
                <p className="text-muted-foreground/70 mt-2">Archived campaigns will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <InvitationManagement />
        </TabsContent>
      </Tabs>
    );
  };


  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName={profile?.name || 'Brand'} />
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
        <BrandSidebar userName={profile?.name || 'Brand'} />
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
      <BrandSidebar userName={profile?.name || 'Brand'} />
      
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

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        userType="brand"
      />
    </div>
  );
};

export default BrandCampaignsPage;
