import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Upload, Zap, Target } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import BrandSidebar from '@/components/brand/BrandSidebar';
import Sidebar from '@/components/dashboard/Sidebar';

const AnalyzeContentPage = () => {
  const { profile } = useAuth();
  const isBrandOrAgency = profile?.user_type === 'Brand' || profile?.user_type === 'Agency';

  const SidebarComponent = isBrandOrAgency ? BrandSidebar : Sidebar;

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
                  <Button className="bg-white text-purple-600 hover:bg-purple-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Content for Analysis
                  </Button>
                </div>
                <BarChart3 className="w-24 h-24 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Track engagement rates, reach, and audience interaction patterns
                </p>
                <Button variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Content Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get AI recommendations for improving content performance
                </p>
                <Button variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Identify trending topics and optimal posting times
                </p>
                <Button variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder Analysis Dashboard */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">No content analyzed yet</span>
                    <Button size="sm" variant="ghost">
                      Upload First Content
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="ghost">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image/Video
                  </Button>
                  <Button className="w-full justify-start" variant="ghost">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="ghost">
                    <Target className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </Button>
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