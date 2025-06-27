import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
          amount: campaignData.budget_max * 100, // Convert to cents
          budget: campaignData.budget_max * 100, // Populate from maximum budget field
          compensation_min: campaignData.budget_min * 100, // Populate from min_budget field (converted to cents)
          compensation_max: campaignData.budget_max * 100, // Populate from max_budget field (converted to cents)
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
          is_public: true // Make it public so it appears in opportunities
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
      
      // Navigate back to brand dashboard
      navigate('/brand-dashboard');
      
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-lg">Loading campaign data...</div>
      </div>
    );
  }

  if (!llmInteraction?.raw_output) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Campaign Data Found</h2>
          <p className="text-gray-600 mb-4">Please create a campaign first.</p>
          <Button onClick={() => navigate('/brand-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const campaignData = llmInteraction.raw_output;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a1f2e] to-[#2a2f3e] text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/brand-dashboard')}
                  className="p-2 hover:bg-white/10 text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Campaign Review</h1>
              </div>
              <Button
                onClick={handleSubmitCampaign}
                disabled={isSubmitting}
                className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/80 text-white border-0"
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Strategy Summary */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1a1f2e] flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Strategy Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{campaignData.search_strategy_summary}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Influencer Allocation */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#1a1f2e] flex items-center gap-2">
                    <span className="text-xl">👥</span>
                    Influencer Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total Influencers:</span>
                    <Badge variant="secondary" className="bg-[#1a1f2e] text-white">
                      {campaignData.influencer_allocation.total_influencers}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">By Category:</h4>
                    <div className="space-y-2">
                      {Object.entries(campaignData.influencer_allocation.allocation_by_category).map(([category, count]) => (
                        <div key={category} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                          <span className="capitalize">{category}:</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">By Tier:</h4>
                    <div className="space-y-2">
                      {Object.entries(campaignData.influencer_allocation.allocation_by_tier).map(([category, tiers]) => (
                        <div key={category} className="text-sm">
                          <div className="font-medium text-gray-600 mb-1">{category}:</div>
                          <div className="ml-4 space-y-1">
                            {Object.entries(tiers as Record<string, number>).map(([tier, count]) => (
                              <div key={tier} className="flex justify-between p-1 bg-gray-50 rounded">
                                <span className="capitalize">{tier}:</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Strategy */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#1a1f2e] flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    Content Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                              <Badge variant="secondary" className="bg-[#1DDCD3] text-white">
                                {(details as any).percentage}%
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{(details as any).purpose}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Tactics */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1a1f2e] flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  Actionable Search Tactics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Recommended Hashtags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaignData.actionable_search_tactics.niche_hashtags.map((hashtag: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Platform Tools:</h4>
                    <div className="space-y-2">
                      {campaignData.actionable_search_tactics.platform_tools.map((tool: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center p-2 bg-gray-50 rounded">
                          <span className="w-2 h-2 bg-[#1DDCD3] rounded-full mr-3"></span>
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Justification */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1a1f2e] flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Strategy Justification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed p-4 bg-gray-50 rounded-lg">{campaignData.justification}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignReviewPage;
