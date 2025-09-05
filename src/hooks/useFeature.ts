import { isFeatureEnabled, getFeatureInfo, Features } from '@/config/features';

// Hook for checking features in components
export const useFeature = (feature: keyof Features) => {
  return {
    isEnabled: isFeatureEnabled(feature),
    info: getFeatureInfo(feature)
  };
};