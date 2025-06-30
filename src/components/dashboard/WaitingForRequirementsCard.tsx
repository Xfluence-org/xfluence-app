import React from 'react';
import { Clock, FileText } from 'lucide-react';

interface WaitingForRequirementsCardProps {
  campaignTitle: string;
  brandName: string;
  acceptedDate: string;
}

const WaitingForRequirementsCard: React.FC<WaitingForRequirementsCardProps> = ({
  campaignTitle,
  brandName,
  acceptedDate
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-yellow-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-[#1a1f2e] mb-1">
            {campaignTitle}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            by {brandName}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
              <Clock className="h-3 w-3 mr-1" />
              Waiting for Requirements
            </span>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Waiting for content requirements</p>
                <p className="text-xs mt-1">The brand will share specific content requirements for this campaign soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        Accepted on: {new Date(acceptedDate).toLocaleDateString()}
      </div>
    </div>
  );
};

export default WaitingForRequirementsCard;