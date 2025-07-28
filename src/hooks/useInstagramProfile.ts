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

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('fetch-instagram-profile', {
        body: { handle: handle.trim(), userId }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch profile');
      }

      const response: InstagramAPIResponse = data;

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch Instagram profile');
      }

      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Instagram profile fetch error:', err);
      return null;
    } finally {
      setLoading(false);
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