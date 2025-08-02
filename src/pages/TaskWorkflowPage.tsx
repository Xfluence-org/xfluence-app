
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import BrandSidebar from '@/components/brand/BrandSidebar';
import TaskWorkflowView from '@/components/influencer/TaskWorkflowView';
import TaskWorkflowManager from '@/components/brand/TaskWorkflowManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TaskWorkflowPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const { data: taskData, isLoading, error } = useQuery({
    queryKey: ['task-details', taskId],
    queryFn: async () => {
      if (!taskId) throw new Error('Task ID is required');
      
      const { data, error } = await supabase
        .from('campaign_tasks')
        .select(`
          *,
          campaigns (
            title,
            brands (
              name
            )
          )
        `)
        .eq('id', taskId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!taskId
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleGoBack = () => {
    if (userProfile?.user_type === 'Brand' || userProfile?.user_type === 'Agency') {
      navigate('/brand/campaigns');
    } else {
      navigate('/dashboard'); // Go back to influencer dashboard instead of campaigns
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {userProfile?.user_type === 'Brand' || userProfile?.user_type === 'Agency' ? (
          <BrandSidebar userName={profile?.name || 'Brand'} />
        ) : (
          <Sidebar userName={profile?.name || 'User'} />
        )}
        <main className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading task workflow...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !taskData) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {userProfile?.user_type === 'Brand' || userProfile?.user_type === 'Agency' ? (
          <BrandSidebar userName={profile?.name || 'Brand'} />
        ) : (
          <Sidebar userName={profile?.name || 'User'} />
        )}
        <main className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-red-500 text-6xl mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error?.message === 'Task not found' 
                  ? 'This task may have been deleted or you may not have permission to view it.'
                  : error?.message || 'The requested task could not be found.'
                }
              </p>
              <Button 
                onClick={handleGoBack}
                className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isBrandUser = userProfile?.user_type === 'Brand' || userProfile?.user_type === 'Agency';
  const taskTitle = `${taskData.title} - ${taskData.campaigns?.brands?.name}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isBrandUser ? <BrandSidebar userName={profile?.name || 'Brand'} /> : <Sidebar userName={profile?.name || 'User'} />}
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={handleGoBack}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">
              Task Workflow
            </h1>
            <p className="text-gray-600">
              {taskTitle}
            </p>
          </div>

          {/* Workflow Component */}
          {isBrandUser ? (
            <TaskWorkflowManager
              taskId={taskId!}
              taskTitle={taskTitle}
              userType="brand"
            />
          ) : (
            <TaskWorkflowView
              taskId={taskId!}
              taskTitle={taskTitle}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskWorkflowPage;
