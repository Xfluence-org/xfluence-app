
import React from 'react';

interface ContentStrategyData {
  content_distribution?: {
    post?: { purpose: string; percentage: number };
    reel?: { purpose: string; percentage: number };
    story?: { purpose: string; percentage: number };
    rationale?: string;
  };
  platform_specific_strategies?: {
    post?: {
      best_practices: string[];
      creative_approach: string;
    };
    reel?: {
      best_practices: string[];
      creative_approach: string;
    };
    story?: {
      best_practices: string[];
      creative_approach: string;
    };
  };
}

interface ContentStrategySectionProps {
  llmInteractions: any[];
}

const ContentStrategySection: React.FC<ContentStrategySectionProps> = ({ llmInteractions }) => {
  // Extract content strategy from LLM interactions or raw_output
  const getContentStrategyData = (): ContentStrategyData | null => {
    console.log('ContentStrategySection - llmInteractions:', llmInteractions);
    
    for (const interaction of llmInteractions) {
      console.log('Processing interaction:', interaction);
      
      // Check if data is in raw_output field directly
      if (interaction.raw_output?.content_strategy) {
        console.log('Found content_strategy in raw_output:', interaction.raw_output.content_strategy);
        return interaction.raw_output.content_strategy;
      }
      
      // Check for various nested structures
      const possiblePaths = [
        interaction.raw_output?.plan?.content_strategy,
        interaction.raw_output?.campaign_strategy?.content_strategy,
        interaction.raw_output?.strategy?.content_strategy,
        interaction.raw_output // In case the whole thing is the content strategy
      ];
      
      for (const path of possiblePaths) {
        if (path && typeof path === 'object') {
          // Check if this looks like content strategy data
          if (path.content_distribution || path.platform_specific_strategies) {
            console.log('Found content strategy at path:', path);
            return path;
          }
        }
      }
      
      // Check if raw_output is a string that needs parsing
      if (typeof interaction.raw_output === 'string') {
        try {
          const parsed = JSON.parse(interaction.raw_output);
          console.log('Parsed string raw_output:', parsed);
          
          if (parsed.content_strategy) {
            console.log('Found content_strategy after parsing string:', parsed.content_strategy);
            return parsed.content_strategy;
          }
          // Check if it's nested under plan
          if (parsed.plan?.content_strategy) {
            console.log('Found content_strategy in parsed plan:', parsed.plan.content_strategy);
            return parsed.plan.content_strategy;
          }
        } catch (e) {
          console.log('Could not parse LLM interaction raw_output string:', e);
        }
      }
      
      // Legacy check for nested structure
      if (interaction.raw_output && typeof interaction.raw_output === 'object') {
        const keys = Object.keys(interaction.raw_output);
        console.log('Raw output keys:', keys);
        
        for (const key of keys) {
          const value = interaction.raw_output[key];
          if (value && typeof value === 'object' && value.content_strategy) {
            console.log('Found nested content_strategy:', value.content_strategy);
            return value.content_strategy;
          }
        }
        
        // Check if the raw_output itself has the expected structure
        if (interaction.raw_output.content_distribution || interaction.raw_output.platform_specific_strategies) {
          console.log('Raw output appears to be content strategy data:', interaction.raw_output);
          return interaction.raw_output;
        }
      }
    }
    
    console.log('No content strategy found in interactions');
    return null;
  };

  const contentStrategy = getContentStrategyData();

  if (!contentStrategy) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No content strategy available</p>
        <p className="text-gray-400 text-sm mt-1">
          Content strategy is generated during campaign creation with AI assistance
        </p>
      </div>
    );
  }

  const getContentTypeDisplay = (type: string) => {
    switch (type) {
      case 'post': return 'Posts';
      case 'reel': return 'Reels';
      case 'story': return 'Stories';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'reel': return '🎬';
      case 'story': return '📱';
      default: return '📄';
    }
  };

  // Helper function to check if a value is a content distribution item
  const isContentDistributionItem = (value: any): value is { purpose: string; percentage: number } => {
    return value && typeof value === 'object' && 'percentage' in value && 'purpose' in value;
  };

  return (
    <div className="space-y-6">
      {/* Content Distribution */}
      {contentStrategy.content_distribution && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-[#1a1f2e] mb-4">Content Distribution</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {Object.entries(contentStrategy.content_distribution)
              .filter(([key, value]) => key !== 'rationale' && isContentDistributionItem(value))
              .map(([contentType, data]) => {
                const contentData = data as { purpose: string; percentage: number };
                return (
                  <div key={contentType} className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getContentTypeIcon(contentType)}</span>
                        <h5 className="font-medium text-gray-700">{getContentTypeDisplay(contentType)}</h5>
                      </div>
                      <span className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                        {contentData.percentage}%
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {contentData.purpose}
                    </p>
                  </div>
                );
              })}
          </div>
          
          {contentStrategy.content_distribution.rationale && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h6 className="font-medium text-blue-800 mb-1">Strategy Rationale</h6>
              <p className="text-blue-700 text-sm">{contentStrategy.content_distribution.rationale}</p>
            </div>
          )}
        </div>
      )}

      {/* Platform Specific Strategies */}
      {contentStrategy.platform_specific_strategies && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-[#1a1f2e] mb-4">Platform Specific Strategies</h4>
          
          <div className="space-y-4">
            {Object.entries(contentStrategy.platform_specific_strategies).map(([contentType, strategy]) => (
              <div key={contentType} className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getContentTypeIcon(contentType)}</span>
                  <h5 className="font-medium text-gray-700">{getContentTypeDisplay(contentType)} Strategy</h5>
                </div>
                <div className="space-y-3">
                  <div>
                    <h6 className="text-sm font-medium text-gray-600 mb-1">Creative Approach</h6>
                    <p className="text-sm text-gray-700">
                      {strategy.creative_approach}
                    </p>
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-600 mb-1">Best Practices</h6>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {strategy.best_practices.map((practice, index) => (
                        <li key={index}>{practice}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentStrategySection;
