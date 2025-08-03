import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Users, Target, Zap, ArrowRight } from 'lucide-react';

interface CampaignStrategyHighlightsProps {
  campaignResults: any;
}

const CampaignStrategyHighlights: React.FC<CampaignStrategyHighlightsProps> = ({ campaignResults }) => {
  if (!campaignResults) return null;

  // Extract data from different possible structures
  let planData = campaignResults;
  if (campaignResults.plan) {
    planData = campaignResults.plan;
  } else if (campaignResults.campaign_strategy) {
    planData = campaignResults.campaign_strategy;
  } else if (campaignResults.strategy) {
    planData = campaignResults.strategy;
  }

  // Extract key insights
  const totalInfluencers = planData?.influencer_allocation?.total_influencers || 0;
  const categories = Object.keys(planData?.influencer_allocation?.allocation_by_category || {});
  const topHashtags = planData?.actionable_search_tactics?.niche_hashtags?.slice(0, 5) || [];
  const contentTypes = planData?.content_strategy?.content_distribution || {};
  
  // Calculate expected reach (estimation based on influencer tiers)
  const expectedReach = () => {
    const allocation = planData?.influencer_allocation?.allocation_by_tier || {};
    let totalReach = 0;
    
    Object.entries(allocation).forEach(([tier, count]: [string, any]) => {
      const influencerCount = typeof count === 'number' ? count : count.count || 0;
      switch(tier) {
        case 'nano': totalReach += influencerCount * 5000; break;
        case 'micro': totalReach += influencerCount * 30000; break;
        case 'mid': totalReach += influencerCount * 250000; break;
        case 'macro': totalReach += influencerCount * 750000; break;
        case 'mega': totalReach += influencerCount * 2000000; break;
      }
    });
    
    return totalReach;
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
    if (reach >= 1000) return `${(reach / 1000).toFixed(0)}K`;
    return reach.toString();
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Key Value Proposition */}
      <Card className="glass border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Campaign Strategy</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-700">{totalInfluencers} Influencers</Badge>
              </div>
              <p className="text-sm text-gray-600">Carefully selected across {categories.length} categories</p>
            </div>
            
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-100 text-green-700">{formatReach(expectedReach())} Reach</Badge>
              </div>
              <p className="text-sm text-gray-600">Estimated audience exposure</p>
            </div>
            
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-700">Targeted</Badge>
              </div>
              <p className="text-sm text-gray-600">Precision-matched to your goals</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Win Actions */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Quick Implementation Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-700">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Start with {categories[0]} influencers</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Focus on {planData?.influencer_allocation?.allocation_by_category[categories[0]] || 'your primary'} influencers in this high-impact category
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-700">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Use these trending hashtags</h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {topHashtags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-700">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Content mix ready to go</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {Object.entries(contentTypes).map(([type, data]: [string, any]) => 
                    `${data.percentage || 0}% ${type}s`
                  ).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Differentiators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Why This Strategy Works
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Targets {categories.length} complementary audience segments
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Balanced influencer tiers for optimal cost-effectiveness
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Content strategy aligned with platform algorithms
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Expected Outcomes
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Reach {formatReach(expectedReach())}+ potential customers
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Generate authentic user-generated content
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Build lasting influencer relationships
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignStrategyHighlights;