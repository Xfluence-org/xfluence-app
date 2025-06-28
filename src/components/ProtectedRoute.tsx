
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

  console.log('ProtectedRoute - User:', user?.id, 'Profile:', profile?.user_type, 'Loading:', loading, 'Path:', location.pathname);

  // Always render loading state first
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

  // Handle authentication check
  if (!user || !profile) {
    console.log('Redirecting to login - no user or profile');
    return <Navigate to="/" replace />;
  }

  // Handle specific route redirections
  const userType = profile.user_type;
  const currentPath = location.pathname;

  // Brand/Agency users trying to access influencer campaigns should go to brand campaigns
  if ((userType === 'Agency' || userType === 'Brand') && currentPath === '/campaigns') {
    console.log('Redirecting brand/agency user from /campaigns to /brand/campaigns');
    return <Navigate to="/brand/campaigns" replace />;
  }
  
  // Influencer users trying to access brand routes should go to influencer dashboard
  if (userType === 'Influencer' && currentPath.startsWith('/brand/')) {
    console.log('Redirecting influencer user from brand routes to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Check user type requirement if specified
  if (requiredUserType && userType !== requiredUserType) {
    console.log('User type mismatch - required:', requiredUserType, 'actual:', userType);
    
    // Redirect to appropriate dashboard based on user type
    if (userType === 'Influencer') {
      return <Navigate to="/dashboard" replace />;
    } else if (userType === 'Agency' || userType === 'Brand') {
      return <Navigate to="/brand-dashboard" replace />;
    }
    
    // Fallback to login if user type is unrecognized
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
