import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface PendingApplicationCardProps {
  campaign: {
    id: string;
    title: string;
    brand: string;
    amount: number;
    appliedDate: string;
  };
}

const PendingApplicationCard: React.FC<PendingApplicationCardProps> = ({ campaign }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-[#1a1f2e] mb-1">
            {campaign.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            by {campaign.brand}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <Clock className="h-3 w-3 mr-1" />
              Application Pending
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Applied on: {new Date(campaign.appliedDate).toLocaleDateString()}
      </div>
    </div>
  );
};

export default PendingApplicationCard;