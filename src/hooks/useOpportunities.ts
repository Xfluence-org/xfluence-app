
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/types/opportunities';

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async (searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching opportunities using database function...');

      // Use the new database function for better performance
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .rpc('get_opportunities', {
          search_query: searchQuery || '',
          category_filter: '',
          min_compensation: 0,
          max_compensation: 999999999,
          platform_filter: ''
        });

      if (opportunitiesError) {
        console.error('Error fetching opportunities via function:', opportunitiesError);
        throw opportunitiesError;
      }

      console.log('Fetched opportunities via function:', opportunitiesData);

      // Transform database data to match Opportunity interface
      const transformedOpportunities: Opportunity[] = opportunitiesData?.map(opportunity => {
        const requirements = opportunity.requirements as any || {};
        
        return {
          id: opportunity.id,
          title: opportunity.title,
          brand: opportunity.brand_name || 'Unknown Brand',
          compensation: {
            min: opportunity.compensation_min ? Math.floor(opportunity.compensation_min / 100) : undefined,
            max: opportunity.compensation_max ? Math.floor(opportunity.compensation_max / 100) : 0,
            type: opportunity.compensation_min ? 'range' : 'fixed'
          },
          category: opportunity.category ? [opportunity.category] : ['General'],
          platforms: requirements.platforms || ['Instagram', 'TikTok'],
          deliverables: {
            posts: requirements.posts || 1,
            stories: requirements.stories || 0,
            reels: requirements.reels || 0
          },
          postedAt: opportunity.created_at,
          description: opportunity.description || undefined,
          applicationDeadline: opportunity.application_deadline || undefined
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

  const applyToOpportunity = async (opportunityId: string, applicationMessage?: string) => {
    try {
      console.log('Applying to opportunity:', opportunityId, 'with message:', applicationMessage);
      
      // Using the test user ID for now
      const testUserId = '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab';
      
      // Check if user already applied
      const { data: existingApplication } = await supabase
        .from('campaign_participants')
        .select('id')
        .eq('campaign_id', opportunityId)
        .eq('influencer_id', testUserId)
        .single();

      if (existingApplication) {
        return { success: false, message: 'You have already applied to this opportunity' };
      }

      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: opportunityId,
          influencer_id: testUserId,
          status: 'applied',
          application_message: applicationMessage || null,
          ai_match_score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100 for demo
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

  const searchOpportunities = async (query: string) => {
    console.log('Searching opportunities with query:', query);
    await fetchOpportunities(query);
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    loading,
    error,
    applyToOpportunity,
    searchOpportunities,
    refetch: () => fetchOpportunities()
  };
};
