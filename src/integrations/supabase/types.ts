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
      backlog_tasks: {
        Row: {
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      download_requests: {
        Row: {
          category_tag: string | null
          company: string
          consent: boolean
          created_at: string
          dl_title: string | null
          dl_type: string | null
          dl_url: string | null
          download_type: string
          email: string
          first_name: string
          id: string
          item_id: string
          item_title: string
          last_name: string
          position: string
          title_tag: string | null
        }
        Insert: {
          category_tag?: string | null
          company: string
          consent?: boolean
          created_at?: string
          dl_title?: string | null
          dl_type?: string | null
          dl_url?: string | null
          download_type: string
          email: string
          first_name: string
          id?: string
          item_id: string
          item_title: string
          last_name: string
          position: string
          title_tag?: string | null
        }
        Update: {
          category_tag?: string | null
          company?: string
          consent?: boolean
          created_at?: string
          dl_title?: string | null
          dl_type?: string | null
          dl_url?: string | null
          download_type?: string
          email?: string
          first_name?: string
          id?: string
          item_id?: string
          item_title?: string
          last_name?: string
          position?: string
          title_tag?: string | null
        }
        Relationships: []
      }
      editor_page_access: {
        Row: {
          created_at: string | null
          id: string
          page_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_slug: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          page_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          automotive_interests: string[] | null
          company: string
          created_at: string
          current_test_systems: string | null
          email: string
          event_date: string
          event_location: string
          event_slug: string
          event_title: string
          evt_image_url: string | null
          first_name: string
          id: string
          industry: string | null
          last_name: string
          phone: string | null
          position: string
        }
        Insert: {
          automotive_interests?: string[] | null
          company: string
          created_at?: string
          current_test_systems?: string | null
          email: string
          event_date: string
          event_location: string
          event_slug?: string
          event_title: string
          evt_image_url?: string | null
          first_name: string
          id?: string
          industry?: string | null
          last_name: string
          phone?: string | null
          position: string
        }
        Update: {
          automotive_interests?: string[] | null
          company?: string
          created_at?: string
          current_test_systems?: string | null
          email?: string
          event_date?: string
          event_location?: string
          event_slug?: string
          event_title?: string
          evt_image_url?: string | null
          first_name?: string
          id?: string
          industry?: string | null
          last_name?: string
          phone?: string | null
          position?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          external_url: string | null
          id: string
          image_url: string
          is_online: boolean | null
          language_code: string
          location_city: string
          location_coordinates: unknown
          location_country: string
          location_venue: string | null
          max_participants: number | null
          published: boolean | null
          registration_deadline: string | null
          slug: string
          teaser: string
          time_end: string | null
          time_start: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url: string
          is_online?: boolean | null
          language_code?: string
          location_city: string
          location_coordinates?: unknown
          location_country: string
          location_venue?: string | null
          max_participants?: number | null
          published?: boolean | null
          registration_deadline?: string | null
          slug: string
          teaser: string
          time_end?: string | null
          time_start: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string
          is_online?: boolean | null
          language_code?: string
          location_city?: string
          location_coordinates?: unknown
          location_country?: string
          location_venue?: string | null
          max_participants?: number | null
          published?: boolean | null
          registration_deadline?: string | null
          slug?: string
          teaser?: string
          time_end?: string | null
          time_start?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      file_segment_mappings: {
        Row: {
          alt_text: string | null
          alt_text_translations: Json | null
          bucket_id: string
          created_at: string | null
          file_path: string
          id: string
          segment_ids: string[]
          updated_at: string | null
          visibility: string
        }
        Insert: {
          alt_text?: string | null
          alt_text_translations?: Json | null
          bucket_id?: string
          created_at?: string | null
          file_path: string
          id?: string
          segment_ids: string[]
          updated_at?: string | null
          visibility?: string
        }
        Update: {
          alt_text?: string | null
          alt_text_translations?: Json | null
          bucket_id?: string
          created_at?: string | null
          file_path?: string
          id?: string
          segment_ids?: string[]
          updated_at?: string | null
          visibility?: string
        }
        Relationships: []
      }
      glossary: {
        Row: {
          context: string | null
          created_at: string | null
          created_by: string | null
          id: string
          term: string
          term_type: string
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          term: string
          term_type: string
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          term?: string
          term_type?: string
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media_folders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          parent_id: string | null
          position: number | null
          storage_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parent_id?: string | null
          position?: number | null
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          position?: number | null
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_links: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          description: string | null
          icon_key: string | null
          id: string
          label_key: string
          language: string
          parent_category: string | null
          parent_label: string | null
          position: number | null
          slug: string
          target_page_slug: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          icon_key?: string | null
          id?: string
          label_key: string
          language: string
          parent_category?: string | null
          parent_label?: string | null
          position?: number | null
          slug: string
          target_page_slug?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          icon_key?: string | null
          id?: string
          label_key?: string
          language?: string
          parent_category?: string | null
          parent_label?: string | null
          position?: number | null
          slug?: string
          target_page_slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string | null
          date: string
          id: string
          image_url: string
          language: string
          published: boolean | null
          slug: string
          teaser: string
          title: string
          updated_at: string | null
          visibility: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          date?: string
          id?: string
          image_url: string
          language?: string
          published?: boolean | null
          slug: string
          teaser: string
          title: string
          updated_at?: string | null
          visibility?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          image_url?: string
          language?: string
          published?: boolean | null
          slug?: string
          teaser?: string
          title?: string
          updated_at?: string | null
          visibility?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content_type: string
          content_value: string
          id: string
          language: string
          page_slug: string
          section_key: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content_type: string
          content_value: string
          id?: string
          language?: string
          page_slug: string
          section_key: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content_type?: string
          content_value?: string
          id?: string
          language?: string
          page_slug?: string
          section_key?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      page_content_backups: {
        Row: {
          backup_created_at: string
          content_type: string
          content_value: string
          id: string
          language: string
          original_updated_at: string | null
          original_updated_by: string | null
          page_slug: string
          section_key: string
        }
        Insert: {
          backup_created_at?: string
          content_type: string
          content_value: string
          id?: string
          language?: string
          original_updated_at?: string | null
          original_updated_by?: string | null
          page_slug: string
          section_key: string
        }
        Update: {
          backup_created_at?: string
          content_type?: string
          content_value?: string
          id?: string
          language?: string
          original_updated_at?: string | null
          original_updated_by?: string | null
          page_slug?: string
          section_key?: string
        }
        Relationships: []
      }
      page_registry: {
        Row: {
          created_at: string | null
          cta_group: string | null
          cta_icon: string | null
          cta_label: string | null
          design_icon: string | null
          flyout_description: string | null
          flyout_description_translations: Json | null
          flyout_image_url: string | null
          id: number
          page_id: number
          page_slug: string
          page_title: string
          parent_id: number | null
          parent_slug: string | null
          position: number | null
          target_page_slug: string | null
        }
        Insert: {
          created_at?: string | null
          cta_group?: string | null
          cta_icon?: string | null
          cta_label?: string | null
          design_icon?: string | null
          flyout_description?: string | null
          flyout_description_translations?: Json | null
          flyout_image_url?: string | null
          id?: number
          page_id: number
          page_slug: string
          page_title: string
          parent_id?: number | null
          parent_slug?: string | null
          position?: number | null
          target_page_slug?: string | null
        }
        Update: {
          created_at?: string | null
          cta_group?: string | null
          cta_icon?: string | null
          cta_label?: string | null
          design_icon?: string | null
          flyout_description?: string | null
          flyout_description_translations?: Json | null
          flyout_image_url?: string | null
          id?: number
          page_id?: number
          page_slug?: string
          page_title?: string
          parent_id?: number | null
          parent_slug?: string | null
          position?: number | null
          target_page_slug?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      segment_registry: {
        Row: {
          created_at: string | null
          deleted: boolean | null
          id: number
          is_static: boolean | null
          page_slug: string
          position: number | null
          segment_id: number
          segment_key: string
          segment_type: string
        }
        Insert: {
          created_at?: string | null
          deleted?: boolean | null
          id?: number
          is_static?: boolean | null
          page_slug: string
          position?: number | null
          segment_id: number
          segment_key: string
          segment_type: string
        }
        Update: {
          created_at?: string | null
          deleted?: boolean | null
          id?: number
          is_static?: boolean | null
          page_slug?: string
          position?: number | null
          segment_id?: number
          segment_key?: string
          segment_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "editor"
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
      app_role: ["admin", "user", "editor"],
    },
  },
} as const
