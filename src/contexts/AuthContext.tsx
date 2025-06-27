
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

  const redirectToDashboard = (userType: UserType) => {
    console.log('Redirecting user to dashboard:', userType);
    
    if (userType === 'Influencer') {
      navigate('/dashboard');
    } else {
      navigate('/brand-dashboard');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          
          if (!isMounted) return;
          
          setProfile(userProfile);
          
          // Only redirect on successful sign in and if user is on auth page
          if (event === 'SIGNED_IN' && userProfile) {
            const isOnAuthPage = location.pathname === '/' || 
                                location.pathname === '/login' || 
                                location.pathname === '/signup';
            
            if (isOnAuthPage) {
              redirectToDashboard(userProfile.user_type);
            }
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then((userProfile) => {
          if (!isMounted) return;

          setProfile(userProfile);
          
          // Only redirect if user is on auth page
          const isOnAuthPage = location.pathname === '/' || 
                              location.pathname === '/login' || 
                              location.pathname === '/signup';
          
          if (userProfile && isOnAuthPage) {
            redirectToDashboard(userProfile.user_type);
          }
          
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
      
      if (!email || !password) {
        return { error: new Error('Email and password are required') };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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
