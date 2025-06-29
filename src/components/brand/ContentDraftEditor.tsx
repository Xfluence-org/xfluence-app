import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Share, Plus, Edit3 } from 'lucide-react';
import { taskWorkflowService, ContentDraft } from '@/services/taskWorkflowService';
import { useAuth } from '@/contexts/AuthContext';

interface ContentDraftEditorProps {
  taskId: string;
  onDraftShared?: () => void;
}

const ContentDraftEditor: React.FC<ContentDraftEditorProps> = ({
  taskId,
  onDraftShared
}) => {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [newDraftContent, setNewDraftContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDrafts();
  }, [taskId]);

  const fetchDrafts = async () => {
    try {
      const data = await taskWorkflowService.getContentDrafts(taskId);
      setDrafts(data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  };

  const handleCreateDraft = async () => {
    if (!newDraftContent.trim() || !user?.id) return;

    try {
      setIsCreating(true);
      await taskWorkflowService.createContentDraft(taskId, newDraftContent, user.id);
      setNewDraftContent('');
      setShowEditor(false);
      await fetchDrafts();
    } catch (error) {
      console.error('Error creating draft:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleShareDraft = async (draftId: string) => {
    try {
      setIsSharing(draftId);
      await taskWorkflowService.shareContentDraft(draftId, taskId);
      await fetchDrafts();
      onDraftShared?.();
    } catch (error) {
      console.error('Error sharing draft:', error);
    } finally {
      setIsSharing(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Requirements & Drafts
            </CardTitle>
            <Button
              onClick={() => setShowEditor(!showEditor)}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Draft
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Draft Editor */}
            {showEditor && (
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Requirements
                      </label>
                      <Textarea
                        value={newDraftContent}
                        onChange={(e) => setNewDraftContent(e.target.value)}
                        placeholder="Write detailed content requirements for the influencer. Include key messages, hashtags, mentions, do's and don'ts..."
                        rows={6}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateDraft}
                        disabled={!newDraftContent.trim() || isCreating}
                        className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                      >
                        {isCreating ? 'Creating...' : 'Save Draft'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowEditor(false);
                          setNewDraftContent('');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Drafts */}
            {drafts.length > 0 ? (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="border-l-4 border-l-[#1DDCD3]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {draft.ai_generated ? 'AI Generated' : 'Brand Created'} •{' '}
                            {new Date(draft.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {draft.shared_with_influencer ? (
                            <Badge className="bg-green-100 text-green-800">
                              Shared with Influencer
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleShareDraft(draft.id)}
                              disabled={isSharing === draft.id}
                              size="sm"
                              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                            >
                              <Share className="h-3 w-3 mr-1" />
                              {isSharing === draft.id ? 'Sharing...' : 'Share'}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-900 whitespace-pre-wrap">{draft.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    No content requirements created yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create content requirements to guide the influencer on what type of content to create.
                  </p>
                  <Button
                    onClick={() => setShowEditor(true)}
                    className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Draft
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentDraftEditor;
