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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          target_id: string | null
          target_table: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_table: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_table?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      consultation_requests: {
        Row: {
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          status: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          status?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          status?: string
        }
        Relationships: []
      }
      cv_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          processed_at: string | null
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          processed_at?: string | null
          status?: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          processed_at?: string | null
          status?: string
          token?: string
        }
        Relationships: []
      }
      email_send_metrics: {
        Row: {
          attempt_log: Json
          attempts: number
          created_at: string
          delivery_events: Json
          delivery_status: string | null
          function_name: string
          id: string
          idempotency_key: string | null
          last_delivery_at: string | null
          last_error_code: string | null
          last_error_message: string | null
          provider_message_id: string | null
          recipient_hash: string | null
          status: string
          total_latency_ms: number | null
        }
        Insert: {
          attempt_log?: Json
          attempts?: number
          created_at?: string
          delivery_events?: Json
          delivery_status?: string | null
          function_name: string
          id?: string
          idempotency_key?: string | null
          last_delivery_at?: string | null
          last_error_code?: string | null
          last_error_message?: string | null
          provider_message_id?: string | null
          recipient_hash?: string | null
          status: string
          total_latency_ms?: number | null
        }
        Update: {
          attempt_log?: Json
          attempts?: number
          created_at?: string
          delivery_events?: Json
          delivery_status?: string | null
          function_name?: string
          id?: string
          idempotency_key?: string | null
          last_delivery_at?: string | null
          last_error_code?: string | null
          last_error_message?: string | null
          provider_message_id?: string | null
          recipient_hash?: string | null
          status?: string
          total_latency_ms?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempts: number
          blocked_until: string | null
          first_attempt: string
          id: string
          identifier: string
          last_attempt: string
        }
        Insert: {
          action_type: string
          attempts?: number
          blocked_until?: string | null
          first_attempt?: string
          id?: string
          identifier: string
          last_attempt?: string
        }
        Update: {
          action_type?: string
          attempts?: number
          blocked_until?: string | null
          first_attempt?: string
          id?: string
          identifier?: string
          last_attempt?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_block_minutes?: number
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit_v2: {
        Args: {
          p_action_type: string
          p_block_minutes?: number
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
