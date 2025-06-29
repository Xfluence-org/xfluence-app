import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BrandSidebar from '@/components/brand/BrandSidebar';
import ContentStrategySection from '@/components/brand/ContentStrategySection';
import InfluencerAllocationSection from '@/components/brand/InfluencerAllocationSection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, Eye, Target, Users, Hash, Globe, Loader2 } from 'lucide-react';

const CampaignReviewPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaignData, setCampaignData] = useState<any>(null);
  const [campaignResults, setCampaignResults] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load campaign data from localStorage
    const tempCampaign = localStorage.getItem('temp_campaign');
    const tempResults = localStorage.getItem('temp_campaign_results');
    
    if (tempCampaign) {
      setCampaignData(JSON.parse(tempCampaign));
    }
    
    if (tempResults) {
      const results = JSON.parse(tempResults);
      console.log('Campaign results loaded:', results);
      setCampaignResults(results);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1DDCD3]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.user_type === 'Influencer') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSaveCampaign = async () => {
    if (!campaignData) {
      toast({
        title: "Error",
        description: "No campaign data to save",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Calculate budget in cents (multiply by 100)
      const budgetInCents = Math.round((campaignData.budget_max || 0) * 100);
      
      // Ensure both columns have exactly the same data
      const llmCampaignData = campaignResults || null;
      
      // Insert campaign into database
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          title: `${campaignData.brand_name} Campaign`,
          description: campaignData.campaign_description,
          brand_id: campaignData.brand_id,
          category: campaignData.categories || ['General'],
          budget: budgetInCents,
          amount: budgetInCents,
          due_date: campaignData.due_date,
          status: 'published',
          is_public: false, // Set is_public to false by default
          compensation_min: Math.round((campaignData.budget_min || 0) * 100),
          compensation_max: budgetInCents,
          application_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          llm_campaign: llmCampaignData, // Same data as raw_output
          requirements: {
            goals: campaignData.goals,
            total_influencers: campaignData.total_influencers,
            influencer_tiers: campaignData.influencer_tiers || [],
            content_types: campaignData.content_types || []
          }
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Error saving campaign:', campaignError);
        throw campaignError;
      }

      // Store LLM interaction data with the same data as llm_campaign
      if (llmCampaignData && campaign) {
        const { error: llmError } = await supabase
          .from('llm_interactions')
          .insert({
            campaign_id: campaign.id,
            user_id: user.id,
            call_type: 'campaign_planner',
            input_messages: [{
              role: 'user',
              content: JSON.stringify({
                goals: campaignData.goals,
                campaign_description: campaignData.campaign_description,
                categories: campaignData.categories,
                total_influencers: campaignData.total_influencers
              })
            }],
            raw_output: llmCampaignData // Exactly the same data as llm_campaign
          });

        if (llmError) {
          console.error('Error saving LLM interaction:', llmError);
          // Don't throw here, as the campaign was saved successfully
        }
      }

      // Clear temporary data
      localStorage.removeItem('temp_campaign');
      localStorage.removeItem('temp_campaign_results');
      
      toast({
        title: "Success",
        description: "Campaign saved successfully!",
      });
      
      // Navigate to campaigns page with the published tab active and open the campaign details
      // We'll use URL parameters to trigger the campaign detail modal
      navigate(`/brand/campaigns?tab=published&view=${campaign.id}`);
      
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error",
        description: `Failed to save campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate('/brand/campaigns');
  };

  // Helper function to create mock LLM interactions for the strategy sections
  const createMockLLMInteractions = () => {
    if (!campaignResults) return [];
    
    console.log('Creating mock LLM interactions with results:', campaignResults);
    
    return [{
      raw_output: campaignResults
    }];
  };

  const renderStrategyOverview = () => {
    if (!campaignResults) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-[#1DDCD3] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#1a1f2e]">
              {campaignResults.influencer_allocation?.total_influencers || 0}
            </div>
            <div className="text-sm text-gray-600">Total Influencers</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-[#1DDCD3] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#1a1f2e]">
              {Object.keys(campaignResults.influencer_allocation?.allocation_by_category || {}).length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Hash className="h-8 w-8 text-[#1DDCD3] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#1a1f2e]">
              {campaignResults.actionable_search_tactics?.niche_hashtags?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Niche Hashtags</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 text-[#1DDCD3] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#1a1f2e]">
              {campaignResults.actionable_search_tactics?.platform_tools?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Platform Tools</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSearchStrategy = () => {
    if (!campaignResults.actionable_search_tactics && !campaignResults.search_strategy_summary && !campaignResults.justification) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#1DDCD3]" />
            Search Strategy & Tactics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaignResults.search_strategy_summary && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <h4 className="font-medium text-blue-800 mb-2">Strategy Summary</h4>
                <p className="text-blue-700 text-sm">{campaignResults.search_strategy_summary}</p>
              </div>
            )}

            {campaignResults.actionable_search_tactics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaignResults.actionable_search_tactics.niche_hashtags && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Niche Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaignResults.actionable_search_tactics.niche_hashtags.map((hashtag: string, index: number) => (
                        <span key={index} className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {campaignResults.actionable_search_tactics.platform_tools && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Platform Tools</h4>
                    <div className="space-y-2">
                      {campaignResults.actionable_search_tactics.platform_tools.map((tool: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-[#1DDCD3]" />
                          <span className="text-sm text-gray-700">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {campaignResults.justification && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <h4 className="font-medium text-green-800 mb-2">Strategy Justification</h4>
                <p className="text-green-700 text-sm">{campaignResults.justification}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <BrandSidebar userName={profile?.name} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#1a1f2e]">Campaign Review</h1>
                <p className="text-gray-600">Review your AI-generated campaign strategy</p>
              </div>
            </div>
            <Button 
              onClick={handleSaveCampaign} 
              disabled={isSaving}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Campaign
                </>
              )}
            </Button>
          </div>

          {campaignData ? (
            <div className="space-y-6">
              {/* Campaign Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                      <p className="text-gray-900">{campaignData.brand_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Influencers</label>
                      <p className="text-gray-900">{campaignData.total_influencers}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                      <p className="text-gray-900">${campaignData.budget_min} - ${campaignData.budget_max}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <p className="text-gray-900">{campaignData.due_date}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goals</label>
                    <p className="text-gray-900">{campaignData.goals}</p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{campaignData.campaign_description}</p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {campaignData.categories?.map((category: string, index: number) => (
                        <span key={index} className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Strategy Results */}
              {campaignResults && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="h-6 w-6 text-[#1DDCD3]" />
                    <h2 className="text-2xl font-bold text-[#1a1f2e]">AI-Generated Strategy</h2>
                  </div>

                  {/* Strategy Overview Cards */}
                  {renderStrategyOverview()}

                  {/* Strategy Tabs */}
                  <Tabs defaultValue="allocation" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="allocation">Influencer Allocation</TabsTrigger>
                      <TabsTrigger value="content">Content Strategy</TabsTrigger>
                      <TabsTrigger value="search">Search Strategy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="allocation" className="mt-6">
                      <InfluencerAllocationSection llmInteractions={createMockLLMInteractions()} />
                    </TabsContent>

                    <TabsContent value="content" className="mt-6">
                      <ContentStrategySection llmInteractions={createMockLLMInteractions()} />
                    </TabsContent>

                    <TabsContent value="search" className="mt-6">
                      {renderSearchStrategy()}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No campaign data available for review.</p>
                <Button onClick={handleGoBack} className="mt-4">
                  Go to Campaigns
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignReviewPage;
