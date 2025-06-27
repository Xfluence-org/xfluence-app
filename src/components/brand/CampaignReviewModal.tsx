
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CampaignReviewModalProps {
  campaignData: any;
  llmResponse: any;
  onBack: () => void;
  onPublishSuccess: () => void;
}

const CampaignReviewModal: React.FC<CampaignReviewModalProps> = ({
  campaignData,
  llmResponse,
  onBack,
  onPublishSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitCampaign = async () => {
    if (!llmResponse || !campaignData) {
      toast({
        title: "Error",
        description: "No campaign data to submit.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Extract content distribution requirements from LLM response
      const contentDistribution = llmResponse.content_strategy?.content_distribution || {};
      const requirements = {
        total_influencers: campaignData.total_influencers,
        follower_tiers: campaignData.influencer_tiers,
        content_types: campaignData.content_types,
        categories: campaignData.categories,
        content_distribution: contentDistribution
      };

      // Create the campaign in the database
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          title: `${campaignData.goals} Campaign`,
          description: campaignData.campaign_description,
          categories: campaignData.categories, // Now using categories array
          budget: campaignData.budget_max * 100, // Convert to cents
          requirements: requirements,
          due_date: campaignData.due_date,
          application_deadline: campaignData.due_date, // Same as due date
          compensation_min: campaignData.budget_min * 100, // Convert to cents
          compensation_max: campaignData.budget_max * 100, // Convert to cents
          campaign_validity_days: campaignData.campaign_validity_days,
          status: 'published',
          is_public: true,
          llm_campaign: llmResponse,
          brand_id: campaignData.brand_id
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
      
      toast({
        title: "Success",
        description: "Campaign published successfully!",
      });
      
      // Call success callback
      onPublishSuccess();
      
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

  if (!llmResponse) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">No Campaign Data Found</h2>
        <p className="text-gray-600 mb-4">Please try generating the campaign again.</p>
        <Button onClick={onBack}>Back to Form</Button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-2xl font-bold text-[#1a1f2e]">
              Campaign Review
            </DialogTitle>
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
      </DialogHeader>

      {/* Content */}
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Strategy Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1a1f2e] flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Strategy Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{llmResponse.search_strategy_summary}</p>
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
                  {llmResponse.influencer_allocation.total_influencers}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">By Category:</h4>
                <div className="space-y-2">
                  {Object.entries(llmResponse.influencer_allocation.allocation_by_category).map(([category, count]) => (
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
                  {Object.entries(llmResponse.influencer_allocation.allocation_by_tier).map(([category, tiers]) => (
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
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{llmResponse.content_strategy.content_distribution.rationale}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Content Types:</h4>
                <div className="space-y-3">
                  {Object.entries(llmResponse.content_strategy.content_distribution)
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
                  {llmResponse.actionable_search_tactics.niche_hashtags.map((hashtag: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Platform Tools:</h4>
                <div className="space-y-2">
                  {llmResponse.actionable_search_tactics.platform_tools.map((tool: string, index: number) => (
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
            <p className="text-gray-700 leading-relaxed p-4 bg-gray-50 rounded-lg">{llmResponse.justification}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CampaignReviewModal;
