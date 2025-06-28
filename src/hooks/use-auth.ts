
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
  initialized: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false
  });

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const getDashboardPath = useCallback((userType: UserType) => {
    return userType === 'Influencer' ? '/dashboard' : '/brand-dashboard';
  }, []);

  const updateAuthState = useCallback((user: User | null, profile: UserProfile | null, session: Session | null) => {
    console.log('Updating auth state:', { userId: user?.id, profileType: profile?.user_type });
    setAuthState({
      user,
      profile,
      session,
      loading: false,
      initialized: true
    });
  }, []);

  const clearAuthState = useCallback(() => {
    console.log('Clearing auth state');
    setAuthState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      initialized: true
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            clearAuthState();
          }
          return;
        }

        console.log('Initial session:', session?.user?.id || 'No session');

        if (mounted) {
          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user.id);
            updateAuthState(session.user, userProfile, session);
          } else {
            clearAuthState();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          clearAuthState();
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'No session');
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or no session, clearing state');
          clearAuthState();
          return;
        }

        if (session?.user) {
          console.log('Setting user session');
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            updateAuthState(session.user, userProfile, session);
          } catch (error) {
            console.error('Error in auth state change:', error);
            clearAuthState();
          }
        }
      }
    );

    initializeAuth();

    return () => {
      console.log('Cleaning up auth hook');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, clearAuthState, updateAuthState]);

  const signUp = useCallback(async (email: string, password: string, userType: UserType, name: string) => {
    try {
      console.log('Signing up user:', email, userType);
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
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      console.log('Resetting password for:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('Starting sign out process');
      
      // Clear state immediately to prevent UI flashing
      clearAuthState();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('Successfully signed out');
      }
      
    } catch (error) {
      console.error('Error during sign out:', error);
      clearAuthState();
    }
  }, [clearAuthState]);

  return {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading || !authState.initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getDashboardPath
  };
};
