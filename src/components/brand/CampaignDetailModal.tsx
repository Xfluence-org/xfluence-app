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
import { Save, Edit, X } from 'lucide-react';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string | null;
  onUpdate: (campaignId: string, updates: any) => void;
}

// Type for the LLM campaign data structure
interface LLMCampaignData {
  campaign_name?: string;
  campaign_objective?: string;
  target_audience?: string;
  content_guidelines?: string;
  key_messages?: string[] | string;
  success_metrics?: string[] | string;
  timeline?: string;
}

const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: 0
  });

  const { data: campaign, isLoading, error } = useCampaignDetail(campaignId);

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

  // Helper function to safely get LLM campaign data
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
              <TabsTrigger value="strategy">Campaign Strategy</TabsTrigger>
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
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
                  <div className="space-y-4">
                    {llmCampaignData.campaign_name && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Campaign Name</h4>
                        <p className="text-gray-900">{llmCampaignData.campaign_name}</p>
                      </div>
                    )}
                    
                    {llmCampaignData.campaign_objective && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Campaign Objective</h4>
                        <p className="text-gray-900">{llmCampaignData.campaign_objective}</p>
                      </div>
                    )}
                    
                    {llmCampaignData.target_audience && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Target Audience</h4>
                        <p className="text-gray-900">{llmCampaignData.target_audience}</p>
                      </div>
                    )}
                    
                    {llmCampaignData.content_guidelines && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Content Guidelines</h4>
                        <p className="text-gray-900">{llmCampaignData.content_guidelines}</p>
                      </div>
                    )}
                    
                    {llmCampaignData.key_messages && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Key Messages</h4>
                        <div className="text-gray-900">
                          {Array.isArray(llmCampaignData.key_messages) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {llmCampaignData.key_messages.map((message, index) => (
                                <li key={index}>{message}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{llmCampaignData.key_messages}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {llmCampaignData.success_metrics && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Success Metrics</h4>
                        <div className="text-gray-900">
                          {Array.isArray(llmCampaignData.success_metrics) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {llmCampaignData.success_metrics.map((metric, index) => (
                                <li key={index}>{metric}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{llmCampaignData.success_metrics}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {llmCampaignData.timeline && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Timeline</h4>
                        <p className="text-gray-900">{llmCampaignData.timeline}</p>
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

              {/* Content Strategy Section */}
              <ContentStrategySection llmInteractions={campaign.llmInteractions || []} />
            </TabsContent>

            <TabsContent value="influencers" className="space-y-6 mt-6">
              {/* Influencer Allocation Section */}
              <InfluencerAllocationSection llmInteractions={campaign.llmInteractions || []} />
              
              {/* Existing Influencer Performance Section */}
              <InfluencerPerformanceSection campaignId={campaignId} />
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailModal;
