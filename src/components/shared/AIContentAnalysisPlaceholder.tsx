import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIContentAnalysisPlaceholderProps {
  contentUrl?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

const AIContentAnalysisPlaceholder: React.FC<AIContentAnalysisPlaceholderProps> = ({ 
  contentUrl, 
  onAnalysisComplete 
}) => {
  return (
    <Card className="border-gray-200 rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-[#1a1f2e]">
          <Zap className="w-5 h-5 text-yellow-500" />
          AI Content Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">AI Analysis Coming Soon</p>
        <p className="text-sm text-gray-500 mt-2 mb-4">
          This feature will provide detailed insights about your content performance.
        </p>
        {contentUrl && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Content URL:</p>
            <p className="text-sm text-gray-700 truncate">{contentUrl}</p>
          </div>
        )}
        <Button variant="outline" disabled>
          Analyze Content
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIContentAnalysisPlaceholder;