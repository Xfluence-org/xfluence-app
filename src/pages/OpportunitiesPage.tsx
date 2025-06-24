
import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import SearchBar from '@/components/opportunities/SearchBar';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import FilterModal, { FilterOptions } from '@/components/opportunities/FilterModal';
import { Opportunity } from '@/types/opportunities';

const OpportunitiesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    categories: [],
    platforms: [],
    compensationRange: { min: 0, max: 10000 },
    deliverables: []
  });

  // Mock data - replace with actual API call
  const [opportunities] = useState<Opportunity[]>([
    {
      id: '1',
      title: 'Summer Collection Launch',
      brand: 'Nike',
      compensation: { max: 3000, type: 'fixed' },
      category: ['Fitness', 'lifestyle'],
      platforms: ['Instagram', 'Tiktok'],
      deliverables: { posts: 2, stories: 3, reels: 1 },
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: '2',
      title: 'Starbucks - Holiday Drinks Campaign',
      brand: 'Starbucks',
      compensation: { max: 1500, type: 'fixed' },
      category: ['Food', 'Drinks'],
      platforms: ['Instagram', 'TikTok'],
      deliverables: { posts: 1, stories: 2, reels: 3 },
      postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: '3',
      title: 'Adidas - Spring Collection Launch',
      brand: 'Adidas',
      compensation: { max: 2500, type: 'fixed' },
      category: ['Fitness', 'lifestyle'],
      platforms: ['Instagram', 'tiktok'],
      deliverables: { posts: 2, stories: 3, reels: 1 },
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    }
  ]);

  // Filter and search logic
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(query) ||
        opp.brand.toLowerCase().includes(query) ||
        opp.category.some(cat => cat.toLowerCase().includes(query)) ||
        opp.platforms.some(platform => platform.toLowerCase().includes(query))
      );
    }

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
  }, [opportunities, searchQuery, activeFilters]);

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
    console.log('Apply for opportunity:', opportunityId);
    // Handle application submission
  };

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
    </div>
  );
};

export default OpportunitiesPage;
