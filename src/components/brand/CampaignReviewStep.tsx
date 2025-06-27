
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2 } from 'lucide-react';

interface CampaignReviewStepProps {
  campaignStrategy: any;
  onPublish: () => void;
  isPublishing: boolean;
}

const CampaignReviewStep: React.FC<CampaignReviewStepProps> = ({
  campaignStrategy,
  onPublish,
  isPublishing,
}) => {
  if (!campaignStrategy) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No campaign strategy data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Publish Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#1a1f2e]">Review Your Campaign Strategy</h2>
        <Button
          onClick={onPublish}
          disabled={isPublishing}
          className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/80 text-white border-0"
        >
          {isPublishing ? (
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

      {/* Strategy Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1a1f2e] flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Strategy Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{campaignStrategy.search_strategy_summary}</p>
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
                {campaignStrategy.influencer_allocation.total_influencers}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3">By Category:</h4>
              <div className="space-y-2">
                {Object.entries(campaignStrategy.influencer_allocation.allocation_by_category).map(([category, count]) => (
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
                {Object.entries(campaignStrategy.influencer_allocation.allocation_by_tier).map(([category, tiers]) => (
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
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{campaignStrategy.content_strategy.content_distribution.rationale}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Content Types:</h4>
              <div className="space-y-3">
                {Object.entries(campaignStrategy.content_strategy.content_distribution)
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
                {campaignStrategy.actionable_search_tactics.niche_hashtags.map((hashtag: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {hashtag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Platform Tools:</h4>
              <div className="space-y-2">
                {campaignStrategy.actionable_search_tactics.platform_tools.map((tool: string, index: number) => (
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
          <p className="text-gray-700 leading-relaxed p-4 bg-gray-50 rounded-lg">{campaignStrategy.justification}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignReviewStep;
