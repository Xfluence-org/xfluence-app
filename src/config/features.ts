// Feature flags for controlled rollout
export interface FeatureConfig {
  enabled: boolean;
  comingSoon?: boolean;
  releaseDate?: string;
  description?: string;
}

export interface Features {
  // Core features
  dashboard: FeatureConfig;
  campaigns: FeatureConfig;
  opportunities: FeatureConfig;
  settings: FeatureConfig;
  
  // Brand-specific features
  brandDashboard: FeatureConfig;
  brandCampaigns: FeatureConfig;
  brandSettings: FeatureConfig;
  brandAIAssistant: FeatureConfig;
  brandProgress: FeatureConfig;
  
  // Influencer features
  influencerDashboard: FeatureConfig;
  influencerSettings: FeatureConfig;
  taskWorkflow: FeatureConfig;
  
  // Advanced features
  contentAnalysis: FeatureConfig;
  findInfluencers: FeatureConfig;
  aiAssistant: FeatureConfig;
  analytics: FeatureConfig;
  paymentProcessing: FeatureConfig;
}

// Production feature configuration for controlled rollout
export const FEATURES: Features = {
  // Phase 1: Core MVP features (Launch Day)
  contentAnalysis: {
    enabled: true,
    description: "AI-powered content analysis and scoring"
  },
  
  findInfluencers: {
    enabled: true,
    description: "Discover and connect with influencers"
  },
  
  aiAssistant: {
    enabled: true,
    description: "AI marketing assistant for campaign strategy"
  },
  
  // Phase 2: Dashboard & Basic Management (Week 2)
  dashboard: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 2 weeks",
    description: "Comprehensive analytics dashboard"
  },
  
  brandDashboard: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 2 weeks",
    description: "Brand performance overview"
  },
  
  influencerDashboard: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 2 weeks", 
    description: "Influencer task management"
  },
  
  // Phase 3: Campaign Management (Month 1)
  campaigns: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming next month",
    description: "Full campaign creation and management"
  },
  
  brandCampaigns: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming next month",
    description: "Brand campaign management suite"
  },
  
  opportunities: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming next month",
    description: "Discover campaign opportunities"
  },
  
  taskWorkflow: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming next month",
    description: "Advanced task workflow management"
  },
  
  // Phase 4: Advanced Features (Month 2)
  brandProgress: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 2 months",
    description: "Real-time campaign progress tracking"
  },
  
  analytics: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 2 months",
    description: "Advanced analytics and reporting"
  },
  
  // Phase 5: Settings & Payments (Month 3)
  settings: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 3 months",
    description: "Account and preference management"
  },
  
  brandSettings: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 3 months",
    description: "Brand profile and team management"
  },
  
  influencerSettings: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 3 months",
    description: "Influencer profile customization"
  },
  
  paymentProcessing: {
    enabled: false,
    comingSoon: true,
    releaseDate: "Coming in 3 months",
    description: "Secure payment processing"
  }
};

// Get current feature overrides from localStorage
const getFeatureOverrides = (): Partial<Features> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem('xfluence_feature_overrides');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Get current feature configuration (with overrides applied)
const getCurrentFeatures = (): Features => {
  const overrides = getFeatureOverrides();
  const current = { ...FEATURES };
  
  Object.keys(overrides).forEach(key => {
    if (key in current) {
      current[key as keyof Features] = {
        ...current[key as keyof Features],
        ...overrides[key as keyof Features]
      };
    }
  });
  
  return current;
};

// Helper function to check if a feature is enabled (with overrides)
export const isFeatureEnabled = (featureName: keyof Features): boolean => {
  const currentFeatures = getCurrentFeatures();
  return currentFeatures[featureName]?.enabled || false;
};

// Helper function to get feature info (with overrides)
export const getFeatureInfo = (featureName: keyof Features): FeatureConfig => {
  const currentFeatures = getCurrentFeatures();
  return currentFeatures[featureName];
};