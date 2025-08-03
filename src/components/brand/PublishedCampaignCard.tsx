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
    const colors: Record<string, string> = {
      'Fashion': 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border-purple-300/50',
      'Beauty': 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-700 border-pink-300/50',
      'Tech': 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-300/50',
      'Technology': 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-300/50',
      'Food': 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 border-orange-300/50',
      'Food & Drinks': 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 border-orange-300/50',
      'Lifestyle': 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-green-300/50',
      'Travel': 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-700 border-sky-300/50',
      'Fitness': 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-700 border-red-300/50',
      'Gaming': 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 border-violet-300/50',
      'General': 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 border-gray-300/50'
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
      className="glass border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-300/30 cursor-pointer"
      onClick={() => onViewDetails?.(campaign.id)}
    >
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                {campaign.title}
              </CardTitle>
              <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getCategoryColor(campaign.category)}`}>
                {campaign.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
              <Calendar className="h-3 w-3" />
              <span>Published {format(new Date(campaign.published_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        {campaign.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {campaign.description}
          </p>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-light rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <Users className="h-3.5 w-3.5 text-purple-600" />
              <span>Influencers</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {campaign.total_influencers}
            </p>
          </div>
          
          <div className="glass-light rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <Eye className="h-3.5 w-3.5 text-purple-600" />
              <span>Total Reach</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatReach(campaign.total_reach)}
            </p>
          </div>
          
          <div className="glass-light rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
              <span>Engagement</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {campaign.avg_engagement_rate.toFixed(1)}%
            </p>
          </div>
          
          <div className="glass-light rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-purple-600" />
              <span>Budget</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              ${(campaign.budget / 100).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {campaign.completion_rate.toFixed(0)}%
            </span>
          </div>
          <div className="relative h-2 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" 
              style={{ width: `${campaign.completion_rate}%` }}
            />
          </div>
        </div>

        {/* Success Badge */}
        {campaign.completion_rate === 100 && (
          <div className="flex items-center justify-center pt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border border-green-300/50 backdrop-blur-sm">
              Successfully Completed
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublishedCampaignCard;