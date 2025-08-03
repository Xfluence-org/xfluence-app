// @ts-nocheck
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Send, Loader2, Calendar } from 'lucide-react';

interface ShareContentRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  participantId: string;
  influencerName: string;
  contentType?: string;
  onRequirementsShared?: () => void;
}

const ShareContentRequirementsModal: React.FC<ShareContentRequirementsModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  participantId,
  influencerName,
  contentType,
  onRequirementsShared
}) => {
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // AI-generated content requirements using edge function
  const generateAIRequirements = async () => {
    setIsGeneratingAI(true);
    try {
      // Get the current user's token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call the edge function
      const response = await supabase.functions.invoke('generate-content-requirements', {
        body: { campaignId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate requirements');
      }

      const data = response.data;
      
      // Format the response into readable requirements
      let formattedRequirements = `Content Requirements for ${influencerName}\n\n`;
      
      if (data.campaign_name) {
        formattedRequirements += `**Campaign: ${data.campaign_name}**\n\n`;
      }
      
      // Format each category of deliverables
      const deliverables = data.generated_deliverables || {};
      
      const categoryTitles = {
        content_creation_requirements: 'Content Creation Requirements',
        technical_specifications: 'Technical Specifications',
        timeline_scheduling: 'Timeline & Scheduling',
        performance_metrics_kpis: 'Performance Metrics & KPIs',
        legal_compliance: 'Legal & Compliance',
        brand_guidelines_messaging: 'Brand Guidelines & Messaging',
        approval_process: 'Approval Process',
        reporting_analytics: 'Reporting & Analytics',
        budget_payment_terms: 'Budget & Payment Terms',
        quality_assurance: 'Quality Assurance Standards'
      };
      
      // If content type is specified, prioritize relevant categories
      if (contentType) {
        formattedRequirements += `**${contentType} Specific Requirements:**\n\n`;
      }
      
      Object.entries(deliverables).forEach(([key, points]) => {
        if (Array.isArray(points) && points.length > 0) {
          const title = categoryTitles[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          formattedRequirements += `**${title}:**\n`;
          points.forEach(point => {
            formattedRequirements += `• ${point}\n`;
          });
          formattedRequirements += '\n';
        }
      });
      
      // Add metadata footer
      if (data.metadata) {
        formattedRequirements += `\n---\n_Generated on ${new Date(data.metadata.generated_date).toLocaleDateString()}_`;
      }

      setRequirements(formattedRequirements);
      toast({
        title: "AI Requirements Generated",
        description: "Review and customize the generated requirements before sharing.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      console.error('Error generating AI requirements:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI requirements",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setRequirements('');
      // Set default deadline to 14 days from now
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 14);
      setDeadline(defaultDeadline.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleShareRequirements = async () => {
    if (!requirements.trim()) {
      toast({
        title: "Error",
        description: "Please enter content requirements",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    try {
      // Update participant stage
      const { error: participantError } = await supabase
        .from('campaign_participants')
        .update({ 
          current_stage: 'content_creation'
        })
        .eq('id', participantId);

      if (participantError) throw participantError;

      // Create tasks based on requirements
      const { data: participant } = await supabase
        .from('campaign_participants')
        .select('influencer_id')
        .eq('id', participantId)
        .single();

      if (participant) {
        // Determine task title based on content type
        const taskTitle = contentType 
          ? `Create ${contentType}` 
          : 'Create Campaign Content';
          
        // Create a single task that encompasses all requirements
        const { error: taskError } = await supabase
          .from('campaign_tasks')
          .insert({
            campaign_id: campaignId,
            influencer_id: participant.influencer_id,
            title: taskTitle,
            description: requirements,
            task_type: contentType?.toLowerCase() || 'content_creation',
            status: 'content_requirement',
            progress: 0,
            next_deadline: deadline || null,
            phase_visibility: {
              content_requirement: true,
              content_review: false,
              publish_analytics: false
            }
          });

        if (taskError) throw taskError;

        // Initialize workflow for the task
        const { data: taskData } = await supabase
          .from('campaign_tasks')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', participant.influencer_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (taskData) {
          // Create initial workflow states for all phases
          await supabase
            .from('task_workflow_states')
            .insert([
              {
                task_id: taskData.id,
                phase: 'content_requirement',
                status: 'in_progress'  // Start as in_progress since we're sharing requirements
              },
              {
                task_id: taskData.id,
                phase: 'content_review',
                status: 'not_started'
              },
              {
                task_id: taskData.id,
                phase: 'publish_analytics',
                status: 'not_started'
              }
            ]);

          // Create content draft with requirements
          await supabase
            .from('task_content_drafts')
            .insert({
              task_id: taskData.id,
              content: requirements,
              shared_with_influencer: true,
              created_by: (await supabase.auth.getUser()).data.user?.id
            });
        }
      }

      toast({
        title: "Success",
        description: "Content requirements shared successfully!",
      });

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['waiting-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['active-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['content-type-waiting-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['content-type-active-participants', campaignId] });

      onRequirementsShared?.();
      onClose();
    } catch (error) {
      console.error('Error sharing requirements:', error);
      toast({
        title: "Error",
        description: "Failed to share content requirements",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#1DDCD3]" />
            Share {contentType ? `${contentType} ` : ''}Content Requirements
          </DialogTitle>
          <DialogDescription>
            Share {contentType ? `${contentType.toLowerCase()} ` : ''}content requirements with {influencerName} to begin the content creation process.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="requirements">Content Requirements</Label>
              <Button
                onClick={generateAIRequirements}
                variant="outline"
                size="sm"
                disabled={isGeneratingAI}
                className="text-xs"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-3 w-3" />
                    AI Generate
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Enter your own content requirements, or click 'AI Generate' to get started with AI-powered suggestions..."
              rows={12}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="deadline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Deadline (Optional)
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Set a specific deadline for this task, or leave empty to use campaign deadline
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Once shared, the influencer will be able to view these requirements and start creating content. They can provide feedback on the requirements before starting.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSharing}>
            Cancel
          </Button>
          <Button 
            onClick={handleShareRequirements} 
            disabled={isSharing || !requirements.trim()}
            className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
          >
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Share Requirements
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareContentRequirementsModal;