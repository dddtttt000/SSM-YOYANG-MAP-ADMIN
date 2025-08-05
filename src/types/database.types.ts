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
      admin_users: {
        Row: {
          id: number
          email: string
          password_digest?: string
          name: string
          role: 'admin' | 'super_admin'
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
      members: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['members']['Insert']>
      }
      facilities_ssmn_basic_full: {
        Row: {
          admin_code: string
          facility_name: string
          facility_type: string | null
          address: string | null
          phone: string | null
          contact_info: Json | null
          operating_hours: Json | null
          capacity: number | null
          amenities: string[] | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['facilities_ssmn_basic_full']['Row'], 'admin_code' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['facilities_ssmn_basic_full']['Insert']>
      }
      facilities_ssmn_etc_nonbenefit: {
        Row: {
          admin_code: string
          [key: string]: any
        }
        Insert: Database['public']['Tables']['facilities_ssmn_etc_nonbenefit']['Row']
        Update: Partial<Database['public']['Tables']['facilities_ssmn_etc_nonbenefit']['Row']>
      }
      facilities_ssmn_etc_program: {
        Row: {
          admin_code: string
          [key: string]: any
        }
        Insert: Database['public']['Tables']['facilities_ssmn_etc_program']['Row']
        Update: Partial<Database['public']['Tables']['facilities_ssmn_etc_program']['Row']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_role: 'super_admin' | 'admin'
    }
  }
}

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type Member = Database['public']['Tables']['members']['Row']
export type Facility = Database['public']['Tables']['facilities_ssmn_basic_full']['Row']
export type FacilityNonBenefit = Database['public']['Tables']['facilities_ssmn_etc_nonbenefit']['Row']
export type FacilityProgram = Database['public']['Tables']['facilities_ssmn_etc_program']['Row']

// Permission 인터페이스는 현재 테이블 구조에서 사용되지 않음
// 향후 권한 시스템 구현 시 사용 가능
export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete')[]
}