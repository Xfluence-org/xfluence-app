
import { supabase } from '@/integrations/supabase/client';

export type WorkflowPhase = 'content_requirement' | 'content_review' | 'publish_analytics';
export type WorkflowStatus = 'not_started' | 'in_progress' | 'completed' | 'rejected';

export interface WorkflowState {
  id: string;
  task_id: string;
  phase: WorkflowPhase;
  status: WorkflowStatus;
  created_at: string;
  updated_at: string;
}

export interface ContentDraft {
  id: string;
  task_id: string;
  content: string;
  ai_generated: boolean;
  brand_edited: boolean;
  shared_with_influencer: boolean;
  created_by: string;
  created_at: string;
}

export interface ContentReview {
  id: string;
  task_id: string;
  upload_id: string;
  ai_commentary: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string;
  reviewed_by: string;
  reviewed_at: string;
}

export class TaskWorkflowService {
  private phases: WorkflowPhase[] = ['content_requirement', 'content_review', 'publish_analytics'];

  async initializeWorkflow(taskId: string): Promise<void> {
    // Create initial workflow states for all phases
    const workflowStates = this.phases.map(phase => ({
      task_id: taskId,
      phase,
      status: phase === 'content_requirement' ? 'in_progress' : 'not_started' as WorkflowStatus
    }));

    const { error } = await supabase
      .from('task_workflow_states')
      .insert(workflowStates);

    if (error) throw error;
  }

  async transitionPhase(taskId: string, fromPhase: WorkflowPhase, action: 'complete' | 'reject'): Promise<void> {
    const { error: updateError } = await supabase
      .from('task_workflow_states')
      .update({ 
        status: action === 'complete' ? 'completed' : 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('task_id', taskId)
      .eq('phase', fromPhase);

    if (updateError) throw updateError;

    // If completing, activate next phase
    if (action === 'complete') {
      const nextPhaseIndex = this.phases.indexOf(fromPhase) + 1;
      if (nextPhaseIndex < this.phases.length) {
        const nextPhase = this.phases[nextPhaseIndex];
        
        const { error: nextPhaseError } = await supabase
          .from('task_workflow_states')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('task_id', taskId)
          .eq('phase', nextPhase);

        if (nextPhaseError) throw nextPhaseError;

        // Update task current phase
        const { error: taskError } = await supabase
          .from('campaign_tasks')
          .update({ current_phase: nextPhase })
          .eq('id', taskId);

        if (taskError) throw taskError;
      }
    }
  }

  async getWorkflowStates(taskId: string): Promise<WorkflowState[]> {
    const { data, error } = await supabase
      .from('task_workflow_states')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at');

    if (error) throw error;
    
    // Cast the data to properly typed WorkflowState array
    return (data || []).map(item => ({
      ...item,
      phase: item.phase as WorkflowPhase,
      status: item.status as WorkflowStatus
    }));
  }

  async createContentDraft(taskId: string, content: string, createdBy: string): Promise<string> {
    const { data, error } = await supabase
      .from('task_content_drafts')
      .insert({
        task_id: taskId,
        content,
        created_by: createdBy,
        ai_generated: false,
        brand_edited: true
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async shareContentDraft(draftId: string, taskId: string): Promise<void> {
    const { error } = await supabase
      .from('task_content_drafts')
      .update({ shared_with_influencer: true })
      .eq('id', draftId);

    if (error) throw error;

    // Update task phase visibility
    const { error: taskError } = await supabase
      .from('campaign_tasks')
      .update({ 
        phase_visibility: {
          content_requirement: true,
          content_review: false,
          publish_analytics: false
        }
      })
      .eq('id', taskId);

    if (taskError) throw taskError;
  }

  async getContentDrafts(taskId: string): Promise<ContentDraft[]> {
    const { data, error } = await supabase
      .from('task_content_drafts')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createContentReview(taskId: string, uploadId: string, status: 'approved' | 'rejected', feedback?: string, reviewedBy?: string): Promise<void> {
    const { error } = await supabase
      .from('task_content_reviews')
      .insert({
        task_id: taskId,
        upload_id: uploadId,
        status,
        feedback: feedback || '',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        ai_commentary: 'AI analysis: Content meets brand guidelines and quality standards.'
      });

    if (error) throw error;

    // If approved, transition to next phase
    if (status === 'approved') {
      await this.transitionPhase(taskId, 'content_review', 'complete');
      
      // Update task phase visibility for publish phase
      const { error: taskError } = await supabase
        .from('campaign_tasks')
        .update({ 
          phase_visibility: {
            content_requirement: true,
            content_review: true,
            publish_analytics: true
          }
        })
        .eq('id', taskId);

      if (taskError) throw taskError;
    }
  }

  async getContentReviews(taskId: string): Promise<ContentReview[]> {
    const { data, error } = await supabase
      .from('task_content_reviews')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Cast the data to properly typed ContentReview array
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'approved' | 'rejected'
    }));
  }

  async submitPublishedContent(taskId: string, publishedUrl: string, platform: string): Promise<void> {
    const { error } = await supabase
      .from('task_published_content')
      .insert({
        task_id: taskId,
        published_url: publishedUrl,
        platform,
        analytics_data: { views: 0, likes: 0, comments: 0, shares: 0 }
      });

    if (error) throw error;

    // Complete the workflow
    await this.transitionPhase(taskId, 'publish_analytics', 'complete');
    
    // Update task status to completed
    const { error: taskError } = await supabase
      .from('campaign_tasks')
      .update({ 
        status: 'content_analytics',
        progress: 100
      })
      .eq('id', taskId);

    if (taskError) throw taskError;
  }

  async checkPhaseVisibility(taskId: string, userType: 'brand' | 'influencer'): Promise<Record<WorkflowPhase, boolean>> {
    const { data: task, error } = await supabase
      .from('campaign_tasks')
      .select('phase_visibility, current_phase')
      .eq('id', taskId)
      .single();

    if (error) throw error;

    const visibility = task.phase_visibility || {
      content_requirement: false,
      content_review: false,
      publish_analytics: false
    };

    // Brands can see all phases, influencers only see visible phases
    if (userType === 'brand') {
      return {
        content_requirement: true,
        content_review: true,
        publish_analytics: true
      };
    }

    // Cast the visibility data to the expected type
    return visibility as Record<WorkflowPhase, boolean>;
  }
}

export const taskWorkflowService = new TaskWorkflowService();
