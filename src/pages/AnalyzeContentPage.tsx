import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Upload, Target, CheckCircle, TrendingUp, Video, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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

  const [contentPurpose, setContentPurpose] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [brandGuidelines, setBrandGuidelines] = useState<string>('');
  const [creativeApproach, setCreativeApproach] = useState<string>('');
  const [platformGoals, setPlatformGoals] = useState<string>('');

  const SidebarComponent = isBrandOrAgency ? BrandSidebar : Sidebar;

  // Load recent analyses from database on component mount
  React.useEffect(() => {
    loadRecentAnalyses();
  }, []);

  const loadRecentAnalyses = async () => {
    try {
      // Use type assertion since we know the table exists but TypeScript doesn't
      const { data, error } = await (supabase as any)
        .from('content_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Transform database records to match expected format
      const transformedAnalyses = data?.map((record: any) => ({
        ...(record.analysis_result || {}),
        fileName: record.file_name,
        analysisDate: record.created_at,
        id: record.id
      })) || [];
      
      setRecentAnalyses(transformedAnalyses);
    } catch (error) {
      console.error('Error loading recent analyses:', error);
    }
  };



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - only videos allowed
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid File Type",
          description: "Only video files are supported for AI analysis",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      setAnalysis(null); // Clear previous analysis
    }
  };

  const uploadVideoFile = async (file: File) => {
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `content-analysis/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('content-analysis')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content-analysis')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload video file');
    }
  };

  const handleAnalyze = async () => {
    // Validate required fields
    if (!selectedFile) {
      toast({
        title: "Missing Video",
        description: "Please select a video file to analyze",
        variant: "destructive"
      });
      return;
    }

    if (!contentPurpose || !targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please provide content purpose and target audience",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Step 1: Upload the video file
      toast({
        title: "Uploading Video",
        description: "Uploading video file to storage...",
      });
      
      const uploadedVideoUrl = await uploadVideoFile(selectedFile);

      // Step 2: Start AI analysis
      toast({
        title: "Starting Analysis",
        description: "Analyzing video with AI (this may take a few minutes)...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: {
          videoUrl: uploadedVideoUrl,
          contentPurpose: contentPurpose,
          targetAudience: targetAudience,
          brandGuidelines: brandGuidelines,
          creativeApproach: creativeApproach,
          platformGoals: platformGoals,
          fileName: selectedFile.name
        }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.analysis);
        
        // Reload recent analyses from database to get the saved record
        await loadRecentAnalyses();
        
        const viralScore = data.analysis.viralScore || data.analysis.overallScore || 0;
        const scoreText = data.analysis.viralScore ? `${viralScore}/10` : `${data.analysis.overallScore || 0}/100`;
        const status = viralScore >= 7 ? "High viral potential!" : 
                     viralScore >= 5 ? "Moderate potential" : 
                     viralScore >= 3 ? "Low potential" : "Needs major improvements";
        
        toast({
          title: "Analysis Complete",
          description: `Video scored ${scoreText} - ${status}`,
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze content. Please try again.",
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

  // Helper function to clean markdown formatting from text
  const cleanMarkdownText = (text: string) => {
    if (!text) return text;
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
      .replace(/#{1,6}\s/g, '')        // Remove # headers
      .replace(/`(.*?)`/g, '$1')       // Remove `code` formatting
      .trim();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <SidebarComponent userName={profile?.name} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Analyzer</h1>
            <p className="text-gray-600">
              Analyze your content performance with AI-powered insights and recommendations
            </p>
          </div>

          {/* Content Analysis Form */}
          <Card className="mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">AI Video Content Analysis</CardTitle>
                  <p className="text-purple-100">
                    Get AI-powered insights on your video content with personalized strategy analysis
                  </p>
                </div>
                <Video className="w-16 h-16 text-purple-200" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Analysis Setup Progress</span>
                  <span className="text-sm text-gray-500">
                    {(selectedFile ? 1 : 0) + (contentPurpose && targetAudience ? 1 : 0)}/2 steps completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((selectedFile ? 1 : 0) + (contentPurpose && targetAudience ? 1 : 0)) * 50}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Step 1: Video Upload */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Upload Your Video
                </h3>
                
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <Input
                        type="file"
                        onChange={handleFileSelect}
                        accept="video/*"
                        className="max-w-md mx-auto file:bg-purple-100 file:text-purple-600 file:border-0 file:rounded-md file:px-3 file:py-1"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Supported formats: MP4, MOV, AVI, WMV (Max 100MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Video className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {selectedFile.type} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Video uploaded successfully</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
                          Change
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetUpload}>
                          Remove
                        </Button>
                      </div>
                    </div>
                    {/* Hidden file input for changing file */}
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      accept="video/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Step 2: Strategy Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm ${
                    contentPurpose && targetAudience ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
                  }`}>
                    {contentPurpose && targetAudience ? '✓' : '2'}
                  </span>
                  Content Strategy Information
                  {contentPurpose && targetAudience && (
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                      Complete
                    </Badge>
                  )}
                </h3>
                <p className="text-gray-600 mb-6">
                  Provide details about your content strategy for personalized AI analysis and recommendations.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Purpose <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={contentPurpose}
                      onChange={(e) => setContentPurpose(e.target.value)}
                      placeholder="e.g., Promote new product launch, increase brand awareness, drive website traffic..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Young professionals aged 25-35, fitness enthusiasts, tech-savvy millennials..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Guidelines
                    </label>
                    <Textarea
                      value={brandGuidelines}
                      onChange={(e) => setBrandGuidelines(e.target.value)}
                      placeholder="e.g., Professional tone, vibrant colors, modern aesthetic, family-friendly content..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creative Approach
                    </label>
                    <Textarea
                      value={creativeApproach}
                      onChange={(e) => setCreativeApproach(e.target.value)}
                      placeholder="e.g., Storytelling format, behind-the-scenes, tutorial style, user-generated content..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Goals
                    </label>
                    <Textarea
                      value={platformGoals}
                      onChange={(e) => setPlatformGoals(e.target.value)}
                      placeholder="e.g., Increase engagement rate, drive conversions, build community, generate leads..."
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Analysis Action */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                      Start Analysis
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${selectedFile ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={selectedFile ? 'text-green-600' : 'text-gray-500'}>
                          Video uploaded
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${contentPurpose && targetAudience ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={contentPurpose && targetAudience ? 'text-green-600' : 'text-gray-500'}>
                          Required fields completed
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !selectedFile || !contentPurpose || !targetAudience}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analyze Video
                      </>
                    )}
                  </Button>
                </div>

                {/* Requirements Notice */}
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div className="text-sm text-purple-700">
                      <p className="font-medium mb-2">Analysis Requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Video files only (MP4, MOV, AVI, etc.)</li>
                        <li>Content purpose and target audience are required</li>
                        <li>Analysis takes 2-5 minutes depending on video length</li>
                        <li>Ensure stable internet connection during analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected File Preview - Now integrated above */}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6 mb-8">
              {/* Overall Score and Recommendation */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Viral Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {analysis.viralScore || analysis.overallScore || 0}/10
                      </div>
                      <Badge 
                        variant={(analysis.viralScore || analysis.overallScore || 0) >= 7 ? "default" : (analysis.viralScore || analysis.overallScore || 0) >= 5 ? "secondary" : "destructive"}
                        className="text-sm"
                      >
                        {(analysis.viralScore || analysis.overallScore || 0) >= 7 ? "High Viral Potential" : 
                         (analysis.viralScore || analysis.overallScore || 0) >= 5 ? "Moderate Potential" : "Low Potential"}
                      </Badge>
                      {analysis.verdict && (
                        <p className="text-sm text-gray-600 mt-3 text-left">
                          {cleanMarkdownText(analysis.verdict)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Viral Audit Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.viralAudit && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Audio Strategy</span>
                            <span className="font-medium">{analysis.viralAudit.audioStrategy?.score || 0}/5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Hook Effectiveness</span>
                            <span className="font-medium">{analysis.viralAudit.hookEffectiveness?.score || 0}/5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Scroll Stopping Power</span>
                            <span className="font-medium">{analysis.viralAudit.scrollStoppingPower?.score || 0}/5</span>
                          </div>
                        </>
                      )}
                      {analysis.scoreBreakdown && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Hook Potential</span>
                            <span className="font-medium">{analysis.scoreBreakdown.hookPotential || 0}/5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Trend Alignment</span>
                            <span className="font-medium">{analysis.scoreBreakdown.trendAlignment || 0}/5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Platform Integration</span>
                            <span className="font-medium">{analysis.scoreBreakdown.platformIntegration || 0}/5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Retention Optimization</span>
                            <span className="font-medium">{analysis.scoreBreakdown.retentionOptimization || 0}/5</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Critical Action */}
              {analysis.criticalAction && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="w-5 h-5" />
                      Critical Action Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-700">{cleanMarkdownText(analysis.criticalAction)}</p>
                  </CardContent>
                </Card>
              )}

              {/* Strengths and Modifications */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.strengths && analysis.strengths.length > 0 ? (
                        analysis.strengths.map((strength: any, index: number) => (
                          <div key={index} className="border-l-4 border-green-500 pl-4">
                            <h4 className="font-medium text-green-800 mb-1">
                              {typeof strength === 'string' ? cleanMarkdownText(strength) : strength.title}
                            </h4>
                            {typeof strength === 'object' && strength.description && (
                              <p className="text-sm text-gray-600 mb-2">{cleanMarkdownText(strength.description)}</p>
                            )}
                            {typeof strength === 'object' && strength.impact && (
                              <p className="text-xs text-green-600 italic">{cleanMarkdownText(strength.impact)}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No strengths identified</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Modifications Needed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analysis.modifications || analysis.suggestions) && (analysis.modifications || analysis.suggestions).length > 0 ? (
                        (analysis.modifications || analysis.suggestions).map((modification: any, index: number) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-start gap-2 mb-1">
                              <h4 className="font-medium text-blue-800 flex-1">
                                {typeof modification === 'string' ? cleanMarkdownText(modification) : modification.title}
                              </h4>
                              {typeof modification === 'object' && modification.priority && (
                                <Badge 
                                  className={`text-xs font-medium px-2 py-1 ${
                                    modification.priority === 'high' 
                                      ? 'bg-red-100 text-red-800 border-red-200' 
                                      : modification.priority === 'medium' 
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                      : 'bg-gray-100 text-gray-800 border-gray-200'
                                  }`}
                                  variant="outline"
                                >
                                  {modification.priority.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            {typeof modification === 'object' && modification.description && (
                              <p className="text-sm text-gray-600 mb-2">{cleanMarkdownText(modification.description)}</p>
                            )}
                            {typeof modification === 'object' && modification.expectedImpact && (
                              <p className="text-xs text-blue-600 italic">{cleanMarkdownText(modification.expectedImpact)}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No modifications needed</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Retention Breakdown */}
              {analysis.retentionBreakdown && (
                <Card>
                  <CardHeader>
                    <CardTitle>Retention Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {Object.entries(analysis.retentionBreakdown).map(([key, value]: [string, any]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-lg font-bold text-blue-600">{value.score}/5</span>
                          </div>
                          <p className="text-xs text-gray-600">{cleanMarkdownText(value.description)}</p>
                          <p className="text-xs text-blue-600 italic">{cleanMarkdownText(value.details)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Platform Optimization */}
              {analysis.platformOptimization && (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {Object.entries(analysis.platformOptimization).map(([key, value]: [string, any]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-lg font-bold text-purple-600">{value.score}/5</span>
                          </div>
                          <p className="text-xs text-gray-600">{cleanMarkdownText(value.description)}</p>
                          <p className="text-xs text-purple-600 italic">{cleanMarkdownText(value.details)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Virality Essentials */}
              {analysis.viralityEssentials && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Virality Checklist
                      <Badge variant="outline">
                        {analysis.viralityEssentials.categories?.reduce((passed: number, cat: any) => 
                          passed + cat.criteria.filter((c: any) => c.passed).length, 0
                        ) || 0} / {analysis.viralityEssentials.categories?.reduce((total: number, cat: any) => 
                          total + cat.criteria.length, 0
                        ) || 0} Passed
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.viralityEssentials.categories?.map((category: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3 flex items-center justify-between">
                            {category.name}
                            <Badge variant="outline" className="text-xs">
                              Weight: {category.weight}
                            </Badge>
                          </h4>
                          <div className="space-y-2">
                            {category.criteria.map((criterion: any, criterionIndex: number) => (
                              <div key={criterionIndex} className="flex items-start gap-3">
                                <div className={`w-4 h-4 rounded-full mt-0.5 ${criterion.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{criterion.name}</p>
                                  <p className="text-xs text-gray-600">{criterion.advice}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
                    recentAnalyses.map((item, index) => {
                      const viralScore = item.viralScore || item.overallScore || 0;
                      const displayScore = item.viralScore ? `${viralScore}/10` : `${item.overallScore || 0}/100`;
                      
                      return (
                        <div 
                          key={item.id || index} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => setAnalysis(item)}
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900">{item.fileName}</span>
                            <div className="text-xs text-gray-500">
                              Score: {displayScore} • {new Date(item.analysisDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {viralScore >= 7 ? '🚀 High Viral Potential' : 
                               viralScore >= 5 ? '⚡ Moderate Potential' : 
                               viralScore >= 3 ? '⚠️ Low Potential' : '❌ Needs Major Work'}
                            </div>
                          </div>
                          <Badge variant={viralScore >= 7 ? "default" : viralScore >= 5 ? "secondary" : "destructive"}>
                            {viralScore >= 7 ? "High" : viralScore >= 5 ? "Medium" : "Low"}
                          </Badge>
                        </div>
                      );
                    })
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