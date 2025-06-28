
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import MetricCard from '@/components/dashboard/MetricCard';
import TaskSection from '@/components/dashboard/TaskSection';
import ChartsSection from '@/components/dashboard/ChartsSection';
import { Users, FolderOpen, CheckCircle, Target } from 'lucide-react';

const ModernDashboard = () => {
  const { profile } = useAuth();

  const metrics = [
    {
      title: 'Active Employees',
      value: '547',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Number of Projects',
      value: '339',
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      title: 'Number of Task',
      value: '147',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      title: 'Target Percentage Completed',
      value: '89.75%',
      icon: <Target className="h-5 w-5" />,
    },
  ];

  const ongoingTasks = [
    {
      id: '1',
      title: 'Journey Scarves',
      description: 'Rebranding and Website Design',
      status: 'on-going' as const,
      progress: 51,
      dueDate: 'Aug, 17 2024',
      assignees: ['John', 'Sarah', 'Mike', 'Lisa'],
      logo: 'JS'
    },
    {
      id: '2',
      title: 'Edifier',
      description: 'Web Design & Development',
      status: 'on-going' as const,
      progress: 51,
      dueDate: 'Aug, 17 2024',
      assignees: ['Alice', 'Bob'],
      logo: 'E'
    },
    {
      id: '3',
      title: 'Ugreen',
      description: 'Web App & Dashboard',
      status: 'on-going' as const,
      progress: 89,
      dueDate: 'Aug, 15 2024',
      assignees: ['Charlie', 'David', 'Eva'],
      logo: 'U'
    },
    {
      id: '4',
      title: 'CNN',
      description: 'Rebranding and Somed Content',
      status: 'on-going' as const,
      progress: 75,
      dueDate: 'Aug, 20 2024',
      assignees: ['Frank', 'Grace', 'Henry', 'Ivy'],
      logo: 'CNN'
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <ModernSidebar userName={profile?.name || 'Markus'} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-medium">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Dear Manager</h1>
                <p className="text-muted-foreground">
                  We have observed a decline in <span className="text-orange-600">[Hermawan]</span>'s performance over the past 2 weeks.
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              View Detail
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
              />
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <TaskSection
              title="On Going Task"
              subtitle="Best performing employee ranking."
              tasks={ongoingTasks}
            />
            <ChartsSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModernDashboard;
