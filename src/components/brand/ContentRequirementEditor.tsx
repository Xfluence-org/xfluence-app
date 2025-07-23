
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { taskWorkflowService } from '@/services/taskWorkflowService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface ContentRequirementEditorProps {
  taskId: string;
  onRequirementsShared: () => void;
}

const ContentRequirementEditor: React.FC<ContentRequirementEditorProps> = ({
  taskId,
  onRequirementsShared
}) => {
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkExistingRequirements();
  }, [taskId]);

  const checkExistingRequirements = async () => {
    try {
      const drafts = await taskWorkflowService.getContentDrafts(taskId);
      if (drafts.length > 0) {
        setRequirements(drafts[0].content);
        setHasStarted(true);
      }
    } catch (error) {
      console.error('Error checking existing requirements:', error);
    }
  };

  const handleStart = async () => {
    try {
      await taskWorkflowService.startContentRequirementPhase(taskId);
      setHasStarted(true);
      toast({
        title: "Started",
        description: "You can now create content requirements for this task."
      });
    } catch (error) {
      console.error('Error starting content requirement phase:', error);
      toast({
        title: "Error",
        description: "Failed to start content requirement phase",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (!requirements.trim()) {
      toast({
        title: "Error",
        description: "Please enter content requirements before sharing",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await taskWorkflowService.shareContentRequirements(taskId, requirements);
      
      toast({
        title: "Requirements Shared",
        description: "Content requirements have been shared with the influencer!"
      });
      
      onRequirementsShared();
    } catch (error) {
      console.error('Error sharing requirements:', error);
      toast({
        title: "Error",
        description: "Failed to share content requirements",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">
            Ready to Create Content Requirements?
          </h3>
          <p className="text-gray-600 mb-4">
            Start by creating content requirements for the influencer. Once you share them, 
            the influencer will be able to see the requirements and begin working.
          </p>
          <Button onClick={handleStart}>
            Start Creating Requirements
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Content Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Requirements & Guidelines
          </label>
          <Textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Enter detailed content requirements, guidelines, key messages, hashtags, mentions, etc."
            rows={10}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleShare}
            disabled={isSubmitting || !requirements.trim()}
          >
            {isSubmitting ? 'Sharing...' : 'Share Requirements with Influencer'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Once you share these requirements, the influencer will be able to see them 
            and both of you will move to the Content Review phase where they can upload content for your approval.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentRequirementEditor;
