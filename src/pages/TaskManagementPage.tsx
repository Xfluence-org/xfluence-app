
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, FileText, Eye, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TaskWorkflowManager from '@/components/brand/TaskWorkflowManager';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  task_type: string;
  status: string;
  current_phase: string;
  progress: number;
  campaign_title: string;
  influencer_name: string;
  due_date: string;
  created_at: string;
}

const TaskManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['brand-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_tasks')
        .select(`
          id,
          title,
          task_type,
          status,
          current_phase,
          progress,
          created_at,
          next_deadline,
          campaigns!inner(
            title,
            brands!inner(
              brand_users!inner(user_id)
            )
          ),
          profiles!inner(name)
        `)
        .eq('campaigns.brands.brand_users.user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        task_type: task.task_type,
        status: task.status,
        current_phase: task.current_phase || 'content_requirement',
        progress: task.progress || 0,
        campaign_title: (task.campaigns as any)?.title || 'Unknown Campaign',
        influencer_name: (task.profiles as any)?.name || 'Unknown Influencer',
        due_date: task.next_deadline,
        created_at: task.created_at
      }));
    }
  });

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'content_requirement': return <FileText className="h-4 w-4" />;
      case 'content_review': return <Eye className="h-4 w-4" />;
      case 'publish_analytics': return <BarChart3 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'content_requirement':
        return <Badge className="bg-blue-100 text-blue-800">Content Requirements</Badge>;
      case 'content_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Review Pending</Badge>;
      case 'publish_analytics':
        return <Badge className="bg-purple-100 text-purple-800">Publishing</Badge>;
      case 'content_analytics':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.campaign_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.influencer_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && !['content_analytics', 'completed'].includes(task.status)) ||
      (activeTab === 'completed' && ['content_analytics', 'completed'].includes(task.status));
    
    return matchesSearch && matchesTab;
  }) || [];

  if (selectedTask) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar userName="Brand Manager" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTask(null)}
              >
                ← Back to Tasks
              </Button>
              <h1 className="text-2xl font-bold">Task Workflow</h1>
            </div>
            
            <TaskWorkflowManager
              taskId={selectedTask.id}
              taskTitle={selectedTask.title}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar userName="Brand Manager" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Task Management</h1>
            <p className="text-gray-600">Manage content creation workflows with your influencers</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks, campaigns, or influencers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DDCD3] mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading tasks...</p>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No tasks found</p>
                      <p className="text-gray-400 mt-1">
                        Tasks will appear here when you assign influencers to campaigns
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTasks.map((task) => (
                        <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                  {getPhaseIcon(task.current_phase)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-lg">{task.title}</h3>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                    <span>Campaign: {task.campaign_title}</span>
                                    <span>•</span>
                                    <span>Influencer: {task.influencer_name}</span>
                                    <span>•</span>
                                    <span>Type: {task.task_type}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  {getStatusBadge(task.status)}
                                  <div className="text-sm text-gray-500 mt-1">
                                    Progress: {task.progress}%
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => setSelectedTask(task)}
                                  className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                                >
                                  Manage
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TaskManagementPage;
