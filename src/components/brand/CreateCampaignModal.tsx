
import React, { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
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
  const [currentStep, setCurrentStep] = useState<'form' | 'results'>('form');
  const [campaignResults, setCampaignResults] = useState<CampaignPlannerResponse | null>(null);
  const { toast } = useToast();

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
        id: Date.now(), // Temporary ID
        ...data,
        platform: 'Instagram', // Fixed to Instagram as Beta
        created_at: new Date().toISOString(),
      };
      
      // Prepare search parameters for the edge function
      const searchParams = {
        goals: data.goals,
        campaign_description: data.campaign_description,
        categories: data.categories,
        total_influencers: data.total_influencers,
        follower_tiers: data.follower_tiers,
        content_types: data.content_types,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        platform: 'Instagram'
      };
      
      // Call the campaign planner edge function
      console.log('Calling campaign_planner edge function with params:', searchParams);
      const { data: plannerResponse, error: plannerError } = await supabase.functions.invoke('campaign-planner', {
        body: { 
          searchParams: searchParams,
          campaignId: campaignData.id 
        }
      });

      if (plannerError) {
        console.error('Campaign planner error:', plannerError);
        toast({
          title: "Error",
          description: "Failed to generate campaign strategy. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Campaign planner response:', plannerResponse);
      
      // Set the results and move to results step
      setCampaignResults(plannerResponse);
      setCurrentStep('results');
      
      // Store campaign data in localStorage for now
      localStorage.setItem('temp_campaign', JSON.stringify(campaignData));
      localStorage.setItem('temp_campaign_results', JSON.stringify(plannerResponse));
      
      toast({
        title: "Success",
        description: "Campaign strategy generated successfully!",
      });
      
    } catch (error) {
      console.error('Error in campaign creation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('form');
    setCampaignResults(null);
    form.reset();
    onClose();
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setCampaignResults(null);
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
    { value: 'nano', label: 'Nano (1K-10K)' },
    { value: 'micro', label: 'Micro (10K-50K)' },
    { value: 'macro', label: 'Macro (50K-100K)' },
  ];

  const contentTypes = [
    { value: 'post', label: 'Post' },
    { value: 'story', label: 'Story' },
    { value: 'reel', label: 'Reel' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {currentStep === 'results' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToForm}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-2xl font-bold text-[#1a1f2e]">
              {currentStep === 'form' ? 'Create New Campaign' : 'Campaign Strategy'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {currentStep === 'form' && (
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
                    'Next'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === 'results' && campaignResults && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Strategy Summary</h3>
              <p className="text-blue-800">{campaignResults.search_strategy_summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Influencer Allocation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Influencers:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {campaignResults.influencer_allocation.total_influencers}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">By Category:</h4>
                    <div className="space-y-1">
                      {Object.entries(campaignResults.influencer_allocation.allocation_by_category).map(([category, count]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span>{category}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">By Tier:</h4>
                    <div className="space-y-2">
                      {Object.entries(campaignResults.influencer_allocation.allocation_by_tier).map(([category, tiers]) => (
                        <div key={category} className="text-sm">
                          <div className="font-medium text-gray-600">{category}:</div>
                          <div className="ml-4 space-y-1">
                            {Object.entries(tiers as Record<string, number>).map(([tier, count]) => (
                              <div key={tier} className="flex justify-between">
                                <span className="capitalize">{tier}:</span>
                                <span>{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Strategy</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Distribution Rationale:</h4>
                    <p className="text-sm text-gray-600">{campaignResults.content_strategy.content_distribution.rationale}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Content Types:</h4>
                    <div className="space-y-2">
                      {Object.entries(campaignResults.content_strategy.content_distribution)
                        .filter(([key]) => key !== 'rationale')
                        .map(([type, details]) => (
                          <div key={type} className="text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium capitalize">{type}:</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {(details as any).percentage}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{(details as any).purpose}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Actionable Search Tactics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Recommended Hashtags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaignResults.actionable_search_tactics.niche_hashtags.map((hashtag, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Platform Tools:</h4>
                  <div className="space-y-1">
                    {campaignResults.actionable_search_tactics.platform_tools.map((tool, index) => (
                      <div key={index} className="text-sm text-gray-600">• {tool}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategy Justification</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{campaignResults.justification}</p>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                variant="outline"
                onClick={handleBackToForm}
              >
                Modify Campaign
              </Button>
              <Button
                onClick={handleClose}
                className="bg-[#1a1f2e] hover:bg-[#2a2f3e] text-white"
              >
                Save Campaign
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignModal;
