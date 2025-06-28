
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import InfluencerDashboard from '@/pages/InfluencerDashboard';
import BrandDashboard from '@/pages/BrandDashboard';
import BrandCampaignsPage from '@/pages/BrandCampaignsPage';
import BrandApplicationsPage from '@/pages/BrandApplicationsPage';
import BrandAIAssistant from '@/pages/BrandAIAssistant';
import OpportunitiesPage from '@/pages/OpportunitiesPage';
import CampaignsPage from '@/pages/CampaignsPage';
import CampaignReviewPage from '@/pages/CampaignReviewPage';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <InfluencerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/brand-dashboard" element={
                <ProtectedRoute>
                  <BrandDashboard />
                </ProtectedRoute>
              } />
              <Route path="/brand/campaigns" element={
                <ProtectedRoute>
                  <BrandCampaignsPage />
                </ProtectedRoute>
              } />
              <Route path="/brand/applications" element={
                <ProtectedRoute>
                  <BrandApplicationsPage />
                </ProtectedRoute>
              } />
              <Route path="/brand/ai-assistant" element={
                <ProtectedRoute>
                  <BrandAIAssistant />
                </ProtectedRoute>
              } />
              <Route path="/opportunities" element={
                <ProtectedRoute>
                  <OpportunitiesPage />
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <CampaignsPage />
                </ProtectedRoute>
              } />
              <Route path="/campaign-review/:id" element={
                <ProtectedRoute>
                  <CampaignReviewPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
