
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import Index from "./pages/Index";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import CampaignsPage from "./pages/CampaignsPage";
import BrandDashboard from "./pages/BrandDashboard";
import BrandCampaignsPage from "./pages/BrandCampaignsPage";
import CampaignReviewPage from "./pages/CampaignReviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface AuthRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'Agency' | 'Brand' | 'Influencer';
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, requiredUserType }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  if (requiredUserType && profile.user_type !== requiredUserType) {
    if (profile.user_type === 'Influencer') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/brand-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthRoute requiredUserType="Influencer">
                  <InfluencerDashboard />
                </AuthRoute>
              } 
            />
            <Route 
              path="/brand-dashboard" 
              element={
                <AuthRoute>
                  <BrandDashboard />
                </AuthRoute>
              } 
            />
            <Route 
              path="/brand/campaigns" 
              element={
                <AuthRoute>
                  <BrandCampaignsPage />
                </AuthRoute>
              } 
            />
            <Route 
              path="/campaign-review" 
              element={
                <AuthRoute>
                  <CampaignReviewPage />
                </AuthRoute>
              } 
            />
            <Route 
              path="/opportunities" 
              element={
                <AuthRoute>
                  <OpportunitiesPage />
                </AuthRoute>
              } 
            />
            <Route 
              path="/campaigns" 
              element={
                <AuthRoute>
                  <CampaignsPage />
                </AuthRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
