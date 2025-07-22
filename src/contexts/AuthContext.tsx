
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const shouldRedirect = (userType: UserType, currentPath: string) => {
    // Only redirect if user is on the root path "/"
    // Never redirect users from other pages
    if (currentPath !== '/') {
      return false;
    }

    return true;
  };

  const redirectToDashboard = (userType: UserType) => {
    // Only redirect if we're on the root path
    if (location.pathname !== '/') {
      console.log('Not redirecting - user is not on root path:', location.pathname);
      return;
    }

    console.log('Redirecting user to dashboard for type:', userType);
    if (userType === 'Influencer') {
      navigate('/dashboard');
    } else {
      navigate('/brand-dashboard');
    }
  };

  useEffect(() => {
    let initialLoadComplete = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'Current path:', location.pathname);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user profile after authentication
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(session.user.id);
            setProfile(userProfile);
            
            // ONLY redirect on actual sign-in events AND only from the root path
            // Never redirect on TOKEN_REFRESHED, session recovery, or when on other pages
            const isActualSignIn = event === 'SIGNED_IN';
            const isOnRootPath = location.pathname === '/';
            const shouldPerformRedirect = userProfile && 
                                        isActualSignIn && 
                                        isOnRootPath &&
                                        initialLoadComplete; // Only after initial load
            
            if (shouldPerformRedirect) {
              console.log('Performing redirect for user type:', userProfile.user_type);
              redirectToDashboard(userProfile.user_type);
            } else {
              console.log('Skipping redirect:', {
                isActualSignIn,
                isOnRootPath,
                initialLoadComplete,
                userType: userProfile?.user_type
              });
            }
          }, 0);
        } else {
          setProfile(null);
        }

        // Only update loading state if this is the first time
        if (!hasInitialized) {
          setLoading(false);
          setHasInitialized(true);
          initialLoadComplete = true;
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session, 'Current path:', location.pathname);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then((userProfile) => {
          setProfile(userProfile);
          setLoading(false);
          setHasInitialized(true);
          initialLoadComplete = true;
          
          // Only redirect if we're on the root path and this is the initial load
          if (userProfile && location.pathname === '/') {
            console.log('Initial redirect for existing session:', userProfile.user_type);
            redirectToDashboard(userProfile.user_type);
          }
        });
      } else {
        setLoading(false);
        setHasInitialized(true);
        initialLoadComplete = true;
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Remove all dependencies to prevent re-running

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
