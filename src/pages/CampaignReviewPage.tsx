import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import BrandSidebar from '@/components/brand/BrandSidebar';

interface LLMInteraction {
  id: string;
  raw_output: any;
  created_at: string;
  campaign_id?: string;
}

const CampaignReviewPage = () => {
  const [llmInteraction, setLlmInteraction] = useState<LLMInteraction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Check if user is Agency or Brand - redirect if not
  useEffect(() => {
    if (profile && profile.user_type !== 'Agency' && profile.user_type !== 'Brand') {
      navigate('/dashboard');
      return;
    }
  }, [profile, navigate]);

  useEffect(() => {
    fetchLatestLLMInteraction();
  }, []);

  const fetchLatestLLMInteraction = async () => {
    try {
      console.log('Fetching latest LLM interaction...');
      const { data, error } = await supabase
        .from('llm_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching LLM interaction:', error);
        toast({
          title: "Error",
          description: "Failed to load campaign data.",
          variant: "destructive"
        });
        return;
      }

      console.log('LLM interaction data:', data);
      setLlmInteraction(data);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCampaign = async () => {
    if (!llmInteraction?.raw_output) {
      toast({
        title: "Error",
        description: "No campaign data to submit.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get temporary campaign data from localStorage
      const tempCampaign = localStorage.getItem('temp_campaign');
      if (!tempCampaign) {
        toast({
          title: "Error",
          description: "Campaign data not found.",
          variant: "destructive"
        });
        return;
      }

      const campaignData = JSON.parse(tempCampaign);
      
      // Create the campaign in the database with corrected field mappings
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          title: `${campaignData.goals} Campaign`,
          description: campaignData.campaign_description,
          category: campaignData.categories, // Array of categories from the form
          amount: campaignData.budget_max, // Keep in dollars
          budget: campaignData.budget_max, // Keep in dollars
          compensation_min: campaignData.budget_min, // Keep in dollars
          compensation_max: campaignData.budget_max, // Keep in dollars
          due_date: campaignData.due_date, // Populate from campaign valid through field
          application_deadline: campaignData.due_date, // Same as due_date as requested
          requirements: {
            total_influencers: campaignData.total_influencers,
            follower_tiers: campaignData.influencer_tiers,
            content_types: campaignData.content_types,
            categories: campaignData.categories
          },
          status: 'published',
          llm_campaign: llmInteraction.raw_output,
          brand_id: campaignData.brand_id,
          is_public: false // Explicitly set to false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        toast({
          title: "Error",
          description: "Failed to create campaign.",
          variant: "destructive"
        });
        return;
      }

      console.log('Campaign created successfully:', newCampaign);
      
      // Clear temporary data
      localStorage.removeItem('temp_campaign');
      localStorage.removeItem('temp_campaign_results');
      
      toast({
        title: "Success",
        description: "Campaign published successfully!",
      });
      
      // Navigate back to campaigns page
      navigate('/brand/campaigns');
      
    } catch (error) {
      console.error('Error submitting campaign:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render for non-brand/agency users
  if (profile && profile.user_type !== 'Agency' && profile.user_type !== 'Brand') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading campaign data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!llmInteraction?.raw_output) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName="Brand Team" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-2">No Campaign Data Found</h2>
              <p className="text-gray-600 mb-6">Please create a campaign first.</p>
              <Button 
                onClick={() => navigate('/brand/campaigns')}
                className="bg-[#1a1f2e] hover:bg-[#2a2f3e] text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaigns
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const campaignData = llmInteraction.raw_output;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BrandSidebar userName="Brand Team" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Campaign Review</h1>
                <p className="text-gray-600">Review and publish your AI-generated campaign strategy</p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/brand/campaigns')}
                  className="border-2 border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Campaigns
                </Button>
                <Button
                  onClick={handleSubmitCampaign}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#1a1f2e] to-[#2a2f3e] hover:from-[#2a2f3e] hover:to-[#3a3f4e] text-white px-8 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publish Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="space-y-6">
            {/* Strategy Summary */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6 flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                Strategy Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{campaignData.search_strategy_summary}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Influencer Allocation */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-[#1a1f2e] mb-6 flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  Influencer Allocation
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total Influencers:</span>
                    <span className="text-2xl font-bold text-[#1a1f2e]">
                      {campaignData.influencer_allocation.total_influencers}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">By Category:</h4>
                    <div className="space-y-2">
                      {Object.entries(campaignData.influencer_allocation.allocation_by_category).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="capitalize text-gray-700">{category}</span>
                          <span className="font-semibold text-[#1a1f2e]">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">By Tier:</h4>
                    <div className="space-y-2">
                      {Object.entries(campaignData.influencer_allocation.allocation_by_tier).map(([category, tiers]) => (
                        <div key={category} className="text-sm">
                          <div className="font-medium text-gray-700 mb-2 capitalize">{category}</div>
                          <div className="ml-4 space-y-2">
                            {Object.entries(tiers as Record<string, number>).map(([tier, count]) => (
                              <div key={tier} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                <span className="capitalize text-gray-600">{tier}</span>
                                <span className="font-semibold text-[#1a1f2e]">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Strategy */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-[#1a1f2e] mb-6 flex items-center gap-2">
                  <span className="text-xl">📱</span>
                  Content Strategy
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Distribution Rationale:</h4>
                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{campaignData.content_strategy.content_distribution.rationale}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Content Types:</h4>
                    <div className="space-y-3">
                      {Object.entries(campaignData.content_strategy.content_distribution)
                        .filter(([key]) => key !== 'rationale')
                        .map(([type, details]) => (
                          <div key={type} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium capitalize">{type}:</span>
                              <span className="font-bold text-[#1DDCD3]">
                                {(details as any).percentage}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{(details as any).purpose}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Tactics */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6 flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                Actionable Search Tactics
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Recommended Hashtags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaignData.actionable_search_tactics.niche_hashtags.map((hashtag: string, index: number) => (
                        <span key={index} className="inline-block px-3 py-1.5 bg-[#1DDCD3]/10 text-[#1a1f2e] border border-[#1DDCD3]/30 rounded-full text-sm font-medium hover:bg-[#1DDCD3]/20 transition-colors cursor-pointer">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Platform Tools:</h4>
                    <div className="space-y-2">
                      {campaignData.actionable_search_tactics.platform_tools.map((tool: string, index: number) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="w-2 h-2 bg-[#1DDCD3] rounded-full mr-3 flex-shrink-0"></span>
                          <span className="text-sm text-gray-700">
                          {tool}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>

            {/* Justification */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                Strategy Justification
              </h2>
              <p className="text-gray-700 leading-relaxed p-6 bg-gray-50 rounded-xl">{campaignData.justification}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignReviewPage;
