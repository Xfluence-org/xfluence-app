
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus, Users, Instagram, Star, MessageSquare } from 'lucide-react';
import { useBrandApplications } from '@/hooks/useBrandApplications';

interface AssignmentRequest {
  contentType: string;
  category: string;
  tier: string;
  requiredCount: number;
}

interface InfluencerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  assignmentRequest: AssignmentRequest;
  onAssignmentComplete: (assignments: any[]) => void;
}

interface ManualInfluencer {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  engagementRate: number;
  category: string;
}

const InfluencerAssignmentModal: React.FC<InfluencerAssignmentModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  assignmentRequest,
  onAssignmentComplete
}) => {
  const [activeTab, setActiveTab] = useState('applicants');
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualInfluencers, setManualInfluencers] = useState<ManualInfluencer[]>([]);
  const [newInfluencer, setNewInfluencer] = useState({
    name: '',
    handle: '',
    followers: '',
    engagementRate: ''
  });

  const { data: applications = [], isLoading } = useBrandApplications();

  // Filter applications based on assignment requirements and search
  const filteredApplicants = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      app.influencer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.influencer_handle.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tier based on follower count
    const matchesTier = (() => {
      const followers = app.followers_count;
      switch (assignmentRequest.tier) {
        case 'nano': return followers >= 1000 && followers <= 10000;
        case 'micro': return followers > 10000 && followers <= 100000;
        case 'mid': return followers > 50000 && followers <= 500000;
        case 'macro': return followers > 100000 && followers <= 1000000;
        case 'mega': return followers > 1000000;
        default: return true;
      }
    })();

    return matchesSearch && matchesTier && app.application_status === 'applied';
  });

  const handleInfluencerSelect = (influencerId: string) => {
    setSelectedInfluencers(prev => 
      prev.includes(influencerId) 
        ? prev.filter(id => id !== influencerId)
        : [...prev, influencerId]
    );
  };

  const handleAddManualInfluencer = () => {
    if (newInfluencer.name && newInfluencer.handle) {
      const influencer: ManualInfluencer = {
        id: `manual-${Date.now()}`,
        name: newInfluencer.name,
        handle: newInfluencer.handle,
        platform: 'Instagram',
        followers: parseInt(newInfluencer.followers) || 0,
        engagementRate: parseFloat(newInfluencer.engagementRate) || 0,
        category: assignmentRequest.category
      };
      
      setManualInfluencers(prev => [...prev, influencer]);
      setNewInfluencer({ name: '', handle: '', followers: '', engagementRate: '' });
    }
  };

  const handleAssignmentSubmit = () => {
    const assignments = [
      ...selectedInfluencers.map(id => ({ type: 'applicant', id })),
      ...manualInfluencers.map(inf => ({ type: 'manual', data: inf }))
    ];
    
    onAssignmentComplete(assignments);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'nano': return 'bg-green-100 text-green-800';
      case 'micro': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-purple-100 text-purple-800';
      case 'macro': return 'bg-orange-100 text-orange-800';
      case 'mega': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Assign Influencers for {assignmentRequest.contentType.charAt(0).toUpperCase() + assignmentRequest.contentType.slice(1)}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{assignmentRequest.category}</Badge>
            <Badge className={getTierColor(assignmentRequest.tier)}>
              {assignmentRequest.tier.charAt(0).toUpperCase() + assignmentRequest.tier.slice(1)} Tier
            </Badge>
            <Badge variant="secondary">Need {assignmentRequest.requiredCount} influencers</Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applicants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              From Applications ({filteredApplicants.length})
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Manually ({manualInfluencers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicants" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search applicants by name or handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Applicants List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading applicants...</p>
                </div>
              ) : filteredApplicants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No matching applicants found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search or add influencers manually</p>
                </div>
              ) : (
                filteredApplicants.map((applicant) => (
                  <Card key={applicant.application_id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedInfluencers.includes(applicant.application_id)}
                          onCheckedChange={() => handleInfluencerSelect(applicant.application_id)}
                        />
                        
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#1DDCD3] text-white">
                            {applicant.influencer_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{applicant.influencer_name}</h4>
                            <Badge variant="outline" className="text-xs">
                              <Instagram className="h-3 w-3 mr-1" />
                              @{applicant.influencer_handle}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{applicant.followers_count.toLocaleString()} followers</span>
                            <span>{applicant.engagement_rate}% engagement</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{applicant.ai_score}/100 AI match</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge className={getTierColor(assignmentRequest.tier)}>
                            {assignmentRequest.tier}
                          </Badge>
                          {applicant.application_message && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <MessageSquare className="h-3 w-3" />
                              <span>Has message</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            {/* Add Manual Influencer Form */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Add New Influencer</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Influencer Name"
                    value={newInfluencer.name}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="@handle"
                    value={newInfluencer.handle}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, handle: e.target.value }))}
                  />
                  <Input
                    placeholder="Followers Count"
                    type="number"
                    value={newInfluencer.followers}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, followers: e.target.value }))}
                  />
                  <Input
                    placeholder="Engagement Rate (%)"
                    type="number"
                    step="0.1"
                    value={newInfluencer.engagementRate}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, engagementRate: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleAddManualInfluencer}
                  className="mt-3 bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                  disabled={!newInfluencer.name || !newInfluencer.handle}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Influencer
                </Button>
              </CardContent>
            </Card>

            {/* Manual Influencers List */}
            <div className="space-y-3">
              {manualInfluencers.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No manual influencers added yet</p>
                  <p className="text-gray-400 text-sm">Add influencers who haven't applied but you'd like to work with</p>
                </div>
              ) : (
                manualInfluencers.map((influencer) => (
                  <Card key={influencer.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gray-200">
                            {influencer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{influencer.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              <Instagram className="h-3 w-3 mr-1" />
                              @{influencer.handle}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{influencer.followers.toLocaleString()} followers</span>
                            <span>{influencer.engagementRate}% engagement</span>
                            <Badge variant="secondary" className="text-xs">Manual Entry</Badge>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setManualInfluencers(prev => 
                            prev.filter(inf => inf.id !== influencer.id)
                          )}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            Selected: {selectedInfluencers.length + manualInfluencers.length} / {assignmentRequest.requiredCount} needed
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignmentSubmit}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
              disabled={selectedInfluencers.length + manualInfluencers.length === 0}
            >
              Assign {selectedInfluencers.length + manualInfluencers.length} Influencers
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerAssignmentModal;
