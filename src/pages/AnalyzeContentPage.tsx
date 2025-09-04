import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Upload, Zap, Target, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import BrandSidebar from '@/components/brand/BrandSidebar';
import Sidebar from '@/components/dashboard/Sidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AnalyzeContentPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isBrandOrAgency = profile?.user_type === 'Brand' || profile?.user_type === 'Agency';
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  const SidebarComponent = isBrandOrAgency ? BrandSidebar : Sidebar;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis(null); // Clear previous analysis
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        }
      });

      if (error) throw error;

      setAnalysis(data);
      setRecentAnalyses(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 analyses
      
      toast({
        title: "Analysis Complete",
        description: `Content scored ${data.score}/100`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setAnalysis(null);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <SidebarComponent userName={profile?.name} />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Analyzer</h1>
            <p className="text-gray-600">
              Analyze your content performance with AI-powered insights and recommendations
            </p>
          </div>

          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">AI-Powered Content Analysis</h2>
                  <p className="text-purple-100 mb-4">
                    Get instant insights on engagement, reach, and optimization opportunities
                  </p>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,.txt,.pdf,.doc,.docx"
                      className="bg-white text-purple-600 file:bg-purple-100 file:text-purple-600 file:border-0 file:rounded-md file:px-3 file:py-1"
                    />
                    {selectedFile && (
                      <Button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-purple-700 hover:bg-purple-800 text-white"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
                      </Button>
                    )}
                  </div>
                </div>
                <BarChart3 className="w-24 h-24 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          {/* Selected File Preview */}
          {selectedFile && (
            <Card className="mb-8 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedFile.type} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={resetUpload}>
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Overall Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {analysis.score}/100
                    </div>
                    <Badge 
                      variant={analysis.score >= 80 ? "default" : analysis.score >= 60 ? "secondary" : "destructive"}
                      className="text-sm"
                    >
                      {analysis.score >= 80 ? "Excellent" : analysis.score >= 60 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.insights?.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder Analysis Dashboard */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.length === 0 ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">No content analyzed yet</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                      >
                        Upload First Content
                      </Button>
                    </div>
                  ) : (
                    recentAnalyses.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{item.fileName}</span>
                          <div className="text-xs text-gray-500">
                            Score: {item.score}/100 • {new Date(item.analysisDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={item.score >= 80 ? "default" : "secondary"}>
                          {item.score >= 80 ? "Excellent" : "Good"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost"
                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Content
                  </Button>
                  {analysis && (
                    <Button className="w-full justify-start" variant="ghost">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Full Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyzeContentPage;