
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface AcceptedInfluencer {
  application_id: string;
  influencer_name: string;
  influencer_handle: string;
  followers_count: number;
  engagement_rate: number;
  ai_score: number;
  application_message: string;
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
  const [acceptedInfluencers, setAcceptedInfluencers] = useState<AcceptedInfluencer[]>([]);
  const [alreadyAssignedIds, setAlreadyAssignedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newInfluencer, setNewInfluencer] = useState({
    name: '',
    handle: '',
    followers: '',
    engagementRate: ''
  });
  const { toast } = useToast();

  // Fetch accepted influencers and already assigned ones
  React.useEffect(() => {
    const fetchInfluencersData = async () => {
      if (!isOpen) return;
      
      // Fetch accepted influencers for this campaign
      const { data, error } = await supabase.rpc('get_brand_applications_all');
      
      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      // Filter for accepted/approved influencers for this campaign
      const accepted = data?.filter(app => 
        app.campaign_id === campaignId && 
        ['accepted', 'approved', 'active'].includes(app.application_status)
      ) || [];
      
      setAcceptedInfluencers(accepted);

      // Fetch already assigned influencers for this specific content type, category, and tier
      const { data: assignments, error: assignmentError } = await supabase
        .from('campaign_content_assignments')
        .select('influencer_id, campaign_participants!inner(id)')
        .eq('campaign_id', campaignId)
        .eq('content_type', assignmentRequest.contentType)
        .eq('category', assignmentRequest.category)
        .eq('tier', assignmentRequest.tier)
        .not('influencer_id', 'is', null);

      if (!assignmentError && assignments) {
        // Get the application IDs that are already assigned
        const assignedApplicationIds: string[] = [];
        
        for (const assignment of assignments) {
          // Find the application ID for this influencer_id
          const matchingApp = accepted.find(app => {
            // We need to match by influencer_id - get from campaign_participants
            return true; // We'll handle this differently
          });
        }

        // Alternative approach: get assigned influencer IDs directly
        const assignedInfluencerIds = assignments.map(a => a.influencer_id).filter(Boolean);
        
        // Find corresponding application IDs
        const assignedAppIds = accepted
          .filter(app => {
            // We need to check if this application's influencer is already assigned
            // This requires checking the campaign_participants table
            return false; // We'll implement this check below
          })
          .map(app => app.application_id);

        setAlreadyAssignedIds(assignedAppIds);
      }
    };

    const fetchAlreadyAssigned = async () => {
      if (!isOpen) return;

      // Get campaign participants that are already assigned to this specific content/category/tier
      const { data: assignedParticipants, error } = await supabase
        .from('campaign_content_assignments')
        .select(`
          campaign_participants!inner(id, influencer_id)
        `)
        .eq('campaign_id', campaignId)
        .eq('content_type', assignmentRequest.contentType)
        .eq('category', assignmentRequest.category)
        .eq('tier', assignmentRequest.tier);

      if (!error && assignedParticipants) {
        const assignedIds = assignedParticipants.map(ap => 
          (ap as any).campaign_participants?.id
        ).filter(Boolean);
        setAlreadyAssignedIds(assignedIds);
      }
    };

    fetchInfluencersData();
    fetchAlreadyAssigned();
  }, [isOpen, campaignId, assignmentRequest]);

  // Filter accepted influencers based on assignment requirements and search, excluding already assigned
  const filteredApplicants = acceptedInfluencers.filter(app => {
    // Exclude already assigned influencers
    if (alreadyAssignedIds.includes(app.application_id)) {
      return false;
    }

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

    return matchesSearch && matchesTier;
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

  const handleAssignmentSubmit = async () => {
    setLoading(true);
    try {
      // Prepare assignments data with proper typing
      const assignments = [
        ...selectedInfluencers.map(id => ({ type: 'applicant', id })),
        ...manualInfluencers.map(inf => ({ 
          type: 'manual', 
          data: {
            name: inf.name,
            handle: inf.handle,
            platform: inf.platform,
            followers: inf.followers,
            engagementRate: inf.engagementRate,
            category: inf.category
          }
        }))
      ];

      // Call the database function to assign influencers
      const { data: assignmentIds, error } = await supabase.rpc('assign_influencers_to_campaign', {
        campaign_id_param: campaignId,
        content_type_param: assignmentRequest.contentType,
        category_param: assignmentRequest.category,
        tier_param: assignmentRequest.tier,
        assignments: JSON.stringify(assignments) as any // Serialize to JSON string
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Successfully assigned ${assignments.length} influencer(s) to ${assignmentRequest.contentType}`,
      });

      onAssignmentComplete(assignments);
      
      // Reset form
      setSelectedInfluencers([]);
      setManualInfluencers([]);
      onClose();
      
    } catch (error) {
      console.error('Error assigning influencers:', error);
      toast({
        title: "Error",
        description: "Failed to assign influencers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            {alreadyAssignedIds.length > 0 && (
              <Badge variant="outline" className="text-orange-600">
                {alreadyAssignedIds.length} already assigned
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applicants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              From Approved ({filteredApplicants.length})
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
                placeholder="Search approved influencers by name or handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Approved Influencers List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredApplicants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    {alreadyAssignedIds.length > 0 
                      ? "No more approved influencers available for this assignment"
                      : "No approved influencers found for this tier"
                    }
                  </p>
                  <p className="text-gray-400 text-sm">
                    {alreadyAssignedIds.length > 0 
                      ? "All matching influencers are already assigned to this task"
                      : "Try adding influencers manually or adjust the tier requirements"
                    }
                  </p>
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
              disabled={selectedInfluencers.length + manualInfluencers.length === 0 || loading}
            >
              {loading ? 'Assigning...' : `Assign ${selectedInfluencers.length + manualInfluencers.length} Influencers`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerAssignmentModal;
