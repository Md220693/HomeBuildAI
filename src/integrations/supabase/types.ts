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
      ai_prompts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          kind: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          kind: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          version?: number
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          default_confidence: number
          guard_rail_pct: number
          id: string
          max_neighbors: number
          updated_at: string
          updated_by: string | null
          use_rag: boolean
          use_storici: boolean
        }
        Insert: {
          default_confidence?: number
          guard_rail_pct?: number
          id?: string
          max_neighbors?: number
          updated_at?: string
          updated_by?: string | null
          use_rag?: boolean
          use_storici?: boolean
        }
        Update: {
          default_confidence?: number
          guard_rail_pct?: number
          id?: string
          max_neighbors?: number
          updated_at?: string
          updated_by?: string | null
          use_rag?: boolean
          use_storici?: boolean
        }
        Relationships: []
      }
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
      interview_questions: {
        Row: {
          created_at: string
          field_key: string
          help_text: string | null
          id: string
          label: string
          options_json: Json | null
          required: boolean
          sort_order: number
          type: string
          updated_at: string
          visibility_rule: Json | null
        }
        Insert: {
          created_at?: string
          field_key: string
          help_text?: string | null
          id?: string
          label: string
          options_json?: Json | null
          required?: boolean
          sort_order?: number
          type: string
          updated_at?: string
          visibility_rule?: Json | null
        }
        Update: {
          created_at?: string
          field_key?: string
          help_text?: string | null
          id?: string
          label?: string
          options_json?: Json | null
          required?: boolean
          sort_order?: number
          type?: string
          updated_at?: string
          visibility_rule?: Json | null
        }
        Relationships: []
      }
      kb_docs: {
        Row: {
          content_text: string
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content_text: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content_text?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assignment_type: string | null
          capitolato_data: Json | null
          confidence: number | null
          cost_estimate_max: number | null
          cost_estimate_min: number | null
          created_at: string
          current_assignments: number | null
          disclaimer: string | null
          foto_urls: string[] | null
          id: string
          interview_data: Json | null
          max_assignments: number | null
          otp_attempts: number | null
          otp_code: string | null
          otp_expires_at: string | null
          otp_verified_at: string | null
          pdf_url: string | null
          planimetria_url: string | null
          scope_json: Json | null
          skip_files: boolean | null
          status: string
          updated_at: string
          user_contact: Json | null
        }
        Insert: {
          assignment_type?: string | null
          capitolato_data?: Json | null
          confidence?: number | null
          cost_estimate_max?: number | null
          cost_estimate_min?: number | null
          created_at?: string
          current_assignments?: number | null
          disclaimer?: string | null
          foto_urls?: string[] | null
          id?: string
          interview_data?: Json | null
          max_assignments?: number | null
          otp_attempts?: number | null
          otp_code?: string | null
          otp_expires_at?: string | null
          otp_verified_at?: string | null
          pdf_url?: string | null
          planimetria_url?: string | null
          scope_json?: Json | null
          skip_files?: boolean | null
          status?: string
          updated_at?: string
          user_contact?: Json | null
        }
        Update: {
          assignment_type?: string | null
          capitolato_data?: Json | null
          confidence?: number | null
          cost_estimate_max?: number | null
          cost_estimate_min?: number | null
          created_at?: string
          current_assignments?: number | null
          disclaimer?: string | null
          foto_urls?: string[] | null
          id?: string
          interview_data?: Json | null
          max_assignments?: number | null
          otp_attempts?: number | null
          otp_code?: string | null
          otp_expires_at?: string | null
          otp_verified_at?: string | null
          pdf_url?: string | null
          planimetria_url?: string | null
          scope_json?: Json | null
          skip_files?: boolean | null
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
      price_items: {
        Row: {
          base_price_eur: number
          category: string
          description: string | null
          id: string
          item_code: string
          priority: number | null
          regional_pricelist_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          base_price_eur: number
          category: string
          description?: string | null
          id?: string
          item_code: string
          priority?: number | null
          regional_pricelist_id?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          base_price_eur?: number
          category?: string
          description?: string | null
          id?: string
          item_code?: string
          priority?: number | null
          regional_pricelist_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_items_regional_pricelist_id_fkey"
            columns: ["regional_pricelist_id"]
            isOneToOne: false
            referencedRelation: "regional_pricelists"
            referencedColumns: ["id"]
          },
        ]
      }
      price_modifiers_geo: {
        Row: {
          cap_pattern: string | null
          id: string
          multiplier: number
          note: string | null
          province: string | null
          region: string
          updated_at: string
        }
        Insert: {
          cap_pattern?: string | null
          id?: string
          multiplier?: number
          note?: string | null
          province?: string | null
          region: string
          updated_at?: string
        }
        Update: {
          cap_pattern?: string | null
          id?: string
          multiplier?: number
          note?: string | null
          province?: string | null
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_modifiers_quality: {
        Row: {
          id: string
          multiplier: number
          quality_tier: string
        }
        Insert: {
          id?: string
          multiplier?: number
          quality_tier: string
        }
        Update: {
          id?: string
          multiplier?: number
          quality_tier?: string
        }
        Relationships: []
      }
      price_modifiers_urgency: {
        Row: {
          id: string
          multiplier: number
          urgency_band: string
        }
        Insert: {
          id?: string
          multiplier?: number
          urgency_band: string
        }
        Update: {
          id?: string
          multiplier?: number
          urgency_band?: string
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
      regional_pricelists: {
        Row: {
          anno_riferimento: number
          attivo: boolean
          created_at: string
          created_by: string | null
          file_originale_name: string | null
          file_originale_url: string | null
          fonte: string
          id: string
          nome_regione: string
          note: string | null
          updated_at: string
        }
        Insert: {
          anno_riferimento?: number
          attivo?: boolean
          created_at?: string
          created_by?: string | null
          file_originale_name?: string | null
          file_originale_url?: string | null
          fonte: string
          id?: string
          nome_regione: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          anno_riferimento?: number
          attivo?: boolean
          created_at?: string
          created_by?: string | null
          file_originale_name?: string | null
          file_originale_url?: string | null
          fonte?: string
          id?: string
          nome_regione?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_pricelists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      supplier_leads: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          lead_id: string
          offered_at: string
          price: number | null
          purchased_at: string | null
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          lead_id: string
          offered_at?: string
          price?: number | null
          purchased_at?: string | null
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          lead_id?: string
          offered_at?: string
          price?: number | null
          purchased_at?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_leads_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          payment_status: string
          stripe_payment_intent_id: string | null
          supplier_id: string
          supplier_lead_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          supplier_id: string
          supplier_lead_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          supplier_id?: string
          supplier_lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_lead_id_fkey"
            columns: ["supplier_lead_id"]
            isOneToOne: false
            referencedRelation: "supplier_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          attivo: boolean
          codice_condotta_accettato: boolean
          contatto_referente: string
          created_at: string
          email: string
          id: string
          onboarding_completato: boolean
          partita_iva: string
          ragione_sociale: string
          sito_web: string | null
          telefono: string
          updated_at: string
          user_id: string
          zona_operativa: string[]
        }
        Insert: {
          attivo?: boolean
          codice_condotta_accettato?: boolean
          contatto_referente: string
          created_at?: string
          email: string
          id?: string
          onboarding_completato?: boolean
          partita_iva: string
          ragione_sociale: string
          sito_web?: string | null
          telefono: string
          updated_at?: string
          user_id: string
          zona_operativa: string[]
        }
        Update: {
          attivo?: boolean
          codice_condotta_accettato?: boolean
          contatto_referente?: string
          created_at?: string
          email?: string
          id?: string
          onboarding_completato?: boolean
          partita_iva?: string
          ragione_sociale?: string
          sito_web?: string | null
          telefono?: string
          updated_at?: string
          user_id?: string
          zona_operativa?: string[]
        }
        Relationships: []
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
      vendor_quotes: {
        Row: {
          created_at: string
          geo: string
          id: string
          normalized_lines_json: Json | null
          quality_tier: string
          scope_json: Json
          total_eur: number
        }
        Insert: {
          created_at?: string
          geo: string
          id?: string
          normalized_lines_json?: Json | null
          quality_tier: string
          scope_json: Json
          total_eur: number
        }
        Update: {
          created_at?: string
          geo?: string
          id?: string
          normalized_lines_json?: Json | null
          quality_tier?: string
          scope_json?: Json
          total_eur?: number
        }
        Relationships: []
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
      auto_assign_lead_to_suppliers: {
        Args: { lead_uuid: string }
        Returns: number
      }
      create_subscribers_backup: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      extract_cap_from_location: {
        Args: { interview_data: Json }
        Returns: string
      }
      get_best_price_item: {
        Args: { p_item_code: string; p_region?: string }
        Returns: {
          base_price_eur: number
          category: string
          description: string
          id: string
          item_code: string
          priority: number
          regional_pricelist_id: string
          unit: string
        }[]
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
