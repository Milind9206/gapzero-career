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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assessment_results: {
        Row: {
          id: string
          score: number
          strong_areas: string[]
          student_email: string
          taken_at: string
          total: number
          weak_areas: string[]
        }
        Insert: {
          id?: string
          score: number
          strong_areas?: string[]
          student_email: string
          taken_at?: string
          total?: number
          weak_areas?: string[]
        }
        Update: {
          id?: string
          score?: number
          strong_areas?: string[]
          student_email?: string
          taken_at?: string
          total?: number
          weak_areas?: string[]
        }
        Relationships: []
      }
      certifications: {
        Row: {
          area: string
          id: string
          link: string
          provider: string
          title: string
          type: string
        }
        Insert: {
          area: string
          id?: string
          link: string
          provider: string
          title: string
          type: string
        }
        Update: {
          area?: string
          id?: string
          link?: string
          provider?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          area: string
          duration: string | null
          id: string
          link: string
          platform: string
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          area: string
          duration?: string | null
          id?: string
          link: string
          platform: string
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          area?: string
          duration?: string | null
          id?: string
          link?: string
          platform?: string
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      internships: {
        Row: {
          company: string
          field: string
          id: string
          link: string
          location: string
          stipend: string | null
          title: string
          type: string
        }
        Insert: {
          company: string
          field: string
          id?: string
          link: string
          location: string
          stipend?: string | null
          title: string
          type: string
        }
        Update: {
          company?: string
          field?: string
          id?: string
          link?: string
          location?: string
          stipend?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company: string
          field: string
          id: string
          link: string
          location: string
          salary_range: string
          skills: string[]
          title: string
        }
        Insert: {
          company: string
          field?: string
          id?: string
          link: string
          location: string
          salary_range: string
          skills?: string[]
          title: string
        }
        Update: {
          company?: string
          field?: string
          id?: string
          link?: string
          location?: string
          salary_range?: string
          skills?: string[]
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          recipient_email: string
          sender_email: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          recipient_email: string
          sender_email: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          recipient_email?: string
          sender_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarded: boolean
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarded?: boolean
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarded?: boolean
          role?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_index: number
          difficulty: string
          id: string
          options: string[]
          question: string
          subject: string
        }
        Insert: {
          correct_index: number
          difficulty?: string
          id?: string
          options: string[]
          question: string
          subject: string
        }
        Update: {
          correct_index?: number
          difficulty?: string
          id?: string
          options?: string[]
          question?: string
          subject?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          assessments_taken: number
          avg_score: number
          branch: string | null
          course: string | null
          created_at: string
          email: string
          id: string
          interest: string | null
          internships_done: number
          name: string
          photo_url: string | null
          resume_url: string | null
        }
        Insert: {
          assessments_taken?: number
          avg_score?: number
          branch?: string | null
          course?: string | null
          created_at?: string
          email: string
          id?: string
          interest?: string | null
          internships_done?: number
          name: string
          photo_url?: string | null
          resume_url?: string | null
        }
        Update: {
          assessments_taken?: number
          avg_score?: number
          branch?: string | null
          course?: string | null
          created_at?: string
          email?: string
          id?: string
          interest?: string | null
          internships_done?: number
          name?: string
          photo_url?: string | null
          resume_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
