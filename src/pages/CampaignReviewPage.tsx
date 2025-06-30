
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BrandSidebar from '@/components/brand/BrandSidebar';
import ComprehensiveStrategyDisplay from '@/components/brand/ComprehensiveStrategyDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, Eye, Target, Users, Hash, Globe, Loader2, TrendingUp, PieChart, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const CampaignReviewPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaignData, setCampaignData] = useState<any>(null);
  const [campaignResults, setCampaignResults] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTiles, setExpandedTiles] = useState<{[key: string]: boolean}>({
    influencer: true,
    content: true,
    search: true,
    additional: true
  });

  useEffect(() => {
    // Load campaign data from localStorage
    const tempCampaign = localStorage.getItem('temp_campaign');
    const tempResults = localStorage.getItem('temp_campaign_results');
    
    if (tempCampaign) {
      setCampaignData(JSON.parse(tempCampaign));
    }
    
    if (tempResults) {
      const results = JSON.parse(tempResults);
      console.log('=== Campaign Results Analysis ===');
      console.log('Raw results:', results);
      console.log('Type of results:', typeof results);
      
      if (results && typeof results === 'object') {
        console.log('All keys in results:', Object.keys(results));
        console.log('Has success key?', 'success' in results);
        console.log('Success value:', results.success);
        
        // Check for common nested data patterns
        if (results.data) console.log('results.data:', results.data);
        if (results.result) console.log('results.result:', results.result);
        if (results.response) console.log('results.response:', results.response);
        
        // Check for strategy fields
        console.log('Direct content_strategy:', results.content_strategy);
        console.log('Direct influencer_allocation:', results.influencer_allocation);
        console.log('Direct actionable_search_tactics:', results.actionable_search_tactics);
      }
      console.log('=== End Analysis ===');
      
      setCampaignResults(results);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1DDCD3]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.user_type === 'Influencer') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSaveCampaign = async () => {
    if (!campaignData) {
      toast({
        title: "Error",
        description: "No campaign data to save",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Calculate budget in cents (multiply by 100)
      const budgetInCents = Math.round((campaignData.budget_max || 0) * 100);
      
      // Insert campaign into database (removed llm_campaign column)
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          title: `${campaignData.brand_name} Campaign`,
          description: campaignData.campaign_description,
          brand_id: campaignData.brand_id,
          category: campaignData.categories || ['General'],
          budget: budgetInCents,
          amount: budgetInCents,
          due_date: campaignData.due_date,
          status: 'published',
          is_public: false, // Set is_public to false by default
          compensation_min: Math.round((campaignData.budget_min || 0) * 100),
          compensation_max: budgetInCents,
          application_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          requirements: {
            goals: campaignData.goals,
            total_influencers: campaignData.total_influencers,
            influencer_tiers: campaignData.influencer_tiers || [],
            content_types: campaignData.content_types || []
          }
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Error saving campaign:', campaignError);
        throw campaignError;
      }

      // Store LLM interaction data separately
      if (campaignResults && campaign) {
        const { error: llmError } = await supabase
          .from('llm_interactions')
          .insert({
            campaign_id: campaign.id,
            user_id: user.id,
            call_type: 'campaign_planner',
            input_messages: [{
              role: 'user',
              content: JSON.stringify({
                goals: campaignData.goals,
                campaign_description: campaignData.campaign_description,
                categories: campaignData.categories,
                total_influencers: campaignData.total_influencers
              })
            }],
            raw_output: campaignResults
          });

        if (llmError) {
          console.error('Error saving LLM interaction:', llmError);
          // Don't throw here, as the campaign was saved successfully
        }
      }

      // Clear temporary data
      localStorage.removeItem('temp_campaign');
      localStorage.removeItem('temp_campaign_results');
      
      toast({
        title: "Success",
        description: "Campaign saved successfully!",
      });
      
      // Navigate to campaigns page with the published tab active and open the campaign details
      // We'll use URL parameters to trigger the campaign detail modal
      navigate(`/brand/campaigns?tab=published&view=${campaign.id}`);
      
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error",
        description: `Failed to save campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate('/brand/campaigns');
  };

  // Helper function to create mock LLM interactions for the strategy sections
  const createMockLLMInteractions = () => {
    if (!campaignResults) return [];
    
    console.log('Creating mock LLM interactions with results:', campaignResults);
    
    // Try to parse if it's a string
    let results = campaignResults;
    if (typeof campaignResults === 'string') {
      try {
        results = JSON.parse(campaignResults);
      } catch (e) {
        console.error('Failed to parse campaign results:', e);
      }
    }
    
    return [{
      raw_output: results
    }];
  };

  const toggleTileExpansion = (tileId: string) => {
    setExpandedTiles(prev => ({ ...prev, [tileId]: !prev[tileId] }));
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'nano': return '1K - 10K';
      case 'micro': return '10K - 50K';
      case 'mid': return '50K - 500K';
      case 'macro': return '500K - 1M';
      case 'mega': return '1M+';
      default: return '';
    }
  };

  const renderStrategyOverview = () => {
    if (!campaignResults) return null;

    console.log('Campaign Results for overview:', campaignResults);

    // Helper function to find hashtags in nested objects
    const findHashtags = (obj: any, path: string = ''): string[] => {
      if (!obj || typeof obj !== 'object') return [];
      
      let hashtags: string[] = [];
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if this key contains hashtag-related terms
        if (key.toLowerCase().includes('hashtag') || key.toLowerCase().includes('hash_tag')) {
          console.log(`Found hashtag field at ${currentPath}:`, value);
          if (Array.isArray(value)) {
            hashtags = hashtags.concat(value);
          }
        } else if (key === 'hashtags' || key === 'tags') {
          console.log(`Found tags field at ${currentPath}:`, value);
          if (Array.isArray(value)) {
            hashtags = hashtags.concat(value);
          }
        } else if (typeof value === 'object' && value !== null) {
          // Recursively search nested objects
          hashtags = hashtags.concat(findHashtags(value, currentPath));
        }
      }
      
      return hashtags;
    };

    // Extract data with multiple fallback paths
    const totalInfluencers = campaignResults.influencer_allocation?.total_influencers || 
                            campaignResults.total_influencers || 
                            campaignData?.total_influencers || 0;
    
    const categoriesCount = Object.keys(
      campaignResults.influencer_allocation?.allocation_by_category || 
      campaignResults.allocation_by_category || 
      {}
    ).length || campaignData?.categories?.length || 0;
    
    // Try multiple paths for hashtags
    let hashtagsCount = 0;
    
    // Direct paths
    if (campaignResults.actionable_search_tactics?.niche_hashtags?.length) {
      hashtagsCount = campaignResults.actionable_search_tactics.niche_hashtags.length;
      console.log('Found hashtags in actionable_search_tactics.niche_hashtags:', hashtagsCount);
    } else if (campaignResults.niche_hashtags?.length) {
      hashtagsCount = campaignResults.niche_hashtags.length;
      console.log('Found hashtags in niche_hashtags:', hashtagsCount);
    } else if (campaignResults.search_strategy?.hashtags?.length) {
      hashtagsCount = campaignResults.search_strategy.hashtags.length;
      console.log('Found hashtags in search_strategy.hashtags:', hashtagsCount);
    } else if (campaignResults.hashtags?.length) {
      hashtagsCount = campaignResults.hashtags.length;
      console.log('Found hashtags in hashtags:', hashtagsCount);
    } else {
      // Deep search for hashtags
      const foundHashtags = findHashtags(campaignResults);
      hashtagsCount = foundHashtags.length;
      if (hashtagsCount > 0) {
        console.log('Found hashtags through deep search:', foundHashtags);
      } else {
        console.log('No hashtags found in any location');
      }
    }
    
    // Helper function to find platform tools in nested objects
    const findPlatformTools = (obj: any, path: string = ''): string[] => {
      if (!obj || typeof obj !== 'object') return [];
      
      let tools: string[] = [];
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if this key contains tool-related terms
        if (key.toLowerCase().includes('platform_tool') || 
            key.toLowerCase().includes('platform-tool') ||
            key.toLowerCase().includes('tools') ||
            key === 'tool') {
          console.log(`Found tools field at ${currentPath}:`, value);
          if (Array.isArray(value)) {
            tools = tools.concat(value);
          }
        } else if (typeof value === 'object' && value !== null) {
          // Recursively search nested objects
          tools = tools.concat(findPlatformTools(value, currentPath));
        }
      }
      
      return tools;
    };
    
    // Try multiple paths for tools
    let toolsCount = 0;
    
    // Direct paths
    if (campaignResults.actionable_search_tactics?.platform_tools?.length) {
      toolsCount = campaignResults.actionable_search_tactics.platform_tools.length;
      console.log('Found tools in actionable_search_tactics.platform_tools:', toolsCount);
    } else if (campaignResults.platform_tools?.length) {
      toolsCount = campaignResults.platform_tools.length;
      console.log('Found tools in platform_tools:', toolsCount);
    } else if (campaignResults.search_strategy?.tools?.length) {
      toolsCount = campaignResults.search_strategy.tools.length;
      console.log('Found tools in search_strategy.tools:', toolsCount);
    } else if (campaignResults.tools?.length) {
      toolsCount = campaignResults.tools.length;
      console.log('Found tools in tools:', toolsCount);
    } else {
      // Deep search for tools
      const foundTools = findPlatformTools(campaignResults);
      toolsCount = foundTools.length;
      if (toolsCount > 0) {
        console.log('Found tools through deep search:', foundTools);
      } else {
        console.log('No tools found in any location');
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-shadow duration-200 border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {totalInfluencers}
            </div>
            <div className="text-sm text-gray-600">Total Influencers</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {categoriesCount}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4 text-center">
            <Hash className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {hashtagsCount}
            </div>
            <div className="text-sm text-gray-600">Niche Hashtags</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-0 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {toolsCount}
            </div>
            <div className="text-sm text-gray-600">Platform Tools</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInfluencerAllocationTile = () => {
    if (!campaignResults) return null;

    const allocation = campaignResults.influencer_allocation || {};
    const isExpanded = expandedTiles['influencer'];

    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <CardHeader className="cursor-pointer" onClick={() => toggleTileExpansion('influencer')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xl">Influencer Allocation</span>
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {allocation.total_influencers || campaignData?.total_influencers || 0}
                </div>
                <div className="text-sm text-gray-600">Total Influencers</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(allocation.allocation_by_category || {}).length || 0}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>

            {isExpanded && allocation.allocation_by_category && (
              <div className="space-y-4 mt-6">
                <h4 className="font-semibold text-gray-800">Distribution by Category</h4>
                {Object.entries(allocation.allocation_by_category).map(([category, count]) => (
                  <div key={category} className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{category}</span>
                      <span className="text-lg font-bold text-blue-600">{count as number}</span>
                    </div>
                    {allocation.allocation_by_tier?.[category] && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                        {Object.entries(allocation.allocation_by_tier[category]).map(([tier, tierCount]) => (
                          <div key={tier} className="bg-gray-50 p-2 rounded text-center">
                            <div className="text-xs text-gray-600">{tier}</div>
                            <div className="font-bold text-gray-800">{tierCount as number}</div>
                            <div className="text-xs text-gray-500">{getTierDescription(tier)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContentStrategyTile = () => {
    if (!campaignResults) return null;

    // Check multiple possible locations for content strategy
    const contentStrategy = campaignResults.content_strategy || 
                           campaignResults.plan?.content_strategy ||
                           (campaignResults.content_distribution || campaignResults.platform_specific_strategies ? {
                             content_distribution: campaignResults.content_distribution,
                             platform_specific_strategies: campaignResults.platform_specific_strategies
                           } : null);
    
    if (!contentStrategy) {
      console.log('No content strategy found in:', campaignResults);
      return null;
    }

    const isExpanded = expandedTiles['content'];

    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <CardHeader className="cursor-pointer" onClick={() => toggleTileExpansion('content')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xl">Content Strategy</span>
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentStrategy.content_distribution && (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(contentStrategy.content_distribution).map(([type, data]: [string, any]) => {
                  if (type === 'rationale') return null;
                  return (
                    <div key={type} className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {data.percentage}%
                      </div>
                      <div className="text-sm font-medium text-gray-700 capitalize">{type}s</div>
                    </div>
                  );
                })}
              </div>
            )}

            {isExpanded && (
              <div className="space-y-4 mt-6">
                {contentStrategy.content_distribution?.rationale && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Distribution Rationale</h4>
                    <p className="text-purple-700 text-sm">{contentStrategy.content_distribution.rationale}</p>
                  </div>
                )}

                {contentStrategy.platform_specific_strategies && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Platform-Specific Strategies</h4>
                    {Object.entries(contentStrategy.platform_specific_strategies).map(([platform, strategy]: [string, any]) => (
                      <div key={platform} className="bg-white p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 capitalize mb-2">{platform}s</h5>
                        <p className="text-sm text-gray-600 mb-3">{strategy.creative_approach}</p>
                        <div className="space-y-1">
                          {strategy.best_practices?.map((practice: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-purple-600 mt-1">•</span>
                              <span className="text-sm text-gray-600">{practice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSearchStrategyTile = () => {
    if (!campaignResults) return null;

    // Check multiple possible locations for search strategy data
    const hasSearchData = campaignResults.actionable_search_tactics || 
                         campaignResults.search_strategy_summary || 
                         campaignResults.justification ||
                         campaignResults.search_strategy ||
                         campaignResults.niche_hashtags ||
                         campaignResults.platform_tools;
    
    if (!hasSearchData) return null;

    const isExpanded = expandedTiles['search'];
    const hashtags = campaignResults.actionable_search_tactics?.niche_hashtags || 
                    campaignResults.niche_hashtags || 
                    campaignResults.search_strategy?.hashtags || [];
    const tools = campaignResults.actionable_search_tactics?.platform_tools || 
                 campaignResults.platform_tools || 
                 campaignResults.search_strategy?.tools || [];

    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <CardHeader className="cursor-pointer" onClick={() => toggleTileExpansion('search')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xl">Search Strategy & Tactics</span>
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <Hash className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {hashtags.length}
                </div>
                <div className="text-sm text-gray-600">Hashtags</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {tools.length}
                </div>
                <div className="text-sm text-gray-600">Tools</div>
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-4 mt-6">
                {(campaignResults.search_strategy_summary || campaignResults.search_strategy?.summary) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Strategy Summary</h4>
                    <p className="text-blue-700 text-sm">
                      {campaignResults.search_strategy_summary || campaignResults.search_strategy?.summary}
                    </p>
                  </div>
                )}

                {hashtags.length > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Recommended Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((hashtag: string, index: number) => (
                        <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tools.length > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Platform Tools</h4>
                    <div className="space-y-2">
                      {tools.map((tool: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-orange-50 rounded">
                          <Globe className="h-5 w-5 text-orange-600" />
                          <span className="text-sm text-gray-700">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(campaignResults.justification || campaignResults.search_strategy?.justification) && (
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-2">Strategy Justification</h4>
                    <p className="text-emerald-700 text-sm">
                      {campaignResults.justification || campaignResults.search_strategy?.justification}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAdditionalDataTile = () => {
    if (!campaignResults) return null;

    // Get all keys from campaign results that aren't already displayed
    const handledKeys = ['influencer_allocation', 'content_strategy', 'actionable_search_tactics', 
                        'search_strategy_summary', 'justification', 'search_strategy', 
                        'niche_hashtags', 'platform_tools', 'content_distribution', 
                        'platform_specific_strategies', 'allocation_by_category', 
                        'allocation_by_tier', 'total_influencers'];
    
    const additionalKeys = Object.keys(campaignResults).filter(key => 
      !handledKeys.includes(key) && campaignResults[key] !== null && campaignResults[key] !== undefined
    );

    if (additionalKeys.length === 0) return null;

    const isExpanded = expandedTiles['additional'];

    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <CardHeader className="cursor-pointer" onClick={() => toggleTileExpansion('additional')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-xl">Additional Insights</span>
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {additionalKeys.length} additional data points from AI analysis
            </div>
            
            {isExpanded && (
              <div className="space-y-4 mt-6">
                {additionalKeys.map((key) => {
                  const value = campaignResults[key];
                  const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  
                  return (
                    <div key={key} className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">{displayKey}</h4>
                      {typeof value === 'string' ? (
                        <p className="text-gray-700 text-sm">{value}</p>
                      ) : typeof value === 'number' ? (
                        <div className="text-2xl font-bold text-indigo-600">{value}</div>
                      ) : Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-2">
                          {value.map((item, idx) => (
                            <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                              {typeof item === 'object' ? JSON.stringify(item) : item}
                            </span>
                          ))}
                        </div>
                      ) : typeof value === 'object' ? (
                        <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-gray-700">{String(value)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <BrandSidebar userName={profile?.name} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#1a1f2e]">Campaign Review</h1>
                <p className="text-gray-600">Review your AI-generated campaign strategy</p>
              </div>
            </div>
            <Button 
              onClick={handleSaveCampaign} 
              disabled={isSaving}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Campaign
                </>
              )}
            </Button>
          </div>

          {campaignData ? (
            <div className="space-y-6">
              {/* Campaign Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                      <p className="text-gray-900">{campaignData.brand_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Influencers</label>
                      <p className="text-gray-900">{campaignData.total_influencers}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                      <p className="text-gray-900">${campaignData.budget_min} - ${campaignData.budget_max}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <p className="text-gray-900">{campaignData.due_date}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goals</label>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(campaignData.goals) ? (
                        campaignData.goals.map((goal: string, index: number) => (
                          <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {goal}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-900">{campaignData.goals}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{campaignData.campaign_description}</p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {campaignData.categories?.map((category: string, index: number) => (
                        <span key={index} className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Strategy Results */}
              {campaignResults && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      AI-Generated Strategy
                    </h2>
                  </div>

                  {/* Strategy Overview Cards */}
                  {renderStrategyOverview()}

                  {/* Comprehensive Strategy Display */}
                  <ComprehensiveStrategyDisplay 
                    campaignResults={campaignResults} 
                    campaignData={campaignData}
                  />
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No campaign data available for review.</p>
                <Button onClick={handleGoBack} className="mt-4">
                  Go to Campaigns
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignReviewPage;
