
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

const CampaignsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as CampaignTab;
  const [activeTab, setActiveTab] = useState<CampaignTab>(tabFromUrl || 'Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (tabFromUrl && ['Active', 'Completed', 'Requests'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    
    let filtered = campaigns;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.brand.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [campaigns, searchQuery]);

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
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-slate-900">
        <Sidebar activeItem="campaigns" userName="Name" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <div className="glass-card p-8 max-w-md mx-auto">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">Loading campaigns...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-slate-900">
        <Sidebar activeItem="campaigns" userName="Name" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <div className="glass-card p-8 max-w-md mx-auto">
                <p className="text-red-400 text-lg">Error loading campaigns. Please try again.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-slate-900">
      <Sidebar activeItem="campaigns" userName="Name" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 fade-in">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-gradient">Campaigns</span>
            </h1>
            <p className="text-muted-foreground">Manage and track your campaign progress</p>
          </header>

          <section>
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">My Campaigns</h2>
              
              <CampaignSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFilterClick={() => console.log('Filter clicked')}
              />
              
              <TabNavigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />

              <div className="space-y-6">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                    <DetailedCampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onViewTaskDetails={setSelectedTaskId}
                    />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">
                      {activeTab === 'Active' && '🚀'}
                      {activeTab === 'Completed' && '✅'}
                      {activeTab === 'Requests' && '📨'}
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">
                      No campaigns found in the {activeTab.toLowerCase()} section.
                    </p>
                    <p className="text-sm text-muted-foreground">
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
        onClose={() => setSelectedTaskId(null)}
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
