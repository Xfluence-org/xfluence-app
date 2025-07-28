// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasRedirectedOnce, setHasRedirectedOnce] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = async (userId: string) => {
    console.log('fetchUserProfile called for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile catch:', error);
      return null;
    }
  };

  const shouldRedirect = (userType: UserType, currentPath: string) => {
    // Don't redirect if user is already on an appropriate page
    if (userType === 'Influencer') {
      return !currentPath.startsWith('/dashboard') && 
             !currentPath.startsWith('/opportunities') && 
             !currentPath.startsWith('/campaigns') &&
             !currentPath.startsWith('/settings');
    } else {
      return !currentPath.startsWith('/brand-dashboard') && 
             !currentPath.startsWith('/brand/') && 
             !currentPath.startsWith('/campaign-review');
    }
  };

  const redirectToDashboard = (userType: UserType) => {
    if (!shouldRedirect(userType, location.pathname)) {
      return; // Don't redirect if user is already on appropriate page
    }

    if (userType === 'Influencer') {
      navigate('/dashboard');
    } else {
      navigate('/brand-dashboard');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session);
        
        // Don't process if we're still initializing
        if (isInitializing && event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') {
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            console.log('Fetching profile for user in auth state change:', session.user.id);
            // Fetch user profile after authentication
            const userProfile = await fetchUserProfile(session.user.id);
            if (!mounted) return;
            
            console.log('Profile fetched in auth state change:', userProfile);
            setProfile(userProfile);
            
            // Only redirect on actual SIGNED_IN event (not TOKEN_REFRESHED, etc.)
            // and only if we're on the login page
            if (userProfile && 
                event === 'SIGNED_IN' && 
                location.pathname === '/') {
              redirectToDashboard(userProfile.user_type);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setProfile(null);
          } finally {
            // Always set loading to false after processing
            if (mounted) {
              console.log('Setting loading to false in auth state change');
              setLoading(false);
            }
          }
        } else {
          setProfile(null);
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('Initial session check:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Fetching profile for initial session:', session.user.id);
          const userProfile = await fetchUserProfile(session.user.id);
          if (!mounted) return;
          
          console.log('Initial profile fetched:', userProfile);
          setProfile(userProfile);
          
          // Only redirect on initial load if we're on the login page
          if (userProfile && location.pathname === '/') {
            redirectToDashboard(userProfile.user_type);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          console.log('Setting loading to false in initializeAuth');
          setLoading(false);
          setIsInitializing(false);
        }
      }
    };

    // Add a timeout to ensure loading eventually gets set to false
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Loading timeout reached, forcing loading to false');
        setLoading(false);
        setIsInitializing(false);
      }
    }, 5000); // 5 second timeout

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userType: UserType, name: string) => {
    try {
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
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
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