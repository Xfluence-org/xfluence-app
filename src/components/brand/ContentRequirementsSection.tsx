
// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Edit, FileText, Video, Camera } from 'lucide-react';

interface ContentRequirement {
  id?: string;
  type: 'Posts' | 'Stories' | 'Reels';
  count: number;
  description: string;
  deadline?: string;
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

  // Load existing requirements or parse from LLM
  React.useEffect(() => {
    const loadRequirements = async () => {
      // First, try to load existing requirements from the campaign
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('requirements')
        .eq('id', campaignId)
        .single();

      if (campaign?.requirements?.content_requirements) {
        setRequirements(campaign.requirements.content_requirements);
        return;
      }

      // If no saved requirements, parse from LLM interactions
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
      
      // Default requirements if no data found
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

    loadRequirements();
  }, [campaignId, llmInteractions]);

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
      // Save requirements to campaign metadata
      const requirementsData = {
        content_requirements: requirements,
        updated_at: new Date().toISOString()
      };

      // Update campaign with requirements
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ 
          requirements: requirementsData 
        })
        .eq('id', campaignId);

      if (updateError) {
        throw updateError;
      }

      // Also create tasks for participants who are waiting for requirements
      const { data: participants } = await supabase
        .from('campaign_participants')
        .select('id, influencer_id')
        .eq('campaign_id', campaignId)
        .eq('status', 'accepted')
        .eq('current_stage', 'waiting_for_requirements');

      if (participants && participants.length > 0) {
        // Delete existing tasks for this campaign
        await supabase
          .from('campaign_tasks')
          .delete()
          .eq('campaign_id', campaignId);

        // Create new tasks for each participant
        const tasks = [];
        for (const participant of participants) {
          if (participant.influencer_id) {
            for (const requirement of requirements) {
              tasks.push({
                campaign_id: campaignId,
                influencer_id: participant.influencer_id,
                title: `Create ${requirement.count} ${requirement.type}`,
                description: requirement.description,
                task_type: requirement.type.toLowerCase(),
                deliverable_count: requirement.count,
                status: 'content_requirement',
                progress: 0
              });
            }
          }
        }

        if (tasks.length > 0) {
          const { error: taskError } = await supabase
            .from('campaign_tasks')
            .insert(tasks);
          
          if (taskError) {
            throw taskError;
          }

          // Update participants to content_requirement stage
          const participantIds = participants.map(p => p.id);
          await supabase
            .from('campaign_participants')
            .update({ current_stage: 'content_requirement' })
            .in('id', participantIds);
        }
      }

      toast({
        title: "Success",
        description: "Content requirements saved successfully!",
      });

      setIsEditing(false);
      onRequirementsUpdated?.();
    } catch (error) {
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

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default ContentRequirementsSection;
