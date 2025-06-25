
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/types/opportunities';

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching opportunities from database...');

      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          description,
          category,
          compensation_min,
          compensation_max,
          requirements,
          created_at,
          brands (
            name
          )
        `)
        .eq('is_public', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (campaignsError) {
        console.error('Error fetching opportunities:', campaignsError);
        throw campaignsError;
      }

      console.log('Fetched campaigns:', campaigns);

      // Transform database data to match Opportunity interface
      const transformedOpportunities: Opportunity[] = campaigns?.map(campaign => {
        const requirements = campaign.requirements as any || {};
        
        return {
          id: campaign.id,
          title: campaign.title,
          brand: campaign.brands?.name || 'Unknown Brand',
          compensation: {
            min: campaign.compensation_min ? Math.floor(campaign.compensation_min / 100) : undefined,
            max: campaign.compensation_max ? Math.floor(campaign.compensation_max / 100) : 0,
            type: campaign.compensation_min ? 'range' : 'fixed'
          },
          category: campaign.category ? [campaign.category] : ['General'],
          platforms: requirements.platforms || ['Instagram', 'TikTok'],
          deliverables: {
            posts: requirements.posts || 1,
            stories: requirements.stories || 0,
            reels: requirements.reels || 0
          },
          postedAt: campaign.created_at,
          description: campaign.description || undefined
        };
      }) || [];

      console.log('Transformed opportunities:', transformedOpportunities);
      setOpportunities(transformedOpportunities);
    } catch (err) {
      console.error('Error in fetchOpportunities:', err);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const applyToOpportunity = async (opportunityId: string) => {
    try {
      console.log('Applying to opportunity:', opportunityId);
      
      // Using the test user ID for now
      const testUserId = '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab';
      
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: opportunityId,
          influencer_id: testUserId,
          status: 'applied'
        });

      if (error) {
        console.error('Error applying to opportunity:', error);
        throw error;
      }

      return { success: true, message: 'Application submitted successfully!' };
    } catch (err) {
      console.error('Error in applyToOpportunity:', err);
      return { success: false, message: 'Failed to submit application' };
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    loading,
    error,
    applyToOpportunity,
    refetch: fetchOpportunities
  };
};
