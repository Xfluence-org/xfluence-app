
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'Agency' | 'Brand' | 'Influencer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredUserType }) => {
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
