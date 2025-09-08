import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Star, TrendingUp, MapPin, Instagram, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import BrandSidebar from '@/components/brand/BrandSidebar';
import Sidebar from '@/components/dashboard/Sidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// To fix Vercel
interface InfluencerSearchParams {
  city: string;
  category: string;
  minFollowers: string;
  maxFollowers: string;
  numberOfInfluencers: number;
}

interface ExtractedInfluencer {
  fullName: string;
  username: string;
  bio?: string;
  followerCount?: string;
  category?: string;
  location?: string;
}

interface SearchResponse {
  success: boolean;
  influencers: ExtractedInfluencer[];
  totalFound: number;
  searchParams: InfluencerSearchParams;
  searchTime: number;
}

const FindInfluencersPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isBrandOrAgency = profile?.user_type === 'Brand' || profile?.user_type === 'Agency';

  const [searchParams, setSearchParams] = useState<InfluencerSearchParams>({
    city: '',
    category: '',
    minFollowers: '10k',
    maxFollowers: '100k',
    numberOfInfluencers: 5
  });

  const [influencers, setInfluencers] = useState<ExtractedInfluencer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  const SidebarComponent = isBrandOrAgency ? BrandSidebar : Sidebar;

  // Load saved searches on component mount
  React.useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, skipping saved searches load');
        return;
      }

      const { data, error } = await supabase
        .from('saved_influencer_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const autoSaveSearchResults = async (searchInfluencers: ExtractedInfluencer[], searchTimeMs: number) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, skipping auto-save');
        return;
      }

      const { error } = await supabase
        .from('saved_influencer_searches')
        .insert({
          user_id: user.id,
          search_params: searchParams,
          results: searchInfluencers,
          results_count: searchInfluencers.length,
          search_time_ms: searchTimeMs
        });

      if (error) {
        console.error('Error auto-saving search results:', error);
        // Don't show error toast for auto-save failures
        return;
      }

      // Reload saved searches to show the new one
      await loadSavedSearches();
    } catch (error) {
      console.error('Error in auto-save:', error);
      // Silently fail for auto-save
    }
  };

  const loadSavedSearch = (savedSearch: any) => {
    setSearchParams(savedSearch.search_params);
    setInfluencers(savedSearch.results);
    setSearchTime(savedSearch.search_time_ms);
    setHasSearched(true);

    toast({
      title: "Search Loaded",
      description: `Loaded ${savedSearch.results_count} results from saved search`
    });
  };

  const categories = [
    'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 'Tech', 'Lifestyle',
    'Gaming', 'Music', 'Art', 'Sports', 'Business', 'Health', 'Education'
  ];

  const usCities = [
    'New York City (New York-Newark-Jersey City, NY-NJ-PA)',
    'Los Angeles (Los Angeles-Long Beach-Anaheim, CA)',
    'Chicago (Chicago-Naperville-Elgin, IL-IN-WI)',
    'Dallas (Dallas-Fort Worth-Arlington, TX)',
    'Houston (Houston-The Woodlands-Sugar Land, TX)',
    'Washington, D.C. (Washington-Arlington-Alexandria, DC-VA-MD-WV)',
    'Miami (Miami-Fort Lauderdale-West Palm Beach, FL)',
    'Philadelphia (Philadelphia-Camden-Wilmington, PA-NJ-DE-MD)',
    'Atlanta (Atlanta-Sandy Springs-Alpharetta, GA)',
    'Phoenix (Phoenix-Mesa-Chandler, AZ)',
    'Boston (Boston-Cambridge-Newton, MA-NH)',
    'San Francisco (San Francisco-Oakland-Berkeley, CA)',
    'Riverside (Riverside-San Bernardino-Ontario, CA)',
    'Detroit (Detroit-Warren-Dearborn, MI)',
    'Seattle (Seattle-Tacoma-Bellevue, WA)',
    'Austin'
  ];

  // Locked follower range: 10k-100k (Micro-influencers)
  const lockedFollowerRange = '10K - 100K (Micro-influencers)';

  const handleSearch = async () => {
    if (!searchParams.city || !searchParams.category) {
      toast({
        title: "Missing Information",
        description: "Please select city and category",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('find-influencers', {
        body: searchParams
      });

      if (error) throw error;

      if (data.success) {
        setInfluencers(data.influencers);
        setSearchTime(data.searchTime);
        setHasSearched(true);

        // Automatically save the search results
        await autoSaveSearchResults(data.influencers, data.searchTime);

        toast({
          title: "Search Complete",
          description: `Found ${data.totalFound} influencers in ${(data.searchTime / 1000).toFixed(1)}s`,
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search influencers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Removed handleFollowerRangeChange since range is now locked

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <SidebarComponent userName={profile?.name} />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Influencers</h1>
            <p className="text-gray-600">
              Discover real influencers using AI-powered web research (Limited to 5 results)
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                AI Influencer Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">US City</label>
                  <Select value={searchParams.city} onValueChange={(value) => setSearchParams(prev => ({ ...prev, city: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select US city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {usCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select value={searchParams.category} onValueChange={(value) => setSearchParams(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Follower Range</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{lockedFollowerRange}</span>
                    <Badge variant="outline" className="text-xs">
                      Locked
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently focused on micro-influencers for best engagement rates
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Results limited to <Badge variant="outline">5 influencers</Badge> per search
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchParams.city || !searchParams.category}
                  className="min-w-[120px]"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Influencers
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {hasSearched && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results ({influencers.length} found)
                </h2>
                <div className="flex items-center gap-3">
                  {searchTime > 0 && (
                    <Badge variant="outline">
                      Search completed in {(searchTime / 1000).toFixed(1)}s
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    Auto-saved to Recent Searches
                  </Badge>
                </div>
              </div>

              {influencers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Influencers Found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or try a different city/category combination.
                    </p>
                    <Button variant="outline" onClick={() => setHasSearched(false)}>
                      Try New Search
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {influencers.map((influencer, i) => (
                    <Card key={i} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {influencer.fullName ? influencer.fullName.charAt(0).toUpperCase() : 'I'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{influencer.fullName || 'Unknown'}</CardTitle>
                            <p className="text-sm text-gray-600 truncate">
                              {influencer.username || '@unknown'}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          {influencer.bio && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {influencer.bio}
                            </p>
                          )}

                          <div className="flex gap-2 flex-wrap">
                            {influencer.category && (
                              <Badge variant="outline" className="text-xs">
                                {influencer.category}
                              </Badge>
                            )}
                            {influencer.location && (
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {influencer.location}
                              </Badge>
                            )}
                          </div>

                          {influencer.followerCount && (
                            <div className="text-sm">
                              <span className="font-semibold">{influencer.followerCount}</span>
                              <span className="text-gray-600 ml-1">followers</span>
                            </div>
                          )}

                          <Button className="w-full" variant="outline" asChild>
                            <a
                              href={`https://instagram.com/${influencer.username?.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="w-4 h-4 mr-2" />
                              View Profile
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedSearches.slice(0, 5).map((savedSearch, index) => (
                    <div
                      key={savedSearch.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => loadSavedSearch(savedSearch)}
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {savedSearch.search_params.city} • {savedSearch.search_params.category}
                        </div>
                        <div className="text-xs text-gray-500">
                          {savedSearch.search_params.minFollowers} - {savedSearch.search_params.maxFollowers} followers • {savedSearch.results_count} results
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(savedSearch.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards - Only show if no search has been made */}
          {!hasSearched && (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Search className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">AI</div>
                  <div className="text-sm text-gray-600">Powered Search</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm text-gray-600">Results Per Search</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">US</div>
                  <div className="text-sm text-gray-600">Cities Only</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">Live</div>
                  <div className="text-sm text-gray-600">Data Extraction</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FindInfluencersPage;