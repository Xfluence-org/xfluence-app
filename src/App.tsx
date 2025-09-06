
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { AuthProvider } from "@/contexts/SimpleAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthErrorBoundary from "@/components/AuthErrorBoundary";
import { FeatureGate } from "@/components/FeatureGate";
import { FeatureStatusIndicator, DevFeatureStatus } from "@/components/FeatureStatusIndicator";
import "@/utils/debugAuth";
import "@/utils/testFeatures";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
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
import InvitationPage from "./pages/InvitationPage";
import AnalyzeContentPage from "./pages/AnalyzeContentPage";
import FindInfluencersPage from "./pages/FindInfluencersPage";
import AdminFeatureToggle from "./pages/AdminFeatureToggle";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FeatureStatusIndicator />
      <BrowserRouter>
        <AuthErrorBoundary>
          <AuthProvider>
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Index />} />
            <Route path="/invite/:token" element={<InvitationPage />} />
            <Route 
              path="/admin/features" 
              element={
                <ProtectedRoute>
                  <AdminFeatureToggle />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analyze-content" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="contentAnalysis" title="Content Analysis">
                    <AnalyzeContentPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/find-influencers" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="findInfluencers" title="Find Influencers">
                    <FindInfluencersPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredUserType="Influencer">
                  <FeatureGate feature="influencerDashboard" title="Influencer Dashboard">
                    <InfluencerDashboard />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requiredUserType="Influencer">
                  <FeatureGate feature="influencerSettings" title="Settings">
                    <SettingsPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/task-workflow/:taskId" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="taskWorkflow" title="Task Workflow">
                    <TaskWorkflowPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/brand-dashboard" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="brandDashboard" title="Brand Dashboard">
                    <BrandDashboard />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/brand/campaigns" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="brandCampaigns" title="Campaign Management">
                    <BrandCampaignsPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/brand/settings" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="brandSettings" title="Brand Settings">
                    <BrandSettingsPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/brand/ai-assistant" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="aiAssistant" title="AI Assistant">
                    <BrandAIAssistantPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/brand/progress" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="brandProgress" title="Progress Dashboard">
                    <BrandProgressDashboard />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaign-review" 
              element={
                <ProtectedRoute>
                  <CampaignReviewPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/opportunities" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="opportunities" title="Opportunities">
                    <OpportunitiesPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns" 
              element={
                <ProtectedRoute>
                  <FeatureGate feature="campaigns" title="Campaigns">
                    <CampaignsPage />
                  </FeatureGate>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </AuthProvider>
    </AuthErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
