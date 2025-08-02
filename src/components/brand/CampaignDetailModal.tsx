import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCampaignDetail } from '@/hooks/useCampaignDetail';
import InfluencerPerformanceSection from '@/components/brand/InfluencerPerformanceSection';
import ContentStrategySection from '@/components/brand/ContentStrategySection';
import InfluencerAllocationSection from '@/components/brand/InfluencerAllocationSection';
import InfluencerAssignmentSection from '@/components/brand/InfluencerAssignmentSection';
import ContentRequirementsSection from '@/components/brand/ContentRequirementsSection';
import WaitingParticipantsSection from '@/components/brand/WaitingParticipantsSection';
import ActiveInfluencersSection from '@/components/brand/ActiveInfluencersSection';
import BrandTaskViewModal from '@/components/brand/BrandTaskViewModal';
import CampaignAnalyticsDashboard from '@/components/brand/CampaignAnalyticsDashboard';
import { Save, Edit, X, Sprout, TrendingUp, Rocket, Star, User } from 'lucide-react';
import PublicCampaignToggle from '@/components/brand/PublicCampaignToggle';
import ApplicationsManagementSection from '@/components/brand/ApplicationsManagementSection';
import InvitationManagement from '@/components/brand/InvitationManagement';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string | null;
  onUpdate: (campaignId: string, updates: any) => void;
}

// Type for the LLM campaign data structure
interface LLMCampaignData {
  justification?: string;
  content_strategy?: {
    content_distribution?: {
      post?: { purpose: string; percentage: number };
      reel?: { purpose: string; percentage: number };
      rationale?: string;
    };
    platform_specific_strategies?: {
      post?: {
        best_practices: string[];
        creative_approach: string;
      };
      reel?: {
        best_practices: string[];
        creative_approach: string;
      };
    };
  };
  influencer_allocation?: {
    total_influencers?: number;
    allocation_by_tier?: any;
    allocation_by_category?: any;
  };
  search_strategy_summary?: string;
  actionable_search_tactics?: {
    niche_hashtags?: string[];
    platform_tools?: string[];
  };
}

