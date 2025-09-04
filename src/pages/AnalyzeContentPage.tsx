import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Upload, BarChart3, TrendingUp } from 'lucide-react';

const AnalyzeContentPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Content Analyzer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your content and get instant AI-powered insights on performance, engagement potential, and optimization recommendations.
          </p>
        </div>

        {/* Main Action Card */}
        <Card className="max-w-2xl mx-auto border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Analyze Your Content
            </CardTitle>
            <CardDescription>
              Get detailed insights and recommendations for your social media content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Content</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop images, videos, or paste text content
              </p>
              <Button className="w-full max-w-xs">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Performance Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Get predicted engagement rates and performance scores
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Optimization Tips</h3>
              <p className="text-sm text-muted-foreground">
                Receive AI-powered suggestions to improve your content
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Instant Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get results in seconds with our advanced AI models
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="max-w-md mx-auto bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold text-primary mb-2">Coming Soon!</h3>
            <p className="text-sm text-muted-foreground">
              This feature is currently in development. Full functionality will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyzeContentPage;