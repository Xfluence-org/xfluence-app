import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus, UserCheck, UserPlus } from 'lucide-react';
import InfluencerAssignmentModal from './InfluencerAssignmentModal';

interface InfluencerAssignmentSectionProps {
  campaignId: string;
  llmInteractions: any[];
}

interface ContentDistributionItem {
  percentage: number;
  purpose: string;
}

interface ContentType {
  type: string;
  percentage: number;
  purpose: string;
}

interface AssignmentRequest {
  contentType: string;
  category: string;
  tier: string;
  requiredCount: number;
}

const InfluencerAssignmentSection: React.FC<InfluencerAssignmentSectionProps> = ({ 
  campaignId, 
  llmInteractions 
}) => {
  const [activeContentType, setActiveContentType] = useState<string>('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [currentAssignmentRequest, setCurrentAssignmentRequest] = useState<AssignmentRequest | null>(null);

  // Extract campaign strategy data
  const getCampaignStrategyData = () => {
    for (const interaction of llmInteractions) {
      // Check if data is in raw_output field directly
      if (interaction.raw_output?.influencer_allocation || interaction.raw_output?.content_strategy) {
        return interaction.raw_output;
      }
      
      // Check for nested plan structure
      if (interaction.raw_output?.plan) {
        return interaction.raw_output.plan;
      }
      
      // Legacy check for nested structure
      if (interaction.raw_output && typeof interaction.raw_output === 'object') {
        const keys = Object.keys(interaction.raw_output);
        for (const key of keys) {
          const value = interaction.raw_output[key];
          if (value && typeof value === 'object' && (value.influencer_allocation || value.content_strategy)) {
            return value;
          }
        }
      }
    }
    return null;
  };

  const strategyData = getCampaignStrategyData();
  const influencerAllocation = strategyData?.influencer_allocation;
  const contentStrategy = strategyData?.content_strategy;

  // Helper function to check if a value is a content distribution item
  const isContentDistributionItem = (value: unknown): value is ContentDistributionItem => {
    return value !== null && typeof value === 'object' && value !== undefined &&
           'percentage' in value && 'purpose' in value &&
           typeof (value as any).percentage === 'number' &&
           typeof (value as any).purpose === 'string';
  };

  // Get content types from content distribution
  const getContentTypes = (): ContentType[] => {
    if (!contentStrategy?.content_distribution) return [];
    
    return Object.entries(contentStrategy.content_distribution)
      .filter(([key, value]) => key !== 'rationale' && isContentDistributionItem(value))
      .map(([contentType, data]) => {
        const contentData = data as ContentDistributionItem;
        return {
          type: contentType,
          percentage: contentData.percentage,
          purpose: contentData.purpose
        };
      });
  };

  const contentTypes = getContentTypes();
  
  // Set default active content type
  React.useEffect(() => {
    if (contentTypes.length > 0 && !activeContentType) {
      setActiveContentType(contentTypes[0].type);
    }
  }, [contentTypes, activeContentType]);

  const handleAssignInfluencers = (contentType: string, category: string, tier: string, requiredCount: number) => {
    setCurrentAssignmentRequest({
      contentType,
      category,
      tier,
      requiredCount
    });
    setShowAssignmentModal(true);
  };

  const handleAssignmentComplete = (assignments: any[]) => {
    console.log('Assignment completed:', assignments);
    // TODO: Implement actual assignment logic
    setShowAssignmentModal(false);
    setCurrentAssignmentRequest(null);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'reel': return '🎬';
      case 'story': return '📱';
      default: return '📄';
    }
  };

  const getContentTypeDisplay = (type: string) => {
    switch (type) {
      case 'post': return 'Posts';
      case 'reel': return 'Reels';
      case 'story': return 'Stories';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'nano': return '🌱';
      case 'micro': return '📈';
      case 'mid': return '🚀';
      case 'macro': return '🚀';
      case 'mega': return '⭐';
      default: return '👤';
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

  // Helper function to safely render values
  const safeRender = (value: unknown): React.ReactNode => {
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    return String(value || '');
  };

  if (!influencerAllocation && !contentStrategy) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No campaign strategy data available</p>
        <p className="text-gray-400 text-sm mt-1">
          Campaign strategy is generated during campaign creation with AI assistance
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Overview */}
      {influencerAllocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#1DDCD3]" />
              Influencer Allocation Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#1DDCD3]">
                  {safeRender(influencerAllocation.total_influencers || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Influencers</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">By Category</h5>
                <div className="space-y-1">
                  {Object.entries(influencerAllocation.allocation_by_category || {}).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-gray-600">{category}</span>
                      <Badge variant="secondary">{safeRender(count)}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Content Types</h5>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((content) => (
                    <Badge key={content.type} className="bg-[#1DDCD3] text-white">
                      {getContentTypeIcon(content.type)} {content.percentage}%
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Distribution & Assignment */}
      {contentTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution & Influencer Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeContentType} onValueChange={setActiveContentType}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${contentTypes.length}, 1fr)` }}>
                {contentTypes.map((content) => (
                  <TabsTrigger key={content.type} value={content.type}>
                    <span className="mr-1">{getContentTypeIcon(content.type)}</span>
                    {getContentTypeDisplay(content.type)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {contentTypes.map((content) => (
                <TabsContent key={content.type} value={content.type} className="mt-6">
                  <div className="space-y-4">
                    {/* Content Type Info */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-800">
                          {getContentTypeDisplay(content.type)} - {content.percentage}% of Content
                        </h4>
                      </div>
                      <p className="text-blue-700 text-sm">{content.purpose}</p>
                    </div>

                    {/* Influencer Categories for this Content Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(influencerAllocation?.allocation_by_category || {}).map(([category, totalCount]) => (
                        <div key={category} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-700">{category}</h5>
                            <Badge variant="outline">{safeRender(totalCount)} influencers</Badge>
                          </div>
                          
                          {/* Tier breakdown for this category */}
                          <div className="space-y-2">
                            {Object.entries(influencerAllocation?.allocation_by_tier?.[category] || {}).map(([tier, count]) => (
                              <div key={tier} className="flex items-center justify-between bg-white rounded p-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{getTierIcon(tier)}</span>
                                  <div>
                                    <div className="text-sm font-medium capitalize">{tier}</div>
                                    <div className="text-xs text-gray-500">{getTierDescription(tier)}</div>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-bold mb-1">{safeRender(count)}</div>
                                  <Button
                                    size="sm"
                                    className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90 text-white"
                                    onClick={() => handleAssignInfluencers(
                                      content.type,
                                      category,
                                      tier,
                                      Number(count)
                                    )}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Assign
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && currentAssignmentRequest && (
        <InfluencerAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          campaignId={campaignId}
          assignmentRequest={currentAssignmentRequest}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}
    </div>
  );
};

export default InfluencerAssignmentSection;
