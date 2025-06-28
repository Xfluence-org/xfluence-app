import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCampaignDetail } from '@/hooks/useCampaignDetail';
import InfluencerPerformanceSection from '@/components/brand/InfluencerPerformanceSection';
import ContentStrategySection from '@/components/brand/ContentStrategySection';
import InfluencerAllocationSection from '@/components/brand/InfluencerAllocationSection';
import ContentRequirementsSection from '@/components/brand/ContentRequirementsSection';
import { Save, Edit, X } from 'lucide-react';
import PublicCampaignToggle from '@/components/brand/PublicCampaignToggle';
import ApplicationsManagementSection from '@/components/brand/ApplicationsManagementSection';

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

  // Helper function to safely get LLM campaign data from llm_campaign field
  const getLLMCampaignData = (): LLMCampaignData | null => {
    if (!campaign?.llm_campaign) return null;
    
    // Check if it's already an object
    if (typeof campaign.llm_campaign === 'object' && campaign.llm_campaign !== null && !Array.isArray(campaign.llm_campaign)) {
      return campaign.llm_campaign as LLMCampaignData;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof campaign.llm_campaign === 'string') {
      try {
        return JSON.parse(campaign.llm_campaign) as LLMCampaignData;
      } catch {
        return null;
      }
    }
    
    return null;
  };

  const handlePublicToggle = (isPublic: boolean) => {
    setCampaignPublicStatus(isPublic);
  };

  const handleRequirementsUpdated = () => {
    refetch();
  };

  if (!isOpen || !campaignId) return null;

  const llmCampaignData = getLLMCampaignData();

  return (
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
              <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
              <TabsTrigger value="strategy">Campaign Strategy</TabsTrigger>
              <TabsTrigger value="content">Content Requirements</TabsTrigger>
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Public Campaign Toggle */}
              <PublicCampaignToggle
                campaignId={campaignId}
                isPublic={campaignPublicStatus}
                onToggle={handlePublicToggle}
              />

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

                    {/* Content Strategy */}
                    {llmCampaignData.content_strategy && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-[#1a1f2e]">Content Strategy</h4>
                        
                        {/* Content Distribution */}
                        {llmCampaignData.content_strategy.content_distribution && (
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-medium text-gray-700 mb-3">Content Distribution</h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {llmCampaignData.content_strategy.content_distribution.post && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-medium text-gray-700">Posts</h6>
                                    <span className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                                      {llmCampaignData.content_strategy.content_distribution.post.percentage}%
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm">
                                    {llmCampaignData.content_strategy.content_distribution.post.purpose}
                                  </p>
                                </div>
                              )}
                              
                              {llmCampaignData.content_strategy.content_distribution.reel && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-medium text-gray-700">Reels</h6>
                                    <span className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                                      {llmCampaignData.content_strategy.content_distribution.reel.percentage}%
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm">
                                    {llmCampaignData.content_strategy.content_distribution.reel.purpose}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {llmCampaignData.content_strategy.content_distribution.rationale && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                                <h6 className="font-medium text-yellow-800 mb-1">Content Rationale</h6>
                                <p className="text-yellow-700 text-sm">{llmCampaignData.content_strategy.content_distribution.rationale}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Platform Specific Strategies */}
                        {llmCampaignData.content_strategy.platform_specific_strategies && (
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-medium text-gray-700 mb-3">Platform Specific Strategies</h5>
                            
                            <div className="space-y-4">
                              {llmCampaignData.content_strategy.platform_specific_strategies.post && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h6 className="font-medium text-gray-700 mb-2">Post Strategy</h6>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 mb-1">Creative Approach:</p>
                                      <p className="text-sm text-gray-700">
                                        {llmCampaignData.content_strategy.platform_specific_strategies.post.creative_approach}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 mb-1">Best Practices:</p>
                                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {llmCampaignData.content_strategy.platform_specific_strategies.post.best_practices.map((practice, index) => (
                                          <li key={index}>{practice}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {llmCampaignData.content_strategy.platform_specific_strategies.reel && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h6 className="font-medium text-gray-700 mb-2">Reel Strategy</h6>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 mb-1">Creative Approach:</p>
                                      <p className="text-sm text-gray-700">
                                        {llmCampaignData.content_strategy.platform_specific_strategies.reel.creative_approach}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 mb-1">Best Practices:</p>
                                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {llmCampaignData.content_strategy.platform_specific_strategies.reel.best_practices.map((practice, index) => (
                                          <li key={index}>{practice}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
                llmInteractions={campaign.llmInteractions || []}
                onRequirementsUpdated={handleRequirementsUpdated}
              />
            </TabsContent>

            <TabsContent value="influencers" className="space-y-6 mt-6">
              {/* Influencer Allocation Section */}
              <InfluencerAllocationSection llmInteractions={campaign.llmInteractions || []} />
              
              {/* Existing Influencer Performance Section */}
              <InfluencerPerformanceSection campaignId={campaignId} />
            </TabsContent>

            <TabsContent value="applications" className="space-y-6 mt-6">
              <ApplicationsManagementSection campaignId={campaignId} />
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailModal;
