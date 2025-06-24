
import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import InvitationCard from '@/components/dashboard/InvitationCard';
import CampaignCard from '@/components/dashboard/CampaignCard';
import { Campaign } from '@/types/dashboard';

const InfluencerDashboard: React.FC = () => {
  const [invitations] = useState<Campaign[]>([
    {
      id: '1',
      brand: 'Nike',
      title: 'Summertime Collection Launch',
      amount: 2000,
      dueDate: 'June 24, 2025',
      requirements: { posts: 2, stories: 3 },
      status: 'invitation'
    },
    {
      id: '2',
      brand: 'Starbucks',
      title: 'Holiday Drinks Campaign',
      amount: 1500,
      dueDate: 'June 24, 2025',
      requirements: { reels: 3, stories: 2 },
      status: 'invitation'
    }
  ]);

  const [activeCampaigns] = useState<Campaign[]>([
    {
      id: '3',
      brand: 'Adidas',
      title: 'Fitness Motivation',
      progress: 75,
      status: 'active',
      dueDate: '',
      requirements: {}
    },
    {
      id: '4',
      brand: 'Samsung',
      title: 'Galaxy S25 Review',
      progress: 50,
      status: 'active',
      dueDate: '',
      requirements: {}
    }
  ]);

  const handleAccept = (campaignId: string) => {
    console.log('Accepted campaign:', campaignId);
    // Handle campaign acceptance
  };

  const handleDecline = (campaignId: string) => {
    console.log('Declined campaign:', campaignId);
    // Handle campaign decline
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar activeItem="dashboard" userName="Name" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Dashboard</h1>
          </header>

          {/* New Campaign Invitations */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-2">New Campaign Invitations</h2>
              <p className="text-gray-600 mb-6">Brands want to collaborate with you</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {invitations.map((campaign) => (
                  <InvitationCard
                    key={campaign.id}
                    campaign={campaign}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Active Campaigns */}
          <section>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a1f2e] mb-6">Active Campaigns</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default InfluencerDashboard;
