
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Target, Users, BarChart, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBrandDashboardData } from '@/hooks/useBrandDashboardData';

const BrandDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { campaigns, metrics, loading, error } = useBrandDashboardData();

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar userName="Brand Manager" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading dashboard data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar userName="Brand Manager" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error loading dashboard: {error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar userName="Brand Manager" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Brand Dashboard</h1>
            <p className="text-gray-600">Welcome, {profile?.name}! Here's an overview of your campaigns and activities.</p>
          </header>

          {/* Quick Actions */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-[#1a1f2e]">
                        {metrics.activeCampaigns}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Campaigns currently in progress</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/brand-campaigns?tab=Active')}
                  >
                    View Campaigns
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                      <p className="text-2xl font-bold text-[#1a1f2e]">
                        {metrics.pendingApplications}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Influencer applications awaiting review</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                    onClick={() => navigate('/brand-applications')}
                  >
                    Review Applications
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed Campaigns</p>
                      <p className="text-2xl font-bold text-[#1a1f2e]">
                        {metrics.completedCampaigns}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Campaigns that have reached completion</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Home className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => navigate('/brand-campaigns?tab=Completed')}
                  >
                    View Completed
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Task Management</p>
                      <p className="text-2xl font-bold text-[#1a1f2e]">
                        {campaigns.length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Active Tasks</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => navigate('/task-management')}
                  >
                    Manage Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Campaign Overview */}
          <section>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6">Campaign Overview</h2>
              
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No campaigns found.</p>
                  <p className="text-gray-400 mt-2">Create a new campaign to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-[#1a1f2e] mb-2">{campaign.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">Status: {campaign.status}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Budget: ${campaign.budget}</span>
                          <span>Progress: {campaign.progress}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboardPage;
