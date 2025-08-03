import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, TrendingUp, Users, Target, Zap, Clock, DollarSign, Instagram, Video, Image, Hash, Calendar, PieChart } from 'lucide-react';

interface CampaignStrategyHighlightsProps {
  campaignResults: any;
}

const CampaignStrategyHighlights: React.FC<CampaignStrategyHighlightsProps> = ({ campaignResults }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!campaignResults) return null;

  // Handle raw response format
  if (campaignResults.raw_response && !campaignResults.parsed) {
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

  // Extract campaign strategy data
  let strategy = campaignResults;
  if (campaignResults.campaign_strategy) {
    strategy = campaignResults.campaign_strategy;
  }

  const overview = strategy.campaign_overview || {};
  const allocation = strategy.influencer_allocation || {};
  const content = strategy.content_strategy || {};
  const budget = strategy.budget_allocation || {};
  const outcomes = strategy.expected_outcomes_and_kpis || {};
  const hashtags = strategy.search_tactics_and_hashtags || {};

  // Extract key metrics
  const totalInfluencers = allocation.total_influencers || 0;
  const contentTypes = content.content_types || {};
  const topHashtags = hashtags.hashtag_recommendations?.primary_hashtags || [];
  const tiers = allocation.tier_distribution || {};
  const goals = overview.campaign_goals || [];
  
  // Helper functions
  const formatCurrency = (amount: string) => {
    if (!amount) return '$0';
    return amount.replace(/[^\d]/g, '') ? `$${parseInt(amount.replace(/[^\d]/g, '')).toLocaleString()}` : amount;
  };

  const extractTargetAge = (audience: string) => {
    const match = audience?.match(/(\d+)-(\d+)/);
    return match ? `${match[1]}-${match[2]}` : 'All ages';
  };

  const getTierPercentage = (tier: string) => {
    const tierData = tiers[tier];
    if (!tierData || !totalInfluencers) return 0;
    return Math.round((tierData.count / totalInfluencers) * 100);
  };

  const getBudgetBreakdown = () => {
    const totalBudget = budget.total_budget || '$50,000';
    const costs = budget.influencer_costs || {};
    const remaining = budget.remaining_budget || '$8,000';
    
    return {
      total: formatCurrency(totalBudget),
      costs: Object.entries(costs).map(([tier, cost]) => ({
        tier: tier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        cost: typeof cost === 'string' ? cost : `$${(cost as any)?.min || 0} - $${(cost as any)?.max || 0}`
      })),
      remaining: formatCurrency(remaining)
    };
  };

  const budgetData = getBudgetBreakdown();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass border-white/20 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-primary/20 rounded-lg backdrop-blur-sm">
              <Zap className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{overview.campaign_name || 'Campaign Strategy'}</h1>
              <p className="text-gray-600 mt-1">{overview.campaign_description}</p>
            </div>
          </div>
          
          {/* Key Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <Badge variant="secondary">{budgetData.total}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Total Budget</p>
              <p className="text-xs text-gray-600">Campaign investment</p>
            </div>
            
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <Badge variant="secondary">{overview.campaign_duration || '6 weeks'}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Duration</p>
              <p className="text-xs text-gray-600">Campaign timeline</p>
            </div>
            
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-brand-primary" />
                <Badge variant="secondary">{totalInfluencers}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Influencers</p>
              <p className="text-xs text-gray-600">Total creators</p>
            </div>

            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-orange-600" />
                <Badge variant="secondary">{extractTargetAge(overview.target_audience)}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Target Age</p>
              <p className="text-xs text-gray-600">Demographics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 glass border-white/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="influencer">Influencer Strategy</TabsTrigger>
          <TabsTrigger value="content">Content Plan</TabsTrigger>
          <TabsTrigger value="budget">Budget Breakdown</TabsTrigger>
          <TabsTrigger value="results">Expected Results</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-brand-primary" />
                  Campaign Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-pink-600" />
                  Platform Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{allocation.platform_focus?.split('(')[0]?.trim() || 'Instagram'}</span>
                    <Badge variant="outline">Primary</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">TikTok</span>
                    <Badge variant="outline">Secondary</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Campaign Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-brand-primary rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Pre-Launch Phase</h4>
                    <p className="text-sm text-gray-600">4 weeks - Teasers, countdowns, feature previews</p>
                    <Progress value={70} className="mt-2" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Launch Day</h4>
                    <p className="text-sm text-gray-600">Live unboxings, giveaways, influencer takeovers</p>
                    <Progress value={20} className="mt-2" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">Post-Launch</h4>
                    <p className="text-sm text-gray-600">2 weeks - User testimonials, long-form reviews</p>
                    <Progress value={10} className="mt-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Influencer Strategy Tab */}
        <TabsContent value="influencer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(tiers).map(([tier, data]: [string, any]) => (
                    <div key={tier} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">
                          {tier.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{data.count}</span>
                          <Badge variant="outline">{getTierPercentage(tier)}%</Badge>
                        </div>
                      </div>
                      <Progress value={getTierPercentage(tier)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Category Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-brand-primary mb-2">100%</div>
                  <Badge variant="secondary" className="px-4 py-2 text-lg">
                    {allocation.category_focus || 'Technology'}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-3">Focused expertise in target category</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(tiers).map(([tier, data]: [string, any]) => (
              <Card key={tier} className="glass border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize">
                    {tier.replace('_', ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand-primary mb-2">{data.count}</div>
                  <p className="text-sm text-gray-600">{data.justification}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Plan Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-purple-600" />
                  Content Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(contentTypes).map(([type, data]: [string, any]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {type === 'reel' && <Video className="h-4 w-4" />}
                          {type === 'post' && <Image className="h-4 w-4" />}
                          {type === 'story' && <Clock className="h-4 w-4" />}
                          <span className="text-sm font-medium capitalize">{type}s</span>
                        </div>
                        <Badge variant="secondary">{data.percentage}%</Badge>
                      </div>
                      <Progress value={data.percentage} className="h-2" />
                      <p className="text-xs text-gray-600">{data.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-blue-600" />
                  Hashtag Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Primary Hashtags</h4>
                    <div className="flex flex-wrap gap-1">
                      {(hashtags.hashtag_recommendations?.primary_hashtags || []).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Secondary Hashtags</h4>
                    <div className="flex flex-wrap gap-1">
                      {(hashtags.hashtag_recommendations?.secondary_hashtags || []).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle>Content Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(content.content_themes || []).map((theme: string, index: number) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 rounded-lg border border-brand-primary/20">
                    <h4 className="font-medium text-gray-900">{theme}</h4>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Breakdown Tab */}
        <TabsContent value="budget" className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-emerald-600 mb-2">{budgetData.total}</div>
            <p className="text-gray-600">Total Campaign Budget</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Cost Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetData.costs.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.tier}</span>
                        <Badge variant="secondary">{item.cost}</Badge>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Remaining Budget</span>
                      <Badge variant="success">{budgetData.remaining}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">For giveaways, boosted posts, and analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle>Budget Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Allocated Budget</span>
                      <span className="text-sm font-medium">84%</span>
                    </div>
                    <Progress value={84} className="h-3" />
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Efficient allocation</strong> across all influencer tiers with budget remaining for optimization and performance boosting.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expected Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass border-white/20 text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {outcomes.target_metrics?.sales || '5,000+'}
                </div>
                <p className="text-sm text-gray-600">Pre-orders Expected</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20 text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {outcomes.target_metrics?.leads || '10,000+'}
                </div>
                <p className="text-sm text-gray-600">Email Sign-ups</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20 text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-brand-primary mb-2">
                  {outcomes.target_metrics?.engagement_rate || '8%+'}
                </div>
                <p className="text-sm text-gray-600">Avg Engagement Rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle>Sales KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(outcomes.sales_kpis || []).map((kpi: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">{kpi}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle>Lead Generation KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(outcomes.lead_generation_kpis || []).map((kpi: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{kpi}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/20">
            <CardContent className="pt-6">
              <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                <h3 className="text-lg font-semibold mb-2">Campaign Success Forecast</h3>
                <p className="text-gray-700">
                  This multi-tier influencer strategy is designed to maximize ROI through strategic content distribution 
                  and targeted audience engagement across {Object.keys(tiers).length} influencer categories.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignStrategyHighlights;