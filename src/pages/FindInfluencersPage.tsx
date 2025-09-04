import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Star, TrendingUp, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import BrandSidebar from '@/components/brand/BrandSidebar';

const FindInfluencersPage = () => {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <BrandSidebar userName={profile?.name} />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Influencers</h1>
            <p className="text-gray-600">
              Discover and connect with the perfect influencers for your brand campaigns
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search influencers by name, niche, or keywords..." 
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">Fashion</Badge>
                <Badge variant="secondary">Tech</Badge>
                <Badge variant="secondary">Lifestyle</Badge>
                <Badge variant="secondary">Beauty</Badge>
                <Badge variant="secondary">Fitness</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-gray-600">Active Influencers</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Badge className="w-8 h-8 rounded-full flex items-center justify-center text-purple-500 bg-purple-100 mx-auto mb-2">
                  AI
                </Badge>
                <div className="text-2xl font-bold">Smart</div>
                <div className="text-sm text-gray-600">AI Matching</div>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder Influencer Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">Influencer {i + 1}</CardTitle>
                      <p className="text-sm text-gray-600">@username{i + 1}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-3">
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Fashion</Badge>
                      <Badge variant="outline" className="text-xs">Lifestyle</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <div className="font-semibold">{(Math.random() * 100 + 10).toFixed(0)}K</div>
                      <div className="text-gray-600">Followers</div>
                    </div>
                    <div>
                      <div className="font-semibold">{(Math.random() * 5 + 2).toFixed(1)}%</div>
                      <div className="text-gray-600">Engagement</div>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Influencers
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindInfluencersPage;