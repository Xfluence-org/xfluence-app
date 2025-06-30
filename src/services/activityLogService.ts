import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id?: string;
  task_id: string;
  campaign_id: string;
  actor_id: string;
  actor_type: 'brand' | 'influencer' | 'system';
  action: string;
  description: string;
  metadata?: any;
  created_at?: string;
}

export const activityLogService = {
  // Log a new activity
  async logActivity(activity: Omit<ActivityLog, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('task_activity_logs')
        .insert(activity)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  },

  // Get activities for a task
  async getTaskActivities(taskId: string) {
    try {
      const { data, error } = await supabase
        .from('task_activity_logs')
        .select(`
          *,
          actor:profiles!task_activity_logs_actor_id_fkey(
            id,
            name
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },

  // Log workflow phase change
  async logPhaseChange(
    taskId: string,
    campaignId: string,
    phase: string,
    status: string,
    actorId: string,
    actorType: 'brand' | 'influencer' | 'system' = 'system'
  ) {
    const actionMap: Record<string, string> = {
      'started': 'phase_started',
      'completed': 'phase_completed',
      'rejected': 'phase_rejected',
      'active': 'phase_activated'
    };

    const action = actionMap[status] || 'phase_updated';
    const phaseName = phase.replace(/_/g, ' ');

    return this.logActivity({
      task_id: taskId,
      campaign_id: campaignId,
      actor_id: actorId,
      actor_type: actorType,
      action,
      description: `${phaseName} phase ${status}`,
      metadata: { phase, status }
    });
  },

  // Log content upload
  async logContentUpload(
    taskId: string,
    campaignId: string,
    actorId: string,
    fileName: string,
    fileType: string
  ) {
    return this.logActivity({
      task_id: taskId,
      campaign_id: campaignId,
      actor_id: actorId,
      actor_type: 'influencer',
      action: 'content_uploaded',
      description: `Uploaded ${fileType} content: ${fileName}`,
      metadata: { fileName, fileType }
    });
  },

  // Log content review
  async logContentReview(
    taskId: string,
    campaignId: string,
    actorId: string,
    status: 'approved' | 'rejected',
    feedback?: string
  ) {
    return this.logActivity({
      task_id: taskId,
      campaign_id: campaignId,
      actor_id: actorId,
      actor_type: 'brand',
      action: `content_${status}`,
      description: `Content ${status}${feedback ? ' with feedback' : ''}`,
      metadata: { status, feedback }
    });
  },

  // Log content publish
  async logContentPublish(
    taskId: string,
    campaignId: string,
    actorId: string,
    platform: string,
    postUrl: string
  ) {
    return this.logActivity({
      task_id: taskId,
      campaign_id: campaignId,
      actor_id: actorId,
      actor_type: 'influencer',
      action: 'content_published',
      description: `Published content on ${platform}`,
      metadata: { platform, postUrl }
    });
  },

  // Log message sent
  async logMessage(
    taskId: string,
    campaignId: string,
    actorId: string,
    actorType: 'brand' | 'influencer',
    message: string
  ) {
    return this.logActivity({
      task_id: taskId,
      campaign_id: campaignId,
      actor_id: actorId,
      actor_type: actorType,
      action: 'message_sent',
      description: 'Sent a message',
      metadata: { messagePreview: message.substring(0, 100) }
    });
  }
};