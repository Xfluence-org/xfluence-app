// @ts-nocheck
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
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Sparkles, Search, Bot, Target, BarChart3, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useEffect } from 'react';

const campaignFormSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required'),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  custom_goal: z.string().optional(),
  campaign_description: z.string().min(1, 'Description is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  total_influencers: z.number().min(1, 'Must have at least 1 influencer'),
  influencer_tiers: z.array(z.string()).min(1, 'At least one influencer tier is required'),
  content_types: z.array(z.string()).min(1, 'At least one content type is required'),
  budget_min: z.number().min(0, 'Minimum budget must be 0 or greater'),
  budget_max: z.number().min(1, 'Maximum budget must be greater than 0'),
  campaign_validity_days: z.number().min(1, 'Campaign must be valid for at least 1 day').max(365, 'Campaign cannot exceed 365 days'),
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
  const [showCustomGoal, setShowCustomGoal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Check if user is Agency or Brand
  if (!profile || (profile.user_type !== 'Agency' && profile.user_type !== 'Brand')) {
    return null; // Don't render modal for non-brand/agency users
  }

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      brand_name: '',
      goals: [],
      custom_goal: '',
      campaign_description: '',
      categories: [],
      total_influencers: 5,
      influencer_tiers: [],
      content_types: [],
      budget_min: 1,
      budget_max: 1000,
      campaign_validity_days: 30,
    },
  });

  // Calculate due date based on validity days
  const calculateDueDate = (days: number) => {
    const currentDate = new Date();
    const dueDate = new Date(currentDate);
    dueDate.setDate(currentDate.getDate() + days);
    return dueDate;
  };

  // Watch the campaign_validity_days field to show preview
  const validityDays = form.watch('campaign_validity_days');
  const previewDueDate = validityDays ? calculateDueDate(validityDays) : null;

  // Animation steps for loading
  const loadingSteps = [
    { icon: "search", title: "Analyzing market trends", subtitle: "Scanning latest influencer data..." },
    { icon: "ai", title: "AI processing requirements", subtitle: "Understanding your campaign goals..." },
    { icon: "target", title: "Finding perfect influencers", subtitle: "Matching creators to your brand..." },
    { icon: "chart", title: "Optimizing budget allocation", subtitle: "Calculating best ROI strategy..." },
    { icon: "sparkle", title: "Finalizing strategy", subtitle: "Preparing your campaign blueprint..." }
  ];

  // Animate through steps when submitting
  useEffect(() => {
    if (isSubmitting) {
      setCurrentStep(0);
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000); // Change step every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isSubmitting, loadingSteps.length]);

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    console.log('Campaign creation data:', data);
    
    try {
      // Ensure we have both user and profile
      if (!user?.id || !profile?.id) {
        toast({
          title: "Authentication Error",
          description: "User not properly authenticated. Please try logging in again.",
          variant: "destructive"
        });
        return;
      }

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
        console.log('Using existing brand:', brandId);
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
        console.log('Created new brand:', brandId);
      }

      // Create brand_user association using user.id (which matches auth.uid()) with proper conflict handling
      console.log('Creating brand user association with user ID:', user.id);
      const { error: brandUserError } = await supabase
        .from('brand_users')
        .upsert({
          user_id: user.id, // Use user.id which corresponds to auth.uid()
          brand_id: brandId,
          role: 'admin'
        }, {
          onConflict: 'user_id,brand_id', // Handle conflicts on the unique constraint
          ignoreDuplicates: false // Update existing records if they exist
        });

      if (brandUserError) {
        console.error('Error creating brand user association:', brandUserError);
        toast({
          title: "Error",
          description: `Failed to associate user with brand: ${brandUserError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Successfully created brand user association');

      // Calculate due date
      const dueDate = calculateDueDate(data.campaign_validity_days);

      // Create temporary campaign data with brand_id and due_date
      const campaignData = {
        id: Date.now(),
        ...data,
        brand_id: brandId,
        due_date: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        platform: 'Instagram',
        created_at: new Date().toISOString(),
      };
      
      // Combine selected goals with custom goal if provided
      const allGoals = [...data.goals];
      if (data.custom_goal && data.custom_goal.trim()) {
        allGoals.push(data.custom_goal.trim());
      }
      
      // Prepare search parameters for the edge function
      const requestBody = {
        searchParams: {
          goals: allGoals.join(', '), // Convert array to comma-separated string
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
      
      // Parse the response if it's a string
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
    setShowCustomGoal(false);
    setCurrentStep(0);
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

  return (
    <>
      {/* Fullscreen loading overlay - Higher z-index to appear above dialog */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center space-y-6">
              {/* Animated Icon */}
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
                  {loadingSteps[currentStep].icon === 'search' && <Search className="w-12 h-12 text-white animate-bounce" />}
                  {loadingSteps[currentStep].icon === 'ai' && <Bot className="w-12 h-12 text-white animate-bounce" />}
                  {loadingSteps[currentStep].icon === 'target' && <Target className="w-12 h-12 text-white animate-bounce" />}
                  {loadingSteps[currentStep].icon === 'chart' && <BarChart3 className="w-12 h-12 text-white animate-bounce" />}
                  {loadingSteps[currentStep].icon === 'sparkle' && <Sparkles className="w-12 h-12 text-white animate-bounce" />}
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-ping opacity-20" />
              </div>
              
              {/* Dynamic Step Content */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 transition-all duration-500">
                  {loadingSteps[currentStep].title}
                </h3>
                <p className="text-gray-600 transition-all duration-500">
                  {loadingSteps[currentStep].subtitle}
                </p>
              </div>
              
              {/* Progress Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {loadingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-500 ${
                        index === currentStep
                          ? 'w-8 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full'
                          : index < currentStep
                          ? 'w-2 h-2 bg-purple-600 rounded-full'
                          : 'w-2 h-2 bg-gray-300 rounded-full'
                      }`}
                    />
                  ))}
                </div>
                
                {/* All Steps List */}
                <div className="text-left space-y-2 mt-6">
                  {loadingSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 transition-all duration-500 ${
                        index === currentStep
                          ? 'opacity-100 scale-105'
                          : index < currentStep
                          ? 'opacity-50'
                          : 'opacity-30'
                      }`}
                    >
                      <span className="text-lg mt-0.5">{step.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          index <= currentStep ? 'text-purple-900' : 'text-gray-600'
                        }`}>
                          {step.title}
                        </p>
                        {index === currentStep && (
                          <div className="mt-1">
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-[2000ms] ease-out"
                                style={{ width: '100%' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {index < currentStep && (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-purple-200">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Campaign Creator
              </DialogTitle>
            </div>
            <p className="text-sm text-gray-600">Let AI help you create the perfect influencer campaign</p>
          </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* AI Suggestion Box */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-300">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white rounded-full">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">AI Tip</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Fill in the details below and our AI will create a comprehensive campaign strategy tailored to your goals and budget.
                  </p>
                </div>
              </div>
            </div>
            <FormField
              control={form.control}
              name="brand_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 inline mr-1" /> Brand Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your brand name..."
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
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
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600 inline mr-1" /> Campaign Goals
                  </FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'Brand Awareness', label: 'Brand Awareness' },
                      { value: 'Sales', label: 'Sales' },
                      { value: 'Engagement', label: 'Engagement' },
                      { value: 'Website Traffic', label: 'Website Traffic' },
                      { value: 'Lead Generation', label: 'Lead Generation' },
                      { value: 'Other', label: 'Other' },
                    ].map((goal) => (
                      <FormField
                        key={goal.value}
                        control={form.control}
                        name="goals"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={goal.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(goal.value)}
                                  onCheckedChange={(checked) => {
                                    const updatedValue = checked
                                      ? [...field.value, goal.value]
                                      : field.value?.filter((value) => value !== goal.value);
                                    field.onChange(updatedValue);
                                    
                                    // Show/hide custom goal input
                                    if (goal.value === 'Other') {
                                      setShowCustomGoal(checked as boolean);
                                      if (!checked) {
                                        form.setValue('custom_goal', '');
                                      }
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {goal.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  
                  {showCustomGoal && (
                    <FormField
                      control={form.control}
                      name="custom_goal"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormControl>
                            <Input
                              placeholder="Enter your custom goal..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  
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
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                      max="365"
                      placeholder="Enter number of days..."
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                    />
                  </FormControl>
                  {previewDueDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Campaign will end on: <span className="font-medium text-[#1a1f2e]">
                        {previewDueDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="p-4 border-2 border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div>
                    <FormLabel className="text-sm font-medium text-purple-900 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-purple-600 inline mr-1" /> Platform
                    </FormLabel>
                    <p className="text-sm text-purple-700 mt-1 font-medium">Instagram</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                    AI Optimized
                  </Badge>
                </div>
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating AI Strategy...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Campaign Strategy
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CreateCampaignModal;
