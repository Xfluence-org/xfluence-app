import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession && isMounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Try to fetch profile with timeout
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          );
          
          try {
            const { data: profileData } = await Promise.race([profilePromise, timeoutPromise]) as any;
            if (profileData && isMounted) {
              setProfile(profileData);
            }
          } catch (error) {
            console.error('Profile fetch failed or timed out:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initialize
    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSession(null);
      } else if (event === 'SIGNED_IN' && newSession) {
        // Only handle actual sign-in, not token refresh or tab switches
        setUser(newSession.user);
        setSession(newSession);
        
        // Fetch profile async without blocking
        supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .single()
          .then(({ data }) => {
            if (data && isMounted) {
              setProfile(data);
              // Only redirect on actual sign-in from login page
              const currentPath = window.location.pathname;
              if (currentPath === '/' && data.user_type) {
                console.log('Redirecting after sign-in, user type:', data.user_type);
                // Small delay to ensure state is updated
                setTimeout(() => {
                  navigate(data.user_type === 'Influencer' ? '/dashboard' : '/brand-dashboard');
                }, 100);
              }
            }
          })
          .catch(error => {
            console.error('Profile fetch error:', error);
          });
      } else if ((event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && newSession) {
        // For token refresh or user updates, just update the session
        // Don't redirect or refetch profile
        setSession(newSession);
        setUser(newSession.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, userType: UserType, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { user_type: userType, name }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};