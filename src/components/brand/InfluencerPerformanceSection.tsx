// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseTypeCasts } from '@/hooks/useSupabaseTypeCasts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Check, X, Edit, Save } from 'lucide-react';

interface InfluencerTask {
  id: string;
  influencer_id: string;
  influencer_name: string;
  task_type: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  next_deadline: string;
}

interface InfluencerPerformanceSectionProps {
  campaignId: string;
}

const InfluencerPerformanceSection: React.FC<InfluencerPerformanceSectionProps> = ({
  campaignId
}) => {
  const { castToUuid } = useSupabaseTypeCasts();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['campaign-tasks', campaignId],
    queryFn: async () => {
      console.log('Fetching campaign tasks for:', campaignId);
      
      // First get accepted influencers for this campaign
      const { data: acceptedInfluencers, error: influencersError } = await supabase
        .from('campaign_participants')
        .select(`
          influencer_id,
          status,
          profiles(name)
        `)
        .eq('campaign_id', castToUuid(campaignId))
        .in('status', ['accepted', 'active'] as any);

      if (influencersError) {
        console.error('Error fetching accepted influencers:', influencersError);
        throw influencersError;
      }

      // Then get tasks for those influencers
      const { data: tasksData, error: tasksError } = await supabase
        .from('campaign_tasks')
        .select(`
          id,
          influencer_id,
          task_type,
          title,
          description,
          status,
          progress,
          next_deadline,
          profiles!campaign_tasks_influencer_id_fkey (
            name
          )
        `)
        .eq('campaign_id', castToUuid(campaignId));

      if (tasksError) {
        console.error('Error fetching campaign tasks:', tasksError);
        throw tasksError;
      }

      // Combine the data - create tasks for accepted influencers who don't have tasks yet
      const existingTaskInfluencers = new Set(tasksData?.map(task => task.influencer_id) || []);
      const allTasks = [...(tasksData || [])];

      // Add placeholder tasks for accepted influencers without tasks
      acceptedInfluencers?.forEach(influencer => {
        if (!existingTaskInfluencers.has(influencer.influencer_id)) {
          allTasks.push({
            id: `placeholder_${influencer.influencer_id}`,
            influencer_id: influencer.influencer_id,
            task_type: 'content_creation',
            title: 'Content Creation',
            description: 'Initial content creation task',
            status: 'content_requirement',
            progress: 0,
            next_deadline: null,
            profiles: influencer.profiles
          });
        }
      });

      return allTasks.map(task => ({
        ...task,
        influencer_name: task.profiles?.name || 'Unknown'
      })) || [];
    },
    enabled: !!campaignId
  });

  const toggleRow = (taskId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedRows(newExpanded);
  };

  const startEditing = (taskId: string, currentDescription: string) => {
    setEditingTask(taskId);
    setEditContent(currentDescription || '');
  };

  const saveEdit = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_tasks')
        .update({ description: editContent })
        .eq('id', taskId);

      if (error) throw error;

      setEditingTask(null);
      setEditContent('');
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('campaign_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'content_requirement': 'bg-blue-100 text-blue-800',
      'content_draft': 'bg-yellow-100 text-yellow-800',
      'submitted': 'bg-purple-100 text-purple-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading influencer performance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading performance data</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#1a1f2e] mb-4">
        Influencers & Performance ({tasks.length} tasks)
      </h3>
      
      {tasks.length > 0 ? (
        <div className="bg-white rounded-lg overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Influencer</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <React.Fragment key={task.id}>
                  <TableRow>
                    <TableCell>
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleRow(task.id)}
                          >
                            {expandedRows.has(task.id) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </TableCell>
                    <TableCell className="font-medium">{task.influencer_name}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#1DDCD3] h-2 rounded-full" 
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{task.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.next_deadline ? 
                        new Date(task.next_deadline).toLocaleDateString() : 
                        'TBD'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {task.status === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'approved')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows.has(task.id) && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-gray-50">
                        <Collapsible open={expandedRows.has(task.id)}>
                          <CollapsibleContent>
                            <div className="p-4 space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Task Description
                                </label>
                                {editingTask === task.id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      rows={3}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => saveEdit(task.id)}
                                        className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                                      >
                                        <Save className="h-3 w-3 mr-1" />
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingTask(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <p className="text-gray-900">{task.description || 'No description available'}</p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => startEditing(task.id, task.description)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Task Type:</span>
                                  <p className="text-gray-900">{task.task_type}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Current Status:</span>
                                  <p className="text-gray-900">{task.status.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Progress:</span>
                                  <p className="text-gray-900">{task.progress}% complete</p>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No influencers assigned to this campaign yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Approve applications in the Applications tab to see influencers here.
          </p>
        </div>
      )}
    </div>
  );
};

export default InfluencerPerformanceSection;
