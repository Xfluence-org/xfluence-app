// Simple test to verify feature management system works
import { isFeatureEnabled, getFeatureInfo } from '@/config/features';

export const testFeatureSystem = () => {
  console.log('🧪 Testing Feature Management System...');
  
  // Test core features
  const coreFeatures = ['contentAnalysis', 'findInfluencers', 'aiAssistant'] as const;
  
  coreFeatures.forEach(feature => {
    const isEnabled = isFeatureEnabled(feature);
    const info = getFeatureInfo(feature);
    
    console.log(`✅ ${feature}:`, {
      enabled: isEnabled,
      comingSoon: info.comingSoon,
      releaseDate: info.releaseDate
    });
  });
  
  // Test disabled features
  const disabledFeatures = ['brandDashboard', 'brandCampaigns', 'opportunities'] as const;
  
  disabledFeatures.forEach(feature => {
    const isEnabled = isFeatureEnabled(feature);
    const info = getFeatureInfo(feature);
    
    console.log(`🔒 ${feature}:`, {
      enabled: isEnabled,
      comingSoon: info.comingSoon,
      releaseDate: info.releaseDate
    });
  });
  
  console.log('✅ Feature Management System Test Complete!');
};

// Auto-run in development
if (import.meta.env.DEV) {
  testFeatureSystem();
}