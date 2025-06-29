
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { taskWorkflowService, WorkflowState } from '@/services/taskWorkflowService';

interface TaskPhaseIndicatorProps {
  taskId: string;
}

const TaskPhaseIndicator: React.FC<TaskPhaseIndicatorProps> = ({ taskId }) => {
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('content_requirement');

  useEffect(() => {
    fetchWorkflowStates();
  }, [taskId]);

  const fetchWorkflowStates = async () => {
    try {
      const states = await taskWorkflowService.getWorkflowStates(taskId);
      setWorkflowStates(states);
      
      // Find current active phase
      const activePhase = states.find(s => s.status === 'in_progress');
      if (activePhase) {
        setCurrentPhase(activePhase.phase);
      }
    } catch (error) {
      console.error('Error fetching workflow states:', error);
    }
  };

  const phases = [
    {
      id: 'content_requirement',
      title: 'Content Requirements',
      description: 'Review content guidelines'
    },
    {
      id: 'content_review',
      title: 'Content Review',
      description: 'Upload content for approval'
    },
    {
      id: 'publish_analytics',
      title: 'Publish & Analytics',
      description: 'Publish and report analytics'
    }
  ];

  const getPhaseStatus = (phaseId: string) => {
    const state = workflowStates.find(s => s.phase === phaseId);
    return state?.status || 'not_started';
  };

  const getPhaseIcon = (phaseId: string) => {
    const status = getPhaseStatus(phaseId);
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getOverallProgress = () => {
    const completedPhases = workflowStates.filter(s => s.status === 'completed').length;
    return (completedPhases / phases.length) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(getOverallProgress())}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>

        <div className="space-y-4">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase.id);
            const isActive = currentPhase === phase.id;
            
            return (
              <div
                key={phase.id}
                className={`flex items-start gap-4 p-3 rounded-lg border ${
                  isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getPhaseIcon(phase.id)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{phase.title}</h4>
                    {getStatusBadge(status)}
                  </div>
                  <p className="text-xs text-gray-600">{phase.description}</p>
                </div>
                
                <div className="flex-shrink-0 text-xs text-gray-500">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskPhaseIndicator;
