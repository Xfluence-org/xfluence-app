import { supabase } from '@/integrations/supabase/client';

export async function debugAuthIssue(userId: string) {
  console.log('=== Debug Auth Issue ===');
  console.log('User ID:', userId);
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Checking Supabase connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', { hasSession: !!sessionData?.session, error: sessionError });
    
    // Test 2: Direct profile query
    console.log('Test 2: Direct profile query...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    console.log('Profile query result:', { data: profileData, error: profileError });
    
    // Test 3: Check if user exists in auth.users (via session)
    console.log('Test 3: Auth user check...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Auth user:', { user: user?.id, error: userError });
    
    return {
      session: sessionData?.session,
      profile: profileData,
      authUser: user,
      errors: {
        session: sessionError,
        profile: profileError,
        user: userError
      }
    };
  } catch (error) {
    console.error('Debug auth error:', error);
    return null;
  }
}

export const debugAuthState = async () => {
  console.group('Auth Debug Information');
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session Error:', sessionError);
    } else {
      console.log('Current Session:', session ? 'Active' : 'None');
      if (session) {
        console.log('User ID:', session.user.id);
        console.log('Email:', session.user.email);
        console.log('Session Expires:', new Date(session.expires_at! * 1000).toLocaleString());
      }
    }
    
    // Check profile
    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Profile Error:', profileError);
      } else {
        console.log('Profile:', profile);
      }
    }
    
    // Check localStorage
    console.log('\nlocalStorage Auth Keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        console.log(`- ${key}`);
        try {
          const value = localStorage.getItem(key);
          if (value && key.includes('auth-token')) {
            const parsed = JSON.parse(value);
            console.log(`  Session expires: ${parsed.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'N/A'}`);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // Check auth state listeners
    console.log('\nAuth State Listener Test:');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event, 'Session:', !!session);
    });
    
    // Cleanup
    setTimeout(() => subscription.unsubscribe(), 1000);
    
  } catch (error) {
    console.error('Debug Error:', error);
  }
  
  console.groupEnd();
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthState;
  (window as any).debugAuthIssue = debugAuthIssue;
}