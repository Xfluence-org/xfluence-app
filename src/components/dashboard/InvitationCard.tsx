
import React from 'react';

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

interface InvitationCardProps {
  campaign: Campaign;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ campaign, onAccept, onDecline }) => {
  const formatRequirements = () => {
    const parts = [];
    if (campaign.requirements.posts) parts.push(`${campaign.requirements.posts} Posts`);
    if (campaign.requirements.stories) parts.push(`${campaign.requirements.stories} Stories`);
    if (campaign.requirements.reels) parts.push(`${campaign.requirements.reels} Reel`);
    return parts.join(', ');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1a1f2e] mb-1">{campaign.brand}</h3>
          <p className="text-2xl font-bold text-[#1DDCD3]">${campaign.amount?.toLocaleString()}</p>
        </div>
      </div>

      <h4 className="font-semibold text-gray-800 mb-2">{campaign.title}</h4>
      
      <div className="text-sm text-gray-600 mb-4 space-y-1">
        <p>Due: {campaign.dueDate}</p>
        <p>{formatRequirements()}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onDecline(campaign.id)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
        >
          Decline
        </button>
        <button
          onClick={() => onAccept(campaign.id)}
          className="flex-1 px-4 py-2 bg-[#1DDCD3] text-white rounded-lg hover:bg-[#00D4C7] transition-all duration-200 font-medium"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default InvitationCard;
