
import React from 'react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'on-going' | 'completed' | 'pending';
  progress: number;
  dueDate: string;
  assignees: string[];
  company?: string;
  logo?: string;
}

interface TaskSectionProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  className?: string;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  subtitle,
  tasks,
  className
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-going':
        return 'status-badge status-badge-active';
      case 'completed':
        return 'status-badge status-badge-completed';
      case 'pending':
        return 'status-badge status-badge-pending';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className={cn("bg-card rounded-lg border border-border p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {task.logo ? (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-medium">{task.logo}</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-medium">
                    +
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-foreground">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              </div>
              <div className="avatar-group">
                {task.assignees.slice(0, 4).map((assignee, index) => (
                  <div key={index} className="avatar">
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {assignee.charAt(0)}
                      </span>
                    </div>
                  </div>
                ))}
                {task.assignees.length > 4 && (
                  <div className="avatar">
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        +{task.assignees.length - 4}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1">
                    <span className={getStatusBadge(task.status)}>
                      {task.status === 'on-going' ? 'On Going' : 
                       task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Procentiation</span>
                  <div className="mt-1 font-medium text-foreground">{task.progress}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date</span>
                  <div className="mt-1 font-medium text-foreground">{task.dueDate}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSection;
