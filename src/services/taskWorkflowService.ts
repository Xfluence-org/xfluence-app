
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowState {
  id: string;
  task_id: string;
  phase: 'content_requirement' | 'content_review' | 'publish_analytics';
  status: 'not_started' | 'in_progress' | 'completed' | 'rejected';
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
  updated_at: string;
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
  created_at: string;
}

export const taskWorkflowService = {
  async getWorkflowStates(taskId: string): Promise<WorkflowState[]> {
    const { data, error } = await supabase
      .from('task_workflow_states')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Cast the data to properly typed WorkflowState array
    return (data || []).map(item => ({
      ...item,
      phase: item.phase as 'content_requirement' | 'content_review' | 'publish_analytics',
      status: item.status as 'not_started' | 'in_progress' | 'completed' | 'rejected'
    }));
  },

  async initializeWorkflow(taskId: string): Promise<void> {
    console.log('Initializing workflow for task:', taskId);
    
    // Check if workflow states already exist
    const existing = await this.getWorkflowStates(taskId);
    if (existing.length > 0) {
      console.log('Workflow already initialized for task:', taskId);
      return;
    }

    // Initialize workflow states
    const { error } = await supabase
      .from('task_workflow_states')
      .insert([
        { task_id: taskId, phase: 'content_requirement', status: 'in_progress' },
        { task_id: taskId, phase: 'content_review', status: 'not_started' },
        { task_id: taskId, phase: 'publish_analytics', status: 'not_started' }
      ]);

    if (error) {
      console.error('Error initializing workflow states:', error);
      throw error;
    }

    // Update task phase visibility
    const { error: updateError } = await supabase
      .from('campaign_tasks')
      .update({
        current_phase: 'content_requirement',
        phase_visibility: {
          content_requirement: false,
          content_review: false,
          publish_analytics: false
        }
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error updating task phase visibility:', updateError);
      throw updateError;
    }

    console.log('Workflow initialized successfully for task:', taskId);
  },

  async transitionPhase(
    taskId: string, 
    fromPhase: 'content_requirement' | 'content_review' | 'publish_analytics',
    action: 'complete' | 'reject'
  ): Promise<void> {
    const newStatus = action === 'complete' ? 'completed' : 'rejected';
    
    const { error } = await supabase
      .from('task_workflow_states')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('task_id', taskId)
      .eq('phase', fromPhase);

    if (error) throw error;

    // If completing, advance to next phase
    if (action === 'complete') {
      const nextPhaseMap = {
        'content_requirement': 'content_review',
        'content_review': 'publish_analytics',
        'publish_analytics': null
      };

      const nextPhase = nextPhaseMap[fromPhase];
      if (nextPhase) {
        await supabase
          .from('task_workflow_states')
          .update({ status: 'in_progress' })
          .eq('task_id', taskId)
          .eq('phase', nextPhase);

        // Update task current phase
        await supabase
          .from('campaign_tasks')
          .update({ current_phase: nextPhase })
          .eq('id', taskId);
      }
    }
  },

  async getContentDrafts(taskId: string): Promise<ContentDraft[]> {
    const { data, error } = await supabase
      .from('task_content_drafts')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createContentDraft(taskId: string, content: string, createdBy: string): Promise<ContentDraft> {
    const { data, error } = await supabase
      .from('task_content_drafts')
      .insert({
        task_id: taskId,
        content,
        created_by: createdBy,
        ai_generated: false,
        brand_edited: true,
        shared_with_influencer: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async shareContentDraft(draftId: string, taskId: string): Promise<void> {
    // Share the draft with influencer
    const { error: shareError } = await supabase
      .from('task_content_drafts')
      .update({ shared_with_influencer: true })
      .eq('id', draftId);

    if (shareError) throw shareError;

    // Update phase visibility to show content_requirement to influencer
    const { error: visibilityError } = await supabase
      .from('campaign_tasks')
      .update({
        phase_visibility: {
          content_requirement: true,
          content_review: false,
          publish_analytics: false
        }
      })
      .eq('id', taskId);

    if (visibilityError) throw visibilityError;
  },

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
  },

  async createContentReview(
    taskId: string, 
    uploadId: string, 
    status: 'approved' | 'rejected',
    feedback?: string,
    reviewedBy?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('task_content_reviews')
      .insert({
        task_id: taskId,
        upload_id: uploadId,
        status,
        feedback,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString()
      });

    if (error) throw error;

    // If approved, move to next phase
    if (status === 'approved') {
      await this.transitionPhase(taskId, 'content_review', 'complete');
      
      // Update phase visibility
      await supabase
        .from('campaign_tasks')
        .update({
          phase_visibility: {
            content_requirement: true,
            content_review: true,
            publish_analytics: true
          }
        })
        .eq('id', taskId);
    }
  },

  async submitPublishedContent(taskId: string, publishedUrl: string, platform: string): Promise<void> {
    const { error } = await supabase
      .from('task_published_content')
      .insert({
        task_id: taskId,
        published_url: publishedUrl,
        platform
      });

    if (error) throw error;

    // Complete the final phase
    await this.transitionPhase(taskId, 'publish_analytics', 'complete');
  },

  async checkPhaseVisibility(taskId: string, userType: 'brand' | 'influencer'): Promise<Record<string, boolean>> {
    const { data: task, error } = await supabase
      .from('campaign_tasks')
      .select('phase_visibility, current_phase')
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('Error checking phase visibility:', error);
      return {};
    }

    // Brand users can see all phases
    if (userType === 'brand') {
      return {
        content_requirement: true,
        content_review: true,
        publish_analytics: true
      };
    }

    // Influencers see phases based on visibility settings
    // Cast phase_visibility to the correct type
    const phaseVisibility = task?.phase_visibility as Record<string, boolean> | null;
    return phaseVisibility || {
      content_requirement: false,
      content_review: false,
      publish_analytics: false
    };
  }
};
