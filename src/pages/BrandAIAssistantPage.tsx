
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Lightbulb, Target, TrendingUp } from 'lucide-react';

const BrandAIAssistantPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1DDCD3]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.user_type === 'Influencer') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <BrandSidebar userName={profile?.name} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">AI Assistant</h1>
            <p className="text-gray-600">Get intelligent insights and recommendations for your campaigns</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[#1DDCD3]" />
                  Campaign Optimization
                </CardTitle>
                <CardDescription>AI-powered suggestions to improve campaign performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#1DDCD3] hover:bg-[#1DDCD3]/90">
                  Analyze Current Campaigns
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#1DDCD3]" />
                  Audience Insights
                </CardTitle>
                <CardDescription>Discover new target audiences and demographics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#1DDCD3] hover:bg-[#1DDCD3]/90">
                  Generate Audience Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-[#1DDCD3]" />
                  Content Ideas
                </CardTitle>
                <CardDescription>Get creative content suggestions for your brand</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#1DDCD3] hover:bg-[#1DDCD3]/90">
                  Generate Ideas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#1DDCD3]" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>Stay ahead with current market trends</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#1DDCD3] hover:bg-[#1DDCD3]/90">
                  View Trends
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
              <CardDescription>Ask questions about your campaigns, influencers, or marketing strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  AI Chat functionality coming soon!<br />
                  This will allow you to have conversations with our AI assistant.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandAIAssistantPage;
