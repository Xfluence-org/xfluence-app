
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Eye } from 'lucide-react';

const CampaignReviewPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<any>(null);
  const [campaignResults, setCampaignResults] = useState<any>(null);

  useEffect(() => {
    // Load campaign data from localStorage
    const tempCampaign = localStorage.getItem('temp_campaign');
    const tempResults = localStorage.getItem('temp_campaign_results');
    
    if (tempCampaign) {
      setCampaignData(JSON.parse(tempCampaign));
    }
    
    if (tempResults) {
      setCampaignResults(JSON.parse(tempResults));
    }
  }, []);

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

  const handleSaveCampaign = () => {
    // TODO: Implement actual campaign saving
    console.log('Saving campaign:', campaignData);
    console.log('Campaign results:', campaignResults);
    
    // Clear temporary data
    localStorage.removeItem('temp_campaign');
    localStorage.removeItem('temp_campaign_results');
    
    // Navigate to campaigns page
    navigate('/brand/campaigns');
  };

  const handleGoBack = () => {
    navigate('/brand/campaigns');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <BrandSidebar userName={profile?.name} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#1a1f2e]">Campaign Review</h1>
                <p className="text-gray-600">Review your AI-generated campaign strategy</p>
              </div>
            </div>
            <Button onClick={handleSaveCampaign} className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90">
              <Save className="h-4 w-4 mr-2" />
              Save Campaign
            </Button>
          </div>

          {campaignData ? (
            <div className="space-y-6">
              {/* Campaign Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                      <p className="text-gray-900">{campaignData.brand_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Influencers</label>
                      <p className="text-gray-900">{campaignData.total_influencers}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                      <p className="text-gray-900">${campaignData.budget_min} - ${campaignData.budget_max}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <p className="text-gray-900">{campaignData.due_date}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goals</label>
                    <p className="text-gray-900">{campaignData.goals}</p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{campaignData.campaign_description}</p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {campaignData.categories?.map((category: string, index: number) => (
                        <span key={index} className="bg-[#1DDCD3] text-white px-2 py-1 rounded text-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Strategy Results */}
              {campaignResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-[#1DDCD3]" />
                      AI-Generated Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {JSON.stringify(campaignResults, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No campaign data available for review.</p>
                <Button onClick={handleGoBack} className="mt-4">
                  Go to Campaigns
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignReviewPage;
