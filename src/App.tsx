
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import BrandDashboardPage from './pages/BrandDashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import BrandCampaignsPage from './pages/BrandCampaignsPage';
import BrandApplicationsPage from './pages/BrandApplicationsPage';
import TaskManagementPage from '@/pages/TaskManagementPage';
import OpportunitiesPage from './pages/OpportunitiesPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/" element={<BrandDashboardPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/brand-dashboard" element={<BrandDashboardPage />} />
            <Route path="/brand-campaigns" element={<BrandCampaignsPage />} />
            <Route path="/brand-applications" element={<BrandApplicationsPage />} />
            <Route path="/task-management" element={<TaskManagementPage />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
