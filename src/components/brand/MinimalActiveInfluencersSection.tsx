import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface MinimalActiveInfluencersSectionProps {
  campaignId: string;
  contentType: string;
  onViewTasks?: (participantId: string, influencerId: string) => void;
}

const MinimalActiveInfluencersSection: React.FC<MinimalActiveInfluencersSectionProps> = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-600 font-medium text-sm">No active participants</p>
      <p className="text-gray-500 text-xs mt-1">
        Active participants will appear here when you assign influencers.
      </p>
    </div>
  );
};

export default MinimalActiveInfluencersSection;