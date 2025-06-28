
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'Agency' | 'Brand' | 'Influencer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredUserType }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DDCD3]"></div>
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  // Handle specific route redirections for user types
  // Brand/Agency users trying to access influencer campaigns should go to brand campaigns
  if ((profile.user_type === 'Agency' || profile.user_type === 'Brand') && location.pathname === '/campaigns') {
    return <Navigate to="/brand/campaigns" replace />;
  }
  
  // Influencer users trying to access brand routes should go to influencer dashboard
  if (profile.user_type === 'Influencer' && location.pathname.startsWith('/brand/')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check user type if specified
  if (requiredUserType && profile.user_type !== requiredUserType) {
    // Redirect to appropriate dashboard based on user type
    if (profile.user_type === 'Influencer') {
      return <Navigate to="/dashboard" replace />;
    } else if (profile.user_type === 'Agency' || profile.user_type === 'Brand') {
      return <Navigate to="/brand-dashboard" replace />;
    }
    
    // Fallback to login if user type is unrecognized
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
