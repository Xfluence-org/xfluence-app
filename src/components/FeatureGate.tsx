import React from 'react';
import { Navigate } from 'react-router-dom';
import { isFeatureEnabled, getFeatureInfo, Features } from '@/config/features';
import { ComingSoonCard } from '@/components/ui/coming-soon-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface FeatureGateProps {
  feature: keyof Features;
  children: React.ReactNode;
  fallbackPath?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showCard?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallbackPath = '/',
  title,
  description,
  icon,
  showCard = true
}) => {
  const isEnabled = isFeatureEnabled(feature);
  const featureInfo = getFeatureInfo(feature);

  // If feature is enabled, render children
  if (isEnabled) {
    return <>{children}</>;
  }

  // If feature is disabled and we should show a card
  if (showCard && featureInfo.comingSoon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-6">
          <ComingSoonCard
            title={title || 'Feature Coming Soon'}
            description={description}
            feature={featureInfo}
            icon={icon}
            onNotifyMe={() => {
              // TODO: Implement notification signup
              console.log(`User wants to be notified about ${feature}`);
            }}
          />
          
          <Card>
            <CardContent className="pt-6">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If feature is disabled and no card should be shown, redirect
  return <Navigate to={fallbackPath} replace />;
};

