
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, ExternalLink } from 'lucide-react';
import { TaskDetail } from '@/types/taskDetail';
import { useAuth } from '@/contexts/AuthContext';
import TaskPhaseIndicator from '@/components/influencer/TaskPhaseIndicator';
import ContentRequirementView from '@/components/influencer/ContentRequirementView';
import ContentUploadPanel from '@/components/influencer/ContentUploadPanel';
import PublishContentForm from '@/components/influencer/PublishContentForm';
import TaskWorkflowManager from '@/components/brand/TaskWorkflowManager';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskDetail: TaskDetail | null;
  onSubmitForReview: (taskId: string) => void;
  onDownloadBrief: (taskId: string) => void;
  onSendMessage: (taskId: string, message: string) => void;
  onFileUpload: (taskId: string, files: FileList) => void;
  onDeleteFile: (taskId: string, fileId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  taskDetail,
  onSubmitForReview,
  onDownloadBrief,
  onSendMessage,
  onFileUpload,
  onDeleteFile
}) => {
  const { profile } = useAuth();
  const isBrand = profile?.user_type === 'Brand';
  const isInfluencer = profile?.user_type === 'Influencer';

  if (!taskDetail) return null;

  const handleRefresh = () => {
    // Trigger a refresh of the task detail
    console.log('Refreshing task detail...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{taskDetail.title}</span>
            <Badge variant="outline">{taskDetail.platform}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Brand</p>
              <p className="font-medium">{taskDetail.brand}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium">{taskDetail.dueDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Score</p>
              <p className="font-medium">{taskDetail.aiScore}/100</p>
            </div>
          </div>

          {/* Content based on user type */}
          {isBrand ? (
            <TaskWorkflowManager
              taskId={taskDetail.id}
              taskTitle={taskDetail.title}
            />
          ) : isInfluencer ? (
            <div className="space-y-6">
              <TaskPhaseIndicator taskId={taskDetail.id} />
              
              <Tabs defaultValue="requirements" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="requirements" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Requirements
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="publish" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Publish
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="requirements" className="mt-6">
                  <ContentRequirementView taskId={taskDetail.id} />
                </TabsContent>

                <TabsContent value="upload" className="mt-6">
                  <ContentUploadPanel taskId={taskDetail.id} />
                </TabsContent>

                <TabsContent value="publish" className="mt-6">
                  <PublishContentForm
                    taskId={taskDetail.id}
                    onPublishComplete={handleRefresh}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Task details not available for your user type</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
