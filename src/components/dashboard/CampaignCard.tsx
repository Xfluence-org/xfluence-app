import React from 'react';
import ProgressBar from './ProgressBar';

interface Campaign {
  id: string;
  brand: string;
  title: string;
  amount: number;
  dueDate: string;
  requirements: {
    posts?: number;
    stories?: number;
    reels?: number;
  };
  progress?: number;
  status: 'invited' | 'accepted' | 'active' | 'completed' | 'declined';
  currentStage?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onClick?: (campaignId: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => {
  const workflowSteps = ['Content Draft', 'Brand Review', 'Post Content', 'Submit report'];
  const currentStep = Math.floor((campaign.progress || 0) / 25);

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer" 
      onClick={() => onClick?.(campaign.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1a1f2e] mb-1">
            {campaign.brand} - {campaign.title}
          </h3>
          <span className="inline-block px-3 py-1 bg-[#1DDCD3] text-white text-xs rounded-full font-medium">
            in progress
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-[#1a1f2e]">{campaign.progress}% Progress</span>
        </div>
        <ProgressBar progress={campaign.progress || 0} />
      </div>

      <div className="flex items-center gap-3 text-sm">
        {workflowSteps.map((step, index) => (
          <React.Fragment key={step}>
            <span
              className={`font-medium transition-colors duration-200 ${
                index < currentStep
                  ? 'text-[#1DDCD3]'
                  : index === currentStep
                  ? 'text-[#1a1f2e]'
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
