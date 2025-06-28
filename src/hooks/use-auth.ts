
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

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

  const getDashboardPath = (userType: UserType) => {
    return userType === 'Influencer' ? '/dashboard' : '/brand-dashboard';
  };

  const clearAuthState = useCallback(() => {
    console.log('Clearing auth state');
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            clearAuthState();
            setInitialized(true);
          }
          return;
        }

        console.log('Initial session:', session?.user?.id || 'No session');

        if (mounted) {
          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user.id);
            setUser(session.user);
            setProfile(userProfile);
            setSession(session);
          } else {
            clearAuthState();
          }
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          clearAuthState();
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'No session');
        
        if (!mounted) return;

        // Handle sign out event specifically
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
          clearAuthState();
          return;
        }

        if (session?.user) {
          console.log('Setting user session');
          // Use setTimeout to prevent blocking the auth state change
          setTimeout(async () => {
            if (mounted) {
              try {
                const userProfile = await fetchUserProfile(session.user.id);
                setUser(session.user);
                setProfile(userProfile);
                setSession(session);
                setLoading(false);
              } catch (error) {
                console.error('Error in auth state change:', error);
                clearAuthState();
              }
            }
          }, 0);
        } else {
          console.log('No session, clearing state');
          clearAuthState();
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('Cleaning up auth hook');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, clearAuthState]);

  const signUp = async (email: string, password: string, userType: UserType, name: string) => {
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
  };

  const signIn = async (email: string, password: string) => {
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
  };

  const resetPassword = async (email: string) => {
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
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process');
      
      // Clear state first to prevent UI issues
      clearAuthState();
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        // Even if there's an error, we've cleared the local state
      } else {
        console.log('Successfully signed out');
      }
      
    } catch (error) {
      console.error('Error during sign out:', error);
      // Ensure state is cleared even on error
      clearAuthState();
    }
  };

  return {
    user,
    profile,
    session,
    loading: loading || !initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getDashboardPath
  };
};
