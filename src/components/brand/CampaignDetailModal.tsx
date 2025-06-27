
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCampaignDetail } from '@/hooks/useCampaignDetail';
import InfluencerPerformanceSection from '@/components/brand/InfluencerPerformanceSection';
import { Save, Edit, X } from 'lucide-react';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string | null;
  onUpdate: (campaignId: string, updates: any) => void;
}

const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: 0
  });

  const { data: campaign, isLoading, error } = useCampaignDetail(campaignId);

  useEffect(() => {
    if (campaign) {
      // Handle category conversion from array to string for the form
      const categoryValue = Array.isArray(campaign.category) 
        ? campaign.category[0] || '' 
        : campaign.category || '';
        
      setEditForm({
        title: campaign.title || '',
        description: campaign.description || '',
        category: categoryValue,
        budget: campaign.budget || 0
      });
    }
  }, [campaign]);

  const handleSave = async () => {
    if (campaignId) {
      await onUpdate(campaignId, editForm);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (campaign) {
      // Handle category conversion from array to string for the form
      const categoryValue = Array.isArray(campaign.category) 
        ? campaign.category[0] || '' 
        : campaign.category || '';
        
      setEditForm({
        title: campaign.title || '',
        description: campaign.description || '',
        category: categoryValue,
        budget: campaign.budget || 0
      });
    }
    setIsEditing(false);
  };

  if (!isOpen || !campaignId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#1a1f2e]">
              Campaign Details
            </DialogTitle>
            {!isEditing ? (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="ml-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading campaign details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading campaign details</p>
          </div>
        ) : campaign ? (
          <div className="space-y-6">
            {/* Campaign Info Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#1a1f2e] mb-4">Campaign Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter campaign title"
                    />
                  ) : (
                    <p className="text-gray-900">{campaign.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Enter category"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {Array.isArray(campaign.category) 
                        ? campaign.category[0] || 'General' 
                        : campaign.category || 'General'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editForm.budget}
                      onChange={(e) => setEditForm(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter budget"
                    />
                  ) : (
                    <p className="text-gray-900">${campaign.budget?.toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <span className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-[#1DDCD3]">
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{campaign.description || 'No description available'}</p>
                )}
              </div>
            </div>

            {/* Influencers & Performance Section */}
            <InfluencerPerformanceSection campaignId={campaignId} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailModal;
