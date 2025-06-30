import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Users, PieChart, TrendingUp, Sparkles, Hash, Globe, Target, BarChart3 } from 'lucide-react';

interface ComprehensiveStrategyDisplayProps {
  campaignResults: any;
  campaignData?: any;
}

const ComprehensiveStrategyDisplay: React.FC<ComprehensiveStrategyDisplayProps> = ({ 
  campaignResults, 
  campaignData 
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    influencer: true,
    content: true,
    search: true,
    additional: true
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
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

  if (!campaignResults) return null;

  // Parse results if string
  let results = campaignResults;
  if (typeof campaignResults === 'string') {
    try {
      results = JSON.parse(campaignResults);
    } catch (e) {
      console.error('Failed to parse campaign results:', e);
    }
  }

  // Check if the response has a success flag with nested data
  if (results && typeof results === 'object') {
    // Common patterns for edge function responses
    if (results.success === true && results.data) {
      console.log('Found nested data in success response:', results.data);
      results = results.data;
    } else if (results.success === true && results.result) {
      console.log('Found nested result in success response:', results.result);
      results = results.result;
    } else if (results.success === true && results.response) {
      console.log('Found nested response in success response:', results.response);
      results = results.response;
    } else if (results.success === true) {
      // If success is true but no nested data, look for other keys
      const possibleDataKeys = Object.keys(results).filter(key => 
        key !== 'success' && key !== 'error' && key !== 'message'
      );
      
      if (possibleDataKeys.length === 1) {
        // If there's only one other key besides success, use that
        console.log('Using single data key:', possibleDataKeys[0]);
        results = results[possibleDataKeys[0]];
      } else if (possibleDataKeys.length > 1) {
        // If multiple keys, remove the success flag and use the whole object
        const { success, error, message, ...actualData } = results;
        console.log('Extracted data after removing meta fields:', actualData);
        results = actualData;
      }
    }
  }

  console.log('Final processed results:', results);

  // Extract all possible data from various structures
  const extractData = (path: string[]) => {
    let current = results;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }
    return current;
  };

  // Try to find data in multiple locations
  const influencerAllocation = extractData(['influencer_allocation']) || 
                              extractData(['plan', 'influencer_allocation']) ||
                              results.influencer_allocation ||
                              null;

  const contentStrategy = extractData(['content_strategy']) || 
                         extractData(['plan', 'content_strategy']) ||
                         results.content_strategy ||
                         null;

  const searchTactics = extractData(['actionable_search_tactics']) || 
                       extractData(['search_strategy']) ||
                       results.actionable_search_tactics ||
                       results.search_strategy ||
                       null;

  const searchSummary = results.search_strategy_summary || 
                       extractData(['search_strategy', 'summary']) ||
                       null;

  const justification = results.justification || 
                       extractData(['search_strategy', 'justification']) ||
                       null;

  // Render sections
  const renderInfluencerSection = () => {
    if (!influencerAllocation && !results.total_influencers && !campaignData?.total_influencers) return null;

    const totalInfluencers = influencerAllocation?.total_influencers || 
                            results.total_influencers || 
                            campaignData?.total_influencers || 0;

    const isExpanded = expandedSections['influencer'];

    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('influencer')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xl">Influencer Allocation Strategy</span>
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{totalInfluencers}</div>
                <div className="text-sm text-gray-600">Total Influencers</div>
              </div>
              {influencerAllocation?.allocation_by_category && (
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {Object.keys(influencerAllocation.allocation_by_category).length}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              )}
            </div>

            {isExpanded && influencerAllocation && (
              <div className="space-y-4 mt-6">
                {influencerAllocation.allocation_by_category && (
                  <>
                    <h4 className="font-semibold text-gray-800">Category Distribution</h4>
                    {Object.entries(influencerAllocation.allocation_by_category).map(([category, count]) => (
                      <div key={category} className="bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">{category}</span>
                          <span className="text-lg font-bold text-blue-600">{count as number}</span>
                        </div>
                        {influencerAllocation.allocation_by_tier?.[category] && (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                            {Object.entries(influencerAllocation.allocation_by_tier[category]).map(([tier, tierCount]) => (
                              <div key={tier} className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-xs text-gray-600 capitalize">{tier}</div>
                                <div className="font-bold text-gray-800">{tierCount as number}</div>
                                <div className="text-xs text-gray-500">{getTierDescription(tier)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContentSection = () => {
    if (!contentStrategy && !results.content_distribution && !results.platform_specific_strategies) return null;

    const distribution = contentStrategy?.content_distribution || results.content_distribution;
    const strategies = contentStrategy?.platform_specific_strategies || results.platform_specific_strategies;
    const isExpanded = expandedSections['content'];

    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('content')}>
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
            {distribution && (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(distribution).map(([type, data]: [string, any]) => {
                  if (type === 'rationale' || !data.percentage) return null;
                  return (
                    <div key={type} className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{data.percentage}%</div>
                      <div className="text-sm font-medium text-gray-700 capitalize">{type}s</div>
                    </div>
                  );
                })}
              </div>
            )}

            {isExpanded && (
              <div className="space-y-4 mt-6">
                {distribution?.rationale && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Distribution Rationale</h4>
                    <p className="text-purple-700 text-sm">{distribution.rationale}</p>
                  </div>
                )}

                {strategies && (
                  <>
                    <h4 className="font-semibold text-gray-800">Platform-Specific Strategies</h4>
                    {Object.entries(strategies).map(([platform, strategy]: [string, any]) => (
                      <div key={platform} className="bg-white p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 capitalize mb-2">{platform}s</h5>
                        <p className="text-sm text-gray-600 mb-3">{strategy.creative_approach}</p>
                        {strategy.best_practices && (
                          <div className="space-y-1">
                            {strategy.best_practices.map((practice: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-purple-600 mt-1">•</span>
                                <span className="text-sm text-gray-600">{practice}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSearchSection = () => {
    // Helper function to find hashtags in nested objects
    const findHashtagsInObject = (obj: any): string[] => {
      if (!obj || typeof obj !== 'object') return [];
      
      let foundHashtags: string[] = [];
      
      for (const [key, value] of Object.entries(obj)) {
        if (key.toLowerCase().includes('hashtag') || key.toLowerCase().includes('hash_tag') || 
            key === 'hashtags' || key === 'tags') {
          if (Array.isArray(value)) {
            foundHashtags = foundHashtags.concat(value);
          }
        } else if (typeof value === 'object' && value !== null) {
          foundHashtags = foundHashtags.concat(findHashtagsInObject(value));
        }
      }
      
      return foundHashtags;
    };

    // Try multiple locations for hashtags
    let hashtags: string[] = [];
    
    if (searchTactics?.niche_hashtags && Array.isArray(searchTactics.niche_hashtags)) {
      hashtags = searchTactics.niche_hashtags;
      console.log('Found hashtags in searchTactics.niche_hashtags:', hashtags);
    } else if (results.niche_hashtags && Array.isArray(results.niche_hashtags)) {
      hashtags = results.niche_hashtags;
      console.log('Found hashtags in results.niche_hashtags:', hashtags);
    } else if (results.hashtags && Array.isArray(results.hashtags)) {
      hashtags = results.hashtags;
      console.log('Found hashtags in results.hashtags:', hashtags);
    } else {
      // Deep search for hashtags
      hashtags = findHashtagsInObject(results);
      if (hashtags.length > 0) {
        console.log('Found hashtags through deep search:', hashtags);
      }
    }
    
    // Helper function to find platform tools in nested objects
    const findPlatformToolsInObject = (obj: any): string[] => {
      if (!obj || typeof obj !== 'object') return [];
      
      let foundTools: string[] = [];
      
      for (const [key, value] of Object.entries(obj)) {
        if (key.toLowerCase().includes('platform_tool') || 
            key.toLowerCase().includes('platform-tool') ||
            key.toLowerCase().includes('tools') ||
            key === 'tool') {
          if (Array.isArray(value)) {
            foundTools = foundTools.concat(value);
          }
        } else if (typeof value === 'object' && value !== null) {
          foundTools = foundTools.concat(findPlatformToolsInObject(value));
        }
      }
      
      return foundTools;
    };
    
    // Try multiple locations for platform tools
    let tools: string[] = [];
    
    if (searchTactics?.platform_tools && Array.isArray(searchTactics.platform_tools)) {
      tools = searchTactics.platform_tools;
      console.log('Found tools in searchTactics.platform_tools:', tools);
    } else if (results.platform_tools && Array.isArray(results.platform_tools)) {
      tools = results.platform_tools;
      console.log('Found tools in results.platform_tools:', tools);
    } else if (results.tools && Array.isArray(results.tools)) {
      tools = results.tools;
      console.log('Found tools in results.tools:', tools);
    } else {
      // Deep search for tools
      tools = findPlatformToolsInObject(results);
      if (tools.length > 0) {
        console.log('Found tools through deep search:', tools);
      }
    }
    
    if (!searchTactics && !searchSummary && !justification && hashtags.length === 0 && tools.length === 0) return null;

    const isExpanded = expandedSections['search'];

    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('search')}>
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
                <div className="text-2xl font-bold text-green-600">{hashtags.length}</div>
                <div className="text-sm text-gray-600">Hashtags</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{tools.length}</div>
                <div className="text-sm text-gray-600">Tools</div>
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-4 mt-6">
                {searchSummary && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Strategy Summary</h4>
                    <p className="text-blue-700 text-sm">{searchSummary}</p>
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

                {justification && (
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-2">Strategy Justification</h4>
                    <p className="text-emerald-700 text-sm">{justification}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get all other fields not handled above
  const getUnhandledFields = () => {
    const handledKeys = [
      'influencer_allocation', 'content_strategy', 'actionable_search_tactics',
      'search_strategy_summary', 'justification', 'search_strategy',
      'niche_hashtags', 'platform_tools', 'content_distribution',
      'platform_specific_strategies', 'allocation_by_category',
      'allocation_by_tier', 'total_influencers', 'plan',
      // Meta fields to exclude
      'success', 'error', 'message', 'status', 'statusCode'
    ];

    const unhandled: {[key: string]: any} = {};
    Object.keys(results).forEach(key => {
      if (!handledKeys.includes(key) && results[key] !== null && results[key] !== undefined) {
        unhandled[key] = results[key];
      }
    });

    return unhandled;
  };

  const renderAdditionalData = () => {
    const unhandled = getUnhandledFields();
    const keys = Object.keys(unhandled);
    
    if (keys.length === 0) return null;

    const isExpanded = expandedSections['additional'];

    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('additional')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-xl">Additional AI Insights</span>
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {keys.length} additional insights from AI analysis
            </div>

            {isExpanded && (
              <div className="space-y-4 mt-6">
                {keys.map(key => {
                  const value = unhandled[key];
                  const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                  return (
                    <div key={key} className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">{displayKey}</h4>
                      {renderValue(value)}
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

  const renderValue = (value: any): React.ReactNode => {
    if (typeof value === 'string') {
      return <p className="text-gray-700 text-sm">{value}</p>;
    } else if (typeof value === 'number') {
      return <div className="text-2xl font-bold text-indigo-600">{value}</div>;
    } else if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              {typeof item === 'object' ? JSON.stringify(item) : item}
            </span>
          ))}
        </div>
      );
    } else if (typeof value === 'object') {
      return (
        <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    } else {
      return <p className="text-gray-700">{String(value)}</p>;
    }
  };

  return (
    <div className="space-y-6">
      {renderInfluencerSection()}
      {renderContentSection()}
      {renderSearchSection()}
      {renderAdditionalData()}

      {/* Debug section for development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Debug: View Raw AI Response Structure
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ComprehensiveStrategyDisplay;