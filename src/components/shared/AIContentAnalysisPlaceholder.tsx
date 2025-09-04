import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

interface AIContentAnalysisPlaceholderProps {
  taskId: string;
}

const AIContentAnalysisPlaceholder: React.FC<AIContentAnalysisPlaceholderProps> = ({ taskId }) => {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Content Performance Analysis
          </CardTitle>
          <CardDescription>
            AI-powered insights for your content (Feature coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">85</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Overall Score</h3>
              <p className="text-muted-foreground">Good performance potential</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Visual Appeal', score: 88, icon: Eye },
              { label: 'Engagement Potential', score: 82, icon: Heart },
              { label: 'Message Clarity', score: 90, icon: MessageCircle },
              { label: 'Shareability', score: 78, icon: Share2 }
            ].map((category) => (
              <div key={category.label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{category.label}</span>
                </div>
                <Badge variant="outline">{category.score}/100</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Strong visual composition and color balance</li>
              <li>• Clear and compelling call-to-action</li>
              <li>• Good use of trending hashtags</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-amber-600 mb-2">Suggestions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Consider adding more engaging captions</li>
              <li>• Optimal posting time: 6-8 PM</li>
              <li>• Include user-generated content elements</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              This is a preview - Full analysis coming soon!
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIContentAnalysisPlaceholder;