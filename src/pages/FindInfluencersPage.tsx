import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, MapPin, Instagram, Youtube, Video, Filter } from 'lucide-react';

const FindInfluencersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Find Perfect Influencers
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and connect with influencers that match your brand's values, audience, and campaign goals.
          </p>
        </div>

        {/* Search Section */}
        <Card className="max-w-4xl mx-auto border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Search Influencers
            </CardTitle>
            <CardDescription>
              Use keywords, niches, or specific criteria to find your ideal collaborators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search by niche, keywords, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg h-12"
                />
              </div>
              <Button size="lg" className="px-8">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Popular searches:</span>
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">Fashion</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">Fitness</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">Tech</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">Travel</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">Food</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Instagram className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Youtube className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Followers</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>Any size</option>
                  <option>1K - 10K</option>
                  <option>10K - 100K</option>
                  <option>100K - 1M</option>
                  <option>1M+</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input placeholder="Enter location" className="text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Engagement Rate</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>Any rate</option>
                  <option>1% - 3%</option>
                  <option>3% - 6%</option>
                  <option>6%+</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Results */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-semibold">Featured Influencers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mx-auto flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">@influencer{i}</h3>
                      <p className="text-sm text-muted-foreground">Fashion & Lifestyle</p>
                    </div>
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{(Math.random() * 900 + 100).toFixed(0)}K</div>
                        <div className="text-muted-foreground">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{(Math.random() * 5 + 1).toFixed(1)}%</div>
                        <div className="text-muted-foreground">Engagement</div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        New York
                      </Badge>
                    </div>
                    <Button size="sm" className="w-full">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Notice */}
        <Card className="max-w-md mx-auto bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold text-primary mb-2">Coming Soon!</h3>
            <p className="text-sm text-muted-foreground">
              This feature is currently in development. Full functionality will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindInfluencersPage;