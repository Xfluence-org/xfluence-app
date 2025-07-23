
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'Agency' | 'Brand' | 'Influencer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredUserType }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1DDCD3]"></div>
      </div>
    );
  }

  // No user or profile - redirect to login
  if (!user || !profile) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has valid user_type
  const validUserTypes = ['Agency', 'Brand', 'Influencer'];
  if (!validUserTypes.includes(profile.user_type)) {
    console.error('Invalid user type:', profile.user_type);
    return <Navigate to="/" replace />;
  }

  // Check if user has required user type
  if (requiredUserType && profile.user_type !== requiredUserType) {
    // Redirect to appropriate dashboard based on user type
    if (profile.user_type === 'Influencer') {
      return <Navigate to="/dashboard" replace />;
    } else if (profile.user_type === 'Agency' || profile.user_type === 'Brand') {
      return <Navigate to="/brand-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
