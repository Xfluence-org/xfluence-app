import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const campaignFormSchema = z.object({
  goals: z.string().min(1, 'Goals are required'),
  campaign_description: z.string().min(1, 'Description is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  total_influencers: z.number().min(1, 'Must have at least 1 influencer'),
  follower_tiers: z.array(z.string()).min(1, 'At least one follower tier is required'),
  content_types: z.array(z.string()).min(1, 'At least one content type is required'),
  budget_min: z.number().min(0, 'Minimum budget must be 0 or greater'),
  budget_max: z.number().min(1, 'Maximum budget must be greater than 0'),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignPlannerResponse {
  search_strategy_summary: string;
  influencer_allocation: {
    total_influencers: number;
    allocation_by_category: Record<string, number>;
    allocation_by_tier: Record<string, Record<string, number>>;
  };
  content_strategy: {
    content_distribution: {
      rationale: string;
      [key: string]: any;
    };
    platform_specific_strategies: Record<string, any>;
  };
  actionable_search_tactics: {
    niche_hashtags: string[];
    platform_tools: string[];
  };
  justification: string;
}

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      goals: '',
      campaign_description: '',
      categories: [],
      total_influencers: 5,
      follower_tiers: [],
      content_types: [],
      budget_min: 0,
      budget_max: 1000,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    console.log('Campaign creation data:', data);
    
    try {
      // Create temporary campaign data
      const campaignData = {
        id: Date.now(),
        ...data,
        platform: 'Instagram',
        created_at: new Date().toISOString(),
      };
      
      // Prepare search parameters for the edge function - nested under searchParams
      const requestBody = {
        searchParams: {
          goals: data.goals,
          campaign_description: data.campaign_description,
          categories: data.categories,
          total_influencers: data.total_influencers,
          follower_tier: data.follower_tiers.length > 0 ? data.follower_tiers : ['micro', 'mid'],
          content_type: data.content_types.length > 0 ? data.content_types : ['post', 'reel'],
          budget_min: data.budget_min,
          budget_max: data.budget_max,
        }
      };
      
      console.log('Request body being sent to edge function:', requestBody);
      console.log('JSON stringified request body:', JSON.stringify(requestBody, null, 2));
      
      // Call the campaign planner edge function
      console.log('Calling campaign_planner edge function...');
      const { data: plannerResponse, error: plannerError } = await supabase.functions.invoke('campaign-planner', {
        body: requestBody
      });

      console.log('Edge function raw response:', plannerResponse);
      console.log('Edge function error:', plannerError);

      if (plannerError) {
        console.error('Campaign planner error details:', {
          message: plannerError.message,
          details: plannerError.details,
          hint: plannerError.hint,
          code: plannerError.code
        });
        toast({
          title: "Edge Function Error",
          description: `Failed to generate campaign strategy: ${plannerError.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!plannerResponse) {
        console.error('No response received from edge function');
        toast({
          title: "No Response",
          description: "No response received from campaign planner. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Campaign planner successful response:', plannerResponse);
      
      // Parse the response if it's a string (sometimes edge functions return stringified JSON)
      let parsedResponse = plannerResponse;
      if (typeof plannerResponse === 'string') {
        try {
          parsedResponse = JSON.parse(plannerResponse);
          console.log('Parsed string response:', parsedResponse);
        } catch (parseError) {
          console.error('Failed to parse response string:', parseError);
          toast({
            title: "Parse Error",
            description: "Failed to parse campaign strategy response.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Store campaign data in localStorage for the review page
      localStorage.setItem('temp_campaign', JSON.stringify(campaignData));
      localStorage.setItem('temp_campaign_results', JSON.stringify(parsedResponse));
      
      toast({
        title: "Success",
        description: "Campaign strategy generated successfully!",
      });
      
      // Close modal and navigate to review page
      onClose();
      navigate('/campaign-review');
      
    } catch (error) {
      console.error('Error in campaign creation:', error);
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const categories = [
    'Food & Drinks',
    'Travel',
    'Lifestyle',
    'Fashion',
    'Beauty',
    'Fitness',
    'Technology',
    'Gaming',
  ];

  const followerTiers = [
    { value: 'micro', label: 'Micro (10K-50K)' },
    { value: 'mid', label: 'Mid (50K-100K)' },
  ];

  const contentTypes = [
    { value: 'post', label: 'Post' },
    { value: 'reel', label: 'Reel' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1f2e]">
            Create New Campaign
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your campaign goals..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campaign_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed campaign description..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categories"
                render={() => (
                  <FormItem>
                    <FormLabel>Categories (Multi-select)</FormLabel>
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-background">
                      {categories.map((category) => (
                        <FormField
                          key={category}
                          control={form.control}
                          name="categories"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={category}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(category)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, category])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== category
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {category}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_influencers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Influencers Needed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="follower_tiers"
                render={() => (
                  <FormItem>
                    <FormLabel>Follower Tiers (Multi-select)</FormLabel>
                    <div className="space-y-2 p-3 border rounded-md bg-background">
                      {followerTiers.map((tier) => (
                        <FormField
                          key={tier.value}
                          control={form.control}
                          name="follower_tiers"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={tier.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(tier.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, tier.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== tier.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {tier.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content_types"
                render={() => (
                  <FormItem>
                    <FormLabel>Content Types (Multi-select)</FormLabel>
                    <div className="space-y-2 p-3 border rounded-md bg-background">
                      {contentTypes.map((type) => (
                        <FormField
                          key={type.value}
                          control={form.control}
                          name="content_types"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={type.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, type.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== type.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {type.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="p-3 border rounded-md bg-gray-50">
                <FormLabel className="text-sm font-medium text-gray-700">Platform</FormLabel>
                <p className="text-sm text-gray-600 mt-1">Instagram (Beta)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="budget_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Budget ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Budget ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1a1f2e] hover:bg-[#2a2f3e] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Strategy...
                  </>
                ) : (
                  'Generate Campaign Strategy'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignModal;
