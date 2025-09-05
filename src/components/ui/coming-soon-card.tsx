import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Bell, Sparkles } from 'lucide-react';
import { FeatureConfig } from '@/config/features';

interface ComingSoonCardProps {
  title: string;
  description?: string;
  feature: FeatureConfig;
  icon?: React.ReactNode;
  onNotifyMe?: () => void;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  title,
  description,
  feature,
  icon,
  onNotifyMe
}) => {
  return (
    <Card className="relative overflow-hidden border-dashed border-2 border-muted-foreground/20 bg-muted/10">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon || <Sparkles className="h-6 w-6 text-brand-primary" />}
            <div>
              <CardTitle className="text-lg text-muted-foreground">{title}</CardTitle>
              <CardDescription className="text-sm">
                {description || feature.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="space-y-4">
          {feature.releaseDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{feature.releaseDate}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNotifyMe}
              className="bg-background/50 hover:bg-background/80"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notify Me
            </Button>
            <span className="text-xs text-muted-foreground">
              Get notified when this feature launches
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};