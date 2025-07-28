
// @ts-nocheck
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Send, Loader2 } from 'lucide-react';

interface OpportunityApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    brand_name: string;
    description: string;
    compensation_min: number;
    compensation_max: number;
  } | null;
  onApplicationSubmitted: () => void;
}

const OpportunityApplicationModal: React.FC<OpportunityApplicationModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onApplicationSubmitted
}) => {
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!campaign || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaign.id,
          influencer_id: user.id,
          status: 'applied',
          application_message: applicationMessage,
          ai_match_score: Math.floor(Math.random() * 25) + 75 // Mock AI score for demo
        });

      if (error) {
        console.error('Error submitting application:', error);
        toast({
          title: "Error",
          description: "Failed to submit application. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });

      onApplicationSubmitted();
      onClose();
      setApplicationMessage('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setApplicationMessage('');
    onClose();
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1f2e]">
            Apply to Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-[#1a1f2e] mb-2">
              {campaign.title}
            </h3>
            <p className="text-gray-600 mb-2">by {campaign.brand_name}</p>
            <p className="text-sm text-gray-700 mb-3">{campaign.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Compensation:</span>
              <span className="font-bold text-[#1DDCD3]">
                ${(campaign.compensation_min / 100)?.toLocaleString()} - ${(campaign.compensation_max / 100)?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Application Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Message
            </label>
            <Textarea
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Tell the brand why you're perfect for this campaign..."
              rows={6}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Share your relevant experience and why you're interested in this campaign
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityApplicationModal;
