import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Settings, Zap } from 'lucide-react';
import { useFeatureManager } from '@/hooks/useFeatureManager';

// Component to show when admin makes changes to features
export const FeatureStatusIndicator: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const { features } = useFeatureManager();

  useEffect(() => {
    // Listen for feature changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'xfluence_feature_overrides') {
        setLastUpdate(new Date().toLocaleTimeString());
        setShowNotification(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => setShowNotification(false), 5000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!showNotification || !lastUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <Card className="bg-brand-primary/10 border-brand-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/20 rounded-full">
              <Zap className="h-4 w-4 text-brand-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Features Updated</p>
              <p className="text-xs text-muted-foreground">
                Admin updated feature configuration at {lastUpdate}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotification(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Component to show current feature status in development
export const DevFeatureStatus: React.FC = () => {
  const { features } = useFeatureManager();
  
  // Only show in development
  if (import.meta.env.PROD) return null;

  const enabledCount = Object.values(features).filter(f => f.enabled).length;
  const totalCount = Object.keys(features).length;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
        <Settings className="h-3 w-3 mr-1" />
        Features: {enabledCount}/{totalCount}
      </Badge>
    </div>
  );
};