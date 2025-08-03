import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Users, Target, Zap, Clock, DollarSign } from 'lucide-react';

interface CampaignStrategyHighlightsProps {
  campaignResults: any;
}

const CampaignStrategyHighlights: React.FC<CampaignStrategyHighlightsProps> = ({ campaignResults }) => {
  if (!campaignResults) return null;

  // Handle raw response format
  let strategyData = campaignResults;
  if (campaignResults.raw_response && !campaignResults.parsed) {
    // Display raw response in a structured way
    return (
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-primary" />
            AI-Generated Campaign Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {campaignResults.raw_response}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract data from different possible structures
  let planData = strategyData;
  if (strategyData.plan) {
    planData = strategyData.plan;
  } else if (strategyData.campaign_strategy) {
    planData = strategyData.campaign_strategy;
  } else if (strategyData.strategy) {
    planData = strategyData.strategy;
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
      {/* Key Strategy Overview */}
      <Card className="glass border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-primary/20 rounded-lg backdrop-blur-sm">
              <Zap className="h-6 w-6 text-brand-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Campaign Strategy Ready</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-brand-primary" />
                <Badge variant="secondary">{totalInfluencers}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Influencers</p>
              <p className="text-xs text-gray-600">{categories.length} categories</p>
            </div>
            
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <Badge variant="secondary">{formatReach(expectedReach())}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Est. Reach</p>
              <p className="text-xs text-gray-600">Total exposure</p>
            </div>
            
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <Badge variant="secondary">{Object.keys(contentTypes).length}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Content Types</p>
              <p className="text-xs text-gray-600">Mixed formats</p>
            </div>

            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <Badge variant="secondary">Ready</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Status</p>
              <p className="text-xs text-gray-600">Launch ready</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Implementation Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-primary">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Launch {categories[0]} outreach</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Target {planData?.influencer_allocation?.allocation_by_category?.[categories[0]] || totalInfluencers} influencers first
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-primary">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Deploy content brief</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Share requirements for {Object.keys(contentTypes).join(' & ')} content
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-primary">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Track & optimize</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Monitor performance and scale what works
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Campaign Intel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Top Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {topHashtags.slice(0, 3).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(contentTypes).map(([type, data]: [string, any]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{type}s</span>
                      <Badge variant="secondary" className="text-xs">
                        {data.percentage || 50}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Why This Works</h4>
                <p className="text-sm text-gray-600">
                  {planData?.justification ? 
                    planData.justification.substring(0, 120) + '...' : 
                    `Targets ${formatReach(expectedReach())} potential customers across ${categories.length} high-impact categories`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expected Results */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Expected Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {formatReach(expectedReach())}+
              </div>
              <p className="text-sm text-gray-600">Total Reach</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {totalInfluencers}
              </div>
              <p className="text-sm text-gray-600">Active Creators</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary mb-1">
                {Object.keys(contentTypes).length}+
              </div>
              <p className="text-sm text-gray-600">Content Pieces</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-gray-700 text-center">
              <strong>Strategy designed for maximum impact:</strong> Multi-tier approach ensures cost efficiency while targeting {categories.length} key audience segments for optimal brand exposure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignStrategyHighlights;