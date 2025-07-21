import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface AIContentAnalysisProps {
  uploadId: string;
  filename: string;
  isVisible?: boolean;
}

// Dummy AI analysis data generator
const generateDummyAnalysis = (filename: string) => {
  const baseScore = 75 + Math.floor(Math.random() * 20); // 75-95 range
  const categories = [
    { name: 'Brand Alignment', score: baseScore + Math.floor(Math.random() * 10) - 5 },
    { name: 'Visual Quality', score: baseScore + Math.floor(Math.random() * 10) - 5 },
    { name: 'Content Relevance', score: baseScore + Math.floor(Math.random() * 10) - 5 },
    { name: 'Engagement Potential', score: baseScore + Math.floor(Math.random() * 10) - 5 }
  ];

  const overallScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length);
  
  const strengths = [
    "Strong visual composition and lighting",
    "Clear product placement and visibility", 
    "Authentic and engaging presentation",
    "Good alignment with brand voice"
  ].slice(0, Math.floor(Math.random() * 2) + 2);

  const suggestions = [
    "Consider adjusting the caption to include more brand-specific keywords",
    "The background could be slightly less cluttered for better focus",
    "Adding a clear call-to-action would improve engagement",
    "Consider using brand colors more prominently"
  ].slice(0, Math.floor(Math.random() * 2) + 1);

  return {
    overallScore,
    categories,
    strengths,
    suggestions,
    recommendation: overallScore >= 80 ? 'approved' : overallScore >= 65 ? 'revision' : 'rejected'
  };
};

const AIContentAnalysis: React.FC<AIContentAnalysisProps> = ({ 
  uploadId, 
  filename, 
  isVisible = true 
}) => {
  if (!isVisible) return null;

  const analysis = generateDummyAnalysis(filename);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">✓ Recommend Approval</Badge>;
      case 'revision':
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ Needs Minor Changes</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">✗ Major Revision Needed</Badge>;
      default:
        return <Badge variant="outline">Under Analysis</Badge>;
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Content Analysis
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <Progress value={category.score} className="h-2" />
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
            Analysis powered by Xfluence AI • Generated in 1.2s
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIContentAnalysis;