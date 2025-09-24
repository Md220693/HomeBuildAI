export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bulk_upload_jobs: {
        Row: {
          backup_created_at: string | null
          completed_at: string | null
          created_at: string
          duplicate_strategy: string | null
          id: string
          import_type: string | null
          processed_count: number | null
          safety_backup_id: string | null
          started_at: string
          status: string
          total_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_created_at?: string | null
          completed_at?: string | null
          created_at?: string
          duplicate_strategy?: string | null
          id?: string
          import_type?: string | null
          processed_count?: number | null
          safety_backup_id?: string | null
          started_at?: string
          status?: string
          total_count: number
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_created_at?: string | null
          completed_at?: string | null
          created_at?: string
          duplicate_strategy?: string | null
          id?: string
          import_type?: string | null
          processed_count?: number | null
          safety_backup_id?: string | null
          started_at?: string
          status?: string
          total_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          capitolato_data: Json | null
          confidence: number | null
          cost_estimate_max: number | null
          cost_estimate_min: number | null
          created_at: string
          disclaimer: string | null
          foto_urls: string[] | null
          id: string
          interview_data: Json | null
          otp_attempts: number | null
          otp_code: string | null
          otp_expires_at: string | null
          otp_verified_at: string | null
          pdf_url: string | null
          planimetria_url: string | null
          scope_json: Json | null
          status: string
          updated_at: string
          user_contact: Json | null
        }
        Insert: {
          capitolato_data?: Json | null
          confidence?: number | null
          cost_estimate_max?: number | null
          cost_estimate_min?: number | null
          created_at?: string
          disclaimer?: string | null
          foto_urls?: string[] | null
          id?: string
          interview_data?: Json | null
          otp_attempts?: number | null
          otp_code?: string | null
          otp_expires_at?: string | null
          otp_verified_at?: string | null
          pdf_url?: string | null
          planimetria_url?: string | null
          scope_json?: Json | null
          status?: string
          updated_at?: string
          user_contact?: Json | null
        }
        Update: {
          capitolato_data?: Json | null
          confidence?: number | null
          cost_estimate_max?: number | null
          cost_estimate_min?: number | null
          created_at?: string
          disclaimer?: string | null
          foto_urls?: string[] | null
          id?: string
          interview_data?: Json | null
          otp_attempts?: number | null
          otp_code?: string | null
          otp_expires_at?: string | null
          otp_verified_at?: string | null
          pdf_url?: string | null
          planimetria_url?: string | null
          scope_json?: Json | null
          status?: string
          updated_at?: string
          user_contact?: Json | null
        }
        Relationships: []
      }
      pending_subscribers: {
        Row: {
          created_at: string
          extracted_data: Json
          form_image_url: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          extracted_data: Json
          form_image_url: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          extracted_data?: Json
          form_image_url?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_subscriptions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          email: string
          email_consent: boolean
          first_name: string
          gdpr_consent: boolean
          gender: string | null
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          status: string
          tessera_numero: number | null
          updated_at: string
          whatsapp_consent: boolean
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          email: string
          email_consent?: boolean
          first_name: string
          gdpr_consent?: boolean
          gender?: string | null
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          status?: string
          tessera_numero?: number | null
          updated_at?: string
          whatsapp_consent?: boolean
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          email?: string
          email_consent?: boolean
          first_name?: string
          gdpr_consent?: boolean
          gender?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          tessera_numero?: number | null
          updated_at?: string
          whatsapp_consent?: boolean
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          birth_date: string | null
          city: string | null
          created_at: string
          email: string
          email_consent: boolean
          first_name: string
          form_image_url: string | null
          gdpr_consent: boolean
          gender: string | null
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          status: string
          tessera_numero: number | null
          updated_at: string
          whatsapp_consent: boolean
        }
        Insert: {
          birth_date?: string | null
          city?: string | null
          created_at?: string
          email: string
          email_consent?: boolean
          first_name: string
          form_image_url?: string | null
          gdpr_consent?: boolean
          gender?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          status?: string
          tessera_numero?: number | null
          updated_at?: string
          whatsapp_consent?: boolean
        }
        Update: {
          birth_date?: string | null
          city?: string | null
          created_at?: string
          email?: string
          email_consent?: boolean
          first_name?: string
          form_image_url?: string | null
          gdpr_consent?: boolean
          gender?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          status?: string
          tessera_numero?: number | null
          updated_at?: string
          whatsapp_consent?: boolean
        }
        Relationships: []
      }
      subscribers_backup: {
        Row: {
          backup_data: Json
          backup_id: string
          created_at: string
          created_by: string
          id: string
          original_subscriber_id: string | null
        }
        Insert: {
          backup_data: Json
          backup_id: string
          created_at?: string
          created_by: string
          id?: string
          original_subscriber_id?: string | null
        }
        Update: {
          backup_data?: Json
          backup_id?: string
          created_at?: string
          created_by?: string
          id?: string
          original_subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_backup_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          permissions: Database["public"]["Enums"]["user_permission"][]
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          permissions?: Database["public"]["Enums"]["user_permission"][]
          role?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          permissions?: Database["public"]["Enums"]["user_permission"][]
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          permission: Database["public"]["Enums"]["user_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          permission: Database["public"]["Enums"]["user_permission"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          permission?: Database["public"]["Enums"]["user_permission"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_campaigns: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          first_name?: string
          invitation_token: string
          last_name?: string
          user_password: string
        }
        Returns: Json
      }
      create_subscribers_backup: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_permission: {
        Args: {
          permission_name: Database["public"]["Enums"]["user_permission"]
          user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_permission:
        | "add_members"
        | "view_members"
        | "remove_members"
        | "view_all_sections"
        | "manage_users"
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
      user_permission: [
        "add_members",
        "view_members",
        "remove_members",
        "view_all_sections",
        "manage_users",
      ],
    },
  },
} as const
