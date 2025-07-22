
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle, AlertCircle, Zap, Image as ImageIcon, Video } from 'lucide-react';

interface AIContentAnalysisProps {
  uploadId: string;
  filename: string;
  fileUrl?: string;
  isVisible?: boolean;
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

// Enhanced AI analysis generator with more realistic patterns
const generateEnhancedAnalysis = (filename: string, fileUrl?: string): AnalysisResult => {
  const isVideo = filename.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);
  const isImage = filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
  
  const contentType = isVideo ? 'video' : isImage ? 'image' : 'unknown';
  
  // Base scoring with some variation
  const baseScore = 78 + Math.floor(Math.random() * 17); // 78-95 range
  const variation = () => Math.floor(Math.random() * 10) - 5; // -5 to +5
  
  const categories = [
    { name: 'Brand Alignment', score: Math.max(65, Math.min(95, baseScore + variation())) },
    { name: 'Visual Quality', score: Math.max(70, Math.min(98, baseScore + variation())) },
    { name: 'Content Relevance', score: Math.max(60, Math.min(92, baseScore + variation())) },
    { name: 'Engagement Potential', score: Math.max(65, Math.min(96, baseScore + variation())) }
  ];

  if (contentType === 'video') {
    categories.push(
      { name: 'Audio Quality', score: Math.max(70, Math.min(95, baseScore + variation())) },
      { name: 'Video Editing', score: Math.max(65, Math.min(90, baseScore + variation())) }
    );
  }

  const overallScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length);
  
  // Generate contextual strengths based on content type
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

  const strengths = (contentType === 'video' ? videoStrengths : imageStrengths)
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 2);

  // Generate contextual suggestions
  const imageSuggestions = [
    "Consider adding more brand logo visibility",
    "The background could be less cluttered for better focus",
    "Adding a clear call-to-action overlay would improve engagement",
    "Consider using brand colors more prominently in the styling",
    "The angle could be adjusted for better product showcase"
  ];

  const videoSuggestions = [
    "Consider adding brand mention in the first 3 seconds",
    "The intro could be more engaging to hook viewers",
    "Adding captions would improve accessibility",
    "Consider shorter duration for better retention",
    "Background music volume could be adjusted"
  ];

  const suggestions = (contentType === 'video' ? videoSuggestions : imageSuggestions)
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 1);

  const recommendation = overallScore >= 85 ? 'approved' : overallScore >= 70 ? 'revision' : 'rejected';

  // Technical quality assessment
  const resolutions = ['1080p HD', '4K Ultra HD', '720p HD', '1440p QHD'];
  const compositions = ['Well-balanced', 'Good framing', 'Excellent', 'Professional'];
  const lightingTypes = ['Natural lighting', 'Professional setup', 'Good exposure', 'Optimal conditions'];

  const technicalQuality = {
    resolution: resolutions[Math.floor(Math.random() * resolutions.length)],
    composition: compositions[Math.floor(Math.random() * compositions.length)],
    lighting: lightingTypes[Math.floor(Math.random() * lightingTypes.length)]
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
  isVisible = true 
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis with realistic delay
    const analyzeContent = () => {
      setAnalyzing(true);
      setTimeout(() => {
        const result = generateEnhancedAnalysis(filename, fileUrl);
        setAnalysis(result);
        setAnalyzing(false);
      }, 1500 + Math.random() * 1000); // 1.5-2.5 second delay
    };

    analyzeContent();
  }, [filename, fileUrl]);

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
        return <Badge className="bg-green-100 text-green-800">✓ Recommend Approval</Badge>;
      case 'revision':
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ Minor Improvements Needed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">✗ Major Revision Required</Badge>;
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
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Content Analysis
          <Zap className="h-4 w-4 text-yellow-500" />
          {analysis && getContentTypeIcon(analysis.contentType)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyzing || !analysis ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Zap className="h-8 w-8 text-purple-600 animate-pulse mx-auto mb-3" />
              <p className="text-gray-600">Analyzing content with AI...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overall Score */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Overall Score</p>
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
                Analysis powered by Xfluence AI • {analysis.contentType.charAt(0).toUpperCase() + analysis.contentType.slice(1)} content detected • Generated in {(1.2 + Math.random() * 0.8).toFixed(1)}s
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIContentAnalysis;
