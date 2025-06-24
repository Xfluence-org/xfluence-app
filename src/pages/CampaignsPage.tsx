import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TabNavigation from '@/components/campaigns/TabNavigation';
import CampaignSearch from '@/components/campaigns/CampaignSearch';
import DetailedCampaignCard from '@/components/campaigns/DetailedCampaignCard';
import TaskDetailModal from '@/components/campaigns/TaskDetailModal';
import { DetailedCampaign, CampaignTab } from '@/types/campaigns';
import { useTaskDetail } from '@/hooks/useTaskDetail';

const CampaignsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CampaignTab>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const {
    taskDetail,
    loading: taskLoading,
    submitForReview,
    downloadBrief,
    sendMessage,
    uploadFiles,
    deleteFile
  } = useTaskDetail(selectedTaskId);

  // Mock data - replace with actual API call
  const [campaigns] = useState<DetailedCampaign[]>([
    {
      id: '1',
      title: 'Air Max Campaign',
      brand: 'Nike',
      status: 'active',
      taskCount: 3,
      dueDate: '12/06/2025',
      platforms: ['Instagram', 'TikTok'],
      amount: 2500,
      overallProgress: 33,
      completedTasks: 1,
      tasks: [
        {
          id: 'task1',
          type: 'Posts',
          deliverable: '1 Post',
          status: 'content review',
          progress: 50,
          nextDeadline: '26/06/2025',
          feedback: 'Consider adding more dynamic movement to increase engagement.'
        },
        {
          id: 'task2',
          type: 'Stories',
          deliverable: '3 stories',
          status: 'post content',
          progress: 75,
          nextDeadline: '26/06/2025',
          feedback: 'Perfect! Approved for publishing.'
        },
        {
          id: 'task3',
          type: 'Reels',
          deliverable: '1 reel',
          status: 'content draft',
          progress: 75,
          nextDeadline: '29/06/2025',
          feedback: 'Send in your message'
        }
      ]
    },
    {
      id: '2',
      title: 'Summer Collection Launch',
      brand: 'Adidas',
      status: 'completed',
      taskCount: 2,
      dueDate: '15/05/2025',
      platforms: ['Instagram', 'TikTok'],
      amount: 3000,
      overallProgress: 100,
      completedTasks: 2,
      tasks: [
        {
          id: 'task4',
          type: 'Posts',
          deliverable: '2 Posts',
          status: 'completed',
          progress: 100,
          nextDeadline: 'Completed',
          feedback: 'Excellent work! Great engagement rates.'
        },
        {
          id: 'task5',
          type: 'Stories',
          deliverable: '5 stories',
          status: 'completed',
          progress: 100,
          nextDeadline: 'Completed',
          feedback: 'Perfect storytelling approach.'
        }
      ]
    },
    {
      id: '3',
      title: 'Holiday Collection',
      brand: 'Starbucks',
      status: 'invited',
      taskCount: 4,
      dueDate: '20/12/2025',
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      amount: 4500,
      overallProgress: 0,
      completedTasks: 0,
      tasks: [
        {
          id: 'task6',
          type: 'Posts',
          deliverable: '3 Posts',
          status: 'pending',
          progress: 0,
          nextDeadline: 'To be confirmed',
        },
        {
          id: 'task7',
          type: 'Stories',
          deliverable: '5 stories',
          status: 'pending',
          progress: 0,
          nextDeadline: 'To be confirmed',
        },
        {
          id: 'task8',
          type: 'Reels',
          deliverable: '2 reels',
          status: 'pending',
          progress: 0,
          nextDeadline: 'To be confirmed',
        }
      ]
    }
  ]);

  // Filter campaigns based on active tab and search
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // Filter by tab
    switch (activeTab) {
      case 'Active':
        filtered = filtered.filter(campaign => 
          campaign.status === 'active'
        );
        break;
      case 'Completed':
        filtered = filtered.filter(campaign => campaign.status === 'completed');
        break;
      case 'Requests':
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
