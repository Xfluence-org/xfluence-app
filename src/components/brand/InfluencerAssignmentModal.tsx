import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Instagram, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
  email: string;
  platform: string;
}

const InfluencerAssignmentModal: React.FC<InfluencerAssignmentModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  assignmentRequest,
  onAssignmentComplete
}) => {
  const [manualInfluencers, setManualInfluencers] = useState<ManualInfluencer[]>([]);
  const [loading, setLoading] = useState(false);
  const [newInfluencer, setNewInfluencer] = useState({
    name: '',
    handle: '',
    email: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddManualInfluencer = () => {
    if (newInfluencer.name && newInfluencer.handle && newInfluencer.email) {
      const influencer: ManualInfluencer = {
        id: `manual-${Date.now()}`,
        name: newInfluencer.name,
        handle: newInfluencer.handle.startsWith('@') ? newInfluencer.handle : `@${newInfluencer.handle}`,
        email: newInfluencer.email,
        platform: 'Instagram'
      };
      
      setManualInfluencers(prev => [...prev, influencer]);
      setNewInfluencer({ name: '', handle: '', email: '' });
    }
  };

  const handleRemoveInfluencer = (id: string) => {
    setManualInfluencers(prev => prev.filter(inf => inf.id !== id));
  };

  const handleAssignmentSubmit = async () => {
    setLoading(true);
    try {
      // Create campaign participants with manual data for email invitations
      // These will become "invitations" that influencers see when they log in with the same email
      
      for (const manualInfluencer of manualInfluencers) {
        // Store assignment details in a structured format for easy access
        const assignmentData = {
          tier: assignmentRequest.tier,
          category: assignmentRequest.category,
          contentType: assignmentRequest.contentType,
          influencerDetails: {
            name: manualInfluencer.name,
            handle: manualInfluencer.handle,
            email: manualInfluencer.email,
            platform: manualInfluencer.platform
          }
        };
        
        // Create invitation record that influencer will see when they sign in
        await supabase
          .from('campaign_participants')
          .insert({
            campaign_id: campaignId,
            influencer_id: null, // Will be set when influencer claims this invitation
            status: 'invited',
            current_stage: 'waiting_for_requirements',
            application_message: JSON.stringify(assignmentData)
          });
      }

      toast({
        title: "Success",
        description: `Successfully added ${manualInfluencers.length} influencer(s) to ${assignmentRequest.contentType}`,
      });

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['waiting-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['active-participants', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-participants', campaignId] });

      onAssignmentComplete([]);
      
      // Reset form
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add Influencers for {assignmentRequest.contentType.charAt(0).toUpperCase() + assignmentRequest.contentType.slice(1)}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{assignmentRequest.category}</Badge>
            <Badge className={getTierColor(assignmentRequest.tier)}>
              {assignmentRequest.tier.charAt(0).toUpperCase() + assignmentRequest.tier.slice(1)} Tier
            </Badge>
            <Badge variant="secondary">Need {assignmentRequest.requiredCount} influencers</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Manual Influencer Form */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="h-5 w-5 text-[#1DDCD3]" />
              <h3 className="text-lg font-semibold">Add Influencer Manually</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  value={newInfluencer.name}
                  onChange={(e) => setNewInfluencer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Handle *
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={newInfluencer.handle}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, handle: e.target.value }))}
                    placeholder="username (without @)"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={newInfluencer.email}
                  onChange={(e) => setNewInfluencer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            
            <Button
              onClick={handleAddManualInfluencer}
              disabled={!newInfluencer.name || !newInfluencer.handle || !newInfluencer.email}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Influencer
            </Button>
          </div>

          {/* Added Influencers List */}
          {manualInfluencers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Added Influencers ({manualInfluencers.length})</h3>
              <div className="space-y-3">
                {manualInfluencers.map((influencer) => (
                  <Card key={influencer.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-[#1DDCD3] flex items-center justify-center">
                            <Instagram className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{influencer.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{influencer.handle}</span>
                              <span>•</span>
                              <span>{influencer.email}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInfluencer(influencer.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignmentSubmit}
              disabled={manualInfluencers.length === 0 || loading}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
            >
              {loading ? 'Assigning...' : `Assign ${manualInfluencers.length} Influencer${manualInfluencers.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerAssignmentModal;