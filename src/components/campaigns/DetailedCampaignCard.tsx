
import React from 'react';
import { DetailedCampaign } from '@/types/campaigns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DetailedCampaignCardProps {
  campaign: DetailedCampaign;
  onViewDetails: (campaignId: string) => void;
}

const DetailedCampaignCard: React.FC<DetailedCampaignCardProps> = ({ 
  campaign, 
  onViewDetails 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'invited':
        return <Badge variant="secondary">Invited</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'active':
        return <Badge className="bg-[#1DDCD3] hover:bg-[#00D4C7]">Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-600 hover:bg-gray-700">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-[#1a1f2e] mb-2">
              {campaign.title}
            </CardTitle>
            <p className="text-gray-600 mb-2">by {campaign.brand}</p>
            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge(campaign.status)}
              <span className="text-sm text-gray-500">
                Due: {campaign.dueDate}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1DDCD3]">
              {formatAmount(campaign.amount)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Tasks</p>
            <p className="font-semibold text-[#1a1f2e]">
              {campaign.completedTasks}/{campaign.taskCount} completed
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <p className="font-semibold text-[#1a1f2e]">{campaign.overallProgress}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Platforms</p>
            <p className="font-semibold text-[#1a1f2e]">
              {campaign.platforms.join(', ')}
            </p>
          </div>
        </div>

        {campaign.overallProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#1DDCD3] h-2 rounded-full transition-all duration-300"
                style={{ width: `${campaign.overallProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={() => onViewDetails(campaign.id)}
            className="bg-[#1DDCD3] hover:bg-[#00D4C7] text-white"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedCampaignCard;
