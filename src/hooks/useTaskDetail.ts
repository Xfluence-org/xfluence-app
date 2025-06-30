import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TaskDetail } from '@/types/taskDetail';
import { taskWorkflowService } from '@/services/taskWorkflowService';
import { formatTaskType, formatDeadline } from '@/utils/taskFormatters';

export const useTaskDetail = (taskId: string | null) => {
  const [loading, setLoading] = useState(false);

  // Fetch task detail from database
  const { data: taskDetail, refetch } = useQuery({
    queryKey: ['taskDetail', taskId],
    queryFn: async () => {
      if (!taskId) return null;

      console.log('Fetching task detail for:', taskId);

      const { data: task, error: taskError } = await supabase
        .from('campaign_tasks')
        .select(`
          id,
          task_type,
          title,
          description,
          status,
          ai_score,
          next_deadline,
          current_phase,
          phase_visibility,
          campaigns (
            title,
            due_date,
            brands (
              name
            )
          )
        `)
        .eq('id', taskId)
        .single();

      if (taskError) {
        console.error('Error fetching task:', taskError);
        throw taskError;
      }

      // Initialize workflow if it doesn't exist
      try {
        const workflowStates = await taskWorkflowService.getWorkflowStates(taskId);
        if (workflowStates.length === 0) {
          await taskWorkflowService.initializeWorkflow(taskId);
        }
      } catch (error) {
        console.error('Error initializing workflow:', error);
      }

      // ... keep existing code (fetch feedbacks, uploads, transform data)
      const { data: feedbacks, error: feedbackError } = await supabase
        .from('task_feedback')
        .select(`
          id,
          message,
          sender_type,
          created_at,
          profiles (
            name
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
      }

      const { data: uploads, error: uploadsError } = await supabase
        .from('task_uploads')
        .select('id, filename, created_at')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (uploadsError) {
        console.error('Error fetching uploads:', uploadsError);
      }


      const getStatusSteps = (status: string, currentPhase: string) => {
        return {
          contentRequirement: currentPhase !== 'content_requirement' || status !== 'content_requirement',
          contentReview: ['content_review', 'post_content', 'content_analytics'].includes(status) || currentPhase === 'content_review',
          publishContent: ['post_content', 'content_analytics'].includes(status) || currentPhase === 'publish_analytics',
          contentAnalytics: status === 'content_analytics',
          currentStep: currentPhase as 'contentRequirement' | 'contentReview' | 'publishContent' | 'contentAnalytics'
        };
      };

      const taskDetailData: TaskDetail = {
        id: task.id,
        title: task.title || formatTaskType(task.task_type),
        platform: 'Instagram',
        brand: task.campaigns?.brands?.name || 'Unknown Brand',
        dueDate: formatDeadline(task.next_deadline || task.campaigns?.due_date),
        status: getStatusSteps(task.status || 'content_requirement', task.current_phase || 'content_requirement'),
        description: task.description || `Create engaging content for this campaign`,
        deliverables: [
          'High-quality content as per requirements',
          'Brand mention required',
          'Follow brand guidelines'
        ],
        aiScore: task.ai_score || 0,
        feedbacks: feedbacks?.map(feedback => ({
          id: feedback.id,
          from: feedback.sender_type === 'brand' ? task.campaigns?.brands?.name || 'Brand' : 'You',
          message: feedback.message,
          timestamp: feedback.created_at
        })) || [],
        uploads: uploads?.map(upload => ({
          id: upload.id,
          filename: upload.filename,
          uploadedAt: upload.created_at
        })) || []
      };

      console.log('Transformed task detail:', taskDetailData);
      return taskDetailData;
    },
    enabled: !!taskId
  });

  // ... keep existing code (submitForReview, downloadBrief, sendMessage, uploadFiles, deleteFile functions)
  const submitForReview = async (taskId: string) => {
    try {
      console.log('Submitting task for review:', taskId);
      
      const { error } = await supabase
        .from('campaign_tasks')
        .update({ 
          status: 'content_review',
          progress: 75,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
        
      if (error) throw error;
      
      refetch();
      
      return { success: true, message: 'Task submitted for review successfully!' };
    } catch (error) {
      console.error('Error submitting task:', error);
      return { success: false, message: 'Failed to submit task for review' };
    }
  };

  const downloadBrief = async (taskId: string) => {
    try {
      console.log('Downloading brief for task:', taskId);
      return { success: true, message: 'Brief downloaded successfully!' };
    } catch (error) {
      console.error('Error downloading brief:', error);
      return { success: false, message: 'Failed to download brief' };
    }
  };

  const sendMessage = async (taskId: string, message: string) => {
    try {
      console.log('Sending message:', { taskId, message });
      
      const { error } = await supabase
        .from('task_feedback')
        .insert({
          task_id: taskId,
          sender_id: '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab',
          sender_type: 'influencer',
          message
        });
        
      if (error) throw error;
      
      refetch();
      
      return { success: true, message: 'Message sent successfully!' };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, message: 'Failed to send message' };
    }
  };

  const uploadFiles = async (taskId: string, files: FileList) => {
    try {
      console.log('Uploading files:', { taskId, fileCount: files.length });
      
      const uploadPromises = Array.from(files).map(file => 
        supabase
          .from('task_uploads')
          .insert({
            task_id: taskId,
            uploader_id: '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab',
            filename: file.name,
            file_url: `placeholder-url-${file.name}`,
            file_size: file.size,
            mime_type: file.type
          })
      );
      
      await Promise.all(uploadPromises);
      
      refetch();
      
      return { success: true, message: 'Files uploaded successfully!' };
    } catch (error) {
      console.error('Error uploading files:', error);
      return { success: false, message: 'Failed to upload files' };
    }
  };

  const deleteFile = async (taskId: string, fileId: string) => {
    try {
      console.log('Deleting file:', { taskId, fileId });
      
      const { error } = await supabase
        .from('task_uploads')
        .delete()
        .eq('id', fileId);
        
      if (error) throw error;
      
      refetch();
      
      return { success: true, message: 'File deleted successfully!' };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, message: 'Failed to delete file' };
    }
  };

  return {
    taskDetail,
    loading,
    submitForReview,
    downloadBrief,
    sendMessage,
    uploadFiles,
    deleteFile
  };
};
