
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import TabNavigation from '@/components/campaigns/TabNavigation';
import CampaignSearch from '@/components/campaigns/CampaignSearch';
import DetailedCampaignCard from '@/components/campaigns/DetailedCampaignCard';
import TaskDetailModal from '@/components/campaigns/TaskDetailModal';
import { CampaignTab } from '@/types/campaigns';
import { useTaskDetail } from '@/hooks/useTaskDetail';
import { useCampaignData } from '@/hooks/useCampaignData';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/SimpleAuthContext';
import FilterModal, { FilterOptions } from '@/components/campaigns/FilterModal';

const CampaignsPage: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as CampaignTab;
  const taskIdFromUrl = searchParams.get('task');
  const [activeTab, setActiveTab] = useState<CampaignTab>(tabFromUrl || 'Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskIdFromUrl);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Update active tab and task when URL changes
  useEffect(() => {
    if (tabFromUrl && ['Active', 'Completed', 'Requests'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
    if (taskIdFromUrl) {
      setSelectedTaskId(taskIdFromUrl);
    }
  }, [tabFromUrl, taskIdFromUrl]);

  // Use the updated hook with tab filtering
  const { data: campaigns, isLoading: loading, error } = useCampaignData(activeTab);

  const {
    taskDetail,
    loading: taskLoading,
    submitForReview,
    downloadBrief,
    sendMessage,
    uploadFiles,
    deleteFile
  } = useTaskDetail(selectedTaskId);

  // Filter campaigns based on search query and filters
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    
    return campaigns.filter(campaign => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          campaign.title.toLowerCase().includes(query) ||
          campaign.brand.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (campaign.status !== filters.status) return false;
      }

      // Platform filter
      if (filters.platform && filters.platform !== 'all') {
        if (!campaign.platforms || !campaign.platforms.includes(filters.platform)) return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        // Campaign might not have category field yet
        const campaignCategory = (campaign as any).category;
        if (!campaignCategory || campaignCategory !== filters.category) return false;
      }

      // Budget filter
      if (filters.budgetRange) {
        const amount = campaign.amount || 0;
        if (amount < filters.budgetRange[0] || amount > filters.budgetRange[1]) return false;
      }

      // Date filter
      if (filters.dateRange) {
        const dueDate = campaign.dueDate ? new Date(campaign.dueDate) : null;
        if (dueDate) {
          if (filters.dateRange.from && dueDate < filters.dateRange.from) return false;
          if (filters.dateRange.to && dueDate > filters.dateRange.to) return false;
        }
      }

      return true;
    });
  }, [campaigns, searchQuery, filters]);

  const handleTabChange = (tab: CampaignTab) => {
    setActiveTab(tab);
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

  const handleViewTaskDetails = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };

  const handleSubmitForReview = async (taskId: string) => {
    const result = await submitForReview(taskId);
  };

  const handleDownloadBrief = async (taskId: string) => {
    const result = await downloadBrief(taskId);
  };

  const handleSendMessage = async (taskId: string, message: string) => {
    const result = await sendMessage(taskId, message);
  };

  const handleFileUpload = async (taskId: string, files: FileList) => {
    const result = await uploadFiles(taskId, files);
  };

  const handleDeleteFile = async (taskId: string, fileId: string) => {
    const result = await deleteFile(taskId, fileId);
  };

  if (loading) {
    return (
      <div className="flex h-screen relative">
        <Sidebar userName={profile?.name || 'User'} />
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
      <div className="flex h-screen relative">
        <Sidebar userName={profile?.name || 'User'} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error loading campaigns. Please try again.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative">
      <Sidebar userName={profile?.name || 'User'} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Campaigns</h1>
          </header>

          <section>
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6">My Campaigns</h2>
              
              <CampaignSearch
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onFilterClick={handleFilterClick}
              />
              
              <TabNavigation 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
              />

              <div className="space-y-6">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                    <DetailedCampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onViewTaskDetails={handleViewTaskDetails}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No campaigns found in the {activeTab.toLowerCase()} section.
                    </p>
                    <p className="text-gray-400 mt-2">
                      {activeTab === 'Active' && "Start applying to opportunities to see active campaigns here."}
                      {activeTab === 'Completed' && "Completed campaigns will appear here once you finish them."}
                      {activeTab === 'Requests' && "Campaign invitations will appear here."}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>
      </main>

      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={handleCloseTaskDetail}
        taskDetail={taskDetail}
        onSubmitForReview={handleSubmitForReview}
        onDownloadBrief={handleDownloadBrief}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        onDeleteFile={handleDeleteFile}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        userType="influencer"
      />
    </div>
  );
};

export default CampaignsPage;
