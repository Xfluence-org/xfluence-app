import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCampaignDetail } from '@/hooks/useCampaignDetail';
import InfluencerPerformanceSection from '@/components/brand/InfluencerPerformanceSection';
import ContentStrategySection from '@/components/brand/ContentStrategySection';
import InfluencerAllocationSection from '@/components/brand/InfluencerAllocationSection';
import ContentRequirementsSection from '@/components/brand/ContentRequirementsSection';
import ApplicationsManagementSection from '@/components/brand/ApplicationsManagementSection';
import PublicCampaignToggle from '@/components/brand/PublicCampaignToggle';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { Save, Edit, X, ArrowLeft } from 'lucide-react';

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

const BrandCampaignDetailPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [campaignPublicStatus, setCampaignPublicStatus] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: 0
  });

  const { data: campaign, isLoading, error, refetch } = useCampaignDetail(campaignId || null);

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
      // Add update logic here when needed
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

  const handlePublicToggle = (isPublic: boolean) => {
    setCampaignPublicStatus(isPublic);
  };

  const handleRequirementsUpdated = () => {
    refetch();
  };

  const handleBackToCampaigns = () => {
    navigate('/brand/campaigns');
  };

  if (!campaignId) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Campaign ID not found</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const llmCampaignData = getLLMCampaignData();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BrandSidebar userName="Brand Team" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleBackToCampaigns}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Campaigns
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#1a1f2e]">
                  {campaign?.title || 'Campaign Details'}
                </h1>
                <p className="text-gray-600">Manage your campaign details and performance</p>
              </div>
            </div>
            {!isEditing && activeTab === 'overview' ? (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
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

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading campaign details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading campaign details</p>
            </div>
          ) : campaign ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-200 px-8 pt-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
                    <TabsTrigger value="strategy">Campaign Strategy</TabsTrigger>
                    <TabsTrigger value="content">Content Requirements</TabsTrigger>
                    <TabsTrigger value="influencers">Influencers</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-8">
                  <TabsContent value="overview" className="space-y-6 mt-0">
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

                  <TabsContent value="strategy" className="space-y-6 mt-0">
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

                  <TabsContent value="content" className="space-y-6 mt-0">
                    <ContentRequirementsSection 
                      campaignId={campaignId}
                      llmInteractions={campaign.llmInteractions || []}
                      onRequirementsUpdated={handleRequirementsUpdated}
                    />
                  </TabsContent>

                  <TabsContent value="influencers" className="space-y-6 mt-0">
                    {/* Influencer Allocation Section */}
                    <InfluencerAllocationSection llmInteractions={campaign.llmInteractions || []} />
                    
                    {/* Existing Influencer Performance Section */}
                    <InfluencerPerformanceSection campaignId={campaignId} />
                  </TabsContent>

                  <TabsContent value="applications" className="space-y-6 mt-0">
                    <ApplicationsManagementSection campaignId={campaignId} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default BrandCampaignDetailPage;
