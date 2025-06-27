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

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      goals: 'Drive brand awareness and engagement.',
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
    
    // TODO: Save to campaigns table
    // Temporarily store in localStorage for now
    const campaignData = {
      id: Date.now(), // Temporary ID
      ...data,
      platform: 'Instagram', // Fixed to Instagram as Beta
      created_at: new Date().toISOString(),
    };
    
    localStorage.setItem('temp_campaign', JSON.stringify(campaignData));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    onClose();
    form.reset();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                      onFocus={(e) => {
                        if (e.target.value === 'Drive brand awareness and engagement.') {
                          field.onChange('');
                        }
                      }}
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
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1a1f2e] hover:bg-[#2a2f3e] text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignModal;
