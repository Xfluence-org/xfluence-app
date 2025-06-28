
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/dashboard/Sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OpportunityApplicationModal from '@/components/influencer/OpportunityApplicationModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Calendar, DollarSign } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  brand_name: string;
  description: string;
  category: string;
  compensation_min: number;
  compensation_max: number;
  requirements: any;
  created_at: string;
  due_date: string;
  application_deadline: string;
  has_applied: boolean;
}

const OpportunitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: opportunities = [], isLoading, error } = useQuery({
    queryKey: ['opportunities', searchQuery, categoryFilter],
    queryFn: async () => {
      console.log('Fetching opportunities with filters:', { searchQuery, categoryFilter });
      
      const { data, error } = await supabase.rpc('get_opportunities', {
        search_query: searchQuery || '',
        category_filter: categoryFilter === 'all' ? '' : categoryFilter,
        min_compensation: 0,
        max_compensation: 999999999,
        platform_filter: ''
      });

      if (error) {
        console.error('Error fetching opportunities:', error);
        throw error;
      }

      console.log('Opportunities fetched:', data);
      return data || [];
    }
  });

  const handleApplyClick = (opportunity: Opportunity) => {
    // Use the full opportunity object since it already matches the interface
    setSelectedOpportunity(opportunity);
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmitted = () => {
    // Refresh opportunities to update application status
    queryClient.invalidateQueries({ queryKey: ['opportunities'] });
  };

  const categories = ['Food & Drinks', 'Travel', 'Lifestyle', 'Fashion', 'Beauty', 'Fitness', 'Technology', 'Gaming'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading opportunities...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Error loading opportunities: {error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">
              Campaign Opportunities
            </h1>
            <p className="text-gray-600">
              Discover and apply to campaigns that match your style and audience.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(searchQuery || categoryFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Opportunities */}
          {opportunities.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No opportunities found</p>
              <p className="text-gray-400 mt-2">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your search filters' 
                  : 'Check back later for new campaigns'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1a1f2e] mb-1">
                        {opportunity.title}
                      </h3>
                      <p className="text-gray-600 mb-2">by {opportunity.brand_name}</p>
                      <Badge variant="outline" className="bg-gray-50">
                        {opportunity.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {opportunity.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        ${opportunity.compensation_min?.toLocaleString()} - ${opportunity.compensation_max?.toLocaleString()}
                      </span>
                    </div>
                    
                    {opportunity.application_deadline && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Apply by: {new Date(opportunity.application_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {opportunity.has_applied ? (
                    <Button disabled className="w-full">
                      Applied
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleApplyClick(opportunity)}
                      className="w-full bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <OpportunityApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        campaign={selectedOpportunity}
        onApplicationSubmitted={handleApplicationSubmitted}
      />
    </div>
  );
};

export default OpportunitiesPage;
