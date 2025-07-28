import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus, UserCheck, UserPlus } from 'lucide-react';
import InfluencerAssignmentModal from './InfluencerAssignmentModal';
import ContentTypeWaitingSection from './ContentTypeWaitingSection';
import ContentTypeActiveSection from './ContentTypeActiveSection';
import { supabase } from '@/integrations/supabase/client';
import { useCampaignDetail } from '@/hooks/useCampaignDetail';
import { useSupabaseTypeCasts } from '@/hooks/useSupabaseTypeCasts';

interface InfluencerAssignmentSectionProps {
  campaignId: string;
  llmInteractions: any[];
  onViewTasks?: (participantId: string, influencerId: string) => void;
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

interface AssignmentCount {
  content_type: string;
  category: string;
  tier: string;
  count: number;
}

const InfluencerAssignmentSection: React.FC<InfluencerAssignmentSectionProps> = ({ 
  campaignId, 
  llmInteractions,
  onViewTasks 
}) => {
  const { castToUuid, isValidResult } = useSupabaseTypeCasts();
  const [activeContentType, setActiveContentType] = useState<string>('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [currentAssignmentRequest, setCurrentAssignmentRequest] = useState<AssignmentRequest | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [assignmentCounts, setAssignmentCounts] = useState<AssignmentCount[]>([]);
  
  // Fetch campaign data to get categories
  const { data: campaignData } = useCampaignDetail(campaignId);

  
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

  // Fetch current assignment counts
  const fetchAssignmentCounts = async () => {
    try {
      // Count all accepted participants with their assignment info
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('id, influencer_id, application_message')
        .eq('campaign_id', castToUuid(campaignId))
        .eq('status', 'accepted' as any);

      if (error) {
        console.error('Error fetching participant counts:', error);
        return;
      }

      console.log('Participants data:', data);
      
      // Parse assignment info from participants
      const tierCategoryCounts = new Map<string, number>();
      
      data?.filter(isValidResult).forEach((participant: any) => {
        const message = participant.application_message || '';
        // Look for [TIER:category:tier] pattern
        const tierMatch = message.match(/\[TIER:([^:]+):([^\]]+)\]/);
        if (tierMatch) {
          const category = tierMatch[1];
          const tier = tierMatch[2];
          const key = `${category}:${tier}`;
          tierCategoryCounts.set(key, (tierCategoryCounts.get(key) || 0) + 1);
        }
      });
      
      console.log('Tier category counts:', tierCategoryCounts);
      
      // Create counts for each content type, category, and tier combination
      const assignmentCountsArray: AssignmentCount[] = [];
      
      // For each content type
      contentTypes.forEach(ct => {
        // For each category
        Object.entries(influencerAllocation?.allocation_by_category || {}).forEach(([category]) => {
          // For each tier in this category
          const tierAllocations = influencerAllocation?.allocation_by_tier?.[category] || {};
          const tierEntries = Object.entries(tierAllocations);
          
          if (tierEntries.length === 0) {
            // If no tiers, check for category-level assignment
            const key = `${category}:all`;
            const count = tierCategoryCounts.get(key) || 0;
            assignmentCountsArray.push({
              content_type: ct.type,
              category: category,
              tier: 'all',
              count: count
            });
          } else {
            // Get count for each specific tier
            tierEntries.forEach(([tier]) => {
              const key = `${category}:${tier}`;
              const count = tierCategoryCounts.get(key) || 0;
              assignmentCountsArray.push({
                content_type: ct.type,
                category: category,
                tier: tier,
                count: count
              });
            });
          }
        });
      });

      console.log('Assignment counts array:', assignmentCountsArray);
      setAssignmentCounts(assignmentCountsArray);
    } catch (error) {
      console.error('Error fetching assignment counts:', error);
    }
  };

  // Get assigned count for a specific combination
  const getAssignedCount = (contentType: string, category: string, tier: string): number => {
    const assignment = assignmentCounts.find(a => 
      a.content_type === contentType && 
      a.category === category && 
      a.tier === tier
    );
    return assignment ? assignment.count : 0;
  };

  // Get remaining count needed
  const getRemainingCount = (contentType: string, category: string, tier: string, required: number): number => {
    const assigned = getAssignedCount(contentType, category, tier);
    return Math.max(0, required - assigned);
  };
  
  // Set default active content type
  React.useEffect(() => {
    if (contentTypes.length > 0 && !activeContentType) {
      setActiveContentType(contentTypes[0].type);
    }
  }, [contentTypes, activeContentType]);

  // Fetch assignment counts on component mount and when refresh key changes
  useEffect(() => {
    fetchAssignmentCounts();
  }, [campaignId, refreshKey]);

  const handleAssignInfluencers = (contentType: string, category: string, tier: string, requiredCount: number) => {
    const remainingCount = getRemainingCount(contentType, category, tier, requiredCount);
    if (remainingCount <= 0) {
      // All required influencers are already assigned
      return;
    }

    setCurrentAssignmentRequest({
      contentType,
      category,
      tier,
      requiredCount: remainingCount // Only assign the remaining count
    });
    setShowAssignmentModal(true);
  };

  const handleAssignmentComplete = (assignments: any[]) => {
    console.log('Assignment completed:', assignments);
    setShowAssignmentModal(false);
    setCurrentAssignmentRequest(null);
    // Trigger refresh of the assigned influencers display and counts
    setRefreshKey(prev => prev + 1);
    // Also manually refetch the counts immediately
    fetchAssignmentCounts();
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

        {/* Manual Influencer Assignment Only */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Influencer Assignment</CardTitle>
            <p className="text-sm text-gray-600 mt-2">Add influencers manually by providing their Instagram handle and email address.</p>
          </CardHeader>
          <CardContent>
            {/* Simple Manual Assignment Section */}
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={() => {
                    setCurrentAssignmentRequest({
                      contentType: 'Manual Assignment',
                      category: 'General',
                      tier: 'all',
                      requiredCount: 1
                    });
                    setShowAssignmentModal(true);
                  }}
                  className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Influencer
                </Button>
              </div>
              
              {/* Show minimal waiting participants */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <UserPlus className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium text-sm">No participants assigned yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  Use the "Add Influencer" button above to assign influencers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Assignment Modal */}
      {showAssignmentModal && currentAssignmentRequest && (
        <InfluencerAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          campaignId={campaignId}
          assignmentRequest={currentAssignmentRequest}
          onAssignmentComplete={handleAssignmentComplete}
          campaignCategories={Array.isArray(campaignData?.category) ? campaignData.category : [campaignData?.category || 'General']}
        />
      )}
    </div>
  );
};

export default InfluencerAssignmentSection;
