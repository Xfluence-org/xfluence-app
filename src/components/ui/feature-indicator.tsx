import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureConfig } from '@/config/features';

interface FeatureIndicatorProps {
  feature: FeatureConfig;
  variant?: 'brand' | 'influencer';
  className?: string;
  onClick?: () => void;
}

export const FeatureIndicator: React.FC<FeatureIndicatorProps> = ({ 
  feature, 
  variant = 'brand',
  className,
  onClick
}) => {
  if (feature.enabled) return null;
  if (!feature.comingSoon) return null;

  const getLockStyle = () => {
    if (variant === 'brand') {
      return "w-4 h-4 text-muted-foreground hover:text-brand-primary transition-colors cursor-pointer";
    }
    return "w-4 h-4 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer";
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Lock 
        className={getLockStyle()}
        onClick={onClick}
      />
    </div>
  );
};