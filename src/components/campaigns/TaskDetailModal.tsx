
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, ExternalLink, Lock } from 'lucide-react';
import { TaskDetail } from '@/types/taskDetail';
import { useAuth } from '@/contexts/SimpleAuthContext';
import TaskPhaseIndicator from '@/components/influencer/TaskPhaseIndicator';
import ContentRequirementView from '@/components/influencer/ContentRequirementView';
import ContentUploadPanel from '@/components/influencer/ContentUploadPanel';
import PublishContentForm from '@/components/influencer/PublishContentForm';
import PublishAnalyticsPanel from '@/components/influencer/PublishAnalyticsPanel';
import TaskWorkflowManager from '@/components/brand/TaskWorkflowManager';
import TaskProgressTracker from '@/components/shared/TaskProgressTracker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const [requirementsAccepted, setRequirementsAccepted] = useState(false);
  const [contentApproved, setContentApproved] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [activeTab, setActiveTab] = useState('requirements');
  
  // console.log('TaskDetailModal - Current profile:', profile);
  // console.log('TaskDetailModal - User type:', profile?.user_type);
  
  // Check for Brand or Agency user types
  const isBrand = profile?.user_type === 'Brand' || profile?.user_type === 'Agency';
  const isInfluencer = profile?.user_type === 'Influencer';
  
  // console.log('TaskDetailModal - isBrand:', isBrand, 'isInfluencer:', isInfluencer);

  // Check workflow states for influencers
  const checkWorkflowStatus = async () => {
    if (!isInfluencer || !taskDetail?.id) return;
    
    try {
      // Check all workflow states
      const { data: workflowStates } = await supabase
        .from('task_workflow_states')
        .select('phase, status')
        .eq('task_id', taskDetail.id);
      
      const requirementState = workflowStates?.find(s => s.phase === 'content_requirement');
      const reviewState = workflowStates?.find(s => s.phase === 'content_review');
      
      setRequirementsAccepted(requirementState?.status === 'completed');
      setContentApproved(reviewState?.status === 'completed');
    } catch (error) {
      console.error('Error checking workflow status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkWorkflowStatus();
  }, [isInfluencer, taskDetail?.id]);

  if (!taskDetail && !checkingStatus) return null;

  const handleRefresh = () => {
    // Trigger a refresh of the task detail
    console.log('Refreshing task detail...');
  };

  const handleUploadComplete = () => {
    // Handle content upload completion
    console.log('Content uploaded successfully');
    handleRefresh();
  };

  // Early return if no taskDetail
  if (!taskDetail) {
    return null;
  }

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
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="requirements" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Requirements
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upload" 
                    className="flex items-center gap-2"
                    disabled={!requirementsAccepted}
                  >
                    {!requirementsAccepted && <Lock className="h-4 w-4" />}
                    {requirementsAccepted && <Upload className="h-4 w-4" />}
                    Upload
                  </TabsTrigger>
                  <TabsTrigger 
                    value="publish" 
                    className="flex items-center gap-2"
                    disabled={!contentApproved}
                  >
                    {!contentApproved && <Lock className="h-4 w-4" />}
                    {contentApproved && <ExternalLink className="h-4 w-4" />}
                    Publish
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="requirements" className="mt-6">
                  <ContentRequirementView 
                    taskId={taskDetail.id} 
                    onRequirementsAccepted={async () => {
                      // Small delay to ensure state updates are complete
                      setTimeout(async () => {
                        // Refresh workflow status
                        await checkWorkflowStatus();
                        // Switch to upload tab
                        setActiveTab('upload');
                        toast({
                          title: "Requirements Accepted",
                          description: "You can now upload your content in the Upload tab",
                          className: "bg-green-50 border-green-200"
                        });
                      }, 100);
                    }}
                  />
                </TabsContent>

                <TabsContent value="upload" className="mt-6">
                  {!requirementsAccepted ? (
                    <div className="text-center py-12">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Locked</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        You need to accept the content requirements before you can upload content. 
                        Please review and accept the requirements in the Requirements tab.
                      </p>
                    </div>
                  ) : (
                    <ContentUploadPanel 
                      taskId={taskDetail.id} 
                      onUploadComplete={handleUploadComplete}
                    />
                  )}
                </TabsContent>

                <TabsContent value="publish" className="mt-6">
                  {!contentApproved ? (
                    <div className="text-center py-12">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Publish Locked</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {!requirementsAccepted 
                          ? "You need to accept the content requirements first."
                          : "Your content needs to be approved by the brand before you can publish. Please upload your content and wait for approval."
                        }
                      </p>
                    </div>
                  ) : (
                    <PublishAnalyticsPanel
                      taskId={taskDetail.id}
                      onPublishComplete={handleRefresh}
                    />
                  )}
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
