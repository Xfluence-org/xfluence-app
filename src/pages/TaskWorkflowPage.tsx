
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import BrandSidebar from '@/components/brand/BrandSidebar';
import TaskWorkflowView from '@/components/influencer/TaskWorkflowView';
import TaskWorkflowManager from '@/components/brand/TaskWorkflowManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TaskWorkflowPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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
        .single();

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
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleGoBack = () => {
    if (userProfile?.user_type === 'Brand' || userProfile?.user_type === 'Agency') {
      navigate('/brand/campaigns');
    } else {
      navigate('/campaigns');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {userProfile?.user_type === 'Brand' || userProfile?.user_type === 'Agency' ? (
          <BrandSidebar />
        ) : (
          <Sidebar />
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
          <BrandSidebar />
        ) : (
          <Sidebar />
        )}
        <main className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              {error?.message || 'Task not found'}
            </p>
            <Button 
              onClick={handleGoBack}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isBrandUser = userProfile?.user_type === 'Brand' || userProfile?.user_type === 'Agency';
  const taskTitle = `${taskData.title} - ${taskData.campaigns?.brands?.name}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isBrandUser ? <BrandSidebar /> : <Sidebar />}
      
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
              Back to Campaigns
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
