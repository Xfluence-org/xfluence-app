
import React from 'react';
import { Campaign } from '@/types/dashboard';
import ProgressBar from './ProgressBar';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const workflowSteps = ['Content Draft', 'Brand Review', 'Post Content', 'Submit report'];
  const currentStep = Math.floor((campaign.progress || 0) / 25);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {campaign.brand} - {campaign.title}
          </h3>
          <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs rounded-full font-medium">
            in progress
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{campaign.progress}% Progress</span>
        </div>
        <ProgressBar progress={campaign.progress || 0} />
      </div>

      <div className="flex items-center gap-3 text-sm">
        {workflowSteps.map((step, index) => (
          <React.Fragment key={step}>
            <span
              className={`font-medium transition-colors duration-200 ${
                index < currentStep
                  ? 'text-green-600'
                  : index === currentStep
                  ? 'text-gray-900'
                  : 'text-gray-400'
              }`}
            >
              {step}
            </span>
            {index < workflowSteps.length - 1 && (
              <span className="text-gray-300">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CampaignCard;
