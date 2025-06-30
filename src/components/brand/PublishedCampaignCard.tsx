import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PublishedCampaign } from '@/hooks/usePublishedCampaigns';
import { TrendingUp, Users, Eye, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface PublishedCampaignCardProps {
  campaign: PublishedCampaign;
  onViewDetails?: (campaignId: string) => void;
}

const PublishedCampaignCard: React.FC<PublishedCampaignCardProps> = ({ campaign, onViewDetails }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Fashion': 'bg-purple-100 text-purple-700',
      'Beauty': 'bg-pink-100 text-pink-700',
      'Tech': 'bg-blue-100 text-blue-700',
      'Food': 'bg-orange-100 text-orange-700',
      'Lifestyle': 'bg-green-100 text-green-700',
      'General': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors['General'];
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000000) {
      return `${(reach / 1000000).toFixed(1)}M`;
    } else if (reach >= 1000) {
      return `${(reach / 1000).toFixed(1)}K`;
    }
    return reach.toString();
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200"
      onClick={() => onViewDetails?.(campaign.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold text-[#1a1f2e]">
              {campaign.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Published {format(new Date(campaign.published_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <Badge className={getCategoryColor(campaign.category)}>
            {campaign.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {campaign.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {campaign.description}
          </p>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              <span>Influencers</span>
            </div>
            <p className="text-lg font-semibold text-[#1a1f2e]">
              {campaign.total_influencers}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-3 w-3" />
              <span>Total Reach</span>
            </div>
            <p className="text-lg font-semibold text-[#1a1f2e]">
              {formatReach(campaign.total_reach)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3" />
              <span>Engagement</span>
            </div>
            <p className="text-lg font-semibold text-[#1a1f2e]">
              {campaign.avg_engagement_rate.toFixed(1)}%
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <DollarSign className="h-3 w-3" />
              <span>Budget</span>
            </div>
            <p className="text-lg font-semibold text-[#1a1f2e]">
              ${(campaign.budget / 100).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-medium text-[#1a1f2e]">{campaign.completion_rate.toFixed(0)}%</span>
          </div>
          <Progress value={campaign.completion_rate} className="h-2" />
        </div>

        {/* Success Badge */}
        {campaign.completion_rate === 100 && (
          <div className="flex items-center justify-center pt-2">
            <Badge className="bg-green-100 text-green-700 border-green-300">
              ✅ Successfully Completed
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublishedCampaignCard;