import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Upload, Zap, Target, FileText, X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import BrandSidebar from '@/components/brand/BrandSidebar';
import Sidebar from '@/components/dashboard/Sidebar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AnalyzeContentPage = () => {
  const { profile } = useAuth();
  const isBrandOrAgency = profile?.user_type === 'Brand' || profile?.user_type === 'Agency';
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  const SidebarComponent = isBrandOrAgency ? BrandSidebar : Sidebar;

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['image/', 'video/', 'text/', 'application/pdf'];
    if (!validTypes.some(type => file.type.startsWith(type))) {
      toast.error('Please select a valid file type (image, video, text, or PDF)');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setAnalysisResults(null);
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const analyzeContent = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: formData,
      });

      if (error) throw error;

      setAnalysisResults(data);
      setRecentAnalyses(prev => [data, ...prev.slice(0, 4)]);
      toast.success('Content analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
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

          {/* Upload Section */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                    selectedFile ? 'border-purple-300 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <span className="text-lg font-medium text-gray-900">{selectedFile.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        onClick={analyzeContent}
                        disabled={isAnalyzing}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Analyze Content
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Upload your content for AI analysis
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Drag and drop your file here, or click to browse
                        </p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*,video/*,text/*,.pdf"
                          />
                          <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                            Choose File
                          </Button>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Supports images, videos, text files, and PDFs (max 50MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {analysisResults && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Check className="w-5 h-5" />
                    Overall Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analysisResults.overall_score}/100
                    </div>
                    <p className="text-sm text-green-700">
                      {analysisResults.overall_score >= 85 ? 'Excellent' : 
                       analysisResults.overall_score >= 70 ? 'Good' : 'Needs Improvement'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Zap className="w-5 h-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {analysisResults.key_insights?.slice(0, 3).map((insight: string, index: number) => (
                      <li key={index} className="text-blue-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Target className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {analysisResults.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                      <li key={index} className="text-purple-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dashboard */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.length > 0 ? (
                    recentAnalyses.map((analysis, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{analysis.file_name}</p>
                          <p className="text-xs text-gray-600">Score: {analysis.overall_score}/100</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(analysis.analyzed_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">No content analyzed yet</span>
                    </div>
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
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*,text/*,.pdf"
                    />
                    <Button className="w-full justify-start" variant="ghost">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Content
                    </Button>
                  </label>
                  {analysisResults && (
                    <Button 
                      className="w-full justify-start" 
                      variant="ghost"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
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