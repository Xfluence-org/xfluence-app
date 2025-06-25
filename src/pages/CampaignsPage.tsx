import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TabNavigation from '@/components/campaigns/TabNavigation';
import CampaignSearch from '@/components/campaigns/CampaignSearch';
import DetailedCampaignCard from '@/components/campaigns/DetailedCampaignCard';
import TaskDetailModal from '@/components/campaigns/TaskDetailModal';
import { CampaignTab } from '@/types/campaigns';
import { useTaskDetail } from '@/hooks/useTaskDetail';
import { useCampaignData } from '@/hooks/useCampaignData';

const CampaignsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CampaignTab>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: campaigns, isLoading: loading, error } = useCampaignData();

  const {
    taskDetail,
    loading: taskLoading,
    submitForReview,
    downloadBrief,
    sendMessage,
    uploadFiles,
    deleteFile
  } = useTaskDetail(selectedTaskId);

  // Filter campaigns based on active tab and search - UPDATED to match dashboard logic
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    
    let filtered = campaigns;

    // Filter by tab - Updated to match dashboard behavior
    switch (activeTab) {
      case 'Active':
        // Show campaigns that are invited, accepted, or active (same as dashboard "active campaigns")
        filtered = filtered.filter(campaign => 
          campaign.status === 'active' || campaign.status === 'invited'
        );
        break;
      case 'Completed':
        filtered = filtered.filter(campaign => campaign.status === 'completed');
        break;
      case 'Requests':
        // Only show truly invited campaigns that haven't been accepted yet
        filtered = filtered.filter(campaign => campaign.status === 'invited');
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.brand.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [campaigns, activeTab, searchQuery]);

  const handleTabChange = (tab: CampaignTab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterClick = () => {
    console.log('Filter clicked');
    // Implement filter modal
  };

  const handleViewTaskDetails = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };

  const handleSubmitForReview = async (taskId: string) => {
    const result = await submitForReview(taskId);
    console.log('Submit result:', result);
  };

  const handleDownloadBrief = async (taskId: string) => {
    const result = await downloadBrief(taskId);
    console.log('Download result:', result);
  };

  const handleSendMessage = async (taskId: string, message: string) => {
    const result = await sendMessage(taskId, message);
    console.log('Message result:', result);
  };

  const handleFileUpload = async (taskId: string, files: FileList) => {
    const result = await uploadFiles(taskId, files);
    console.log('Upload result:', result);
  };

  const handleDeleteFile = async (taskId: string, fileId: string) => {
    const result = await deleteFile(taskId, fileId);
    console.log('Delete result:', result);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar activeItem="campaigns" userName="Name" />
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
        <Sidebar activeItem="campaigns" userName="Name" />
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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar activeItem="campaigns" userName="Name" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Campaigns</h1>
          </header>

          <section>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
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
            </div>
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
    </div>
  );
};

export default CampaignsPage;
