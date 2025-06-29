
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskWorkflowService, WorkflowState, ContentDraft, ContentReview } from '@/services/taskWorkflowService';

export const useTaskWorkflow = (taskId: string | null) => {
  const queryClient = useQueryClient();

  const { data: workflowStates, isLoading: workflowLoading } = useQuery({
    queryKey: ['task-workflow', taskId],
    queryFn: () => taskWorkflowService.getWorkflowStates(taskId!),
    enabled: !!taskId
  });

  const { data: contentDrafts, isLoading: draftsLoading } = useQuery({
    queryKey: ['content-drafts', taskId],
    queryFn: () => taskWorkflowService.getContentDrafts(taskId!),
    enabled: !!taskId
  });

  const { data: contentReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['content-reviews', taskId],
    queryFn: () => taskWorkflowService.getContentReviews(taskId!),
    enabled: !!taskId
  });

  const initializeWorkflowMutation = useMutation({
    mutationFn: (taskId: string) => taskWorkflowService.initializeWorkflow(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-workflow'] });
    }
  });

  const startContentRequirementMutation = useMutation({
    mutationFn: (taskId: string) => taskWorkflowService.startContentRequirementPhase(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-workflow'] });
    }
  });

  const shareContentRequirementsMutation = useMutation({
    mutationFn: ({ taskId, requirements }: {
      taskId: string;
      requirements: string;
    }) => taskWorkflowService.shareContentRequirements(taskId, requirements),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-drafts'] });
      queryClient.invalidateQueries({ queryKey: ['task-workflow'] });
    }
  });

  const createContentReviewMutation = useMutation({
    mutationFn: ({ taskId, uploadId, status, feedback, reviewedBy }: {
      taskId: string;
      uploadId: string;
      status: 'approved' | 'rejected';
      feedback?: string;
      reviewedBy?: string;
    }) => taskWorkflowService.createContentReview(taskId, uploadId, status, feedback, reviewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['task-workflow'] });
    }
  });

  const submitPublishedContentMutation = useMutation({
    mutationFn: ({ taskId, publishedUrl, platform }: {
      taskId: string;
      publishedUrl: string;
      platform: string;
    }) => taskWorkflowService.submitPublishedContent(taskId, publishedUrl, platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-workflow'] });
    }
  });

  const checkPhaseVisibilityMutation = useMutation({
    mutationFn: ({ taskId, userType }: {
      taskId: string;
      userType: 'brand' | 'influencer';
    }) => taskWorkflowService.checkPhaseVisibility(taskId, userType)
  });

  return {
    // Data
    workflowStates,
    contentDrafts,
    contentReviews,
    
    // Loading states
    workflowLoading,
    draftsLoading,
    reviewsLoading,
    
    // Mutations
    initializeWorkflow: initializeWorkflowMutation.mutate,
    startContentRequirement: startContentRequirementMutation.mutate,
    shareContentRequirements: shareContentRequirementsMutation.mutate,
    createContentReview: createContentReviewMutation.mutate,
    submitPublishedContent: submitPublishedContentMutation.mutate,
    checkPhaseVisibility: checkPhaseVisibilityMutation.mutate,
    
    // Mutation states
    isInitializing: initializeWorkflowMutation.isPending,
    isStartingRequirement: startContentRequirementMutation.isPending,
    isSharingRequirements: shareContentRequirementsMutation.isPending,
    isCreatingReview: createContentReviewMutation.isPending,
    isSubmittingPublished: submitPublishedContentMutation.isPending
  };
};
