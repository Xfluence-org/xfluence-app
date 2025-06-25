
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/dashboard/Sidebar';
import SearchBar from '@/components/opportunities/SearchBar';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import ApplicationModal from '@/components/opportunities/ApplicationModal';
import FilterModal, { FilterOptions } from '@/components/opportunities/FilterModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Opportunity } from '@/types/opportunities';

const OpportunitiesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    categories: [],
    platforms: [],
    compensationRange: { min: 0, max: 10000 },
    deliverables: []
  });

  const { toast } = useToast();

  // Use React Query to fetch opportunities with the new database function
  const { data: opportunitiesData, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['opportunities', searchQuery, activeFilters],
    queryFn: async () => {
      console.log('Fetching opportunities with filters:', { searchQuery, activeFilters });
      
      const { data, error } = await supabase.rpc('get_opportunities', {
        search_query: searchQuery,
        category_filter: activeFilters.categories[0] || '',
        min_compensation: activeFilters.compensationRange.min * 100, // convert to cents
        max_compensation: activeFilters.compensationRange.max * 100,
        platform_filter: activeFilters.platforms[0] || ''
      });
      
      if (error) {
        console.error('Error fetching opportunities:', error);
        throw error;
      }
      
      console.log('Fetched opportunities from database:', data);
      return data;
    }
  });

  // Transform database data to match Opportunity interface
  const opportunities: Opportunity[] = useMemo(() => {
    if (!opportunitiesData) return [];
    
    return opportunitiesData.map(opportunity => {
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
    });
  }, [opportunitiesData]);

  // Apply client-side platform filtering since database function handles basic filters
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Apply platform filter (additional client-side filtering)
    if (activeFilters.platforms.length > 1) { // Only apply if multiple platforms selected
      filtered = filtered.filter(opp =>
        opp.platforms.some(platform => 
          activeFilters.platforms.some(filterPlatform => 
            platform.toLowerCase() === filterPlatform.toLowerCase()
          )
        )
      );
    }

    return filtered;
  }, [opportunities, activeFilters.platforms]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const handleViewDetails = (opportunityId: string) => {
    console.log('View details for:', opportunityId);
    // Navigate to opportunity details page or open modal
  };

  const handleApplyNow = (opportunityId: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      setSelectedOpportunityId(opportunityId);
      setIsApplicationModalOpen(true);
    }
  };

  const handleApplicationSubmit = async (message: string) => {
    if (!selectedOpportunityId) return;
    
    setApplicationLoading(true);
    
    try {
      console.log('Submitting application for opportunity:', selectedOpportunityId);
      
      // Using the test user ID for now - in production this would be the current user's ID
      const testUserId = '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab';
      
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: selectedOpportunityId,
          influencer_id: testUserId,
          status: 'applied',
          application_message: message,
          ai_match_score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100 for demo
        });
        
      if (error) {
        console.error('Application failed:', error);
        throw error;
      }
      
      console.log('Application submitted successfully!');
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
      
      setIsApplicationModalOpen(false);
      setSelectedOpportunityId('');
      
      // Refetch opportunities to update the has_applied status
      refetch();
      
    } catch (err) {
      console.error('Error submitting application:', err);
      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplicationLoading(false);
    }
  };

  const selectedOpportunity = opportunities.find(opp => opp.id === selectedOpportunityId);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar activeItem="opportunities" userName="Name" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading opportunities...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar activeItem="opportunities" userName="Name" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error loading opportunities. Please try again.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar activeItem="opportunities" userName="Name" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Opportunities</h1>
          </header>

          <section>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1a1f2e] mb-2">New Campaigns</h2>
                <p className="text-gray-600 mb-6">Campaigns you may like</p>
                
                <SearchBar onSearch={handleSearch} onFilterClick={handleFilterClick} />
              </div>

              <div className="space-y-6">
                {filteredOpportunities.length > 0 ? (
                  filteredOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onViewDetails={handleViewDetails}
                      onApplyNow={handleApplyNow}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No opportunities found matching your criteria.</p>
                    <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedOpportunityId('');
        }}
        onSubmit={handleApplicationSubmit}
        opportunityTitle={selectedOpportunity?.title || ''}
        loading={applicationLoading}
      />
    </div>
  );
};

export default OpportunitiesPage;
