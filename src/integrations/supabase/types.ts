export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          created_at: string | null
          deliverable_count: number | null
          description: string | null
          id: string
          influencer_id: string | null
          next_deadline: string | null
          progress: number | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_score?: number | null
          campaign_id?: string | null
          created_at?: string | null
          deliverable_count?: number | null
          description?: string | null
          id?: string
          influencer_id?: string | null
          next_deadline?: string | null
          progress?: number | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_score?: number | null
          campaign_id?: string | null
          created_at?: string | null
          deliverable_count?: number | null
          description?: string | null
          id?: string
          influencer_id?: string | null
          next_deadline?: string | null
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
          category: string | null
          compensation_max: number | null
          compensation_min: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
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
          category?: string | null
          compensation_max?: number | null
          compensation_min?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
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
          category?: string | null
          compensation_max?: number | null
          compensation_min?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
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
      task_feedback: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
          sender_type: string
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
          sender_type: string
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
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
      task_uploads: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_url: string
          filename: string
          id: string
          mime_type: string | null
          task_id: string | null
          uploader_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_url: string
          filename: string
          id?: string
          mime_type?: string | null
          task_id?: string | null
          uploader_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_url?: string
          filename?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
    }
    Enums: {
      user_type: "Agency" | "Brand" | "Influencer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
