import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Sparkles, Calendar, Users, BarChart3, Settings, CreditCard } from 'lucide-react';
import { FEATURES } from '@/config/features';

const FeatureRoadmap: React.FC = () => {
  const phases = [
    {
      title: "Phase 1: Launch Ready",
      subtitle: "Available Now",
      status: "live",
      icon: CheckCircle,
      features: [
        { name: "AI Content Analysis", feature: "contentAnalysis", icon: BarChart3 },
        { name: "Influencer Discovery", feature: "findInfluencers", icon: Users },
        { name: "AI Marketing Assistant", feature: "aiAssistant", icon: Sparkles },
      ]
    },
    {
      title: "Phase 2: Dashboard & Analytics",
      subtitle: "Coming in 2 weeks",
      status: "soon",
      icon: Clock,
      features: [
        { name: "Brand Dashboard", feature: "brandDashboard", icon: BarChart3 },
        { name: "Influencer Dashboard", feature: "influencerDashboard", icon: BarChart3 },
      ]
    },
    {
      title: "Phase 3: Campaign Management",
      subtitle: "Coming next month",
      status: "planned",
      icon: Calendar,
      features: [
        { name: "Campaign Creation", feature: "brandCampaigns", icon: Calendar },
        { name: "Opportunity Marketplace", feature: "opportunities", icon: Users },
        { name: "Task Workflows", feature: "taskWorkflow", icon: CheckCircle },
      ]
    },
    {
      title: "Phase 4: Advanced Features",
      subtitle: "Coming in 2-3 months",
      status: "future",
      icon: Sparkles,
      features: [
        { name: "Progress Tracking", feature: "brandProgress", icon: BarChart3 },
        { name: "Advanced Analytics", feature: "analytics", icon: BarChart3 },
        { name: "Account Settings", feature: "settings", icon: Settings },
        { name: "Payment Processing", feature: "paymentProcessing", icon: CreditCard },
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'soon': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'planned': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'future': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Feature Roadmap
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're launching with core features and rolling out advanced capabilities based on user feedback. 
            Join early to influence our development priorities!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {phases.map((phase, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <phase.icon className={`h-6 w-6 ${
                    phase.status === 'live' ? 'text-green-600' :
                    phase.status === 'soon' ? 'text-blue-600' :
                    phase.status === 'planned' ? 'text-yellow-600' :
                    'text-purple-600'
                  }`} />
                  <Badge className={getStatusColor(phase.status)}>
                    {phase.status === 'live' ? 'Live' : 
                     phase.status === 'soon' ? 'Soon' :
                     phase.status === 'planned' ? 'Planned' : 'Future'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{phase.title}</CardTitle>
                <CardDescription>{phase.subtitle}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {phase.features.map((feature, featureIndex) => {
                    const featureInfo = FEATURES[feature.feature as keyof typeof FEATURES];
                    const isEnabled = featureInfo?.enabled || false;
                    
                    return (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <feature.icon className={`h-4 w-4 ${
                          isEnabled ? 'text-green-600' : 'text-muted-foreground'
                        }`} />
                        <span className={`text-sm ${
                          isEnabled ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}>
                          {feature.name}
                        </span>
                        {isEnabled && (
                          <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {phase.status === 'soon' && (
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Clock className="h-4 w-4 mr-2" />
                    Notify Me
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-brand-primary/5 border-brand-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Early Access Benefits
              </h3>
              <p className="text-muted-foreground mb-4">
                Sign up now to get early access to new features, priority support, and influence our roadmap.
              </p>
              <Button className="bg-brand-primary hover:bg-brand-primary/90">
                Join Early Access
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeatureRoadmap;