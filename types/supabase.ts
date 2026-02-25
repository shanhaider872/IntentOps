export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          full_name: string
          description: string | null
          url: string
          default_branch: string
          language: string | null
          cloud_provider: string | null
          detected_frameworks: string[] | null
          dockerfile_content: string | null
          terraform_files: Json | null
          cloudformation_files: Json | null
          is_connected: boolean
          last_analyzed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          full_name: string
          description?: string | null
          url: string
          default_branch?: string
          language?: string | null
          cloud_provider?: string | null
          detected_frameworks?: string[] | null
          dockerfile_content?: string | null
          terraform_files?: Json | null
          cloudformation_files?: Json | null
          is_connected?: boolean
          last_analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          full_name?: string
          description?: string | null
          url?: string
          default_branch?: string
          language?: string | null
          cloud_provider?: string | null
          detected_frameworks?: string[] | null
          dockerfile_content?: string | null
          terraform_files?: Json | null
          cloudformation_files?: Json | null
          is_connected?: boolean
          last_analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      analyses: {
        Row: {
          id: string
          project_id: string
          user_id: string
          intent: string
          status: string
          started_at: string | null
          completed_at: string | null
          error_message: string | null
          metrics: Json | null
          chart_data: Json | null
          summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          intent: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          metrics?: Json | null
          chart_data?: Json | null
          summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          intent?: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          metrics?: Json | null
          chart_data?: Json | null
          summary?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      recommendations: {
        Row: {
          id: string
          analysis_id: string
          project_id: string
          user_id: string
          title: string
          category: string
          description: string
          savings: number
          performance_gain: number
          effort: string
          risk: string
          code_patch: string | null
          terraform_update: string | null
          is_applied: boolean
          applied_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          project_id: string
          user_id: string
          title: string
          category: string
          description: string
          savings?: number
          performance_gain?: number
          effort: string
          risk: string
          code_patch?: string | null
          terraform_update?: string | null
          is_applied?: boolean
          applied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          project_id?: string
          user_id?: string
          title?: string
          category?: string
          description?: string
          savings?: number
          performance_gain?: number
          effort?: string
          risk?: string
          code_patch?: string | null
          terraform_update?: string | null
          is_applied?: boolean
          applied_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
