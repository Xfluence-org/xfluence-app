
import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import SearchBar from '@/components/opportunities/SearchBar';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import ApplicationModal from '@/components/opportunities/ApplicationModal';
import FilterModal, { FilterOptions } from '@/components/opportunities/FilterModal';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useToast } from '@/hooks/use-toast';

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

  const { opportunities, loading, error, applyToOpportunity, searchOpportunities } = useOpportunities();
  const { toast } = useToast();

  // Filter logic (search is now handled by the hook)
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Apply category filter
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(opp =>
        opp.category.some(cat => activeFilters.categories.includes(cat))
      );
    }

    // Apply platform filter
    if (activeFilters.platforms.length > 0) {
      filtered = filtered.filter(opp =>
        opp.platforms.some(platform => 
          activeFilters.platforms.some(filterPlatform => 
            platform.toLowerCase() === filterPlatform.toLowerCase()
          )
        )
      );
    }

    // Apply compensation filter
    filtered = filtered.filter(opp =>
      opp.compensation.max >= activeFilters.compensationRange.min &&
      opp.compensation.max <= activeFilters.compensationRange.max
    );

    return filtered;
  }, [opportunities, activeFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchOpportunities(query);
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
    const result = await applyToOpportunity(selectedOpportunityId, message);
    setApplicationLoading(false);
    
    if (result.success) {
      toast({
        title: "Application Submitted",
        description: result.message,
      });
      setIsApplicationModalOpen(false);
      setSelectedOpportunityId('');
    } else {
      toast({
        title: "Application Failed",
        description: result.message,
        variant: "destructive",
      });
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
              <p className="text-red-500 text-lg">Error: {error}</p>
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
