import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserType = 'Agency' | 'Brand' | 'Influencer';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  user_type: UserType;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

const STORAGE_KEY = 'auth_state';

const getStoredAuth = (): AuthState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading auth from localStorage:', error);
  }
  return { user: null, profile: null, session: null, loading: true };
};

const setStoredAuth = (state: AuthState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving auth to localStorage:', error);
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing auth from localStorage:', error);
  }
};

export const useAuth = () => {
  const storedAuth = getStoredAuth();
  
  const [user, setUser] = useState<User | null>(storedAuth.user);
  const [profile, setProfile] = useState<UserProfile | null>(storedAuth.profile);
  const [session, setSession] = useState<Session | null>(storedAuth.session);
  const [loading, setLoading] = useState(!storedAuth.user);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
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

  const getDashboardPath = (userType: UserType) => {
    return userType === 'Influencer' ? '/dashboard' : '/brand-dashboard';
  };

  const updateAuthState = (newState: Partial<AuthState>) => {
    const updatedState = {
      user: newState.user !== undefined ? newState.user : user,
      profile: newState.profile !== undefined ? newState.profile : profile,
      session: newState.session !== undefined ? newState.session : session,
      loading: newState.loading !== undefined ? newState.loading : loading,
    };

    setUser(updatedState.user);
    setProfile(updatedState.profile);
    setSession(updatedState.session);
    setLoading(updatedState.loading);

    if (updatedState.user) {
      setStoredAuth(updatedState);
    } else {
      clearStoredAuth();
    }
  };

  // Track if we need to redirect after sign in
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          updateAuthState({
            user: session.user,
            profile: userProfile,
            session: session,
            loading: false
          });
          
          // Set redirect path on sign in events
          if (userProfile && event === 'SIGNED_IN') {
            setRedirectPath(getDashboardPath(userProfile.user_type));
          }
        } else {
          updateAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false
          });
          setRedirectPath(null);
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then((userProfile) => {
          updateAuthState({
            user: session.user,
            profile: userProfile,
            session: session,
            loading: false
          });
        });
      } else {
        updateAuthState({ loading: false });
      }
    });

    return () => subscription.unsubscribe();
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
    try {
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Clear local state
      updateAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false
      });
      
      // Clear storage
      clearStoredAuth();
      
      // Clear any Supabase auth tokens from localStorage
      localStorage.removeItem('supabase.auth.token');
      
      // Clear redirect path
      setRedirectPath(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    redirectPath,
    getDashboardPath
  };
};