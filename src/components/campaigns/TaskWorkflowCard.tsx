import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Upload, 
  ExternalLink, 
  Clock, 
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Campaign } from '@/types/campaigns';
import { formatTaskType, formatPhaseName, formatStatus } from '@/utils/taskFormatters';

interface TaskWorkflowCardProps {
  campaign: Campaign;
  onViewTaskDetails: (taskId: string) => void;
}

interface WorkflowPhase {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
  description?: string;
}

const TaskWorkflowCard: React.FC<TaskWorkflowCardProps> = ({ 
  campaign, 
  onViewTaskDetails 
}) => {
  // Get the current workflow phase based on task status
  const getWorkflowPhases = (task: any): WorkflowPhase[] => {
    const phases: WorkflowPhase[] = [
      {
        id: 'content_requirement',
        name: formatPhaseName('content_requirement'),
        icon: <FileText className="h-4 w-4" />,
        status: 'pending',
        description: 'Review content guidelines'
      },
      {
        id: 'content_review',
        name: 'Content Creation',
        icon: <Upload className="h-4 w-4" />,
        status: 'pending',
        description: 'Upload your content'
      },
      {
        id: 'publish_analytics',
        name: 'Publish & Track',
        icon: <ExternalLink className="h-4 w-4" />,
        status: 'pending',
        description: 'Share post links'
      }
    ];

    // Update phase statuses based on task status
    if (task.status === 'content_requirement') {
      phases[0].status = 'active';
    } else if (task.status === 'content_review') {
      phases[0].status = 'completed';
      phases[1].status = 'active';
    } else if (task.status === 'publish_analytics') {
      phases[0].status = 'completed';
      phases[1].status = 'completed';
      phases[2].status = 'active';
    } else if (task.status === 'completed') {
      phases.forEach(phase => phase.status = 'completed');
    }

    return phases;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-600';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPhaseIcon = (phase: WorkflowPhase) => {
    if (phase.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (phase.status === 'active') {
      return <div className="h-4 w-4 rounded-full bg-blue-600 animate-pulse" />;
    }
    return phase.icon;
  };

  return (
    <Card className="overflow-hidden border-2 hover:border-[#1DDCD3] transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#1a1f2e] mb-1">
              {campaign.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">by {campaign.brand}</p>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {campaign.platforms[0]}
              </Badge>
              <Badge className={getStatusColor(campaign.status)}>
                {formatStatus(campaign.status)}
              </Badge>
              {campaign.dueDate && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  Due: {new Date(campaign.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Compensation</p>
            <p className="font-semibold text-[#1a1f2e]">${campaign.amount}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{campaign.overall_progress}%</span>
          </div>
          <Progress value={campaign.overall_progress} className="h-2" />
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {campaign.tasks.map((task) => {
            const phases = getWorkflowPhases(task);
            const activePhase = phases.find(p => p.status === 'active');
            
            return (
              <div 
                key={task.id} 
                className="bg-gray-50 rounded-lg p-4 space-y-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onViewTaskDetails(task.id)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{formatTaskType(task.title || task.task_type)}</h4>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                {/* Workflow Phases */}
                <div className="flex items-center gap-2">
                  {phases.map((phase, index) => (
                    <React.Fragment key={phase.id}>
                      <div className="flex items-center gap-1">
                        <div className={`
                          p-1 rounded-full transition-colors
                          ${phase.status === 'completed' ? 'bg-green-100' : ''}
                          ${phase.status === 'active' ? 'bg-blue-100' : ''}
                          ${phase.status === 'pending' ? 'bg-gray-100' : ''}
                        `}>
                          {getPhaseIcon(phase)}
                        </div>
                        <span className={`
                          text-xs font-medium
                          ${phase.status === 'completed' ? 'text-green-700' : ''}
                          ${phase.status === 'active' ? 'text-blue-700' : ''}
                          ${phase.status === 'pending' ? 'text-gray-400' : ''}
                        `}>
                          {phase.name}
                        </span>
                      </div>
                      {index < phases.length - 1 && (
                        <div className={`
                          h-0.5 w-8 transition-colors
                          ${phases[index + 1].status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}
                        `} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Current Action */}
                {activePhase && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      {activePhase.description}
                    </p>
                    {activePhase.id === 'content_requirement' && task.hasFeedback && (
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Feedback Available
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View Details Button */}
        <Button 
          className="w-full bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
          onClick={(e) => {
            e.stopPropagation();
            if (campaign.tasks[0]) {
              onViewTaskDetails(campaign.tasks[0].id);
            }
          }}
        >
          View Task Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskWorkflowCard;