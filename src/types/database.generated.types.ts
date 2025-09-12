export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: number
          is_active: boolean | null
          last_login_at: string | null
          name: string
          password_digest: string
          role: string
          supabase_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          password_digest: string
          role: string
          supabase_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          password_digest?: string
          role?: string
          supabase_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      announcement_reads: {
        Row: {
          announcement_id: number
          id: number
          member_id: number
          read_at: string | null
        }
        Insert: {
          announcement_id: number
          id?: number
          member_id: number
          read_at?: string | null
        }
        Update: {
          announcement_id?: number
          id?: number
          member_id?: number
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: number
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string | null
          description: string | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string | null
          description?: string | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string | null
          description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bdong_code_mapping: {
        Row: {
          bdong_code: string | null
          bdong_name: string | null
          bdong_part: string | null
          center_lat: number | null
          center_lng: number | null
          deleted_date: string | null
          number: string | null
          past_bdong_code: string | null
          ri_name: string | null
          sido_name: string | null
          sido_part: string | null
          sigungu_name: string | null
          sigungu_part: string | null
          start_date: string | null
        }
        Insert: {
          bdong_code?: string | null
          bdong_name?: string | null
          bdong_part?: string | null
          center_lat?: number | null
          center_lng?: number | null
          deleted_date?: string | null
          number?: string | null
          past_bdong_code?: string | null
          ri_name?: string | null
          sido_name?: string | null
          sido_part?: string | null
          sigungu_name?: string | null
          sigungu_part?: string | null
          start_date?: string | null
        }
        Update: {
          bdong_code?: string | null
          bdong_name?: string | null
          bdong_part?: string | null
          center_lat?: number | null
          center_lng?: number | null
          deleted_date?: string | null
          number?: string | null
          past_bdong_code?: string | null
          ri_name?: string | null
          sido_name?: string | null
          sido_part?: string | null
          sigungu_name?: string | null
          sigungu_part?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
      facilities_rating: {
        Row: {
          admin_code: string | null
          final_rating: string | null
          rating_category: string | null
          rating_date: string | null
          score: string | null
        }
        Insert: {
          admin_code?: string | null
          final_rating?: string | null
          rating_category?: string | null
          rating_date?: string | null
          score?: string | null
        }
        Update: {
          admin_code?: string | null
          final_rating?: string | null
          rating_category?: string | null
          rating_date?: string | null
          score?: string | null
        }
        Relationships: []
      }
      facilities_raw_address_20250201: {
        Row: {
          address: string | null
          admin_code: string | null
          admin_name: string | null
          bdong: string | null
          bdong_code: number | null
          install_date: number | null
          post_code: number | null
          reg_date: number | null
          sido_code: number | null
          sigungu_code: number | null
        }
        Insert: {
          address?: string | null
          admin_code?: string | null
          admin_name?: string | null
          bdong?: string | null
          bdong_code?: number | null
          install_date?: number | null
          post_code?: number | null
          reg_date?: number | null
          sido_code?: number | null
          sigungu_code?: number | null
        }
        Update: {
          address?: string | null
          admin_code?: string | null
          admin_name?: string | null
          bdong?: string | null
          bdong_code?: number | null
          install_date?: number | null
          post_code?: number | null
          reg_date?: number | null
          sido_code?: number | null
          sigungu_code?: number | null
        }
        Relationships: []
      }
      facilities_raw_employment_20250201: {
        Row: {
          admin_code: number | null
          admin_type_code: string | null
          admin_type_name: string | null
          caregiver_level1: string | null
          dental_hygienist: string | null
          doctor_parttime: string | null
          doctor_regular: string | null
          etc: string | null
          facility_director: string | null
          nurse: string | null
          nurse_aide: string | null
          nutritionist: string | null
          occupational_therapist: string | null
          office_director: string | null
          physical_therapist: string | null
          social_worker: string | null
        }
        Insert: {
          admin_code?: number | null
          admin_type_code?: string | null
          admin_type_name?: string | null
          caregiver_level1?: string | null
          dental_hygienist?: string | null
          doctor_parttime?: string | null
          doctor_regular?: string | null
          etc?: string | null
          facility_director?: string | null
          nurse?: string | null
          nurse_aide?: string | null
          nutritionist?: string | null
          occupational_therapist?: string | null
          office_director?: string | null
          physical_therapist?: string | null
          social_worker?: string | null
        }
        Update: {
          admin_code?: number | null
          admin_type_code?: string | null
          admin_type_name?: string | null
          caregiver_level1?: string | null
          dental_hygienist?: string | null
          doctor_parttime?: string | null
          doctor_regular?: string | null
          etc?: string | null
          facility_director?: string | null
          nurse?: string | null
          nurse_aide?: string | null
          nutritionist?: string | null
          occupational_therapist?: string | null
          office_director?: string | null
          physical_therapist?: string | null
          social_worker?: string | null
        }
        Relationships: []
      }
      facilities_raw_rating_20250630: {
        Row: {
          admin_code: string | null
          admin_name: string | null
          admin_owner: string | null
          admin_type: string | null
          environment: number | null
          final_rating: string | null
          guarantee: number | null
          No: number | null
          operation: number | null
          process: number | null
          rating_date: string | null
          rating_year: string | null
          result: number | null
          sido_name: string | null
          sigungu_name: string | null
          total_score: string | null
        }
        Insert: {
          admin_code?: string | null
          admin_name?: string | null
          admin_owner?: string | null
          admin_type?: string | null
          environment?: number | null
          final_rating?: string | null
          guarantee?: number | null
          No?: number | null
          operation?: number | null
          process?: number | null
          rating_date?: string | null
          rating_year?: string | null
          result?: number | null
          sido_name?: string | null
          sigungu_name?: string | null
          total_score?: string | null
        }
        Update: {
          admin_code?: string | null
          admin_name?: string | null
          admin_owner?: string | null
          admin_type?: string | null
          environment?: number | null
          final_rating?: string | null
          guarantee?: number | null
          No?: number | null
          operation?: number | null
          process?: number | null
          rating_date?: string | null
          rating_year?: string | null
          result?: number | null
          sido_name?: string | null
          sigungu_name?: string | null
          total_score?: string | null
        }
        Relationships: []
      }
      facilities_raw_type_20250201: {
        Row: {
          admin_code: string | null
          admin_type_code: string | null
          admin_type_name: string | null
          care_facility: boolean | null
          care_family_home: boolean | null
          day_night_protection: boolean | null
          facility_id: number | null
          maximum_people: string | null
          short_term_protection: boolean | null
          visiting_bath: boolean | null
          visiting_care: boolean | null
          visiting_nursing: boolean | null
          welfare_equipment: boolean | null
        }
        Insert: {
          admin_code?: string | null
          admin_type_code?: string | null
          admin_type_name?: string | null
          care_facility?: boolean | null
          care_family_home?: boolean | null
          day_night_protection?: boolean | null
          facility_id?: number | null
          maximum_people?: string | null
          short_term_protection?: boolean | null
          visiting_bath?: boolean | null
          visiting_care?: boolean | null
          visiting_nursing?: boolean | null
          welfare_equipment?: boolean | null
        }
        Update: {
          admin_code?: string | null
          admin_type_code?: string | null
          admin_type_name?: string | null
          care_facility?: boolean | null
          care_family_home?: boolean | null
          day_night_protection?: boolean | null
          facility_id?: number | null
          maximum_people?: string | null
          short_term_protection?: boolean | null
          visiting_bath?: boolean | null
          visiting_care?: boolean | null
          visiting_nursing?: boolean | null
          welfare_equipment?: boolean | null
        }
        Relationships: []
      }
      facilities_ssmn_basic_full: {
        Row: {
          "2021_rating": string | null
          "2023_rating": string | null
          address: string | null
          admin_code: string
          admin_introduce: string | null
          admin_name: string | null
          admin_type_code: string | null
          area_code: string | null
          assistant: number | null
          bath_room: number | null
          bdong_code: string | null
          bdong_name: string | null
          building_main_no: string | null
          building_sub_no: string | null
          capacity: number | null
          caregiver_deferred: number | null
          caregiver_level1: number | null
          caregiver_level2: number | null
          clerk: number | null
          cook: number | null
          country_number: string | null
          created_at: string | null
          current_female: number | null
          current_male: number | null
          dental_hygienist: number | null
          dining_room: number | null
          doctor_parttime: number | null
          doctor_regular: number | null
          facility_director: number | null
          final_rating: string | null
          floor: string | null
          geom: unknown | null
          hdong_code: string | null
          homepage_url: string | null
          hygienist: number | null
          install_date: string | null
          laundry_room: number | null
          manager: number | null
          medical_room: number | null
          nurse: number | null
          nurse_aide: number | null
          nutritionist: number | null
          occupational_therapist: number | null
          office: number | null
          office_director: number | null
          others: number | null
          parking_info: string | null
          phone_number: string | null
          physical_therapist: number | null
          post_code: string | null
          program_room: number | null
          rating_category: string | null
          rating_date: string | null
          reg_date: string | null
          restroom: number | null
          ri_code: string | null
          rode_code: string | null
          room_1: number | null
          room_2: number | null
          room_3: number | null
          room_4: number | null
          score: number | null
          sido_code: string | null
          sido_name: string | null
          sigungu_code: string | null
          sigungu_name: string | null
          social_worker: number | null
          special_room: number | null
          thumbnail_url: string | null
          training_room: number | null
          transport_desc: string | null
          updated_at: string | null
          waiting_female: number | null
          waiting_male: number | null
        }
        Insert: {
          "2021_rating"?: string | null
          "2023_rating"?: string | null
          address?: string | null
          admin_code: string
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Update: {
          "2021_rating"?: string | null
          "2023_rating"?: string | null
          address?: string | null
          admin_code?: string
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Relationships: []
      }
      facilities_ssmn_basic_full_backup_20250714: {
        Row: {
          "2021_rating": string | null
          "2023_rating": string | null
          address: string | null
          admin_code: string | null
          admin_introduce: string | null
          admin_name: string | null
          admin_type_code: string | null
          area_code: string | null
          assistant: number | null
          bath_room: number | null
          bdong_code: string | null
          bdong_name: string | null
          building_main_no: string | null
          building_sub_no: string | null
          capacity: number | null
          caregiver_deferred: number | null
          caregiver_level1: number | null
          caregiver_level2: number | null
          clerk: number | null
          cook: number | null
          country_number: string | null
          created_at: string | null
          current_female: number | null
          current_male: number | null
          dental_hygienist: number | null
          dining_room: number | null
          doctor_parttime: number | null
          doctor_regular: number | null
          facility_director: number | null
          final_rating: string | null
          floor: string | null
          geom: unknown | null
          hdong_code: string | null
          homepage_url: string | null
          hygienist: number | null
          install_date: string | null
          laundry_room: number | null
          manager: number | null
          medical_room: number | null
          nurse: number | null
          nurse_aide: number | null
          nutritionist: number | null
          occupational_therapist: number | null
          office: number | null
          office_director: number | null
          others: number | null
          parking_info: string | null
          phone_number: string | null
          physical_therapist: number | null
          post_code: string | null
          program_room: number | null
          rating_category: string | null
          rating_date: string | null
          reg_date: string | null
          restroom: number | null
          ri_code: string | null
          rode_code: string | null
          room_1: number | null
          room_2: number | null
          room_3: number | null
          room_4: number | null
          score: number | null
          sido_code: string | null
          sido_name: string | null
          sigungu_code: string | null
          sigungu_name: string | null
          social_worker: number | null
          special_room: number | null
          thumbnail_url: string | null
          training_room: number | null
          transport_desc: string | null
          updated_at: string | null
          waiting_female: number | null
          waiting_male: number | null
        }
        Insert: {
          "2021_rating"?: string | null
          "2023_rating"?: string | null
          address?: string | null
          admin_code?: string | null
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Update: {
          "2021_rating"?: string | null
          "2023_rating"?: string | null
          address?: string | null
          admin_code?: string | null
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Relationships: []
      }
      facilities_ssmn_basic_full_backup_rating_update: {
        Row: {
          "2021_rating": string | null
          "2023_rating": string | null
          address: string | null
          admin_code: string | null
          admin_introduce: string | null
          admin_name: string | null
          admin_type_code: string | null
          area_code: string | null
          assistant: number | null
          bath_room: number | null
          bdong_code: string | null
          bdong_name: string | null
          building_main_no: string | null
          building_sub_no: string | null
          capacity: number | null
          caregiver_deferred: number | null
          caregiver_level1: number | null
          caregiver_level2: number | null
          clerk: number | null
          cook: number | null
          country_number: string | null
          created_at: string | null
          current_female: number | null
          current_male: number | null
          dental_hygienist: number | null
          dining_room: number | null
          doctor_parttime: number | null
          doctor_regular: number | null
          facility_director: number | null
          final_rating: string | null
          floor: string | null
          geom: unknown | null
          hdong_code: string | null
          homepage_url: string | null
          hygienist: number | null
          install_date: string | null
          laundry_room: number | null
          manager: number | null
          medical_room: number | null
          nurse: number | null
          nurse_aide: number | null
          nutritionist: number | null
          occupational_therapist: number | null
          office: number | null
          office_director: number | null
          others: number | null
          parking_info: string | null
          phone_number: string | null
          physical_therapist: number | null
          post_code: string | null
          program_room: number | null
          rating_category: string | null
          rating_date: string | null
          reg_date: string | null
          restroom: number | null
          ri_code: string | null
          rode_code: string | null
          room_1: number | null
          room_2: number | null
          room_3: number | null
          room_4: number | null
          score: number | null
          sido_code: string | null
          sido_name: string | null
          sigungu_code: string | null
          sigungu_name: string | null
          social_worker: number | null
          special_room: number | null
          thumbnail_url: string | null
          training_room: number | null
          transport_desc: string | null
          updated_at: string | null
          waiting_female: number | null
          waiting_male: number | null
        }
        Insert: {
          "2021_rating"?: string | null
          "2023_rating"?: string | null
          address?: string | null
          admin_code?: string | null
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Update: {
          "2021_rating"?: string | null
          "2023_rating"?: string | null
          address?: string | null
          admin_code?: string | null
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Relationships: []
      }
      facilities_ssmn_etc_equipment: {
        Row: {
          admin_code: string | null
          created_at: string | null
          equipment: string | null
          equipment_item_name: string | null
          equipment_manufacturer: string | null
          equipment_model: string | null
          equipment_note: string | null
          equipment_purpose: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          admin_code?: string | null
          created_at?: string | null
          equipment?: string | null
          equipment_item_name?: string | null
          equipment_manufacturer?: string | null
          equipment_model?: string | null
          equipment_note?: string | null
          equipment_purpose?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          admin_code?: string | null
          created_at?: string | null
          equipment?: string | null
          equipment_item_name?: string | null
          equipment_manufacturer?: string | null
          equipment_model?: string | null
          equipment_note?: string | null
          equipment_purpose?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_basic"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_basic_full"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_service"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_within_radius"
            referencedColumns: ["admin_code"]
          },
        ]
      }
      facilities_ssmn_etc_nonbenefit: {
        Row: {
          admin_code: string | null
          created_at: string | null
          id: number
          nonbenefit_amount: string | null
          nonbenefit_basis: string | null
          nonbenefit_kind: string | null
          nonbenefit_registered_at: string | null
          updated_at: string | null
        }
        Insert: {
          admin_code?: string | null
          created_at?: string | null
          id?: number
          nonbenefit_amount?: string | null
          nonbenefit_basis?: string | null
          nonbenefit_kind?: string | null
          nonbenefit_registered_at?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_code?: string | null
          created_at?: string | null
          id?: number
          nonbenefit_amount?: string | null
          nonbenefit_basis?: string | null
          nonbenefit_kind?: string | null
          nonbenefit_registered_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_basic"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_basic_full"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_service"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_within_radius"
            referencedColumns: ["admin_code"]
          },
        ]
      }
      facilities_ssmn_etc_partner: {
        Row: {
          admin_code: string | null
          created_at: string | null
          id: number
          partner_end_date: string | null
          partner_name: string | null
          partner_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          admin_code?: string | null
          created_at?: string | null
          id?: number
          partner_end_date?: string | null
          partner_name?: string | null
          partner_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_code?: string | null
          created_at?: string | null
          id?: number
          partner_end_date?: string | null
          partner_name?: string | null
          partner_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_basic"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_basic_full"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_service"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_within_radius"
            referencedColumns: ["admin_code"]
          },
        ]
      }
      facilities_ssmn_etc_program: {
        Row: {
          admin_code: string | null
          created_at: string | null
          id: number
          program_cycle: string | null
          program_location: string | null
          program_name: string | null
          program_target_count: string | null
          program_type: string | null
          updated_at: string | null
        }
        Insert: {
          admin_code?: string | null
          created_at?: string | null
          id?: number
          program_cycle?: string | null
          program_location?: string | null
          program_name?: string | null
          program_target_count?: string | null
          program_type?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_code?: string | null
          created_at?: string | null
          id?: number
          program_cycle?: string | null
          program_location?: string | null
          program_name?: string | null
          program_target_count?: string | null
          program_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_basic"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_basic_full"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_service"
            referencedColumns: ["admin_code"]
          },
          {
            foreignKeyName: "fk_facilities_admin_code"
            columns: ["admin_code"]
            isOneToOne: false
            referencedRelation: "facilities_ssmn_within_radius"
            referencedColumns: ["admin_code"]
          },
        ]
      }
      fcm_tokens: {
        Row: {
          created_at: string | null
          device_type: string | null
          fcm_token: string
          id: string
          last_used_at: string | null
          member_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          fcm_token: string
          id?: string
          last_used_at?: string | null
          member_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          fcm_token?: string
          id?: string
          last_used_at?: string | null
          member_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fcm_tokens_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          birthday: string | null
          birthyear: string | null
          connected_at: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          geom: unknown | null
          id: number
          last_login_at: string | null
          name: string | null
          nickname: string | null
          phone: string | null
          profile_image: string | null
          social_id: string
          social_type: string
          updated_at: string | null
        }
        Insert: {
          birthday?: string | null
          birthyear?: string | null
          connected_at?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          geom?: unknown | null
          id?: number
          last_login_at?: string | null
          name?: string | null
          nickname?: string | null
          phone?: string | null
          profile_image?: string | null
          social_id: string
          social_type: string
          updated_at?: string | null
        }
        Update: {
          birthday?: string | null
          birthyear?: string | null
          connected_at?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          geom?: unknown | null
          id?: number
          last_login_at?: string | null
          name?: string | null
          nickname?: string | null
          phone?: string | null
          profile_image?: string | null
          social_id?: string
          social_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          id: number
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: number
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: number
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_inquiries: {
        Row: {
          admin_reply: string | null
          admin_reply_at: string | null
          content: string
          created_at: string | null
          email: string
          id: number
          member_id: number | null
          phone: string | null
          privacy_consent: boolean
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_reply?: string | null
          admin_reply_at?: string | null
          content: string
          created_at?: string | null
          email: string
          id?: number
          member_id?: number | null
          phone?: string | null
          privacy_consent?: boolean
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_reply?: string | null
          admin_reply_at?: string | null
          content?: string
          created_at?: string | null
          email?: string
          id?: number
          member_id?: number | null
          phone?: string | null
          privacy_consent?: boolean
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_inquiries_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      view_backup_facilities_ssmn_basic_20250714: {
        Row: {
          backup_date: string | null
          schema_name: string | null
          view_definition: string | null
          view_name: string | null
        }
        Insert: {
          backup_date?: string | null
          schema_name?: string | null
          view_definition?: string | null
          view_name?: string | null
        }
        Update: {
          backup_date?: string | null
          schema_name?: string | null
          view_definition?: string | null
          view_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      facilities_ssmn_basic: {
        Row: {
          "2021_rating": string | null
          "2023_rating": string | null
          address: string | null
          admin_code: string | null
          admin_introduce: string | null
          admin_name: string | null
          admin_type_code: string | null
          area_code: string | null
          assistant: number | null
          bath_room: number | null
          bdong_code: string | null
          bdong_name: string | null
          building_main_no: string | null
          building_sub_no: string | null
          capacity: number | null
          caregiver_deferred: number | null
          caregiver_level1: number | null
          caregiver_level2: number | null
          clerk: number | null
          cook: number | null
          country_number: string | null
          created_at: string | null
          current_female: number | null
          current_male: number | null
          dental_hygienist: number | null
          dining_room: number | null
          doctor_parttime: number | null
          doctor_regular: number | null
          facility_director: number | null
          final_rating: string | null
          floor: string | null
          geom: unknown | null
          hdong_code: string | null
          homepage_url: string | null
          hygienist: number | null
          install_date: string | null
          laundry_room: number | null
          manager: number | null
          medical_room: number | null
          nurse: number | null
          nurse_aide: number | null
          nutritionist: number | null
          occupational_therapist: number | null
          office: number | null
          office_director: number | null
          others: number | null
          parking_info: string | null
          phone_number: string | null
          physical_therapist: number | null
          post_code: string | null
          program_room: number | null
          rating_category: string | null
          rating_date: string | null
          reg_date: string | null
          restroom: number | null
          ri_code: string | null
          rode_code: string | null
          room_1: number | null
          room_2: number | null
          room_3: number | null
          room_4: number | null
          score: number | null
          sido_code: string | null
          sido_name: string | null
          sigungu_code: string | null
          sigungu_name: string | null
          social_worker: number | null
          special_room: number | null
          thumbnail_url: string | null
          training_room: number | null
          transport_desc: string | null
          updated_at: string | null
          waiting_female: number | null
          waiting_male: number | null
        }
        Insert: {
          "2021_rating"?: string | null
          "2023_rating"?: string | null
          address?: string | null
          admin_code?: string | null
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Update: {
          "2021_rating"?: string | null
          "2023_rating"?: string | null
          address?: string | null
          admin_code?: string | null
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Relationships: []
      }
      facilities_ssmn_service: {
        Row: {
          address: string | null
          admin_code: string | null
          admin_introduce: string | null
          admin_name: string | null
          admin_type_code: string | null
          area_code: string | null
          assistant: number | null
          bath_room: number | null
          bdong_code: string | null
          bdong_name: string | null
          building_main_no: string | null
          building_sub_no: string | null
          capacity: number | null
          caregiver_deferred: number | null
          caregiver_level1: number | null
          caregiver_level2: number | null
          clerk: number | null
          cook: number | null
          country_number: string | null
          created_at: string | null
          current_female: number | null
          current_male: number | null
          dental_hygienist: number | null
          dining_room: number | null
          doctor_parttime: number | null
          doctor_regular: number | null
          facility_director: number | null
          final_rating: string | null
          floor: string | null
          geom: unknown | null
          hdong_code: string | null
          homepage_url: string | null
          hygienist: number | null
          install_date: string | null
          laundry_room: number | null
          manager: number | null
          medical_room: number | null
          nurse: number | null
          nurse_aide: number | null
          nutritionist: number | null
          occupational_therapist: number | null
          office: number | null
          office_director: number | null
          others: number | null
          parking_info: string | null
          phone_number: string | null
          physical_therapist: number | null
          post_code: string | null
          program_room: number | null
          rating_category: string | null
          rating_date: string | null
          reg_date: string | null
          restroom: number | null
          ri_code: string | null
          rode_code: string | null
          room_1: number | null
          room_2: number | null
          room_3: number | null
          room_4: number | null
          score: number | null
          sido_code: string | null
          sido_name: string | null
          sigungu_code: string | null
          sigungu_name: string | null
          social_worker: number | null
          special_room: number | null
          thumbnail_url: string | null
          training_room: number | null
          transport_desc: string | null
          updated_at: string | null
          waiting_female: number | null
          waiting_male: number | null
        }
        Insert: {
          address?: string | null
          admin_code?: string | null
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Update: {
          address?: string | null
          admin_code?: string | null
          admin_introduce?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          assistant?: number | null
          bath_room?: number | null
          bdong_code?: string | null
          bdong_name?: string | null
          building_main_no?: string | null
          building_sub_no?: string | null
          capacity?: number | null
          caregiver_deferred?: number | null
          caregiver_level1?: number | null
          caregiver_level2?: number | null
          clerk?: number | null
          cook?: number | null
          country_number?: string | null
          created_at?: string | null
          current_female?: number | null
          current_male?: number | null
          dental_hygienist?: number | null
          dining_room?: number | null
          doctor_parttime?: number | null
          doctor_regular?: number | null
          facility_director?: number | null
          final_rating?: string | null
          floor?: string | null
          geom?: unknown | null
          hdong_code?: string | null
          homepage_url?: string | null
          hygienist?: number | null
          install_date?: string | null
          laundry_room?: number | null
          manager?: number | null
          medical_room?: number | null
          nurse?: number | null
          nurse_aide?: number | null
          nutritionist?: number | null
          occupational_therapist?: number | null
          office?: number | null
          office_director?: number | null
          others?: number | null
          parking_info?: string | null
          phone_number?: string | null
          physical_therapist?: number | null
          post_code?: string | null
          program_room?: number | null
          rating_category?: string | null
          rating_date?: string | null
          reg_date?: string | null
          restroom?: number | null
          ri_code?: string | null
          rode_code?: string | null
          room_1?: number | null
          room_2?: number | null
          room_3?: number | null
          room_4?: number | null
          score?: number | null
          sido_code?: string | null
          sido_name?: string | null
          sigungu_code?: string | null
          sigungu_name?: string | null
          social_worker?: number | null
          special_room?: number | null
          thumbnail_url?: string | null
          training_room?: number | null
          transport_desc?: string | null
          updated_at?: string | null
          waiting_female?: number | null
          waiting_male?: number | null
        }
        Relationships: []
      }
      facilities_ssmn_within_radius: {
        Row: {
          address: string | null
          admin_code: string | null
          admin_name: string | null
          admin_type_code: string | null
          area_code: string | null
          country_number: string | null
          geom: unknown | null
          phone_number: string | null
        }
        Insert: {
          address?: string | null
          admin_code?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          country_number?: string | null
          geom?: unknown | null
          phone_number?: string | null
        }
        Update: {
          address?: string | null
          admin_code?: string | null
          admin_name?: string | null
          admin_type_code?: string | null
          area_code?: string | null
          country_number?: string | null
          geom?: unknown | null
          phone_number?: string | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      check_database_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: string
        }[]
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_address_info: {
        Args: { lat: number; lng: number }
        Returns: {
          sigungu_name: string
          bdong_name: string
        }[]
      }
      get_address_info_from_boundary: {
        Args: { lat: number; lng: number }
        Returns: {
          sigungu_name: string
          bdong_name: string
        }[]
      }
      get_address_info_within_radius: {
        Args: { lat: number; lng: number; radius_meters?: number }
        Returns: {
          sigungu_name: string
          bdong_name: string
          distance_meters: number
        }[]
      }
      get_bdong_clusters: {
        Args: { center_lat: number; center_lng: number; search_radius: number }
        Returns: {
          id: string
          name: string
          lat: number
          lng: number
          facility_count: number
          sigungu_name: string
        }[]
      }
      get_facilities_in_sigungu: {
        Args: {
          target_sigungu: string
          target_sido?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          admin_code: string
          admin_name: string
          admin_type_code: string
          address: string
          lat: number
          lng: number
          final_rating: string
          score: number
          capacity: number
          current_male: number
          current_female: number
        }[]
      }
      get_facilities_ssmn_within_radius: {
        Args: { lat: number; lng: number; radius: number }
        Returns: {
          admin_code: string
          admin_type_code: string
          admin_name: string
          post_code: string
          sido_code: string
          sigungu_code: string
          hdong_code: string
          bdong_code: string
          ri_code: string
          address: string
          rode_code: string
          building_main_no: string
          building_sub_no: string
          floor: string
          area_code: string
          country_number: string
          phone_number: string
          reg_date: string
          install_date: string
          facility_director: number
          office_director: number
          social_worker: number
          doctor_regular: number
          doctor_parttime: number
          nurse: number
          nurse_aide: number
          dental_hygienist: number
          physical_therapist: number
          occupational_therapist: number
          caregiver_level1: number
          caregiver_level2: number
          caregiver_deferred: number
          clerk: number
          nutritionist: number
          cook: number
          hygienist: number
          manager: number
          assistant: number
          others: number
          room_1: number
          room_2: number
          room_3: number
          room_4: number
          special_room: number
          office: number
          medical_room: number
          training_room: number
          program_room: number
          dining_room: number
          restroom: number
          bath_room: number
          laundry_room: number
          capacity: number
          current_male: number
          current_female: number
          waiting_male: number
          waiting_female: number
          homepage_url: string
          transport_desc: string
          parking_info: string
          rating_category: string
          rating_date: string
          final_rating: string
          score: number
          updated_at: string
          created_at: string
          geom: string
          thumbnail_url: string
          admin_introduce: string
          sido_name: string
          sigungu_name: string
          bdong_name: string
        }[]
      }
      get_facility_clusters: {
        Args: {
          active_categories?: string[]
          center_lat?: number
          center_lng?: number
          cluster_type?: string
          radius_meters?: number
        }
        Returns: {
          id: string
          name: string
          count: number
          lat: number
          lng: number
          category_counts: Json
        }[]
      }
      get_facility_coordinates: {
        Args: { facility_id?: string }
        Returns: {
          admin_code: string
          admin_name: string
          latitude: number
          longitude: number
          geom_type: string
        }[]
      }
      get_facility_coordinates_fallback: {
        Args: { facility_id?: string }
        Returns: {
          admin_code: string
          admin_name: string
          sido_name: string
          sigungu_name: string
          bdong_name: string
          geom_raw: string
          geom_type_info: string
        }[]
      }
      get_facility_coordinates_v2: {
        Args: { facility_id?: string }
        Returns: {
          admin_code: string
          admin_name: string
          latitude: number
          longitude: number
          geom_type: string
          geom_raw: string
        }[]
      }
      get_nearby_facilities: {
        Args: {
          lat: number
          lng: number
          sigungu_name: string
          bdong_name: string
          limit_count?: number
        }
        Returns: {
          id: string
          admin_name: string
          lat: number
          lng: number
          install_date: string
          distance: number
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_quick_stats: {
        Args: { input_lat: number; input_lng: number; radius_km?: number }
        Returns: {
          total_facilities: number
          total_sigungu: number
          avg_score: number
        }[]
      }
      get_region_list: {
        Args: { region_type?: string }
        Returns: {
          region_name: string
          facility_count: number
        }[]
      }
      get_region_list_v2: {
        Args: { region_type?: string }
        Returns: {
          region_name: string
          facility_count: number
        }[]
      }
      get_service_facilities: {
        Args: {
          p_sido_name?: string
          p_sigungu_name?: string
          p_admin_type_code?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          admin_code: string
          admin_name: string
          admin_type_code: string
          address: string
          sido_name: string
          sigungu_name: string
          bdong_name: string
          phone_number: string
          capacity: number
          current_male: number
          current_female: number
          final_rating: string
          score: number
          homepage_url: string
          transport_desc: string
          parking_info: string
        }[]
      }
      get_sigungu_clusters: {
        Args: { input_lat: number; input_lng: number; radius_km?: number }
        Returns: {
          sigungu_name: string
          sido_name: string
          facility_count: number
          center_lat: number
          center_lng: number
          avg_lat: number
          avg_lng: number
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search_facilities_by_region: {
        Args: {
          p_sido_name?: string
          p_sigungu_name?: string
          p_bdong_name?: string
        }
        Returns: {
          admin_code: string
          admin_type_code: string
          admin_name: string
          address: string
          sido_name: string
          sigungu_name: string
          bdong_name: string
          latitude: number
          longitude: number
          phone_number: string
          capacity: number
          current_male: number
          current_female: number
          reg_date: string
          thumbnail_url: string
          admin_introduce: string
          geom_original: string
        }[]
      }
      search_facilities_by_region_v2: {
        Args: {
          p_sido_name?: string
          p_sigungu_name?: string
          p_bdong_name?: string
        }
        Returns: {
          admin_code: string
          admin_type_code: string
          admin_name: string
          address: string
          sido_name: string
          sigungu_name: string
          bdong_name: string
          latitude: number
          longitude: number
          phone_number: string
          capacity: number
          current_male: number
          current_female: number
          reg_date: string
          thumbnail_url: string
          admin_introduce: string
          geom_original: string
        }[]
      }
      search_regions: {
        Args: { search_keyword: string }
        Returns: Json
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_facility_coordinates: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_facilities: number
          valid_geom_count: number
          invalid_geom_count: number
          sample_coordinates: string
        }[]
      }
      update_geom_from_coords: {
        Args: { record_id: number; longitude: number; latitude: number }
        Returns: undefined
      }
      update_member_location: {
        Args: { p_member_id: number; p_longitude: number; p_latitude: number }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
      validate_and_fix_coordinates: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_code: string
          admin_name: string
          issue_type: string
          original_geom: string
          fixed_latitude: number
          fixed_longitude: number
        }[]
      }
      verify_admin_password: {
        Args: { p_email: string; p_password: string }
        Returns: {
          id: number
          email: string
          name: string
          role: string
          is_active: boolean
          last_login_at: string
          created_at: string
          updated_at: string
          supabase_user_id: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
    Enums: {},
  },
} as const
