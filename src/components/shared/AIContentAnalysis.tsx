
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, AlertCircle, Zap, Image as ImageIcon, Video, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface AIContentAnalysisProps {
  uploadId: string;
  filename: string;
  fileUrl?: string;
  isVisible?: boolean;
  taskId?: string;
  campaignId?: string;
}

interface AnalysisResult {
  overallScore: number;
  categories: Array<{
    name: string;
    score: number;
  }>;
  strengths: string[];
  suggestions: string[];
  recommendation: 'approved' | 'revision' | 'rejected';
  contentType: 'image' | 'video' | 'unknown';
  technicalQuality: {
    resolution: string;
    composition: string;
    lighting: string;
  };
}

interface CategoryScores {
  brand_alignment: number;
  visual_quality: number;
  content_relevance: number;
  engagement_potential: number;
}

// Dummy AI analysis generator with consistent scoring
const generateDummyAnalysis = (filename: string, fileUrl?: string): AnalysisResult => {
  const isVideo = filename.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);
  const isImage = filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
  
  const contentType = isVideo ? 'video' : isImage ? 'image' : 'unknown';
  
  // Generate consistent dummy scores based on filename hash
  const fileHash = filename.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const baseScore = 75 + Math.abs(fileHash % 20); // 75-95 range
  const variation = () => Math.abs(fileHash % 10) - 5; // -5 to +5
  
  const categories = [
    { name: 'Brand Alignment', score: Math.max(65, Math.min(95, baseScore + variation())) },
    { name: 'Visual Quality', score: Math.max(70, Math.min(98, baseScore + variation() + 2)) },
    { name: 'Content Relevance', score: Math.max(60, Math.min(92, baseScore + variation() - 3)) },
    { name: 'Engagement Potential', score: Math.max(65, Math.min(96, baseScore + variation() + 1)) }
  ];

  if (contentType === 'video') {
    categories.push(
      { name: 'Audio Quality', score: Math.max(70, Math.min(95, baseScore + variation())) },
      { name: 'Video Editing', score: Math.max(65, Math.min(90, baseScore + variation() - 2)) }
    );
  }

  const overallScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length);
  
  // Dummy strengths based on content type
  const imageStrengths = [
    "Excellent lighting and exposure balance",
    "Strong composition following rule of thirds",
    "Clear product visibility and focus",
    "Authentic and natural presentation",
    "Good color balance and saturation",
    "Professional image quality and sharpness"
  ];

  const videoStrengths = [
    "Smooth camera movements and stable footage",
    "Clear audio quality throughout",
    "Engaging storytelling and pacing",
    "Good transition effects and editing",
    "Consistent lighting and exposure",
    "Natural and authentic delivery"
  ];

  // Select 2-3 dummy strengths
  const allStrengths = contentType === 'video' ? videoStrengths : imageStrengths;
  const strengthCount = 2 + Math.abs(fileHash % 2);
  const strengths = allStrengths.slice(0, strengthCount);

  // Dummy suggestions
  const imageSuggestions = [
    "Consider adding more brand logo visibility",
    "The background could be less cluttered for better focus",
    "Adding a clear call-to-action overlay would improve engagement",
    "Consider using brand colors more prominently in the styling"
  ];

  const videoSuggestions = [
    "Consider adding brand mention in the first 3 seconds",
    "The intro could be more engaging to hook viewers",
    "Adding captions would improve accessibility",
    "Consider shorter duration for better retention"
  ];

  const allSuggestions = contentType === 'video' ? videoSuggestions : imageSuggestions;
  const suggestionCount = overallScore < 85 ? 1 + Math.abs(fileHash % 2) : 0;
  const suggestions = allSuggestions.slice(0, suggestionCount);

  const recommendation = overallScore >= 85 ? 'approved' : overallScore >= 70 ? 'revision' : 'rejected';

  // Dummy technical quality
  const resolutions = ['1080p HD', '4K Ultra HD', '720p HD', '1440p QHD'];
  const compositions = ['Well-balanced', 'Good framing', 'Excellent', 'Professional'];
  const lightingTypes = ['Natural lighting', 'Professional setup', 'Good exposure', 'Optimal conditions'];

  const technicalQuality = {
    resolution: resolutions[Math.abs(fileHash) % resolutions.length],
    composition: compositions[Math.abs(fileHash) % compositions.length],
    lighting: lightingTypes[Math.abs(fileHash) % lightingTypes.length]
  };

  return {
    overallScore,
    categories,
    strengths,
    suggestions,
    recommendation,
    contentType,
    technicalQuality
  };
};

