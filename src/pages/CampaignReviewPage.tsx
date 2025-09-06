
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BrandSidebar from '@/components/brand/BrandSidebar';
import CampaignStrategyHighlights from '@/components/brand/CampaignStrategyHighlights';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';

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
      
      // Insert campaign into database (removed llm_campaign column)
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
        throw campaignError;
      }

      // Store LLM interaction data separately
      if (campaignResults && campaign) {
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
            raw_output: campaignResults
          });

        if (llmError) {
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


  return (
    <div className="flex h-screen bg-gray-50">
      <BrandSidebar userName={profile?.name} />
      
      <div className="flex-1 ml-64 overflow-y-auto">
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

                  {/* New concise strategy highlights */}
                  <CampaignStrategyHighlights campaignResults={campaignResults} />
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
