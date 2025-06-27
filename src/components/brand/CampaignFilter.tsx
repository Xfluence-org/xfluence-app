
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
}

interface CampaignFilterProps {
  campaigns: Campaign[];
  selectedCampaign: string;
  onCampaignChange: (campaignId: string) => void;
}

const CampaignFilter: React.FC<CampaignFilterProps> = ({
  campaigns,
  selectedCampaign,
  onCampaignChange
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter by Campaign:</span>
      </div>
      
      <Select value={selectedCampaign} onValueChange={onCampaignChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="All Campaigns" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Campaigns</SelectItem>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign.id} value={campaign.id}>
              {campaign.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CampaignFilter;
