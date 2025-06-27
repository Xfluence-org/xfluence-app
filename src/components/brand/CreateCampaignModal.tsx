
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
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CampaignReviewStep } from './CampaignReviewStep';

const campaignFormSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required'),
  goals: z.string().min(1, 'Goals are required'),
  campaign_description: z.string().min(1, 'Description is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  total_influencers: z.number().min(1, 'Must have at least 1 influencer'),
  influencer_tiers: z.array(z.string()).min(1, 'At least one influencer tier is required'),
  content_types: z.array(z.string()).min(1, 'At least one content type is required'),
  budget_min: z.number().min(0, 'Minimum budget must be 0 or greater'),
  budget_max: z.number().min(1, 'Maximum budget must be greater than 0'),
  campaign_validity_days: z.number().min(1, 'Campaign validity must be at least 1 day'),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'review'>('form');
  const [campaignStrategy, setCampaignStrategy] = useState<any>(null);
  const [formData, setFormData] = useState<CampaignFormData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Check if user is Agency or Brand
  if (!profile || (profile.user_type !== 'Agency' && profile.user_type !== 'Brand')) {
    return null;
  }

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      brand_name: '',
      goals: '',
      campaign_description: '',
      categories: [],
      total_influencers: 5,
      influencer_tiers: [],
      content_types: [],
      budget_min: 0,
      budget_max: 1000,
      campaign_validity_days: 30,
    },
  });

  const calculateDueDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    console.log('Campaign creation data:', data);
    
    try {
      // First, create or get the brand
      let brandId: string;
      
      // Check if brand already exists
      const { data: existingBrand, error: brandCheckError } = await supabase
        .from('brands')
        .select('id')
        .eq('name', data.brand_name)
        .single();

      if (brandCheckError && brandCheckError.code !== 'PGRST116') {
        console.error('Error checking existing brand:', brandCheckError);
        toast({
          title: "Error",
          description: "Failed to check existing brand.",
          variant: "destructive"
        });
        return;
      }

      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        // Create new brand
        const { data: newBrand, error: brandError } = await supabase
          .from('brands')
          .insert({
            name: data.brand_name
          })
          .select()
          .single();

        if (brandError) {
          console.error('Error creating brand:', brandError);
          toast({
            title: "Error",
            description: "Failed to create brand.",
            variant: "destructive"
          });
          return;
        }

        brandId = newBrand.id;
      }

      // Create brand_user association if it doesn't exist
      const { error: brandUserError } = await supabase
        .from('brand_users')
        .upsert({
          user_id: user?.id,
          brand_id: brandId,
          role: 'admin'
        });

      if (brandUserError) {
        console.error('Error creating brand user association:', brandUserError);
        toast({
          title: "Error",
          description: "Failed to associate user with brand.",
          variant: "destructive"
        });
        return;
      }

      // Create campaign data with brand_id and calculated due date
      const dueDate = calculateDueDate(data.campaign_validity_days);
      const campaignData = {
        id: Date.now(),
        ...data,
        brand_id: brandId,
        due_date: dueDate,
        platform: 'Instagram',
        created_at: new Date().toISOString(),
      };
      
      // Prepare search parameters for the edge function
      const requestBody = {
        searchParams: {
          goals: data.goals,
          campaign_description: data.campaign_description,
          categories: data.categories,
          total_influencers: data.total_influencers,
          follower_tier: data.influencer_tiers.length > 0 ? data.influencer_tiers : ['micro', 'mid'],
          content_type: data.content_types.length > 0 ? data.content_types : ['post', 'reel'],
          budget_min: data.budget_min,
          budget_max: data.budget_max,
        }
      };
      
      console.log('Request body being sent to edge function:', requestBody);
      
      // Call the campaign planner edge function
      console.log('Calling campaign_planner edge function...');
      const { data: plannerResponse, error: plannerError } = await supabase.functions.invoke('campaign-planner', {
        body: requestBody
      });

      console.log('Edge function raw response:', plannerResponse);

      if (plannerError) {
        console.error('Campaign planner error details:', plannerError);
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
      
      // Parse the response if it's a string
      let parsedResponse = plannerResponse;
      if (typeof plannerResponse === 'string') {
        try {
          parsedResponse = JSON.parse(plannerResponse);
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
      
      // Store data for review step
      setCampaignStrategy(parsedResponse);
      setFormData(campaignData);
      setCurrentStep('review');
      
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

  const handlePublishCampaign = async () => {
    if (!campaignStrategy || !formData) {
      toast({
        title: "Error",
        description: "No campaign data to publish.",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    try {
      // Extract requirements from the campaign strategy
      const contentDistribution = campaignStrategy.content_strategy?.content_distribution || {};
      const requirements = {
        total_influencers: formData.total_influencers,
        follower_tiers: formData.influencer_tiers,
        content_types: formData.content_types,
        categories: formData.categories,
        content_distribution: contentDistribution
      };

      // Create the campaign in the database
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          title: `${formData.goals} Campaign`,
          description: formData.campaign_description,
          category: formData.categories, // Store as array
          budget: formData.budget_max * 100, // Convert to cents
          amount: formData.budget_max * 100,
          compensation_min: formData.budget_min * 100,
          compensation_max: formData.budget_max * 100,
          due_date: formData.due_date,
          application_deadline: formData.due_date,
          requirements: requirements,
          status: 'published',
          is_public: true,
          llm_campaign: campaignStrategy,
          brand_id: formData.brand_id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        toast({
          title: "Error",
          description: "Failed to create campaign.",
          variant: "destructive"
        });
        return;
      }

      console.log('Campaign created successfully:', newCampaign);
      
      toast({
        title: "Success",
        description: "Campaign published successfully!",
      });
      
      // Reset and close modal
      handleClose();
      
    } catch (error) {
      console.error('Error publishing campaign:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setCurrentStep('form');
    setCampaignStrategy(null);
    setFormData(null);
    onClose();
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
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

  const influencerTiers = [
    { value: 'nano', label: 'Nano (1K-10K)' },
    { value: 'micro', label: 'Micro (10K-50K)' },
    { value: 'mid', label: 'Mid (50K-500K)' },
    { value: 'macro', label: 'Macro (500K-1M)' },
    { value: 'mega', label: 'Mega (1M+)' },
  ];

  const contentTypes = [
    { value: 'post', label: 'Post' },
    { value: 'reel', label: 'Reel' },
    { value: 'story', label: 'Story' },
  ];

  const watchedValidityDays = form.watch('campaign_validity_days');
  const calculatedDueDate = watchedValidityDays ? calculateDueDate(watchedValidityDays) : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1f2e] flex items-center gap-2">
            {currentStep === 'review' && (
              <Button
                variant="ghost"
                onClick={handleBackToForm}
                className="p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {currentStep === 'form' ? 'Create New Campaign' : 'Campaign Review'}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'form' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="brand_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your brand name..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  name="influencer_tiers"
                  render={() => (
                    <FormItem>
                      <FormLabel>Influencer Tiers (Multi-select)</FormLabel>
                      <div className="space-y-2 p-3 border rounded-md bg-background">
                        {influencerTiers.map((tier) => (
                          <FormField
                            key={tier.value}
                            control={form.control}
                            name="influencer_tiers"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <FormField
                  control={form.control}
                  name="campaign_validity_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Validity (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                        />
                      </FormControl>
                      <FormMessage />
                      {calculatedDueDate && (
                        <p className="text-sm text-gray-600 mt-1">
                          Due date: {calculatedDueDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
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
        ) : (
          <CampaignReviewStep
            campaignStrategy={campaignStrategy}
            onPublish={handlePublishCampaign}
            isPublishing={isPublishing}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignModal;
