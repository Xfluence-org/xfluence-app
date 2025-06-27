
import React from 'react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import ApplicationsTab from '@/components/brand/ApplicationsTab';

const BrandApplicationsPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BrandSidebar userName="Brand Team" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Applications</h1>
            <p className="text-gray-600">Manage and review influencer applications for your campaigns.</p>
          </header>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <ApplicationsTab />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandApplicationsPage;
