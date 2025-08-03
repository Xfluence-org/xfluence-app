import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Users, Target, Zap, ArrowRight, Clock, DollarSign } from 'lucide-react';

interface CampaignStrategyHighlightsProps {
  campaignResults: any;
}

const CampaignStrategyHighlights: React.FC<CampaignStrategyHighlightsProps> = ({ campaignResults }) => {
  if (!campaignResults) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="text-center py-8">
          <p className="text-destructive">No campaign strategy available. Please regenerate your campaign.</p>
        </CardContent>
      </Card>
    );
  }

  // Extract strategy data from the new structured format
  const strategy = campaignResults.strategy_summary || {};
  const quickWins = campaignResults.quick_wins || [];
  const allocation = campaignResults.influencer_allocation || {};
  const contentStrategy = campaignResults.content_strategy || {};
  const metrics = campaignResults.success_metrics || {};
  const roadmap = campaignResults.implementation_roadmap || [];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num?.toString() || '0';
  };

  return (
    <div className="space-y-6">
      {/* Hero Value Proposition */}
      <Card className="bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 border border-brand-primary/30 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-primary/20 rounded-xl border border-brand-primary/30">
              <Zap className="h-8 w-8 text-brand-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-3">Strategy Overview</h2>
              <p className="text-lg text-foreground/80 mb-4 leading-relaxed">
                {strategy.core_value_proposition || "Strategy designed to maximize your campaign impact and ROI."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-sm">Expected ROI</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {strategy.expected_roi || "Increased brand awareness and engagement"}
                  </p>
                </div>
                
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-sm">Key Advantage</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {strategy.key_differentiator || "Targeted approach for maximum impact"}
                  </p>
                </div>
                
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-sm">Target Reach</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(metrics.target_reach || 0)} potential customers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Implementation Steps */}
      <Card className="border border-border shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2 text-brand-primary">
            <CheckCircle className="h-5 w-5" />
            Start Here - Quick Wins (First 2 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {quickWins.slice(0, 3).map((win: any, index: number) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg border border-border">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-full flex items-center justify-center border border-brand-primary/30">
                  <span className="text-sm font-bold text-brand-primary">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {win.action || `Quick Win ${index + 1}`}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {win.why || "Immediate impact action"}
                  </p>
                  {win.timeline && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {win.timeline}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Numbers & Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-brand-primary">
              <Users className="h-5 w-5" />
              Influencer Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/20">
                <div className="text-3xl font-bold text-brand-primary mb-1">
                  {allocation.total_influencers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Influencers</div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(allocation.allocation_by_tier || {}).map(([tier, data]: [string, any]) => (
                  <div key={tier} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <span className="font-medium capitalize">{tier}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.rationale || "Strategic tier selection"}
                      </p>
                    </div>
                    <Badge className="bg-brand-primary text-brand-primary-foreground">
                      {data.count || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-brand-primary">
              <Target className="h-5 w-5" />
              Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xl font-bold text-green-700">
                    {metrics.expected_engagement_rate || "3-5%"}
                  </div>
                  <div className="text-xs text-green-600">Engagement Rate</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xl font-bold text-blue-700">
                    {formatNumber(metrics.target_reach || 0)}
                  </div>
                  <div className="text-xs text-blue-600">Total Reach</div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/20 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">Primary KPI</h4>
                <p className="text-sm text-muted-foreground">
                  {metrics.primary_kpi || "Brand awareness and engagement growth"}
                </p>
              </div>
              
              {metrics.projected_conversions && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-1">Projected Results</h4>
                  <p className="text-sm text-yellow-700">{metrics.projected_conversions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Strategy & Hashtags */}
      <Card className="border border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-brand-primary">
            <TrendingUp className="h-5 w-5" />
            Content & Messaging Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Content Mix</h4>
              <div className="space-y-2">
                {(contentStrategy.content_mix || []).map((content: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <span className="font-medium capitalize">{content.type}</span>
                      <p className="text-xs text-muted-foreground">{content.purpose}</p>
                    </div>
                    <Badge variant="outline">{content.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">Trending Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {(contentStrategy.trending_hashtags || []).slice(0, 8).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </Badge>
                ))}
              </div>
              
              {contentStrategy.key_messages && (
                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-2">Key Messages</h4>
                  <ul className="space-y-1">
                    {contentStrategy.key_messages.slice(0, 3).map((message: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 text-brand-primary mt-1 flex-shrink-0" />
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Timeline */}
      {roadmap.length > 0 && (
        <Card className="border border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-brand-primary">
              <Clock className="h-5 w-5" />
              4-Week Implementation Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmap.slice(0, 4).map((week: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center border border-brand-primary/30">
                    <span className="text-sm font-bold text-brand-primary">W{week.week || index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{week.focus}</h4>
                    <ul className="space-y-1">
                      {(week.deliverables || []).map((deliverable: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignStrategyHighlights;