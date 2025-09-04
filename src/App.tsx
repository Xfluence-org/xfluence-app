
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { AuthProvider } from "@/contexts/SimpleAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthErrorBoundary from "@/components/AuthErrorBoundary";
import "@/utils/debugAuth";
import Index from "./pages/Index";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import CampaignsPage from "./pages/CampaignsPage";
import BrandDashboard from "./pages/BrandDashboard";
import BrandCampaignsPage from "./pages/BrandCampaignsPage";
import CampaignReviewPage from "./pages/CampaignReviewPage";
import SettingsPage from "./pages/SettingsPage";
import BrandSettingsPage from "./pages/BrandSettingsPage";
import BrandAIAssistantPage from "./pages/BrandAIAssistantPage";
import TaskWorkflowPage from "./pages/TaskWorkflowPage";
import BrandProgressDashboard from "./pages/BrandProgressDashboard";
import AnalyzeContentPage from "./pages/AnalyzeContentPage";
import FindInfluencersPage from "./pages/FindInfluencersPage";
import InvitationPage from "./pages/InvitationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthErrorBoundary>
          <AuthProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/invite/:token" element={<InvitationPage />} />
            
            {/* New Shared Routes - Available to both influencers and brands */}
            <Route path="/analyze-content" element={
              <ProtectedRoute>
                <AnalyzeContentPage />
              </ProtectedRoute>
            } />
            <Route path="/find-influencers" element={
              <ProtectedRoute requiredUserType="Brand">
                <FindInfluencersPage />
              </ProtectedRoute>
            } />

            {/* AI Assistant - Available to both */}
            <Route path="/brand/ai-assistant" element={
              <ProtectedRoute>
                <BrandAIAssistantPage />
              </ProtectedRoute>
            } />

            {/* Legacy Routes - Hidden but preserved */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredUserType="Influencer">
                <Navigate to="/analyze-content" replace />
              </ProtectedRoute>
            } />
            <Route path="/brand-dashboard" element={
              <ProtectedRoute requiredUserType="Brand">
                <Navigate to="/analyze-content" replace />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredUserType="Influencer">
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/task-workflow/:taskId" element={
              <ProtectedRoute requiredUserType="Influencer">
                <TaskWorkflowPage />
              </ProtectedRoute>
            } />
            <Route path="/brand/campaigns" element={
              <ProtectedRoute requiredUserType="Brand">
                <BrandCampaignsPage />
              </ProtectedRoute>
            } />
            <Route path="/brand/settings" element={
              <ProtectedRoute requiredUserType="Brand">
                <BrandSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/brand/progress" element={
              <ProtectedRoute requiredUserType="Brand">
                <BrandProgressDashboard />
              </ProtectedRoute>
            } />
            <Route path="/campaign-review" element={
              <ProtectedRoute requiredUserType="Brand">
                <CampaignReviewPage />
              </ProtectedRoute>
            } />
            <Route path="/opportunities" element={
              <ProtectedRoute requiredUserType="Influencer">
                <OpportunitiesPage />
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <CampaignsPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </AuthErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
