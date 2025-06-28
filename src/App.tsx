
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import CampaignsPage from "./pages/CampaignsPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import SettingsPage from "./pages/SettingsPage";
import BrandDashboard from "./pages/BrandDashboard";
import BrandCampaignsPage from "./pages/BrandCampaignsPage";
import BrandCampaignDetailPage from "./pages/BrandCampaignDetailPage";
import BrandAIAssistantPage from "./pages/BrandAIAssistantPage";
import BrandSettingsPage from "./pages/BrandSettingsPage";
import CampaignReviewPage from "./pages/CampaignReviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <InfluencerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns"
              element={
                <ProtectedRoute>
                  <CampaignsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunities"
              element={
                <ProtectedRoute>
                  <OpportunitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand-dashboard"
              element={
                <ProtectedRoute>
                  <BrandDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/campaigns"
              element={
                <ProtectedRoute>
                  <BrandCampaignsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/campaigns/:campaignId"
              element={
                <ProtectedRoute>
                  <BrandCampaignDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/ai-assistant"
              element={
                <ProtectedRoute>
                  <BrandAIAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/settings"
              element={
                <ProtectedRoute>
                  <BrandSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaign-review/:campaignId"
              element={
                <ProtectedRoute>
                  <CampaignReviewPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
