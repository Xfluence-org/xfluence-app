
import React from 'react';

interface ContentStrategyData {
  content_distribution?: {
    post?: { purpose: string; percentage: number };
    reel?: { purpose: string; percentage: number };
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
  };
}

interface ContentStrategySectionProps {
  llmInteractions: any[];
}

const ContentStrategySection: React.FC<ContentStrategySectionProps> = ({ llmInteractions }) => {
  // Extract content strategy from LLM interactions
  const getContentStrategyData = (): ContentStrategyData | null => {
    console.log('Processing LLM interactions for content strategy:', llmInteractions);
    
    for (const interaction of llmInteractions) {
      // Check direct content_strategy property
      if (interaction.raw_output?.content_strategy) {
        console.log('Found content strategy in raw_output:', interaction.raw_output.content_strategy);
        return interaction.raw_output.content_strategy;
      }
      
      // Check if content strategy is at root level
      if (interaction.raw_output?.content_distribution || interaction.raw_output?.platform_specific_strategies) {
        console.log('Found content strategy at root level:', interaction.raw_output);
        return {
          content_distribution: interaction.raw_output.content_distribution,
          platform_specific_strategies: interaction.raw_output.platform_specific_strategies
        };
      }
      
      // Also check if the data is nested differently
      if (typeof interaction.raw_output === 'string') {
        try {
          const parsed = JSON.parse(interaction.raw_output);
          if (parsed.content_strategy) {
            console.log('Found content strategy in parsed string:', parsed.content_strategy);
            return parsed.content_strategy;
          }
          if (parsed.content_distribution || parsed.platform_specific_strategies) {
            console.log('Found content strategy at parsed root level:', parsed);
            return {
              content_distribution: parsed.content_distribution,
              platform_specific_strategies: parsed.platform_specific_strategies
            };
          }
        } catch (e) {
          console.log('Could not parse LLM interaction:', e);
        }
      }
    }
    
    console.log('No content strategy found in LLM interactions');
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

  console.log('Rendering content strategy:', contentStrategy);

  return (
    <div className="space-y-6">
      {/* Content Distribution */}
      {contentStrategy.content_distribution && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-[#1a1f2e] mb-4">Content Distribution</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {contentStrategy.content_distribution.post && (
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-700">Posts</h5>
                  <span className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                    {contentStrategy.content_distribution.post.percentage}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {contentStrategy.content_distribution.post.purpose}
                </p>
              </div>
            )}
            
            {contentStrategy.content_distribution.reel && (
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-700">Reels</h5>
                  <span className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                    {contentStrategy.content_distribution.reel.percentage}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {contentStrategy.content_distribution.reel.purpose}
                </p>
              </div>
            )}
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
            {contentStrategy.platform_specific_strategies.post && (
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-3">Post Strategy</h5>
                <div className="space-y-3">
                  <div>
                    <h6 className="text-sm font-medium text-gray-600 mb-1">Creative Approach</h6>
                    <p className="text-sm text-gray-700">
                      {contentStrategy.platform_specific_strategies.post.creative_approach}
                    </p>
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-600 mb-1">Best Practices</h6>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {contentStrategy.platform_specific_strategies.post.best_practices.map((practice, index) => (
                        <li key={index}>{practice}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {contentStrategy.platform_specific_strategies.reel && (
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-3">Reel Strategy</h5>
                <div className="space-y-3">
                  <div>
                    <h6 className="text-sm font-medium text-gray-600 mb-1">Creative Approach</h6>
                    <p className="text-sm text-gray-700">
                      {contentStrategy.platform_specific_strategies.reel.creative_approach}
                    </p>
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-600 mb-1">Best Practices</h6>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {contentStrategy.platform_specific_strategies.reel.best_practices.map((practice, index) => (
                        <li key={index}>{practice}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback message if no strategy sections found */}
      {!contentStrategy.content_distribution && !contentStrategy.platform_specific_strategies && (
        <div className="text-center py-8">
          <p className="text-gray-500">Content strategy data is being processed</p>
          <p className="text-gray-400 text-sm mt-1">
            Please check back in a moment for detailed content recommendations
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentStrategySection;
