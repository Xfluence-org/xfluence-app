export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      brand_users: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_users_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      campaign_content_assignments: {
        Row: {
          assignment_type: string
          campaign_id: string
          category: string
          content_type: string
          created_at: string
          id: string
          influencer_id: string | null
          manual_data: Json | null
          tier: string
          updated_at: string
        }
        Insert: {
          assignment_type?: string
          campaign_id: string
          category: string
          content_type: string
          created_at?: string
          id?: string
          influencer_id?: string | null
          manual_data?: Json | null
          tier: string
          updated_at?: string
        }
        Update: {
          assignment_type?: string
          campaign_id?: string
          category?: string
          content_type?: string
          created_at?: string
          id?: string
          influencer_id?: string | null
          manual_data?: Json | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_content_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_content_assignments_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_participants: {
        Row: {
          accepted_at: string | null
          ai_match_score: number | null
          application_message: string | null
          campaign_id: string | null
          completed_at: string | null
          created_at: string | null
          current_stage: string | null
          id: string
          influencer_id: string | null
          invitation_claimed_at: string | null
          invitation_sent_at: string | null
          invitation_token: string | null
          progress: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          ai_match_score?: number | null
          application_message?: string | null
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_stage?: string | null
          id?: string
          influencer_id?: string | null
          invitation_claimed_at?: string | null
          invitation_sent_at?: string | null
          invitation_token?: string | null
          progress?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          ai_match_score?: number | null
          application_message?: string | null
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_stage?: string | null
          id?: string
          influencer_id?: string | null
          invitation_claimed_at?: string | null
          invitation_sent_at?: string | null
          invitation_token?: string | null
          progress?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_participants_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_tasks: {
        Row: {
          ai_score: number | null
          campaign_id: string | null
          content_assignment_id: string | null
          created_at: string | null
          current_phase: string | null
          deliverable_count: number | null
          description: string | null
          id: string
          influencer_id: string | null
          next_deadline: string | null
          phase_visibility: Json | null
          progress: number | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_score?: number | null
          campaign_id?: string | null
          content_assignment_id?: string | null
          created_at?: string | null
          current_phase?: string | null
          deliverable_count?: number | null
          description?: string | null
          id?: string
          influencer_id?: string | null
          next_deadline?: string | null
          phase_visibility?: Json | null
          progress?: number | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_score?: number | null
          campaign_id?: string | null
          content_assignment_id?: string | null
          created_at?: string | null
          current_phase?: string | null
          deliverable_count?: number | null
          description?: string | null
          id?: string
          influencer_id?: string | null
          next_deadline?: string | null
          phase_visibility?: Json | null
          progress?: number | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_tasks_content_assignment_id_fkey"
            columns: ["content_assignment_id"]
            isOneToOne: false
            referencedRelation: "campaign_content_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_tasks_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          amount: number | null
          application_deadline: string | null
          brand_id: string | null
          budget: number | null
          campaign_validity_days: number | null
          category: string[] | null
          compensation_max: number | null
          compensation_min: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          gig_extracted: Json | null
          id: string
          is_public: boolean | null
          requirements: Json | null
          status: string | null
          target_engagement_rate: number | null
          target_reach: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          application_deadline?: string | null
          brand_id?: string | null
          budget?: number | null
          campaign_validity_days?: number | null
          category?: string[] | null
          compensation_max?: number | null
          compensation_min?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          gig_extracted?: Json | null
          id?: string
          is_public?: boolean | null
          requirements?: Json | null
          status?: string | null
          target_engagement_rate?: number | null
          target_reach?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          application_deadline?: string | null
          brand_id?: string | null
          budget?: number | null
          campaign_validity_days?: number | null
          category?: string[] | null
          compensation_max?: number | null
          compensation_min?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          gig_extracted?: Json | null
          id?: string
          is_public?: boolean | null
          requirements?: Json | null
          status?: string | null
          target_engagement_rate?: number | null
          target_reach?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_accounts: {
        Row: {
          access_token: string | null
          created_at: string | null
          engagement_rate: number | null
          followers_count: number | null
          following: number | null
          following_count: number | null
          id: string
          impressions: number | null
          instagram_user_id: string
          last_synced_at: string | null
          media_count: number | null
          profile_picture: string | null
          reach: number | null
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          followers_count?: number | null
          following?: number | null
          following_count?: number | null
          id?: string
          impressions?: number | null
          instagram_user_id: string
          last_synced_at?: string | null
          media_count?: number | null
          profile_picture?: string | null
          reach?: number | null
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          followers_count?: number | null
          following?: number | null
          following_count?: number | null
          id?: string
          impressions?: number | null
          instagram_user_id?: string
          last_synced_at?: string | null
          media_count?: number | null
          profile_picture?: string | null
          reach?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      invitation_emails: {
        Row: {
          campaign_participant_id: string | null
          clicked_at: string | null
          created_at: string | null
          email: string
          id: string
          opened_at: string | null
          sent_at: string | null
        }
        Insert: {
          campaign_participant_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
        }
        Update: {
          campaign_participant_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_emails_campaign_participant_id_fkey"
            columns: ["campaign_participant_id"]
            isOneToOne: false
            referencedRelation: "campaign_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_interactions: {
        Row: {
          call_type: string
          campaign_id: string | null
          created_at: string | null
          id: string
          input_messages: Json
          raw_output: Json
          timestamp: string
          user_id: string | null
        }
        Insert: {
          call_type: string
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          input_messages: Json
          raw_output: Json
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          call_type?: string
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          input_messages?: Json
          raw_output?: Json
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_interactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          updated_at?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      task_activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string | null
          campaign_id: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          task_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string | null
          campaign_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          task_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string | null
          campaign_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_activity_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_activity_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_activity_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "campaign_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_analytics: {
        Row: {
          clicks: number | null
          comments: number | null
          created_at: string | null
          engagement_rate: number | null
          id: string
          impressions: number | null
          last_updated: string | null
          likes: number | null
          published_content_id: string | null
          reach: number | null
          saves: number | null
          shares: number | null
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          last_updated?: string | null
          likes?: number | null
          published_content_id?: string | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          last_updated?: string | null
          likes?: number | null
          published_content_id?: string | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_analytics_published_content_id_fkey"
            columns: ["published_content_id"]
            isOneToOne: false
            referencedRelation: "task_published_content"
            referencedColumns: ["id"]
          },
        ]
      }
      task_content_drafts: {
        Row: {
          ai_generated: boolean | null
          brand_edited: boolean | null
          caption: string | null
          content: string
          created_at: string | null
          created_by: string | null
          hashtags: string | null
          id: string
          media_urls: string[] | null
          shared_with_influencer: boolean | null
          status: string | null
          task_id: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          brand_edited?: boolean | null
          caption?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          hashtags?: string | null
          id?: string
          media_urls?: string[] | null
          shared_with_influencer?: boolean | null
          status?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          brand_edited?: boolean | null
          caption?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          hashtags?: string | null
          id?: string
          media_urls?: string[] | null
          shared_with_influencer?: boolean | null
          status?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_content_drafts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_content_drafts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "campaign_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_content_reviews: {
        Row: {
          ai_commentary: string | null
          created_at: string | null
          feedback: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          task_id: string | null
          upload_id: string | null
        }
        Insert: {
          ai_commentary?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status: string
          task_id?: string | null
          upload_id?: string | null
        }
        Update: {
          ai_commentary?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          task_id?: string | null
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_content_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_content_reviews_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "campaign_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_content_reviews_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "task_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      task_feedback: {
        Row: {
          created_at: string | null
          id: string
          message: string
          phase: string | null
          sender_id: string | null
          sender_type: string
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          phase?: string | null
          sender_id?: string | null
          sender_type: string
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          phase?: string | null
          sender_id?: string | null
          sender_type?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_feedback_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_feedback_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "campaign_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_published_content: {
        Row: {
          analytics_data: Json | null
          created_at: string | null
          id: string
          influencer_id: string | null
          notes: string | null
          platform: string | null
          published_url: string
          status: string | null
          task_id: string | null
          updated_at: string | null
        }
        Insert: {
          analytics_data?: Json | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          notes?: string | null
          platform?: string | null
          published_url: string
          status?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Update: {
          analytics_data?: Json | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          notes?: string | null
          platform?: string | null
          published_url?: string
          status?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_published_content_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_published_content_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "campaign_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_uploads: {
        Row: {
          caption: string | null
          created_at: string | null
          file_size: number | null
          file_url: string
          filename: string
          hashtags: string | null
          id: string
          mime_type: string | null
          task_id: string | null
          uploader_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url: string
          filename: string
          hashtags?: string | null
          id?: string
          mime_type?: string | null
          task_id?: string | null
          uploader_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url?: string
          filename?: string
          hashtags?: string | null
          id?: string
          mime_type?: string | null
          task_id?: string | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_uploads_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "campaign_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_uploads_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_workflow_states: {
        Row: {
          created_at: string | null
          id: string
          phase: string
          status: string
          task_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phase: string
          status: string
          task_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phase?: string
          status?: string
          task_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_workflow_states_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "campaign_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_influencers_to_campaign: {
        Args: {
          campaign_id_param: string
          content_type_param: string
          category_param: string
          tier_param: string
          assignments: Json
        }
        Returns: string[]
      }
      calculate_task_progress: {
        Args: { task_id_param: string }
        Returns: number
      }
      create_assignment_tasks: {
        Args: { assignment_id_param: string }
        Returns: undefined
      }
      extract_llm_section: {
        Args: { campaign_id_param: string; section_name: string }
        Returns: Json
      }
      get_brand_applications: {
        Args: { limit_count?: number }
        Returns: {
          application_id: string
          campaign_id: string
          campaign_title: string
          influencer_name: string
          influencer_handle: string
          followers_count: number
          platform: string
          applied_at: string
          application_status: string
          engagement_rate: number
          average_views: number
          niche: string[]
          ai_score: number
          application_message: string
        }[]
      }
      get_brand_applications_all: {
        Args: { limit_count?: number }
        Returns: {
          application_id: string
          campaign_id: string
          campaign_title: string
          influencer_name: string
          influencer_handle: string
          followers_count: number
          platform: string
          applied_at: string
          application_status: string
          engagement_rate: number
          average_views: number
          niche: string[]
          ai_score: number
          application_message: string
        }[]
      }
      get_brand_campaigns: {
        Args: { brand_filter?: string }
        Returns: {
          campaign_id: string
          campaign_title: string
          campaign_status: string
          budget: number
          spent: number
          applicants: number
          accepted: number
          due_date: string
          platforms: string[]
          category: string
          progress: number
          is_public: boolean
        }[]
      }
      get_campaign_active_influencers: {
        Args: { campaign_id_param: string }
        Returns: {
          id: string
          influencer_id: string
          current_stage: string
          accepted_at: string
          status: string
          influencer_name: string
          influencer_handle: string
          followers_count: number
          engagement_rate: number
        }[]
      }
      get_campaign_applications: {
        Args: { campaign_id_param: string; limit_count?: number }
        Returns: {
          application_id: string
          campaign_id: string
          campaign_title: string
          influencer_id: string
          influencer_name: string
          influencer_handle: string
          followers_count: number
          platform: string
          applied_at: string
          application_status: string
          engagement_rate: number
          average_views: number
          niche: string[]
          ai_score: number
          application_message: string
        }[]
      }
      get_campaign_details: {
        Args: { campaign_id_param: string }
        Returns: Json
      }
      get_campaign_llm_data: {
        Args: { campaign_id_param: string }
        Returns: Json
      }
      get_campaign_strategy: {
        Args: { campaign_id_param: string }
        Returns: Json
      }
      get_campaign_waiting_influencers: {
        Args: { campaign_id_param: string }
        Returns: {
          id: string
          influencer_id: string
          current_stage: string
          accepted_at: string
          status: string
          influencer_name: string
          influencer_handle: string
          followers_count: number
          engagement_rate: number
        }[]
      }
      get_campaign_with_llm_data: {
        Args: { campaign_id_param: string }
        Returns: {
          id: string
          title: string
          description: string
          category: string[]
          status: string
          budget: number
          amount: number
          due_date: string
          created_at: string
          is_public: boolean
          brand_name: string
          brand_logo_url: string
          llm_data: Json
        }[]
      }
      get_influencer_campaigns: {
        Args: { status_filter?: string }
        Returns: {
          campaign_id: string
          campaign_title: string
          brand_name: string
          campaign_status: string
          task_count: number
          due_date: string
          platforms: string[]
          amount: number
          overall_progress: number
          completed_tasks: number
          tasks: Json
        }[]
      }
      get_opportunities: {
        Args: {
          search_query?: string
          category_filter?: string
          min_compensation?: number
          max_compensation?: number
          platform_filter?: string
        }
        Returns: {
          id: string
          title: string
          brand_name: string
          description: string
          category: string
          compensation_min: number
          compensation_max: number
          requirements: Json
          created_at: string
          due_date: string
          application_deadline: string
          has_applied: boolean
        }[]
      }
      user_has_campaign_access: {
        Args: { campaign_id_param: string; user_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      user_type: "Agency" | "Brand" | "Influencer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_type: ["Agency", "Brand", "Influencer"],
    },
  },
} as const
