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
        // Generate different mock data based on taskId to show different task types
        let mockTaskDetail: TaskDetail;
        
        if (taskId === 'task1') {
          mockTaskDetail = {
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
            description: 'Create engaging posts showcasing Nike Air Max collection with dynamic movement and urban style',
            deliverables: [
              '1 Instagram post',
              'High-quality photos',
              'Brand mention required',
              'Use hashtag #NikeAirMax'
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
                filename: 'nike_post_draft.jpg',
                uploadedAt: new Date().toISOString()
              }
            ]
          };
        } else if (taskId === 'task2') {
          mockTaskDetail = {
            id: taskId,
            title: 'Stories',
            platform: 'Instagram',
            brand: 'Nike',
            dueDate: '26/06/2025',
            status: {
              contentRequirement: true,
              contentReview: true,
              publishContent: true,
              contentAnalytics: false,
              currentStep: 'publishContent'
            },
            description: 'Share 3 stories showing behind-the-scenes content of your workout routine',
            deliverables: [
              '3 Instagram stories',
              'Behind-the-scenes content',
              'Swipe-up link',
              'Brand mention'
            ],
            aiScore: 92,
            feedbacks: [
              {
                id: '1',
                from: 'Nike',
                message: 'Perfect! Approved for publishing.',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
              }
            ],
            uploads: [
              {
                id: '1',
                filename: 'story_1.mp4',
                uploadedAt: new Date().toISOString()
              },
              {
                id: '2',
                filename: 'story_2.mp4',
                uploadedAt: new Date().toISOString()
              }
            ]
          };
        } else if (taskId === 'task3') {
          mockTaskDetail = {
            id: taskId,
            title: 'Reels',
            platform: 'Instagram',
            brand: 'Nike',
            dueDate: '29/06/2025',
            status: {
              contentRequirement: true,
              contentReview: false,
              publishContent: false,
              contentAnalytics: false,
              currentStep: 'contentReview'
            },
            description: 'Create an engaging reel showcasing Nike workout gear in action',
            deliverables: [
              '1 Instagram reel',
              'High-energy workout content',
              'Music sync required',
              'Brand logo visible'
            ],
            aiScore: 78,
            feedbacks: [
              {
                id: '1',
                from: 'Nike',
                message: 'Send in your message',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
              }
            ],
            uploads: [
              {
                id: '1',
                filename: 'workout_reel_draft.mp4',
                uploadedAt: new Date().toISOString()
              }
            ]
          };
        } else {
          // Default fallback
          mockTaskDetail = {
            id: taskId,
            title: 'Task',
            platform: 'Instagram',
            brand: 'Nike',
            dueDate: '29/06/2025',
            status: {
              contentRequirement: true,
              contentReview: false,
              publishContent: false,
              contentAnalytics: false,
              currentStep: 'contentRequirement'
            },
            description: 'Task description will be loaded here',
            deliverables: ['Content deliverable'],
            aiScore: 70,
            feedbacks: [],
            uploads: []
          };
        }

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
