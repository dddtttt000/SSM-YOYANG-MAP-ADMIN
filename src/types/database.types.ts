export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          id: number
          email: string | null
          name: string | null
          nickname: string | null
          social_id: string
          social_type: string
          phone: string | null
          status: string
          created_at: string | null
          updated_at: string | null
          birthday: string | null
          birthyear: string | null
          gender: string | null
          profile_image: string | null
          last_login_at: string | null
          connected_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['members']['Insert']>
      }
      facilities_ssmn_basic_full: {
        Row: {
          admin_code: string
          admin_type_code: string | null
          admin_name: string | null
          post_code: string | null
          sido_code: string | null
          sigungu_code: string | null
          hdong_code: string | null
          bdong_code: string | null
          ri_code: string | null
          address: string | null
          rode_code: string | null
          building_main_no: string | null
          building_sub_no: string | null
          floor: string | null
          area_code: string | null
          country_number: string | null
          phone_number: string | null
          reg_date: string | null
          install_date: string | null
          facility_director: number | null
          office_director: number | null
          social_worker: number | null
          doctor_regular: number | null
          doctor_parttime: number | null
          nurse: number | null
          nurse_aide: number | null
          dental_hygienist: number | null
          physical_therapist: number | null
          occupational_therapist: number | null
          caregiver_level1: number | null
          caregiver_level2: number | null
          caregiver_deferred: number | null
          clerk: number | null
          nutritionist: number | null
          cook: number | null
          hygienist: number | null
          manager: number | null
          assistant: number | null
          others: number | null
          room_1: number | null
          room_2: number | null
          room_3: number | null
          room_4: number | null
          special_room: number | null
          office: number | null
          medical_room: number | null
          training_room: number | null
          program_room: number | null
          dining_room: number | null
          restroom: number | null
          bath_room: number | null
          laundry_room: number | null
          capacity: number | null
          current_male: number | null
          current_female: number | null
          waiting_male: number | null
          waiting_female: number | null
          homepage_url: string | null
          transport_desc: string | null
          parking_info: string | null
          rating_category: string | null
          rating_date: string | null
          final_rating: string | null
          score: number | null
          updated_at: string | null
          created_at: string | null
          geom: unknown | null
          thumbnail_url: string | null
          admin_introduce: string | null
          sido_name: string | null
          sigungu_name: string | null
          bdong_name: string | null
          '2023_rating': string | null
          '2021_rating': string | null
        }
        Insert: Omit<Database['public']['Tables']['facilities_ssmn_basic_full']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['facilities_ssmn_basic_full']['Insert']>
      }
      facilities_ssmn_etc_nonbenefit: {
        Row: {
          id: number
          admin_code: string | null
          nonbenefit_kind: string | null
          nonbenefit_basis: string | null
          nonbenefit_amount: string | null
          nonbenefit_registered_at: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['facilities_ssmn_etc_nonbenefit']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['facilities_ssmn_etc_nonbenefit']['Insert']>
      }
      facilities_ssmn_etc_program: {
        Row: {
          id: number
          admin_code: string | null
          program_type: string | null
          program_name: string | null
          program_target_count: string | null
          program_cycle: string | null
          program_location: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['facilities_ssmn_etc_program']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['facilities_ssmn_etc_program']['Row']>
      }
      announcements: {
        Row: {
          id: number
          title: string
          content: string
          category: string
          is_important: boolean
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: number
        }
        Insert: Omit<
          Database['public']['Tables']['announcements']['Row'],
          'id' | 'created_at' | 'updated_at' | 'created_by'
        >
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
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
export type Announcement = Database['public']['Tables']['announcements']['Row']

// Permission 인터페이스는 현재 테이블 구조에서 사용되지 않음
// 향후 권한 시스템 구현 시 사용 가능
export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete')[]
}
