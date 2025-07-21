import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface MinimalWaitingSectionProps {
  campaignId: string;
  contentType: string;
}

const MinimalWaitingSection: React.FC<MinimalWaitingSectionProps> = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <Clock className="h-10 w-10 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-600 font-medium text-sm">No participants waiting</p>
      <p className="text-gray-500 text-xs mt-1">
        Assigned participants will appear here until you share requirements.
      </p>
    </div>
  );
};

export default MinimalWaitingSection;