const AIContentAnalysis: React.FC<AIContentAnalysisProps> = ({ 
  uploadId, 
  filename, 
  fileUrl,
  isVisible = true,
  taskId,
  campaignId
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [useRealAnalysis, setUseRealAnalysis] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const analyzeContent = async (forceRealAnalysis = false) => {
      setAnalyzing(true);
      
      // Check if we should use real analysis (only for video files with required IDs)
      const isVideo = filename.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);
      const canUseRealAnalysis = isVideo && taskId && campaignId;
      
      if (canUseRealAnalysis || forceRealAnalysis) {
        try {
          // First check if analysis already exists in database
          const { data: existingAnalysis } = await supabase
            .from('content_ai_analysis')
            .select('*')
            .eq('upload_id', uploadId)
            .single();
            
          if (existingAnalysis) {
            // Use existing analysis
            const result: AnalysisResult = {
              overallScore: existingAnalysis.overall_score,
              categories: [
                { name: 'Brand Alignment', score: existingAnalysis.category_scores?.brand_alignment || 0 },
                { name: 'Visual Quality', score: existingAnalysis.category_scores?.visual_quality || 0 },
                { name: 'Content Relevance', score: existingAnalysis.category_scores?.content_relevance || 0 },
                { name: 'Engagement Potential', score: existingAnalysis.category_scores?.engagement_potential || 0 }
              ],
              strengths: existingAnalysis.strengths || [],
              suggestions: existingAnalysis.suggestions || [],
              recommendation: existingAnalysis.recommendation,
              contentType: existingAnalysis.content_type || 'video',
              technicalQuality: existingAnalysis.technical_quality || {
                resolution: '1080p HD',
                composition: 'Well-balanced',
                lighting: 'Natural lighting'
              }
            };
            setAnalysis(result);
            setUseRealAnalysis(true);
          } else {
            // Call edge function for new analysis
            console.log('Calling analyze-content edge function...');
            const { data, error } = await supabase.functions.invoke('analyze-content', {
              body: { uploadId, taskId, campaignId }
            });
            
            if (error) throw error;
            
            if (data?.analysis) {
              const scores = data.analysis.scores as CategoryScores;
              const result: AnalysisResult = {
                overallScore: data.analysis.overallScore,
                categories: [
                  { name: 'Brand Alignment', score: scores.brand_alignment },
                  { name: 'Visual Quality', score: scores.visual_quality },
                  { name: 'Content Relevance', score: scores.content_relevance },
                  { name: 'Engagement Potential', score: scores.engagement_potential }
                ],
                strengths: data.analysis.strengths,
                suggestions: data.analysis.suggestions,
                recommendation: data.analysis.recommendation,
                contentType: data.analysis.contentType,
                technicalQuality: data.analysis.technicalQuality
              };
              setAnalysis(result);
              setUseRealAnalysis(true);
              
              toast({
                title: "AI Analysis Complete",
                description: "Content has been analyzed using TwelveLabs AI",
                className: "bg-green-50 border-green-200"
              });
            }
          }
        } catch (error) {
          console.error('Error with real AI analysis:', error);
          toast({
            title: "AI Analysis Error",
            description: "Falling back to demo analysis",
            variant: "destructive"
          });
          // Fall back to dummy analysis
          const result = generateDummyAnalysis(filename, fileUrl);
          setAnalysis(result);
          setUseRealAnalysis(false);
        }
      } else {
        // Use dummy analysis for non-video files or missing IDs
        setTimeout(() => {
          const result = generateDummyAnalysis(filename, fileUrl);
          setAnalysis(result);
          setUseRealAnalysis(false);
        }, 1500 + Math.random() * 1000);
      }
      
      setAnalyzing(false);
    };

  useEffect(() => {
    analyzeContent();
  }, [filename, fileUrl, uploadId, taskId, campaignId]);

  const handleReanalyze = async () => {
    if (!taskId || !campaignId) {
      toast({
        title: "Missing Information",
        description: "Task ID and Campaign ID are required for AI analysis",
        variant: "destructive"
      });
      return;
    }

    setIsReanalyzing(true);
    try {
      // Delete existing analysis if any
      const { error: deleteError } = await supabase
        .from('content_ai_analysis')
        .delete()
        .eq('upload_id', uploadId);

      if (deleteError) {
        console.error('Error deleting existing analysis:', deleteError);
      }

      // Call edge function for new analysis
      console.log('Re-analyzing content with edge function...');
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: { uploadId, taskId, campaignId }
      });
      
      if (error) throw error;
      
      if (data?.analysis) {
        const scores = data.analysis.scores as CategoryScores;
        const result: AnalysisResult = {
          overallScore: data.analysis.overallScore,
          categories: [
            { name: 'Brand Alignment', score: scores.brand_alignment },
            { name: 'Visual Quality', score: scores.visual_quality },
            { name: 'Content Relevance', score: scores.content_relevance },
            { name: 'Engagement Potential', score: scores.engagement_potential }
          ],
          strengths: data.analysis.strengths,
          suggestions: data.analysis.suggestions,
          recommendation: data.analysis.recommendation,
          contentType: data.analysis.contentType,
          technicalQuality: data.analysis.technicalQuality
        };
        setAnalysis(result);
        setUseRealAnalysis(true);
        
        toast({
          title: "Analysis Complete",
          description: "Content has been re-analyzed using AI",
          className: "bg-green-50 border-green-200"
        });
      }
    } catch (error) {
      console.error('Error with re-analysis:', error);
      toast({
        title: "Re-analysis Failed",
        description: "Could not re-analyze content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (!isVisible) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Recommend Approval</Badge>;
      case 'revision':
        return <Badge className="bg-yellow-100 text-yellow-800">Minor Improvements Needed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Major Revision Required</Badge>;
      default:
        return <Badge variant="outline">Analyzing...</Badge>;
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-green-600" />;
      default:
        return <Brain className="h-4 w-4 text-purple-600" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Content Analysis {!useRealAnalysis && '(Demo)'}
            <Zap className="h-4 w-4 text-yellow-500" />
            {analysis && getContentTypeIcon(analysis.contentType)}
          </CardTitle>
          {!useRealAnalysis && profile?.user_type !== 'Influencer' && !analyzing && (
            <Button
              onClick={handleReanalyze}
              disabled={isReanalyzing || !taskId || !campaignId}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              {isReanalyzing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Re-analyze with AI
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyzing || !analysis ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Analyzing content with AI...</p>
              <p className="text-sm text-gray-500 mt-1">
                {useRealAnalysis ? 'Processing with TwelveLabs AI' : 'Generating demo analysis'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Overall Score */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Overall Score (Demo)</p>
                <p className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}/100
                </p>
              </div>
              <div className="text-right">
                {getRecommendationBadge(analysis.recommendation)}
              </div>
            </div>

            {/* Technical Quality */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-white/50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-500">Resolution</p>
                <p className="text-sm font-medium">{analysis.technicalQuality.resolution}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Composition</p>
                <p className="text-sm font-medium">{analysis.technicalQuality.composition}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Lighting</p>
                <p className="text-sm font-medium">{analysis.technicalQuality.lighting}</p>
              </div>
            </div>

            {/* Category Scores */}
            <div className="space-y-3">
              <p className="font-medium text-gray-900">Detailed Analysis</p>
              {analysis.categories.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{category.name}</span>
                    <span className={`font-medium ${getScoreColor(category.score)}`}>
                      {category.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(category.score)}`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="font-medium text-gray-900">Strengths</p>
              </div>
              <ul className="space-y-1">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <p className="font-medium text-gray-900">AI Suggestions</p>
                </div>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 p-3 bg-white/50 rounded-lg border">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI Analysis • 
                {analysis.contentType.charAt(0).toUpperCase() + analysis.contentType.slice(1)} content detected
                {!useRealAnalysis && ' • This is test data for development'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIContentAnalysis;
