
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Edit, FileText, Video, Camera, Users } from 'lucide-react';

interface ContentRequirement {
  id?: string;
  type: 'Posts' | 'Stories' | 'Reels';
  count: number;
  description: string;
  deadline?: string;
}

interface InfluencerAllocationData {
  total_influencers?: number;
  allocation_by_tier?: {
    [category: string]: {
      nano?: number;
      micro?: number;
      macro?: number;
      mega?: number;
    };
  };
  allocation_by_category?: {
    [category: string]: number;
  };
}

interface ContentRequirementsSectionProps {
  campaignId: string;
  llmInteractions: any[];
  onRequirementsUpdated?: () => void;
}

const ContentRequirementsSection: React.FC<ContentRequirementsSectionProps> = ({
  campaignId,
  llmInteractions,
  onRequirementsUpdated
}) => {
  const [requirements, setRequirements] = useState<ContentRequirement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Parse content requirements from LLM interactions
  React.useEffect(() => {
    const parseContentRequirements = () => {
      for (const interaction of llmInteractions) {
        if (interaction.raw_output?.content_strategy) {
          const contentStrategy = interaction.raw_output.content_strategy;
          const distribution = contentStrategy.content_distribution;
          
          if (distribution) {
            const parsed: ContentRequirement[] = [];
            
            if (distribution.post) {
              parsed.push({
                type: 'Posts',
                count: Math.ceil((distribution.post.percentage || 50) / 10), // Convert percentage to rough count
                description: distribution.post.purpose || 'Create engaging posts showcasing the product'
              });
            }
            
            if (distribution.reel) {
              parsed.push({
                type: 'Reels',
                count: Math.ceil((distribution.reel.percentage || 50) / 10), // Convert percentage to rough count
                description: distribution.reel.purpose || 'Create dynamic reels showing product in action'
              });
            }
            
            if (parsed.length > 0) {
              setRequirements(parsed);
              return;
            }
          }
        }
      }
      
      // Default requirements if no LLM data found
      setRequirements([
        {
          type: 'Posts',
          count: 3,
          description: 'Create high-quality posts showcasing the product in lifestyle settings'
        },
        {
          type: 'Stories',
          count: 5,
          description: 'Share behind-the-scenes content and product usage in stories'
        }
      ]);
    };

    parseContentRequirements();
  }, [llmInteractions]);

  // Extract influencer allocation from LLM interactions
  const getInfluencerAllocationData = (): InfluencerAllocationData | null => {
    for (const interaction of llmInteractions) {
      if (interaction.raw_output?.influencer_allocation) {
        return interaction.raw_output.influencer_allocation;
      }
      // Also check if the data is nested differently
      if (typeof interaction.raw_output === 'string') {
        try {
          const parsed = JSON.parse(interaction.raw_output);
          if (parsed.influencer_allocation) {
            return parsed.influencer_allocation;
          }
        } catch (e) {
          console.log('Could not parse LLM interaction:', e);
        }
      }
    }
    return null;
  };

  const addRequirement = () => {
    setRequirements([...requirements, {
      type: 'Posts',
      count: 1,
      description: ''
    }]);
  };

  const updateRequirement = (index: number, field: keyof ContentRequirement, value: any) => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], [field]: value };
    setRequirements(updated);
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const saveRequirements = async () => {
    setIsSaving(true);
    try {
      // Save requirements as campaign tasks for approved influencers
      const { data: participants } = await supabase
        .from('campaign_participants')
        .select('influencer_id')
        .eq('campaign_id', campaignId)
        .eq('status', 'accepted');

      if (participants) {
        // Delete existing tasks
        await supabase
          .from('campaign_tasks')
          .delete()
          .eq('campaign_id', campaignId);

        // Create new tasks for each participant
        const tasks = [];
        for (const participant of participants) {
          for (const requirement of requirements) {
            tasks.push({
              campaign_id: campaignId,
              influencer_id: participant.influencer_id,
              title: `Create ${requirement.count} ${requirement.type}`,
              description: requirement.description,
              task_type: requirement.type,
              deliverable_count: requirement.count,
              status: 'content_requirement',
              progress: 0
            });
          }
        }

        if (tasks.length > 0) {
          await supabase.from('campaign_tasks').insert(tasks);
        }
      }

      toast({
        title: "Success",
        description: "Content requirements saved successfully!",
      });

      setIsEditing(false);
      onRequirementsUpdated?.();
    } catch (error) {
      console.error('Error saving requirements:', error);
      toast({
        title: "Error",
        description: "Failed to save content requirements.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Posts': return <FileText className="h-4 w-4" />;
      case 'Reels': return <Video className="h-4 w-4" />;
      case 'Stories': return <Camera className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'nano': return '🌱';
      case 'micro': return '📈';
      case 'macro': return '🚀';
      case 'mega': return '⭐';
      default: return '👤';
    }
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'nano': return '1K - 10K followers';
      case 'micro': return '10K - 100K followers';
      case 'macro': return '100K - 1M followers';
      case 'mega': return '1M+ followers';
      default: return '';
    }
  };

  const influencerAllocation = getInfluencerAllocationData();
  const categories = Object.keys(influencerAllocation?.allocation_by_tier || {});

  return (
    <Tabs defaultValue="content" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="content">Content Requirements</TabsTrigger>
        <TabsTrigger value="influencers">Influencer Allocation</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#1a1f2e]">Content Requirements</h3>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Requirements
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={saveRequirements} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Requirements'}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {requirements.map((requirement, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 min-w-32">
                  {getIcon(requirement.type)}
                  {isEditing ? (
                    <select
                      value={requirement.type}
                      onChange={(e) => updateRequirement(index, 'type', e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="Posts">Posts</option>
                      <option value="Stories">Stories</option>
                      <option value="Reels">Reels</option>
                    </select>
                  ) : (
                    <Badge variant="outline">{requirement.type}</Badge>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Count:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={requirement.count}
                        onChange={(e) => updateRequirement(index, 'count', parseInt(e.target.value))}
                        className="w-20 h-8"
                        min={1}
                      />
                    ) : (
                      <span className="font-semibold text-[#1DDCD3]">{requirement.count}</span>
                    )}
                  </div>

                  {isEditing ? (
                    <Textarea
                      value={requirement.description}
                      onChange={(e) => updateRequirement(index, 'description', e.target.value)}
                      placeholder="Describe the content requirements..."
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-700 text-sm">{requirement.description}</p>
                  )}
                </div>

                {isEditing && (
                  <Button
                    onClick={() => removeRequirement(index)}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <Button onClick={addRequirement} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Content Requirement
            </Button>
          )}
        </div>

        {!isEditing && requirements.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No content requirements set</p>
            <Button onClick={() => setIsEditing(true)} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Requirements
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="influencers" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#1a1f2e]">Influencer Allocation</h3>
          <Users className="h-5 w-5 text-[#1DDCD3]" />
        </div>

        {influencerAllocation ? (
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
                
                <Tabs defaultValue={categories[0]}>
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
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No influencer allocation data available</p>
            <p className="text-gray-400 text-sm mt-1">
              Influencer allocation is generated during campaign creation with AI assistance
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ContentRequirementsSection;
