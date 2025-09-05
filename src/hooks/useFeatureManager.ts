import { useState, useEffect } from 'react';
import { FEATURES, Features, FeatureConfig } from '@/config/features';

const STORAGE_KEY = 'xfluence_feature_overrides';

// In a real app, this would be stored in a database and managed server-side
// For demo purposes, we'll use localStorage with the ability to sync to a backend
export const useFeatureManager = () => {
  const [features, setFeatures] = useState<Features>(FEATURES);
  const [hasChanges, setHasChanges] = useState(false);

  // Load feature overrides from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const overrides = JSON.parse(stored);
        const mergedFeatures = { ...FEATURES };
        
        // Apply overrides to default features
        Object.keys(overrides).forEach(key => {
          if (key in mergedFeatures) {
            mergedFeatures[key as keyof Features] = {
              ...mergedFeatures[key as keyof Features],
              ...overrides[key]
            };
          }
        });
        
        setFeatures(mergedFeatures);
      } catch (error) {
        console.error('Failed to load feature overrides:', error);
      }
    }
  }, []);

  const updateFeature = (featureName: keyof Features, updates: Partial<FeatureConfig>) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: {
        ...prev[featureName],
        ...updates
      }
    }));
    setHasChanges(true);
  };

  const toggleFeature = (featureName: keyof Features) => {
    updateFeature(featureName, { enabled: !features[featureName].enabled });
  };

  const saveChanges = async () => {
    try {
      // Create overrides object (only store differences from defaults)
      const overrides: Partial<Features> = {};
      
      Object.keys(features).forEach(key => {
        const featureKey = key as keyof Features;
        const current = features[featureKey];
        const defaultFeature = FEATURES[featureKey];
        
        // Only store if different from default
        if (JSON.stringify(current) !== JSON.stringify(defaultFeature)) {
          overrides[featureKey] = current;
        }
      });

      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      
      // In production, you would also sync to your backend:
      // await fetch('/api/admin/features', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(overrides)
      // });

      setHasChanges(false);
      return { success: true };
    } catch (error) {
      console.error('Failed to save features:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const resetToDefaults = () => {
    setFeatures(FEATURES);
    localStorage.removeItem(STORAGE_KEY);
    setHasChanges(false);
  };

  const getFeatureStatus = (featureName: keyof Features) => {
    return features[featureName];
  };

  const isFeatureEnabled = (featureName: keyof Features) => {
    return features[featureName]?.enabled || false;
  };

  return {
    features,
    hasChanges,
    updateFeature,
    toggleFeature,
    saveChanges,
    resetToDefaults,
    getFeatureStatus,
    isFeatureEnabled
  };
};