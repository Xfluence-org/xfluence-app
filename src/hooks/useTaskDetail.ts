
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TaskDetail } from '@/types/taskDetail';

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

      // Fetch task feedback
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

      // Fetch task uploads
      const { data: uploads, error: uploadsError } = await supabase
        .from('task_uploads')
        .select('id, filename, created_at')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (uploadsError) {
        console.error('Error fetching uploads:', uploadsError);
      }

      // Transform data to match TaskDetail interface
      const formatDate = (dateStr: string) => {
        if (!dateStr) return 'TBD';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      };

      const getStatusSteps = (status: string) => {
        const steps = {
          contentRequirement: status !== 'content_requirement',
          contentReview: ['content_review', 'post_content', 'content_analytics'].includes(status),
          publishContent: ['post_content', 'content_analytics'].includes(status),
          contentAnalytics: status === 'content_analytics',
          currentStep: status as 'contentRequirement' | 'contentReview' | 'publishContent' | 'contentAnalytics'
        };
        return steps;
      };

      const taskDetailData: TaskDetail = {
        id: task.id,
        title: task.task_type || 'Task',
        platform: 'Instagram', // Default platform
        brand: task.campaigns?.brands?.name || 'Unknown Brand',
        dueDate: formatDate(task.next_deadline),
        status: getStatusSteps(task.status || 'content_requirement'),
        description: task.description || `Create engaging ${task.task_type?.toLowerCase()} content`,
        deliverables: [
          `1 ${task.task_type} post`,
          'High-quality content',
          'Brand mention required'
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
      
      // Refetch to update UI
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
      // In a real implementation, this would download a file
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
          sender_id: '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab', // Test user ID
          sender_type: 'influencer',
          message
        });
        
      if (error) throw error;
      
      // Refetch to update UI
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
      
      // In a real implementation, you would upload to Supabase Storage first
      // For now, we'll just create database records
      const uploadPromises = Array.from(files).map(file => 
        supabase
          .from('task_uploads')
          .insert({
            task_id: taskId,
            uploader_id: '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab', // Test user ID
            filename: file.name,
            file_url: `placeholder-url-${file.name}`, // In reality, this would be the Supabase Storage URL
            file_size: file.size,
            mime_type: file.type
          })
      );
      
      await Promise.all(uploadPromises);
      
      // Refetch to update UI
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
      
      // Refetch to update UI
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
