
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

type UserType = 'Agency' | 'Brand' | 'Influencer';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  user_type: UserType;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: UserType, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Add refs to track state and prevent unwanted redirects
  const hasRedirectedRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // More restrictive function to determine when to redirect
  const shouldRedirectOnEvent = (event: string) => {
    // Only redirect on actual sign-in
    if (event === 'SIGNED_IN') return true;
    
    // Don't redirect on token refresh, sign out, etc.
    return false;
  };

  const shouldRedirect = (userType: UserType, currentPath: string) => {
    // Don't redirect if user is already on an appropriate page
    if (userType === 'Influencer') {
      return !currentPath.startsWith('/dashboard') && 
             !currentPath.startsWith('/opportunities') && 
             !currentPath.startsWith('/campaigns');
    } else {
      return !currentPath.startsWith('/brand-dashboard') && 
             !currentPath.startsWith('/brand/') && 
             !currentPath.startsWith('/campaign-review') &&
             !currentPath.startsWith('/campaigns');
    }
  };

  const redirectToDashboard = (userType: UserType, force: boolean = false) => {
    // Prevent multiple redirects unless forced
    if (hasRedirectedRef.current && !force) {
      return;
    }

    if (!shouldRedirect(userType, location.pathname)) {
      return; // Don't redirect if user is already on appropriate page
    }

    console.log('Redirecting user to dashboard:', userType);
    hasRedirectedRef.current = true;

    if (userType === 'Influencer') {
      navigate('/dashboard');
    } else {
      navigate('/brand-dashboard');
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user profile
          const userProfile = await fetchUserProfile(session.user.id);
          
          if (!isMounted) return;
          
          setProfile(userProfile);
          
          // Only redirect on specific events and conditions
          if (userProfile && shouldRedirectOnEvent(event)) {
            redirectToDashboard(userProfile.user_type);
          }
        } else {
          setProfile(null);
          hasRedirectedRef.current = false; // Reset redirect flag when user logs out
        }

        setLoading(false);
        isInitialLoadRef.current = false;
      }
    );

    // Check for existing session (initial load)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then((userProfile) => {
          if (!isMounted) return;

          setProfile(userProfile);
          
          // Only redirect on initial load if user is on auth page
          if (userProfile && isInitialLoadRef.current) {
            const isOnAuthPage = location.pathname === '/' || 
                                location.pathname === '/login' || 
                                location.pathname === '/signup';
            
            if (isOnAuthPage) {
              redirectToDashboard(userProfile.user_type, true);
            }
          }
          
          setLoading(false);
          isInitialLoadRef.current = false;
        });
      } else {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove location dependency to prevent re-runs

  // Reset redirect flag when location changes manually
  useEffect(() => {
    // Allow redirects again if user manually navigates
    if (!isInitialLoadRef.current) {
      hasRedirectedRef.current = false;
    }
  }, [location.pathname]);

  const signUp = async (email: string, password: string, userType: UserType, name: string) => {
    try {
      console.log('Signing up:', { email, userType, name });
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            user_type: userType,
            name: name
          }
        }
      });

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in:', { email });
      
      // Validate inputs
      if (!email || !password) {
        return { error: new Error('Email and password are required') };
      }

      // Reset redirect flag before signing in
      hasRedirectedRef.current = false;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
      }

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    hasRedirectedRef.current = false; // Reset redirect flag
    await supabase.auth.signOut();
    navigate('/');
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
