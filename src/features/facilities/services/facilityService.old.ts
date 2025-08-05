import { supabase } from '@/lib/supabase'
import { Facility } from '@/types/database.types'

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

export interface CreateFacilityDto {
  facility_name: string
  facility_type?: string
  address?: string
  contact_info?: {
    phone?: string
    email?: string
    website?: string
  }
  operating_hours?: {
    weekday?: string
    weekend?: string
    holiday?: string
  }
  capacity?: number
  amenities?: string[]
  status?: string
}

export interface UpdateFacilityDto extends Partial<CreateFacilityDto> {}

class FacilityService {
  async getFacilities(filters: FacilityFilters = {}): Promise<PaginatedResponse<Facility>> {
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

  async getFacilityByAdminCode(adminCode: string) {
    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*')
      .eq('admin_code', adminCode)
      .single()

    if (error) throw error
    return data
  }

  async createFacility(dto: CreateFacilityDto) {
    // admin_code 생성
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

  async updateFacility(adminCode: string, dto: UpdateFacilityDto) {
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

  async getFacilityTypes() {
    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('facility_type')
      .not('facility_type', 'is', null)

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