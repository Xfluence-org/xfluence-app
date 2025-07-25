import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xospglrpmoqubokupgvw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvc3BnbHJwbW9xdWJva3VwZ3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjgyMDAsImV4cCI6MjA2NjQwNDIwMH0.Z9YShKj_qLGycHxQoHlaPOu3ahPQUiW0qUB-fr0Wy2Y";

// Create a simple client without complex types
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
    debug: false,
    autoRefreshTokenTick: 60
  }
}) as any;