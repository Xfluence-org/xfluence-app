
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sprout, TrendingUp, Rocket, Star, User } from 'lucide-react';

interface InfluencerAllocationData {
  total_influencers?: number;
  allocation_by_tier?: {
    [category: string]: {
      nano?: number;
      micro?: number;
      macro?: number;
      mega?: number;
      mid?: number;
    };
  };
  allocation_by_category?: {
    [category: string]: number;
  };
}

interface InfluencerAllocationSectionProps {
  llmInteractions: any[];
}

const InfluencerAllocationSection: React.FC<InfluencerAllocationSectionProps> = ({ llmInteractions }) => {
  const [activeCategory, setActiveCategory] = useState<string>('');

  // Extract influencer allocation from LLM interactions or raw_output
  const getInfluencerAllocationData = (): InfluencerAllocationData | null => {
    console.log('InfluencerAllocationSection - llmInteractions:', llmInteractions);
    
    for (const interaction of llmInteractions) {
      console.log('Processing interaction:', interaction);
      
      // Check if data is in raw_output field directly
      if (interaction.raw_output?.influencer_allocation) {
        console.log('Found influencer_allocation in raw_output:', interaction.raw_output.influencer_allocation);
        return interaction.raw_output.influencer_allocation;
      }
      
      // Check for various nested structures
      const possiblePaths = [
        interaction.raw_output?.plan?.influencer_allocation,
        interaction.raw_output?.campaign_strategy?.influencer_allocation,
        interaction.raw_output?.strategy?.influencer_allocation,
        interaction.raw_output // In case the whole thing is the influencer allocation
      ];
      
      for (const path of possiblePaths) {
        if (path && typeof path === 'object') {
          // Check if this looks like influencer allocation data
          if (path.total_influencers || path.allocation_by_tier || path.allocation_by_category) {
            console.log('Found influencer allocation at path:', path);
            return path;
          }
        }
      }
      
      // Check if raw_output is a string that needs parsing
      if (typeof interaction.raw_output === 'string') {
        try {
          const parsed = JSON.parse(interaction.raw_output);
          console.log('Parsed string raw_output:', parsed);
          
          if (parsed.influencer_allocation) {
            console.log('Found influencer_allocation after parsing string:', parsed.influencer_allocation);
            return parsed.influencer_allocation;
          }
          // Check if it's nested under plan
          if (parsed.plan?.influencer_allocation) {
            console.log('Found influencer_allocation in parsed plan:', parsed.plan.influencer_allocation);
            return parsed.plan.influencer_allocation;
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
          if (value && typeof value === 'object' && value.influencer_allocation) {
            console.log('Found nested influencer_allocation:', value.influencer_allocation);
            return value.influencer_allocation;
          }
        }
        
        // Check if the raw_output itself has the expected structure
        if (interaction.raw_output.total_influencers || interaction.raw_output.allocation_by_tier || interaction.raw_output.allocation_by_category) {
          console.log('Raw output appears to be influencer allocation data:', interaction.raw_output);
          return interaction.raw_output;
        }
      }
    }
    
    console.log('No influencer allocation found in interactions');
    return null;
  };

  const influencerAllocation = getInfluencerAllocationData();

  if (!influencerAllocation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No influencer allocation data available</p>
        <p className="text-gray-400 text-sm mt-1">
          Influencer allocation is generated during campaign creation with AI assistance
        </p>
      </div>
    );
  }

  const categories = Object.keys(influencerAllocation.allocation_by_tier || {});
  
  // Set default active category if not set
  React.useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'nano': return <Sprout className="w-4 h-4 inline" />;
      case 'micro': return <TrendingUp className="w-4 h-4 inline" />;
      case 'mid': return <Rocket className="w-4 h-4 inline" />;
      case 'macro': return <Rocket className="w-4 h-4 inline" />;
      case 'mega': return <Star className="w-4 h-4 inline" />;
      default: return <User className="w-4 h-4 inline" />;
    }
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'nano': return '1K - 10K followers';
      case 'micro': return '10K - 100K followers';
      case 'mid': return '50K - 500K followers';
      case 'macro': return '100K - 1M followers';
      case 'mega': return '1M+ followers';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-[#1a1f2e] mb-4">Campaign Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#1DDCD3]">
              {influencerAllocation.total_influencers || 0}
            </div>
            <div className="text-sm text-gray-600">Total Influencers</div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-700 mb-2">By Category</h5>
            <div className="space-y-1">
              {Object.entries(influencerAllocation.allocation_by_category || {}).map(([category, count]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-700 mb-2">Categories</h5>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-[#1DDCD3] text-white rounded text-xs"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-[#1a1f2e] mb-4">Influencer Breakdown by Category</h4>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-3">
                      {category} - Tier Distribution
                    </h5>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(influencerAllocation.allocation_by_tier?.[category] || {}).map(([tier, count]) => (
                        <div key={tier} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl mb-1">{getTierIcon(tier)}</div>
                          <div className="font-bold text-lg text-[#1a1f2e]">{count}</div>
                          <div className="text-sm font-medium text-gray-700 capitalize">{tier}</div>
                          <div className="text-xs text-gray-500">{getTierDescription(tier)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h6 className="font-medium text-blue-800 mb-1">{category} Strategy</h6>
                    <p className="text-blue-700 text-sm">
                      This category targets {influencerAllocation.allocation_by_category?.[category]} influencers 
                      across different tiers to maximize reach and engagement within the {category.toLowerCase()} niche.
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default InfluencerAllocationSection;