const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [campaignPublicStatus, setCampaignPublicStatus] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participantId: string;
    influencerId: string;
  } | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: 0
  });

  const { data: campaign, isLoading, error, refetch } = useCampaignDetail(campaignId);

  useEffect(() => {
    if (campaign) {
      // Handle category conversion from array to string for the form
      const categoryValue = Array.isArray(campaign.category) 
        ? campaign.category[0] || '' 
        : campaign.category || '';
        
      setEditForm({
        title: campaign.title || '',
        description: campaign.description || '',
        category: categoryValue,
        budget: campaign.budget || 0
      });
      
      // Set public status
      setCampaignPublicStatus(campaign.is_public || false);
    }
  }, [campaign]);

  const handleSave = async () => {
    if (campaignId) {
      await onUpdate(campaignId, editForm);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (campaign) {
      // Handle category conversion from array to string for the form
      const categoryValue = Array.isArray(campaign.category) 
        ? campaign.category[0] || '' 
        : campaign.category || '';
        
      setEditForm({
        title: campaign.title || '',
        description: campaign.description || '',
        category: categoryValue,
        budget: campaign.budget || 0
      });
    }
    setIsEditing(false);
  };

  // Helper function to get category display value
  const getCategoryDisplay = (category: any) => {
    if (Array.isArray(category)) {
      return category.length > 0 ? category[0] : 'General';
    }
    return category || 'General';
  };

  // Simplified function to get LLM campaign data using the database function result
  const getLLMCampaignData = (): LLMCampaignData | null => {
    if (!campaign?.llm_data || Object.keys(campaign.llm_data).length === 0) {
      return null;
    }
    
    // console.log('LLM data from database function:', campaign.llm_data);
    return campaign.llm_data as LLMCampaignData;
  };

  // Create mock LLM interactions for components that expect that format
  const createMockLLMInteractions = () => {
    const llmData = getLLMCampaignData();
    if (!llmData) return [];
    
    return [{
      raw_output: llmData
    }];
  };

  const handlePublicToggle = (isPublic: boolean) => {
    setCampaignPublicStatus(isPublic);
  };

  const handleRequirementsUpdated = () => {
    refetch();
    setRefreshKey(prev => prev + 1);
  };

  const handleViewTasks = (participantId: string, influencerId: string) => {
    setSelectedParticipant({ participantId, influencerId });
  };

  // Helper functions for influencer allocation display
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'nano': return <Sprout className="w-4 h-4 inline" />;
      case 'micro': return <TrendingUp className="w-4 h-4 inline" />;
      case 'macro': return <Rocket className="w-4 h-4 inline" />;
      case 'mega': return <Star className="w-4 h-4 inline" />;
      default: return <User className="w-4 h-4 inline" />;
    }
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'nano': return '1K - 10K followers';
      case 'micro': return '10K - 100K followers';
      case 'macro': return '100K - 1M followers';
      case 'mega': return '1M+ followers';
      default: return '';
    }
  };

  if (!isOpen || !campaignId) return null;

  const llmCampaignData = getLLMCampaignData();

  // Extract content types from LLM data
  const getContentTypes = (): string[] => {
    if (!llmCampaignData?.content_strategy?.content_distribution) return [];
    
    return Object.entries(llmCampaignData.content_strategy.content_distribution)
      .filter(([key, value]) => key !== 'rationale' && value && typeof value === 'object' && 'percentage' in value)
      .map(([contentType]) => {
        // Capitalize first letter and properly pluralize
        const capitalized = contentType.charAt(0).toUpperCase() + contentType.slice(1);
        // Special case for "story" -> "Stories"
        if (contentType.toLowerCase() === 'story') {
          return 'Stories';
        }
        return capitalized + 's';
      });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#1a1f2e]">
              Campaign Details
            </DialogTitle>
            {!isEditing && activeTab === 'overview' ? (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="ml-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : isEditing && activeTab === 'overview' ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            ) : null}
          </div>
          <DialogDescription>
            View and manage campaign settings, strategy, and influencer assignments
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading campaign details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading campaign details</p>
          </div>
        ) : campaign ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="content">Requirements</TabsTrigger>
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1a1f2e] mb-4">Campaign Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Title
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter campaign title"
                      />
                    ) : (
                      <p className="text-gray-900">{campaign.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Enter category"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {getCategoryDisplay(campaign.category)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.budget}
                        onChange={(e) => setEditForm(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                        placeholder="Enter budget"
                      />
                    ) : (
                      <p className="text-gray-900">${campaign.budget?.toLocaleString()}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <span className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-[#1DDCD3]">
                      {campaign.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <p className="text-gray-900">
                      {campaign.due_date ? new Date(campaign.due_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created
                    </label>
                    <p className="text-gray-900">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter campaign description"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900">{campaign.description || 'No description available'}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-6 mt-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1a1f2e] mb-4">AI Generated Campaign Strategy</h3>
                
                {llmCampaignData ? (
                  <div className="space-y-6">
                    {/* Strategy Justification */}
                    {llmCampaignData.justification && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Strategy Justification</h4>
                        <p className="text-blue-700">{llmCampaignData.justification}</p>
                      </div>
                    )}

                    {/* Search Strategy Summary */}
                    {llmCampaignData.search_strategy_summary && (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <h4 className="font-medium text-green-800 mb-2">Search Strategy Summary</h4>
                        <p className="text-green-700">{llmCampaignData.search_strategy_summary}</p>
                      </div>
                    )}

                    {/* Actionable Search Tactics */}
                    {llmCampaignData.actionable_search_tactics && (
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                        <h4 className="font-medium text-purple-800 mb-3">Actionable Search Tactics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {llmCampaignData.actionable_search_tactics.niche_hashtags && (
                            <div>
                              <h5 className="font-medium text-purple-700 mb-2">Niche Hashtags</h5>
                              <div className="flex flex-wrap gap-2">
                                {llmCampaignData.actionable_search_tactics.niche_hashtags.map((hashtag, index) => (
                                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                                    {hashtag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {llmCampaignData.actionable_search_tactics.platform_tools && (
                            <div>
                              <h5 className="font-medium text-purple-700 mb-2">Platform Tools</h5>
                              <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                                {llmCampaignData.actionable_search_tactics.platform_tools.map((tool, index) => (
                                  <li key={index}>{tool}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content Strategy Section */}
                    {llmCampaignData.content_strategy && (
                      <ContentStrategySection llmInteractions={createMockLLMInteractions()} />
                    )}

                    {/* Influencer Allocation Section */}
                    {llmCampaignData.influencer_allocation && (
                      <InfluencerAllocationSection llmInteractions={createMockLLMInteractions()} />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No campaign strategy available</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Campaign strategy is generated during campaign creation with AI assistance
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 mt-6">
              <ContentRequirementsSection 
                campaignId={campaignId}
                llmInteractions={createMockLLMInteractions()}
                onRequirementsUpdated={handleRequirementsUpdated}
              />
            </TabsContent>

            <TabsContent value="influencers" className="space-y-6 mt-6">
              {/* Invitation Management */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1a1f2e] mb-4">Invitations</h3>
                <InvitationManagement campaignId={campaignId} />
              </div>
              
              {/* Active Influencers Working on Content */}
              <ActiveInfluencersSection 
                campaignId={campaignId} 
                key={`active-${refreshKey}`}
                onViewTasks={handleViewTasks}
              />
              
              {/* Participants Waiting for Requirements */}
              <WaitingParticipantsSection 
                campaignId={campaignId} 
                key={`waiting-${refreshKey}`}
                contentTypes={getContentTypes()}
              />
              
              {/* Influencer Assignment */}
              <InfluencerAssignmentSection 
                campaignId={campaignId}
                llmInteractions={createMockLLMInteractions()}
                key={`assignment-${refreshKey}`}
                onViewTasks={handleViewTasks}
              />
            </TabsContent>


            <TabsContent value="analytics" className="space-y-6 mt-6">
              <CampaignAnalyticsDashboard campaignId={campaignId} />
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
    
    {/* Brand Task View Modal */}
    {selectedParticipant && (
      <BrandTaskViewModal
        isOpen={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        participantId={selectedParticipant.participantId}
        influencerId={selectedParticipant.influencerId}
        campaignId={campaignId}
      />
    )}
    </>
  );
};

export default CampaignDetailModal;
