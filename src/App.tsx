import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BrandDashboardPage from './pages/BrandDashboardPage';
import BrandCampaignsPage from './pages/BrandCampaignsPage';
import BrandApplicationsPage from './pages/BrandApplicationsPage';
import InfluencerProfilePage from './pages/InfluencerProfilePage';
import TaskManagementPage from '@/pages/TaskManagementPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/brand-dashboard" element={<BrandDashboardPage />} />
            <Route path="/brand-campaigns" element={<BrandCampaignsPage />} />
            <Route path="/brand-applications" element={<BrandApplicationsPage />} />
            <Route path="/influencer-profile/:id" element={<InfluencerProfilePage />} />
            <Route path="/task-management" element={<TaskManagementPage />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
