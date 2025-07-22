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

export interface TaskFeedback {
  id: string;
  task_id: string;
  sender_id: string;
  sender_type: 'brand' | 'influencer';
  message: string;
  phase: 'content_requirement' | 'content_review' | 'publish_analytics';
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
    
    return (data || []).map(item => ({
      ...item,
      phase: item.phase as 'content_requirement' | 'content_review' | 'publish_analytics',
      status: item.status as 'not_started' | 'in_progress' | 'completed' | 'rejected'
    }));
  },

  async initializeWorkflow(taskId: string): Promise<void> {
    console.log('Initializing workflow for task:', taskId);
    
    const existing = await this.getWorkflowStates(taskId);
    if (existing.length > 0) {
      console.log('Workflow already initialized for task:', taskId);
      return;
    }

    // Initialize only 3 workflow states
    const { error } = await supabase
      .from('task_workflow_states')
      .insert([
        { task_id: taskId, phase: 'content_requirement', status: 'not_started' },
        { task_id: taskId, phase: 'content_review', status: 'not_started' },
        { task_id: taskId, phase: 'publish_analytics', status: 'not_started' }
      ]);

    if (error) {
      console.error('Error initializing workflow states:', error);
      throw error;
    }

    // Update task phase visibility - brand can work on requirements, influencer waits
    const { error: updateError } = await supabase
      .from('campaign_tasks')
      .update({
        current_phase: 'content_requirement',
        phase_visibility: {
          content_requirement: false, // Not visible to influencer until shared
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

  async startContentRequirementPhase(taskId: string): Promise<void> {
    // Brand starts working on content requirements
    const { error } = await supabase
      .from('task_workflow_states')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('task_id', taskId)
      .eq('phase', 'content_requirement');

    if (error) throw error;
  },

  async shareContentRequirements(taskId: string, requirements: string): Promise<void> {
    // Create or update content draft
    const { data: existingDraft } = await supabase
      .from('task_content_drafts')
      .select('id')
      .eq('task_id', taskId)
      .maybeSingle();

    if (existingDraft) {
      // Update existing draft
      await supabase
        .from('task_content_drafts')
        .update({
          content: requirements,
          shared_with_influencer: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDraft.id);
    } else {
      // Create new draft
      await supabase
        .from('task_content_drafts')
        .insert({
          task_id: taskId,
          content: requirements,
          shared_with_influencer: true,
          ai_generated: false,
          brand_edited: true,
          created_by: 'brand-user' // This should be the actual brand user ID
        });
    }

    // Complete content requirement phase
    await supabase
      .from('task_workflow_states')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('task_id', taskId)
      .eq('phase', 'content_requirement');

    // Start content review phase  
    await supabase
      .from('task_workflow_states')
      .update({ status: 'in_progress' })
      .eq('task_id', taskId)
      .eq('phase', 'content_review');

    // Update task phase visibility - now influencer can see requirements and review phase
    await supabase
      .from('campaign_tasks')
      .update({ 
        current_phase: 'content_review',
        phase_visibility: {
          content_requirement: true, // Now visible to influencer
          content_review: true, // Both can see this phase
          publish_analytics: false
        }
      })
      .eq('id', taskId);
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

  async getContentReviews(taskId: string): Promise<ContentReview[]> {
    const { data, error } = await supabase
      .from('task_content_reviews')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
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

    if (status === 'approved') {
      // Complete content review phase and start publish analytics
      await supabase
        .from('task_workflow_states')
        .update({ status: 'completed' })
        .eq('task_id', taskId)
        .eq('phase', 'content_review');

      await supabase
        .from('task_workflow_states')
        .update({ status: 'in_progress' })
        .eq('task_id', taskId)
        .eq('phase', 'publish_analytics');

      // Update visibility for final phase
      await supabase
        .from('campaign_tasks')
        .update({ 
          current_phase: 'publish_analytics',
          phase_visibility: {
            content_requirement: true,
            content_review: true,
            publish_analytics: true // Both can see all phases now
          }
        })
        .eq('id', taskId);
    }
    // If rejected, keep in content_review phase for re-upload
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
    await supabase
      .from('task_workflow_states')
      .update({ status: 'completed' })
      .eq('task_id', taskId)
      .eq('phase', 'publish_analytics');
  },

  async getTaskFeedback(taskId: string, phase?: string): Promise<TaskFeedback[]> {
    let query = supabase
      .from('task_feedback')
      .select(`
        id,
        task_id,
        sender_id,
        sender_type,
        message,
        phase,
        created_at
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (phase) {
      query = query.eq('phase', phase);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      sender_type: item.sender_type as 'brand' | 'influencer',
      phase: item.phase as 'content_requirement' | 'content_review' | 'publish_analytics'
    }));
  },

  async sendTaskFeedback(
    taskId: string,
    senderId: string,
    senderType: 'brand' | 'influencer',
    message: string,
    phase: 'content_requirement' | 'content_review' | 'publish_analytics'
  ): Promise<void> {
    const { error } = await supabase
      .from('task_feedback')
      .insert({
        task_id: taskId,
        sender_id: senderId,
        sender_type: senderType,
        message,
        phase
      });

    if (error) throw error;
  },

  async checkPhaseVisibility(taskId: string, userType: 'brand' | 'influencer'): Promise<Record<string, boolean>> {
    const { data: task, error } = await supabase
      .from('campaign_tasks')
      .select('phase_visibility, current_phase')
      .eq('id', taskId)
      .maybeSingle();

    if (error) {
      console.error('Error checking phase visibility:', error);
      return {};
    }

    // Brand users can always see the current phase they're working on
    if (userType === 'brand') {
      const { data: workflowStates } = await supabase
        .from('task_workflow_states')
        .select('phase, status')
        .eq('task_id', taskId);

      const brandVisibility: Record<string, boolean> = {};
      workflowStates?.forEach(state => {
        // Brand can see all phases, but focus is on current workflow state
        brandVisibility[state.phase] = true;
      });

      return brandVisibility;
    }

    // Influencers see phases based on visibility settings
    const phaseVisibility = task?.phase_visibility as Record<string, boolean> | null;
    return phaseVisibility || {
      content_requirement: false,
      content_review: false,
      publish_analytics: false
    };
  }
};
