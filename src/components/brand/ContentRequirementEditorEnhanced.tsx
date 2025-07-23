import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, Brain, Wand2, Send, RefreshCw } from 'lucide-react';
import { taskWorkflowService } from '@/services/taskWorkflowService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface ContentRequirementEditorEnhancedProps {
  taskId: string;
  onRequirementsShared: () => void;
}

const ContentRequirementEditorEnhanced: React.FC<ContentRequirementEditorEnhancedProps> = ({
  taskId,
  onRequirementsShared
}) => {
  const [requirements, setRequirements] = useState('');
  const [aiRequirements, setAiRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
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

  const generateAIRequirements = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation with realistic content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedContent = `🎯 CONTENT REQUIREMENTS

📱 Platform: Instagram Reel/Post
⏱️ Duration: 15-30 seconds (for Reel) or high-quality static post
🎨 Style: Authentic, lifestyle-focused, natural lighting

📝 CONTENT GUIDELINES:
• Feature the product naturally in your daily routine
• Show the product being used or worn authentically
• Include at least 2-3 close-up shots highlighting key features
• Maintain your personal brand aesthetic while showcasing our product

💬 CAPTIONS & MESSAGING:
• Start with a hook that relates to your audience's pain points
• Share your genuine experience with the product
• Include product benefits naturally in your story
• End with a clear call-to-action

🏷️ REQUIRED HASHTAGS:
#brandpartner #productname #collaboration
+ 5-8 relevant hashtags from your niche

📍 MENTIONS:
• Tag @brandusername in both post and story
• Use branded hashtag #campaignhashtag

📊 DELIVERABLES:
• 1 Instagram Reel OR 1 high-quality post
• 1 Instagram story featuring the product
• Submit analytics 48 hours after posting

⚠️ COMPLIANCE:
• Include #ad or #sponsored in caption
• Follow FTC guidelines for sponsored content
• Ensure content aligns with brand values and guidelines

📅 TIMELINE:
• Content submission: Within 7 days
• Revisions (if needed): 2-3 days
• Publishing: After brand approval`;

      setAiRequirements(generatedContent);
      setActiveTab('ai');
      
      toast({
        title: "AI Requirements Generated!",
        description: "Review and customize the AI-generated content requirements.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      console.error('Error generating AI requirements:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI requirements",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const refineWithAI = async () => {
    if (!requirements.trim()) {
      toast({
        title: "Error",
        description: "Please enter some requirements to refine",
        variant: "destructive"
      });
      return;
    }

    setIsRefining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate AI refinement
      const refinedContent = requirements + `

🤖 AI ENHANCEMENTS:
• Added specific timeline expectations for deliverables
• Included compliance guidelines for sponsored content
• Suggested optimal hashtag strategy for maximum reach
• Recommended content structure for better engagement
• Added technical specifications for image/video quality

💡 ADDITIONAL SUGGESTIONS:
• Consider requesting behind-the-scenes content for authenticity
• Ask for user-generated content permissions for reposting
• Include specific brand colors/aesthetics guidelines if applicable`;

      setRequirements(refinedContent);
      
      toast({
        title: "Requirements Refined!",
        description: "AI has enhanced your requirements with best practices.",
        className: "bg-blue-50 border-blue-200"
      });
    } catch (error) {
      console.error('Error refining requirements:', error);
      toast({
        title: "Error",
        description: "Failed to refine requirements",
        variant: "destructive"
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleShare = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content requirements before sharing",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await taskWorkflowService.shareContentRequirements(taskId, content);
      
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
          <div className="space-y-6">
            <div>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">
                Ready to Create Content Requirements?
              </h3>
              <p className="text-gray-600 mb-4">
                Choose how you'd like to create content requirements for this campaign.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors cursor-pointer" 
                    onClick={handleStart}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                  <h4 className="font-medium mb-2">Manual Creation</h4>
                  <p className="text-sm text-gray-600">Write requirements yourself with optional AI refinement</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => { handleStart(); setTimeout(() => generateAIRequirements(), 500); }}>
                <CardContent className="p-6 text-center">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium mb-2">AI Generation</h4>
                  <p className="text-sm text-gray-600">Let AI create comprehensive requirements for you</p>
                </CardContent>
              </Card>
            </div>
          </div>
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
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Enhanced
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual + AI Refine</TabsTrigger>
            <TabsTrigger value="ai">AI Generated</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Content Requirements & Guidelines
                </label>
                <Button
                  onClick={refineWithAI}
                  variant="outline"
                  size="sm"
                  disabled={isRefining || !requirements.trim()}
                >
                  {isRefining ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Refine with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Enter your content requirements, or start typing and use AI to refine them..."
                rows={12}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => handleShare(requirements)}
                disabled={isSubmitting || !requirements.trim()}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Share Requirements with Influencer
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            {!aiRequirements ? (
              <div className="text-center py-8">
                <Card className="border-2 border-dashed border-blue-200">
                  <CardContent className="p-8">
                    <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      Generate AI Requirements
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Our AI will create comprehensive content requirements based on best practices and campaign goals.
                    </p>
                    <Button 
                      onClick={generateAIRequirements}
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      AI Generated Requirements
                    </label>
                    <Button
                      onClick={generateAIRequirements}
                      variant="outline"
                      size="sm"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={aiRequirements}
                    onChange={(e) => setAiRequirements(e.target.value)}
                    rows={15}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <Brain className="h-3 w-3 inline mr-1" />
                    Generated by AI • Feel free to edit and customize before sharing
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleShare(aiRequirements)}
                    disabled={isSubmitting || !aiRequirements.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Share AI Requirements
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">AI-Powered Content Requirements</p>
              <p className="text-xs text-blue-700">
                Our AI creates comprehensive requirements including compliance guidelines, engagement optimization, 
                and platform-specific best practices. You can always edit and customize before sharing.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentRequirementEditorEnhanced;