import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Features } from '@/config/features';
import { Settings, Save, RefreshCw, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFeatureManager } from '@/hooks/useFeatureManager';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminAccess } from '@/components/AdminAccess';

// This would be a protected admin-only page
const AdminFeatureToggle: React.FC = () => {
  const { isAdmin, loading } = useAdminAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  const { 
    features, 
    hasChanges, 
    toggleFeature, 
    updateFeature, 
    saveChanges, 
    resetToDefaults 
  } = useFeatureManager();
  const { toast } = useToast();

  // Show loading while checking admin status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Redirect non-admin users
  if (!isAdmin && !isAuthenticated) {
    return <AdminAccess onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const updateReleaseDate = (featureName: keyof Features, releaseDate: string) => {
    updateFeature(featureName, { releaseDate });
  };

  const handleSaveChanges = async () => {
    const result = await saveChanges();
    
    if (result.success) {
      toast({
        title: "Features Updated",
        description: "Feature configuration has been saved successfully. Changes are now live!",
      });
    } else {
      toast({
        title: "Save Failed",
        description: result.error || "Failed to save feature configuration.",
        variant: "destructive"
      });
    }
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    toast({
      title: "Reset Complete",
      description: "Feature configuration has been reset to defaults.",
    });
  };

  const phases = [
    {
      title: "Core Features",
      features: ['contentAnalysis', 'findInfluencers', 'aiAssistant'] as const
    },
    {
      title: "Dashboard Features", 
      features: ['dashboard', 'brandDashboard', 'influencerDashboard'] as const
    },
    {
      title: "Campaign Management",
      features: ['campaigns', 'brandCampaigns', 'opportunities', 'taskWorkflow'] as const
    },
    {
      title: "Advanced Features",
      features: ['brandProgress', 'analytics', 'settings', 'brandSettings', 'influencerSettings', 'paymentProcessing'] as const
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-brand-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Feature Management</h1>
              <p className="text-muted-foreground">Control which features are available to users</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleResetToDefaults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={!hasChanges}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {hasChanges && (
          <Card className="mb-6 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-4">
              <p className="text-yellow-700 dark:text-yellow-300">
                You have unsaved changes. Don't forget to save your configuration.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {phases.map((phase, phaseIndex) => (
            <Card key={phaseIndex}>
              <CardHeader>
                <CardTitle>{phase.title}</CardTitle>
                <CardDescription>
                  Manage features in the {phase.title.toLowerCase()} category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phase.features.map((featureName) => {
                    const feature = features[featureName];
                    if (!feature) return null;
                    
                    return (
                      <div key={featureName} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={() => toggleFeature(featureName)}
                            />
                            <div>
                              <Label className="font-medium capitalize">
                                {featureName.replace(/([A-Z])/g, ' $1').trim()}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                          <Badge variant={feature.enabled ? "default" : "secondary"}>
                            {feature.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        
                        {!feature.enabled && feature.comingSoon && (
                          <div className="space-y-2">
                            <Label htmlFor={`${featureName}-date`} className="text-sm">
                              Release Date Message
                            </Label>
                            <Input
                              id={`${featureName}-date`}
                              value={feature.releaseDate || ''}
                              onChange={(e) => updateReleaseDate(featureName, e.target.value)}
                              placeholder="e.g., Coming in 2 weeks"
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Configuration Preview</CardTitle>
                <CardDescription>
                  Current feature configuration (for debugging)
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
              >
                {showConfig ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showConfig ? 'Hide' : 'Show'} Config
              </Button>
            </div>
          </CardHeader>
          {showConfig && (
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {JSON.stringify(features, null, 2)}
              </pre>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminFeatureToggle;