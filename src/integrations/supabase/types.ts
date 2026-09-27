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
      cv_analyses: {
        Row: {
          apellidos: string | null
          created_at: string
          debilidades: string[] | null
          direccion: string | null
          edad: number | null
          email: string | null
          fecha_nacimiento: string | null
          file_name: string
          file_type: string
          fortalezas: string[] | null
          id: string
          nacionalidad: string | null
          nombre: string | null
          puntuacion_general: number | null
          recomendaciones: string[] | null
          telefono: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apellidos?: string | null
          created_at?: string
          debilidades?: string[] | null
          direccion?: string | null
          edad?: number | null
          email?: string | null
          fecha_nacimiento?: string | null
          file_name: string
          file_type: string
          fortalezas?: string[] | null
          id?: string
          nacionalidad?: string | null
          nombre?: string | null
          puntuacion_general?: number | null
          recomendaciones?: string[] | null
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apellidos?: string | null
          created_at?: string
          debilidades?: string[] | null
          direccion?: string | null
          edad?: number | null
          email?: string | null
          fecha_nacimiento?: string | null
          file_name?: string
          file_type?: string
          fortalezas?: string[] | null
          id?: string
          nacionalidad?: string | null
          nombre?: string | null
          puntuacion_general?: number | null
          recomendaciones?: string[] | null
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          cv_analysis_id: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          institucion: string
          titulo: string
        }
        Insert: {
          created_at?: string
          cv_analysis_id: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          institucion: string
          titulo: string
        }
        Update: {
          created_at?: string
          cv_analysis_id?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          institucion?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_cv_analysis_id_fkey"
            columns: ["cv_analysis_id"]
            isOneToOne: false
            referencedRelation: "cv_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string
          cv_analysis_id: string
          id: string
          idioma: string
          nivel: string
        }
        Insert: {
          created_at?: string
          cv_analysis_id: string
          id?: string
          idioma: string
          nivel: string
        }
        Update: {
          created_at?: string
          cv_analysis_id?: string
          id?: string
          idioma?: string
          nivel?: string
        }
        Relationships: [
          {
            foreignKeyName: "languages_cv_analysis_id_fkey"
            columns: ["cv_analysis_id"]
            isOneToOne: false
            referencedRelation: "cv_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          action: string
          created_at: string
          id: string
          is_active: boolean
          llm: string
          name: string
          system_content: string
          temperature: number
          updated_at: string
          user_template: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          is_active?: boolean
          llm: string
          name: string
          system_content: string
          temperature?: number
          updated_at?: string
          user_template: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          is_active?: boolean
          llm?: string
          name?: string
          system_content?: string
          temperature?: number
          updated_at?: string
          user_template?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          cv_analysis_id: string
          id: string
          skill: string
        }
        Insert: {
          created_at?: string
          cv_analysis_id: string
          id?: string
          skill: string
        }
        Update: {
          created_at?: string
          cv_analysis_id?: string
          id?: string
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_cv_analysis_id_fkey"
            columns: ["cv_analysis_id"]
            isOneToOne: false
            referencedRelation: "cv_analyses"
            referencedColumns: ["id"]
          },
        ]
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
      work_experiences: {
        Row: {
          created_at: string
          cv_analysis_id: string
          descripcion: string | null
          empresa: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          puesto: string
        }
        Insert: {
          created_at?: string
          cv_analysis_id: string
          descripcion?: string | null
          empresa: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          puesto: string
        }
        Update: {
          created_at?: string
          cv_analysis_id?: string
          descripcion?: string | null
          empresa?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          puesto?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_experiences_cv_analysis_id_fkey"
            columns: ["cv_analysis_id"]
            isOneToOne: false
            referencedRelation: "cv_analyses"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
