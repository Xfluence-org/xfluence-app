import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InstagramAPIResponse {
  success: boolean;
  data?: any;
  cached?: boolean;
  error?: string;
}

export const useInstagramProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (handle: string, userId?: string) => {
    if (!handle.trim()) {
      setError('Instagram handle is required');
      return null;
    }

    console.log('=== STARTING INSTAGRAM PROFILE FETCH ===');
    console.log('Handle:', handle.trim());
    console.log('User ID:', userId);

    setLoading(true);
    setError(null);

    try {
      console.log('Calling supabase.functions.invoke...');
      const { data, error: functionError } = await supabase.functions.invoke('fetch-instagram-profile', {
        body: { handle: handle.trim(), userId }
      });

      console.log('Function response data:', data);
      console.log('Function response error:', functionError);

      if (functionError) {
        console.error('Function error details:', functionError);
        throw new Error(functionError.message || 'Failed to fetch profile');
      }

      if (!data) {
        console.error('No data returned from function');
        throw new Error('No data returned from Instagram API');
      }

      const response: InstagramAPIResponse = data;
      console.log('Parsed response:', response);

      if (!response.success) {
        console.error('API response indicates failure:', response.error);
        throw new Error(response.error || 'Failed to fetch Instagram profile');
      }

      console.log('Profile data:', response.data);
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('=== INSTAGRAM PROFILE FETCH ERROR ===');
      console.error('Error:', err);
      console.error('Error message:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
      console.log('=== INSTAGRAM PROFILE FETCH COMPLETE ===');
    }
  };

  const clearError = () => setError(null);

  return {
    fetchProfile,
    loading,
    error,
    clearError
  };
};