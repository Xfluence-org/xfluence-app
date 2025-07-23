import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  TrendingUp,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import TaskProgressTracker from '@/components/shared/TaskProgressTracker';
import BrandSidebar from '@/components/brand/BrandSidebar';

interface CampaignProgress {
  id: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overallProgress: number;
}

interface TaskWithProgress {
  id: string;
  title: string;
  campaign_id: string;
  campaign_title: string;
  influencer_name: string;
  current_phase: string;
  phase_status: string;
  progress: number;
  last_activity?: string;
  requirements_accepted?: boolean;
}

const BrandProgressDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [filterPhase, setFilterPhase] = useState('all');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const { user, profile } = useAuth();

  // Fetch campaigns with progress
  const { data: campaignProgress = [] } = useQuery({
    queryKey: ['campaign-progress', user?.id, profile?.user_type],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all campaigns for the brand/agency user
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          brands!inner(
            id,
            brand_users!inner(
              user_id
            )
          ),
          campaign_tasks(
            id,
            status,
            progress,
            task_workflow_states(
              phase,
              status
            )
          )
        `)
        .eq('brands.brand_users.user_id', user.id)
        .eq('status', 'published');

      if (!campaigns) return [];

      // Calculate progress for each campaign
      return campaigns.map((campaign: any) => {
        const tasks = campaign.campaign_tasks || [];
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
        const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress').length;
        const pendingTasks = totalTasks - completedTasks - inProgressTasks;
        
        const overallProgress = totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0;

        return {
          id: campaign.id,
          title: campaign.title,
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          overallProgress
        };
      });
    },
    enabled: !!user?.id
  });

  // Fetch all tasks with progress details
  const { data: tasksWithProgress = [] } = useQuery({
    queryKey: ['tasks-with-progress', user?.id, profile?.user_type],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: tasks } = await supabase
        .from('campaign_tasks')
        .select(`
          id,
          title,
          progress,
          campaign_id,
          campaigns!inner(
            id,
            title,
            brand_id,
            brands!inner(
              id,
              brand_users!inner(
                user_id
              )
            )
          ),
          influencer:profiles!campaign_tasks_influencer_id_fkey(
            id,
            name
          ),
          task_workflow_states(
            phase,
            status,
            created_at
          )
        `)
        .eq('campaigns.brands.brand_users.user_id', user.id)
        .order('created_at', { ascending: false });

      if (!tasks) return [];

      return tasks.map((task: any) => {
        const workflowStates = task.task_workflow_states || [];
        const activeState = workflowStates.find((s: any) => 
          s.status === 'in_progress' || s.status === 'active'
        );
        const requirementState = workflowStates.find((s: any) => 
          s.phase === 'content_requirement'
        );
        
        return {
          id: task.id,
          title: task.title,
          campaign_id: task.campaign_id,
          campaign_title: task.campaigns.title,
          influencer_name: task.influencer?.name || 'Unknown',
          current_phase: activeState?.phase || 'content_requirement',
          phase_status: activeState?.status || 'not_started',
          progress: task.progress || 0,
          last_activity: workflowStates[0]?.created_at,
          requirements_accepted: requirementState?.status === 'completed'
        };
      });
    },
    enabled: !!user?.id
  });

  // Get unique campaigns for filter
  const uniqueCampaigns = Array.from(
    new Set(tasksWithProgress.map(t => t.campaign_id))
  ).map(id => {
    const campaign = tasksWithProgress.find(t => t.campaign_id === id);
    return { id, title: campaign?.campaign_title || '' };
  });

  // Filter tasks
  const filteredTasks = tasksWithProgress.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.influencer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.campaign_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCampaign = filterCampaign === 'all' || task.campaign_id === filterCampaign;
    const matchesPhase = filterPhase === 'all' || task.current_phase === filterPhase;
    
    return matchesSearch && matchesCampaign && matchesPhase;
  });

  // Calculate overall statistics
  const overallStats = {
    totalTasks: tasksWithProgress.length,
    completedTasks: tasksWithProgress.filter(t => t.progress === 100).length,
    inProgressTasks: tasksWithProgress.filter(t => t.progress > 0 && t.progress < 100).length,
    pendingTasks: tasksWithProgress.filter(t => t.progress === 0).length,
    averageProgress: tasksWithProgress.length > 0
      ? Math.round(tasksWithProgress.reduce((sum, t) => sum + t.progress, 0) / tasksWithProgress.length)
      : 0
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'content_requirement':
        return <FileText className="h-4 w-4" />;
      case 'content_review':
        return <Clock className="h-4 w-4" />;
      case 'publish_analytics':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'content_requirement':
        return 'text-purple-600';
      case 'content_review':
        return 'text-blue-600';
      case 'publish_analytics':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BrandSidebar userName={profile?.name || profile?.email || 'User'} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1a1f2e]">Progress Dashboard</h1>
                <p className="text-gray-600 mt-1">Track all campaign and task progress in one place</p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Activity className="h-5 w-5 mr-2" />
                Live Tracking
              </Badge>
            </div>
          </header>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{overallStats.totalTasks}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{overallStats.inProgressTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-600">{overallStats.pendingTasks}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">{overallStats.averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaign Overview</TabsTrigger>
          <TabsTrigger value="tasks">Task Details</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {campaignProgress.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No active campaigns found
              </CardContent>
            </Card>
          ) : (
            campaignProgress.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <Badge variant="outline">
                      {campaign.overallProgress}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={campaign.overallProgress} className="h-2" />
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Tasks</p>
                      <p className="font-medium">{campaign.totalTasks}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Completed</p>
                      <p className="font-medium text-green-600">{campaign.completedTasks}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">In Progress</p>
                      <p className="font-medium text-blue-600">{campaign.inProgressTasks}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pending</p>
                      <p className="font-medium text-gray-600">{campaign.pendingTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search tasks, influencers, or campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {uniqueCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPhase} onValueChange={setFilterPhase}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="content_requirement">Content Requirements</SelectItem>
                    <SelectItem value="content_review">Content Review</SelectItem>
                    <SelectItem value="publish_analytics">Publish & Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Task List or Selected Task */}
          {selectedTask ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTask(null)}
                className="mb-4"
              >
                ← Back to Task List
              </Button>
              <TaskProgressTracker
                taskId={selectedTask}
                campaignId={filteredTasks.find(t => t.id === selectedTask)?.campaign_id || ''}
              />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No tasks found matching your filters
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {task.campaign_title}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {task.influencer_name}
                            </span>
                            {task.requirements_accepted && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Requirements Accepted
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${getPhaseColor(task.current_phase)}`}>
                              {getPhaseIcon(task.current_phase)}
                              {task.current_phase.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{task.progress}%</p>
                            <Progress value={task.progress} className="h-2 w-24" />
                          </div>
                          <div className="text-gray-400">
                            →
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BrandProgressDashboard;