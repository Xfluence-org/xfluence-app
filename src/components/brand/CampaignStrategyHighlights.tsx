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

  // Extract campaign strategy data - handle both edge function format and saved format
  let strategy = campaignResults;
  
  // If this is from the saved llm_interactions table, extract from raw_output
  if (campaignResults.raw_output) {
    strategy = campaignResults.raw_output;
  }

  const allocation = strategy.influencer_allocation || {};
  const content = strategy.content_strategy || {};
  const tactics = strategy.actionable_search_tactics || {};
  const justification = strategy.justification || '';
  const summary = strategy.search_strategy_summary || '';

  // Extract key metrics from actual edge function format
  const totalInfluencers = allocation.total_influencers || 0;
  const contentDistribution = content.content_distribution || {};
  const platformStrategies = content.platform_specific_strategies || {};
  const niches = tactics.niche_hashtags || [];
  const tools = tactics.platform_tools || [];
  const allocationByTier = allocation.allocation_by_tier || {};
  const allocationByCategory = allocation.allocation_by_category || {};

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
              <h1 className="text-3xl font-bold text-gray-900">AI Campaign Strategy</h1>
              <p className="text-gray-600 mt-1">{summary}</p>
            </div>
          </div>
          
          {/* Key Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-brand-primary" />
                <Badge variant="secondary">{totalInfluencers}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Total Influencers</p>
              <p className="text-xs text-gray-600">Recommended creators</p>
            </div>
            
            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <Badge variant="secondary">{Object.keys(allocationByCategory).length}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Categories</p>
              <p className="text-xs text-gray-600">Target niches</p>
            </div>

            <div className="glass-light rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Hash className="h-5 w-5 text-purple-600" />
                <Badge variant="secondary">{niches.length}</Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">Hashtags</p>
              <p className="text-xs text-gray-600">Strategic tags</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 border border-border rounded-lg p-1 gap-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 font-medium hover:bg-purple-50 transition-all duration-200 rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 font-medium hover:bg-purple-50 transition-all duration-200 rounded-md">Content Strategy</TabsTrigger>
          <TabsTrigger value="strategy" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 font-medium hover:bg-purple-50 transition-all duration-200 rounded-md">Influencer Strategy & Search Strategy</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-primary" />
                Strategy Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Strategic Justification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{justification}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combined Strategy Tab */}
        <TabsContent value="strategy" className="space-y-6">
          {/* Influencer Strategy Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary" />
              Influencer Strategy
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Category Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(allocationByCategory).map(([category, count]: [string, any]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <Badge variant="outline">{count} influencers</Badge>
                        </div>
                        <Progress value={(count / totalInfluencers) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Tier Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(allocationByTier).map(([category, tiers]: [string, any]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="font-medium text-gray-900">{category}</h4>
                        {Object.entries(tiers).map(([tier, count]: [string, any]) => (
                          <div key={tier} className="space-y-2 ml-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm capitalize">{tier} tier</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                            <Progress value={(count / totalInfluencers) * 100} className="h-1" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search Strategy Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Hash className="h-5 w-5 text-brand-primary" />
              Search Strategy
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-600" />
                    Niche Hashtags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {niches.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-600" />
                    Platform Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tools.map((tool: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm">{tool}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Content Plan Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                Content Distribution Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 text-sm">{contentDistribution.rationale}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(contentDistribution).filter(([key]) => key !== 'rationale').map(([type, data]: [string, any]) => (
                    <div key={type} className="p-4 bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 rounded-lg border border-brand-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {type === 'reel' && <Video className="h-4 w-4" />}
                          {type === 'post' && <Image className="h-4 w-4" />}
                          {type === 'story' && <Clock className="h-4 w-4" />}
                          <span className="font-medium capitalize">{type}s</span>
                        </div>
                        <Badge variant="secondary">{data.percentage}%</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{data.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                Platform-Specific Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(platformStrategies).map(([type, strategy]: [string, any]) => (
                  <div key={type} className="space-y-3">
                    <h4 className="font-medium text-gray-900 capitalize flex items-center gap-2">
                      {type === 'reel' && <Video className="h-4 w-4" />}
                      {type === 'post' && <Image className="h-4 w-4" />}
                      {type === 'story' && <Clock className="h-4 w-4" />}
                      {type}s
                    </h4>
                    <div className="ml-6 space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Creative Approach:</p>
                        <p className="text-sm text-gray-600">{strategy.creative_approach}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Best Practices:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          {strategy.best_practices?.map((practice: string, index: number) => (
                            <li key={index}>{practice}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default CampaignStrategyHighlights;