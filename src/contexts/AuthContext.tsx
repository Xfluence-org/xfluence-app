import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  error: Error | null;
  signUp: (email: string, password: string, userType: UserType, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  clearError: () => void;
  forceClearSession: () => Promise<void>;
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
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const profileCacheRef = useRef<Map<string, { profile: UserProfile; timestamp: number }>>(new Map());
  const profileFetchPromiseRef = useRef<Map<string, Promise<UserProfile>>>(new Map());

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile> => {
    // Check cache first (cache for 5 seconds)
    const cached = profileCacheRef.current.get(userId);
    if (cached && Date.now() - cached.timestamp < 5000) {
      return cached.profile;
    }

    // Check if there's already a fetch in progress for this user
    const existingPromise = profileFetchPromiseRef.current.get(userId);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new fetch promise
    const fetchPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          console.error('Profile fetch error details:', { userId, error });
          
          // If it's a not found error, return null instead of throwing
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }

        if (!data) {
          console.error('Profile data is null for user:', userId);
          return null;
        }

        // Cache the result
        profileCacheRef.current.set(userId, {
          profile: data,
          timestamp: Date.now()
        });

        return data;
      } catch (error) {
        console.error('Error in profile fetch:', error);
        throw error;
      } finally {
        // Clean up the promise ref
        profileFetchPromiseRef.current.delete(userId);
      }
    })();

    // Store the promise to prevent duplicate fetches
    profileFetchPromiseRef.current.set(userId, fetchPromise);
    
    return fetchPromise;
  }, []);

  const claimPendingInvitations = useCallback(async (userEmail: string, userId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      console.log('Checking for pending invitations for email:', userEmail);
      
      // Find invitation emails for this user
      const { data: invitationEmails, error: emailError } = await supabase
        .from('invitation_emails')
        .select(`
          id,
          campaign_participant_id,
          campaign_participants!inner(
            id,
            campaign_id,
            influencer_id,
            status,
            invitation_claimed_at
          )
        `)
        .eq('email', userEmail)
        .is('campaign_participants.influencer_id', null)
        .is('campaign_participants.invitation_claimed_at', null);

      if (!isMountedRef.current) return;

      if (emailError) {
        console.error('Error fetching invitation emails:', emailError);
        return;
      }

      if (!invitationEmails || invitationEmails.length === 0) {
        console.log('No pending invitations found');
        return;
      }

      console.log('Found pending invitations:', invitationEmails.length);

      // Claim each invitation
      for (const invitationEmail of invitationEmails) {
        if (!isMountedRef.current) break;
        
        try {
          // Update the campaign participant
          const { error: updateError } = await supabase
            .from('campaign_participants')
            .update({
              influencer_id: userId,
              invitation_claimed_at: new Date().toISOString(),
              status: 'accepted'
            })
            .eq('id', invitationEmail.campaign_participant_id);

          if (updateError) {
            console.error('Error claiming invitation:', updateError);
            continue;
          }

          // Update the invitation email record
          const { error: emailUpdateError } = await supabase
            .from('invitation_emails')
            .update({
              clicked_at: new Date().toISOString()
            })
            .eq('id', invitationEmail.id);

          if (emailUpdateError) {
            console.error('Error updating invitation email:', emailUpdateError);
          }

          console.log('Successfully claimed invitation:', invitationEmail.campaign_participant_id);
        } catch (error) {
          console.error('Error processing invitation:', error);
        }
      }
    } catch (error) {
      console.error('Error claiming pending invitations:', error);
    }
  }, []);

  const redirectToDashboard = useCallback((userType: UserType) => {
    // Only redirect if we're on the root path
    const currentPath = window.location.pathname;
    if (currentPath !== '/') {
      console.log('Not redirecting - user is not on root path:', currentPath);
      return;
    }

    console.log('Redirecting user to dashboard for type:', userType);
    if (userType === 'Influencer') {
      navigate('/dashboard');
    } else {
      navigate('/brand-dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Cancel any ongoing operations when component unmounts
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    let isInitialized = false;
    let authStateHandled = false;
    let authStateProcessing = false;
    let loadingTimeout: NodeJS.Timeout;
    
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('Auth state changed:', event, 'Session:', !!session);
      
      if (!isMountedRef.current) return;
      
      // Mark that we've handled an auth state change
      authStateHandled = true;
      authStateProcessing = true;
      
      // Handle different auth events
      switch (event) {
        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          setProfile(null);
          profileCacheRef.current.clear();
          setLoading(false);
          break;
          
        case 'TOKEN_REFRESHED':
        case 'SIGNED_IN':
        case 'USER_UPDATED':
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            try {
              console.log('Fetching profile for user:', session.user.id);
              const userProfile = await fetchUserProfile(session.user.id);
              
              if (!isMountedRef.current) return;
              
              if (!userProfile) {
                console.error('No profile found for user, clearing session');
                // Profile doesn't exist, clear the session
                await supabase.auth.signOut();
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
              }
              
              setProfile(userProfile);
              console.log('Profile set successfully:', userProfile);
              
              // Only claim invitations on actual sign-in
              if (event === 'SIGNED_IN' && userProfile?.user_type === 'Influencer' && session.user.email) {
                await claimPendingInvitations(session.user.email, session.user.id);
              }
              
              // Only redirect on actual sign-in events AND only from the root path
              const isActualSignIn = event === 'SIGNED_IN';
              const isOnRootPath = window.location.pathname === '/';
              const shouldPerformRedirect = userProfile && 
                                          isActualSignIn && 
                                          isOnRootPath &&
                                          isInitialized;
              
              if (shouldPerformRedirect) {
                console.log('Performing redirect for user type:', userProfile.user_type);
                redirectToDashboard(userProfile.user_type);
              }
              
              // Ensure loading is set to false after successful profile fetch
              setLoading(false);
            } catch (error) {
              console.error('Error handling auth state change:', error);
              console.error('Error details:', error);
              
              // If profile fetch fails, try to refresh the session
              if (event === 'SIGNED_IN') {
                console.log('Attempting to refresh session due to profile fetch error');
                try {
                  const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
                  if (refreshError || !newSession) {
                    console.error('Session refresh failed, signing out', refreshError);
                    await supabase.auth.signOut();
                  }
                } catch (refreshError) {
                  console.error('Error refreshing session:', refreshError);
                  await supabase.auth.signOut();
                }
              }
              
              setProfile(null);
              if (isMountedRef.current) {
                setError(error instanceof Error ? error : new Error('Failed to fetch user profile'));
              }
            }
          } else {
            // No user in session
            setProfile(null);
          }
          
          // Always set loading to false after handling auth event
          setLoading(false);
          break;
          
        default:
          console.log('Unhandled auth event:', event);
          setLoading(false);
      }
      
      // Mark auth state processing as complete
      authStateProcessing = false;
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Set a timeout to ensure loading eventually gets set to false
    loadingTimeout = setTimeout(() => {
      if (isMountedRef.current && loading) {
        console.warn('Loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Check for existing session on mount
    const initializeAuth = async () => {
      console.log('Starting initializeAuth...');
      
      // Wait a bit to see if auth state change fires first
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // If auth state change already handled the session, wait for it to complete
      if (authStateHandled) {
        console.log('Auth state already handled, waiting for completion...');
        
        // Wait for auth state processing to complete (max 5 seconds)
        let waitTime = 0;
        while (authStateProcessing && waitTime < 5000) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitTime += 100;
        }
        
        // Ensure loading is false after auth state processing
        if (isMountedRef.current) {
          setLoading(false);
        }
        return;
      }
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', !!session);
        
        if (!isMountedRef.current) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            
            if (!isMountedRef.current) return;
            
            setProfile(userProfile);
            
            // Claim pending invitations for influencers
            if (userProfile?.user_type === 'Influencer' && session.user.email) {
              await claimPendingInvitations(session.user.email, session.user.id);
            }
            
            // Only redirect if we're on the root path and this is the initial load
            if (userProfile && window.location.pathname === '/') {
              console.log('Initial redirect for existing session:', userProfile.user_type);
              redirectToDashboard(userProfile.user_type);
            }
          } catch (error) {
            console.error('Error fetching initial profile:', error);
            setProfile(null);
            if (isMountedRef.current) {
              setError(error instanceof Error ? error : new Error('Failed to fetch user profile'));
            }
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMountedRef.current) {
          setError(error instanceof Error ? error : new Error('Failed to get session'));
        }
      } finally {
        console.log('InitializeAuth complete, setting loading to false');
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth().then(() => {
      isInitialized = true;
    });

    return () => {
      subscription.unsubscribe();
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [fetchUserProfile, claimPendingInvitations, redirectToDashboard]);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Force clear session - useful for corrupted sessions
  const forceClearSession = useCallback(async () => {
    console.log('Force clearing session and local storage');
    try {
      // Clear all auth-related local storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear cache
      profileCacheRef.current.clear();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear state
      setUser(null);
      setProfile(null);
      setSession(null);
      setError(null);
      setLoading(false);
      
      // Reload the page to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error force clearing session:', error);
    }
  }, []);

  // Validate session and refresh if needed
  const validateSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session validation error:', error);
        throw error;
      }
      
      if (!session) {
        throw new Error('No valid session');
      }
      
      // Check if session is about to expire (within 5 minutes)
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      if (timeUntilExpiry < 5 * 60 * 1000) {
        // Refresh the session
        const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Session refresh error:', refreshError);
          throw refreshError;
        }
        
        return newSession;
      }
      
      return session;
    } catch (error) {
      console.error('Session validation failed:', error);
      // Clear auth state on validation failure
      setUser(null);
      setProfile(null);
      setSession(null);
      throw error;
    }
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    clearError,
    forceClearSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
