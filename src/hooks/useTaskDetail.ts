
import { useState, useEffect } from 'react';
import { TaskDetail } from '@/types/taskDetail';

export const useTaskDetail = (taskId: string | null) => {
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setTaskDetail(null);
      return;
    }

    const fetchTaskDetail = async () => {
      setLoading(true);
      
      try {
        // Mock API call - replace with actual endpoint
        const mockTaskDetail: TaskDetail = {
          id: taskId,
          title: 'Posts',
          platform: 'Instagram',
          brand: 'Nike',
          dueDate: '29/06/2025',
          status: {
            contentRequirement: true,
            contentReview: true,
            publishContent: false,
            contentAnalytics: false,
            currentStep: 'contentReview'
          },
          description: 'Share 3 stories showing behind-the-scenes content of your workout routine',
          deliverables: [
            '2 Instagram stories',
            '1 tiktok story',
            'swipe-up link',
            'brand mention'
          ],
          aiScore: 85,
          feedbacks: [
            {
              id: '1',
              from: 'Nike',
              message: 'Consider adding more dynamic movement to increase engagement.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
          ],
          uploads: [
            {
              id: '1',
              filename: 'insta_story.mp4',
              uploadedAt: new Date().toISOString()
            }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTaskDetail(mockTaskDetail);
      } catch (error) {
        console.error('Error fetching task detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [taskId]);

  const submitForReview = async (taskId: string) => {
    try {
      console.log('Submitting task for review:', taskId);
      // API call would go here
      return { success: true, message: 'Task submitted for review successfully!' };
    } catch (error) {
      console.error('Error submitting task:', error);
      return { success: false, message: 'Failed to submit task for review' };
    }
  };

  const downloadBrief = async (taskId: string) => {
    try {
      console.log('Downloading brief for task:', taskId);
      // API call would go here
      return { success: true, message: 'Brief downloaded successfully!' };
    } catch (error) {
      console.error('Error downloading brief:', error);
      return { success: false, message: 'Failed to download brief' };
    }
  };

  const sendMessage = async (taskId: string, message: string) => {
    try {
      console.log('Sending message:', { taskId, message });
      
      // Add message to local state optimistically
      if (taskDetail) {
        const newFeedback = {
          id: Date.now().toString(),
          from: 'You',
          message,
          timestamp: new Date().toISOString()
        };
        
        setTaskDetail(prev => prev ? {
          ...prev,
          feedbacks: [...prev.feedbacks, newFeedback]
        } : null);
      }
      
      // API call would go here
      return { success: true, message: 'Message sent successfully!' };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, message: 'Failed to send message' };
    }
  };

  const uploadFiles = async (taskId: string, files: FileList) => {
    try {
      console.log('Uploading files:', { taskId, fileCount: files.length });
      
      // Add files to local state optimistically
      if (taskDetail) {
        const newUploads = Array.from(files).map(file => ({
          id: Date.now().toString() + Math.random(),
          filename: file.name,
          uploadedAt: new Date().toISOString()
        }));
        
        setTaskDetail(prev => prev ? {
          ...prev,
          uploads: [...prev.uploads, ...newUploads]
        } : null);
      }
      
      // API call would go here
      return { success: true, message: 'Files uploaded successfully!' };
    } catch (error) {
      console.error('Error uploading files:', error);
      return { success: false, message: 'Failed to upload files' };
    }
  };

  const deleteFile = async (taskId: string, fileId: string) => {
    try {
      console.log('Deleting file:', { taskId, fileId });
      
      // Remove file from local state optimistically
      if (taskDetail) {
        setTaskDetail(prev => prev ? {
          ...prev,
          uploads: prev.uploads.filter(upload => upload.id !== fileId)
        } : null);
      }
      
      // API call would go here
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
