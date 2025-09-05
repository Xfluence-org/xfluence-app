import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';

interface FeatureLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const FeatureLockedModal: React.FC<FeatureLockedModalProps> = ({
  isOpen,
  onClose,
  featureName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-muted rounded-full">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center">
            Feature Coming Soon
          </DialogTitle>
          <DialogDescription className="text-center">
            <strong className="capitalize">
              {featureName.replace(/([A-Z])/g, ' $1').trim()}
            </strong> is currently in development and will be available soon.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 p-4 bg-brand-primary/5 rounded-lg">
            <Sparkles className="h-4 w-4 text-brand-primary" />
            <span className="text-sm text-foreground font-semibold">
              We're working hard to bring you this feature!
            </span>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};