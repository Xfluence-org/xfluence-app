
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

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
      
      // Create the campaign in the database
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          title: `${campaignData.goals} Campaign`,
          description: campaignData.campaign_description,
          category: campaignData.categories[0] || 'General',
          amount: campaignData.budget_max * 100, // Convert to cents
          budget: campaignData.budget_max * 100,
          requirements: {
            total_influencers: campaignData.total_influencers,
            follower_tiers: campaignData.follower_tiers,
            content_types: campaignData.content_types,
            categories: campaignData.categories
          },
          status: 'published',
          llm_campaign: llmInteraction.raw_output,
          brand_id: null // Will need to be set based on current user's brand
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading campaign data...</div>
      </div>
    );
  }

  if (!llmInteraction?.raw_output) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/brand-dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-[#1a1f2e]">Campaign Review</h1>
          </div>
          <Button
            onClick={handleSubmitCampaign}
            disabled={isSubmitting}
            className="bg-[#1a1f2e] hover:bg-[#2a2f3e] text-white"
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

        <div className="space-y-6">
          {/* Strategy Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Strategy Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">{campaignData.search_strategy_summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Influencer Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Influencer Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Influencers:</span>
                  <Badge variant="secondary">
                    {campaignData.influencer_allocation.total_influencers}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">By Category:</h4>
                  <div className="space-y-2">
                    {Object.entries(campaignData.influencer_allocation.allocation_by_category).map(([category, count]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span>{category}:</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">By Tier:</h4>
                  <div className="space-y-2">
                    {Object.entries(campaignData.influencer_allocation.allocation_by_tier).map(([category, tiers]) => (
                      <div key={category} className="text-sm">
                        <div className="font-medium text-gray-600">{category}:</div>
                        <div className="ml-4 space-y-1">
                          {Object.entries(tiers as Record<string, number>).map(([tier, count]) => (
                            <div key={tier} className="flex justify-between">
                              <span className="capitalize">{tier}:</span>
                              <span>{count}</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Content Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Distribution Rationale:</h4>
                  <p className="text-sm text-gray-600">{campaignData.content_strategy.content_distribution.rationale}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Content Types:</h4>
                  <div className="space-y-2">
                    {Object.entries(campaignData.content_strategy.content_distribution)
                      .filter(([key]) => key !== 'rationale')
                      .map(([type, details]) => (
                        <div key={type} className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium capitalize">{type}:</span>
                            <Badge variant="secondary">
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
          <Card>
            <CardHeader>
              <CardTitle>Actionable Search Tactics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Recommended Hashtags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaignData.actionable_search_tactics.niche_hashtags.map((hashtag: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Platform Tools:</h4>
                  <div className="space-y-2">
                    {campaignData.actionable_search_tactics.platform_tools.map((tool: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Justification */}
          <Card>
            <CardHeader>
              <CardTitle>Strategy Justification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{campaignData.justification}</p>
            </CardContent>
          </Card>

          {/* Raw Output for Debugging */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-500">Raw LLM Output (Debug)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(campaignData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignReviewPage;
