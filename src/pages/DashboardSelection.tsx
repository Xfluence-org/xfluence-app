
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const DashboardSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleInfluencerDashboard = () => {
    navigate('/dashboard');
  };

  const handleBrandDashboard = () => {
    navigate('/brand-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1a1f2e] mb-2">Choose Your Dashboard</h1>
          <p className="text-gray-600">Select the dashboard type that matches your role</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleInfluencerDashboard}
            className="w-full h-16 bg-[#1DDCD3] hover:bg-[#00D4C7] text-white rounded-xl font-medium text-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <span className="text-2xl">📱</span>
            <span>Influencer Dashboard</span>
          </Button>

          <Button
            onClick={handleBrandDashboard}
            className="w-full h-16 bg-[#1a1f2e] hover:bg-[#252b3b] text-white rounded-xl font-medium text-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <span className="text-2xl">🏢</span>
            <span>Brand/Agency Dashboard</span>
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This selection is temporary until authentication is properly configured
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelection;
