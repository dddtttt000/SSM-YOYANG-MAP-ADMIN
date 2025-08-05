import { supabase } from '@/lib/supabase'

// 시설 기본 정보 타입
export interface FacilityBasic {
  admin_code: string // Primary Key
  facility_name: string
  facility_type?: string
  address?: string
  phone?: string
  status?: string
  created_at?: string
  updated_at?: string
  [key: string]: any // 추가 필드를 위한 인덱스 시그니처
}

// 비급여 항목 정보 타입
export interface FacilityNonBenefit {
  admin_code: string // Foreign Key
  [key: string]: any
}

// 프로그램 정보 타입
export interface FacilityProgram {
  admin_code: string // Foreign Key
  [key: string]: any
}

// 통합 시설 정보 타입
export interface FacilityFull extends FacilityBasic {
  nonBenefitItems?: FacilityNonBenefit[]
  programs?: FacilityProgram[]
}

export interface FacilityFilters {
  type?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  totalPages: number
}

class FacilityService {
  async getFacilities(filters: FacilityFilters = {}): Promise<PaginatedResponse<FacilityBasic>> {
    const { page = 1, limit = 10, type, status, search } = filters
    const from = (page - 1) * limit
    const to = from + limit - 1

    let countQuery = supabase
      .from('facilities_ssmn_basic_full')
      .select('*', { count: 'exact', head: true })

    let dataQuery = supabase
      .from('facilities_ssmn_basic_full')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false })

    // 필터 적용
    if (type && type !== 'all') {
      countQuery = countQuery.eq('facility_type', type)
      dataQuery = dataQuery.eq('facility_type', type)
    }

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
      dataQuery = dataQuery.eq('status', status)
    }

    if (search) {
      const searchFilter = `facility_name.ilike.%${search}%,address.ilike.%${search}%`
      countQuery = countQuery.or(searchFilter)
      dataQuery = dataQuery.or(searchFilter)
    }

    // 총 개수 조회
    const { count, error: countError } = await countQuery
    if (countError) throw countError

    // 데이터 조회
    const { data, error: dataError } = await dataQuery
    if (dataError) throw dataError

    return {
      data: data || [],
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  // admin_code로 시설 상세 정보 조회 (관련 테이블 JOIN)
  async getFacilityByAdminCode(adminCode: string): Promise<FacilityFull | null> {
    // 기본 정보 조회
    const { data: basicData, error: basicError } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*')
      .eq('admin_code', adminCode)
      .single()

    if (basicError) throw basicError
    if (!basicData) return null

    // 비급여 항목 조회
    const { data: nonBenefitData } = await supabase
      .from('facilities_ssmn_etc_nonbenefit')
      .select('*')
      .eq('admin_code', adminCode)

    // 프로그램 정보 조회
    const { data: programData } = await supabase
      .from('facilities_ssmn_etc_program')
      .select('*')
      .eq('admin_code', adminCode)

    return {
      ...basicData,
      nonBenefitItems: nonBenefitData || [],
      programs: programData || [],
    }
  }

  async createFacility(dto: Partial<FacilityBasic>) {
    // admin_code 생성 로직 (예: 날짜 + 시퀀스)
    const adminCode = await this.generateAdminCode()

    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .insert({
        admin_code: adminCode,
        ...dto,
        status: dto.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateFacility(adminCode: string, dto: Partial<FacilityBasic>) {
    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('admin_code', adminCode)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteFacility(adminCode: string) {
    // 소프트 삭제 (상태를 'deleted'로 변경)
    const { error } = await supabase
      .from('facilities_ssmn_basic_full')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('admin_code', adminCode)

    if (error) throw error
    return true
  }

  // 비급여 항목 관리
  async updateNonBenefitItems(adminCode: string, items: Partial<FacilityNonBenefit>[]) {
    // 기존 항목 삭제
    await supabase
      .from('facilities_ssmn_etc_nonbenefit')
      .delete()
      .eq('admin_code', adminCode)

    // 새 항목 추가
    if (items.length > 0) {
      const { error } = await supabase
        .from('facilities_ssmn_etc_nonbenefit')
        .insert(items.map(item => ({ ...item, admin_code: adminCode })))

      if (error) throw error
    }
  }

  // 프로그램 관리
  async updatePrograms(adminCode: string, programs: Partial<FacilityProgram>[]) {
    // 기존 프로그램 삭제
    await supabase
      .from('facilities_ssmn_etc_program')
      .delete()
      .eq('admin_code', adminCode)

    // 새 프로그램 추가
    if (programs.length > 0) {
      const { error } = await supabase
        .from('facilities_ssmn_etc_program')
        .insert(programs.map(program => ({ ...program, admin_code: adminCode })))

      if (error) throw error
    }
  }

  async getFacilityTypes() {
    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('facility_type')
      .not('facility_type', 'is', null)
      .neq('status', 'deleted')

    if (error) throw error

    // 중복 제거하여 유니크한 타입만 반환
    const types = [...new Set(data?.map(item => item.facility_type))].filter(Boolean)
    return types
  }

  async getFacilityStats() {
    // 전체 시설 수
    const { count: totalCount } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted')

    // 활성 시설 수
    const { count: activeCount } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // 타입별 시설 수
    const { data: typeData } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('facility_type')
      .neq('status', 'deleted')

    const typeStats: Record<string, number> = {}
    typeData?.forEach((item) => {
      if (item.facility_type) {
        typeStats[item.facility_type] = (typeStats[item.facility_type] || 0) + 1
      }
    })

    return {
      total: totalCount || 0,
      active: activeCount || 0,
      byType: typeStats,
    }
  }

  // admin_code 생성 헬퍼
  private async generateAdminCode(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    // 오늘 생성된 시설 수 조회
    const { count } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*', { count: 'exact', head: true })
      .like('admin_code', `${year}${month}${day}%`)

    const sequence = String((count || 0) + 1).padStart(4, '0')
    return `${year}${month}${day}${sequence}`
  }
}

export const facilityService = new FacilityService()