
import React from 'react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import ApplicationsManagementSection from '@/components/brand/ApplicationsManagementSection';
import { useBrandApplications } from '@/hooks/useBrandApplications';
import { useAuth } from '@/contexts/SimpleAuthContext';

const BrandApplicationsPage: React.FC = () => {
  const { profile } = useAuth();
  const { data: applications = [], isLoading, error } = useBrandApplications(50);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName={profile?.name || 'Brand'} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading applications...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <BrandSidebar userName={profile?.name || 'Brand'} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error loading applications</p>
              <p className="text-gray-500 mt-2">{error?.message}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BrandSidebar userName={profile?.name || 'Brand'} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Campaign Applications</h1>
            <p className="text-gray-600">Review and manage influencer applications to your campaigns.</p>
          </header>

          <section>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              {applications.length > 0 ? (
                <div className="space-y-6">
                  {applications.map((application) => (
                    <ApplicationsManagementSection
                      key={application.campaign_id}
                      campaignId={application.campaign_id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No applications found</p>
                  <p className="text-gray-400 mt-2">
                    Applications will appear here once influencers apply to your campaigns
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BrandApplicationsPage;
