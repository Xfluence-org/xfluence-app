
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { ChevronDown, ChevronRight, Check, X, Edit } from 'lucide-react';

interface InfluencerPerformanceSectionProps {
  campaignId: string;
}

const InfluencerPerformanceSection: React.FC<InfluencerPerformanceSectionProps> = ({ 
  campaignId 
}) => {
  const [expandedInfluencer, setExpandedInfluencer] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const queryClient = useQueryClient();

  const { data: influencers = [], isLoading } = useQuery({
    queryKey: ['campaign-influencers', campaignId],
    queryFn: async () => {
      console.log('Fetching campaign influencers for:', campaignId);
      
      const { data, error } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          status,
          progress,
          created_at,
          profiles (
            id,
            name,
            email
          ),
          campaign_tasks (
            id,
            task_type,
            title,
            status,
            progress,
            description
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching campaign influencers:', error);
        throw error;
      }

      console.log('Fetched campaign influencers:', data);
      return data || [];
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const { error } = await supabase
        .from('campaign_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-influencers', campaignId] });
      setEditingTask(null);
      setEditContent('');
    }
  });

  const approveTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('campaign_tasks')
        .update({ 
          status: 'completed',
          progress: 100 
        })
        .eq('id', taskId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-influencers', campaignId] });
    }
  });

  const denyTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('campaign_tasks')
        .update({ 
          status: 'content_review',
          progress: 25 
        })
        .eq('id', taskId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-influencers', campaignId] });
    }
  });

  const handleEditTask = (taskId: string, currentContent: string) => {
    setEditingTask(taskId);
    setEditContent(currentContent || '');
  };

  const handleSaveEdit = (taskId: string) => {
    updateTaskMutation.mutate({
      taskId,
      updates: { description: editContent }
    });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditContent('');
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'content_review':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'pending':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#1a1f2e] mb-4">Influencers & Performance</h3>
        <p className="text-gray-500">Loading influencer data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#1a1f2e] mb-4">Influencers & Performance</h3>
      
      {influencers.length === 0 ? (
        <p className="text-gray-500">No accepted influencers found for this campaign.</p>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {influencers.map((participant: any) => (
                <React.Fragment key={participant.id}>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">{participant.profiles?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{participant.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getStatusBadge(participant.status)}>
                        {participant.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div 
                            className="bg-[#1DDCD3] h-2 rounded-full" 
                            style={{ width: `${participant.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{participant.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {participant.campaign_tasks?.length || 0} tasks
                    </TableCell>
                    <TableCell>
                      <Collapsible 
                        open={expandedInfluencer === participant.id}
                        onOpenChange={() => setExpandedInfluencer(
                          expandedInfluencer === participant.id ? null : participant.id
                        )}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {expandedInfluencer === participant.id ? 
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronRight className="h-4 w-4" />
                            }
                            Details
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <Collapsible 
                        open={expandedInfluencer === participant.id}
                        onOpenChange={() => setExpandedInfluencer(
                          expandedInfluencer === participant.id ? null : participant.id
                        )}
                      >
                        <CollapsibleContent>
                          <div className="p-4 bg-white border-l-4 border-[#1DDCD3] ml-4">
                            <h4 className="font-medium text-[#1a1f2e] mb-3">Task Details</h4>
                            {participant.campaign_tasks?.map((task: any) => (
                              <div key={task.id} className="border rounded-lg p-4 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h5 className="font-medium">{task.title}</h5>
                                    <p className="text-sm text-gray-600">{task.task_type}</p>
                                  </div>
                                  <span className={getStatusBadge(task.status)}>
                                    {task.status}
                                  </span>
                                </div>
                                
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content/Instructions
                                  </label>
                                  {editingTask === task.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        placeholder="Enter task content or instructions"
                                        rows={3}
                                      />
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleSaveEdit(task.id)}
                                          className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                                        >
                                          Save
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={handleCancelEdit}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start gap-2">
                                      <p className="text-sm text-gray-900 flex-1">
                                        {task.description || 'No content available'}
                                      </p>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditTask(task.id, task.description)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {task.status === 'content_review' && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => approveTaskMutation.mutate(task.id)}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => denyTaskMutation.mutate(task.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Request Changes
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InfluencerPerformanceSection;
