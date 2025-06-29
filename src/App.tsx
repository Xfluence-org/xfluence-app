
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredUserType="Influencer">
                  <InfluencerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requiredUserType="Influencer">
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/task-workflow/:taskId" 
              element={
                <ProtectedRoute>
                  <TaskWorkflowPage />
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
              path="/brand/settings" 
              element={
                <ProtectedRoute>
                  <BrandSettingsPage />
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
                  <OpportunitiesPage />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
