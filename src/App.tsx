
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
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
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Influencer Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredUserType="Influencer">
                  <InfluencerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/opportunities" element={
                <ProtectedRoute requiredUserType="Influencer">
                  <OpportunitiesPage />
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute requiredUserType="Influencer">
                  <CampaignsPage />
                </ProtectedRoute>
              } />
              <Route path="/campaign-review/:id" element={
                <ProtectedRoute requiredUserType="Influencer">
                  <CampaignReviewPage />
                </ProtectedRoute>
              } />
              
              {/* Brand/Agency Routes */}
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
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
