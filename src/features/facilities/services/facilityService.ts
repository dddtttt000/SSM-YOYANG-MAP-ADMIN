import { supabase } from '@/lib/supabase'
import { Facility, FacilityNonBenefit, FacilityProgram } from '@/types/database.types'

export interface FacilityFilters {
  search?: string
  sido_code?: string
  sigungu_code?: string
  rating?: string
  type_codes?: string[]
  page?: number
  limit?: number
  showAll?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  totalPages: number
}

export interface FacilityWithRelations extends Facility {
  nonbenefits?: FacilityNonBenefit[]
  programs?: FacilityProgram[]
}

export interface FacilityStats {
  total: number
  byRating: Record<string, number>
  bySido: Record<string, number>
  averageCapacity: number
  totalCapacity: number
  currentOccupancy: number
}

export interface CreateFacilityDto {
  admin_name: string
  admin_type_code?: string
  post_code?: string
  sido_code?: string
  sigungu_code?: string
  address?: string
  phone_number?: string
  capacity?: number
  homepage_url?: string
  admin_introduce?: string
}

export interface UpdateFacilityDto extends Partial<CreateFacilityDto> {
  // 인력 정보
  facility_director?: number
  office_director?: number
  social_worker?: number
  doctor_regular?: number
  doctor_parttime?: number
  nurse?: number
  nurse_aide?: number
  dental_hygienist?: number
  physical_therapist?: number
  occupational_therapist?: number
  caregiver_level1?: number
  caregiver_level2?: number
  caregiver_deferred?: number
  clerk?: number
  nutritionist?: number
  cook?: number
  hygienist?: number
  manager?: number
  assistant?: number
  others?: number

  // 시설 정보
  room_1?: number
  room_2?: number
  room_3?: number
  room_4?: number
  special_room?: number
  office?: number
  medical_room?: number
  training_room?: number
  program_room?: number
  dining_room?: number
  restroom?: number
  bath_room?: number
  laundry_room?: number

  // 입소 현황
  current_male?: number
  current_female?: number
  waiting_male?: number
  waiting_female?: number

  // 기타 정보
  transport_desc?: string
  parking_info?: string
  thumbnail_url?: string
}

class FacilityService {
  async getFacilities(filters: FacilityFilters = {}): Promise<PaginatedResponse<Facility>> {
    const { page = 1, limit = 12, search, sido_code, sigungu_code, rating, type_codes, showAll } = filters
    const from = (page - 1) * limit
    const to = from + limit - 1

    let countQuery = supabase
      .from('facilities_ssmn_basic_full')
      .select('*', { count: 'exact', head: true })

    let dataQuery = supabase
      .from('facilities_ssmn_basic_full')
      .select('*')
      .range(from, to)
      .order('admin_code', { ascending: false })

    // 시설명이 없는 시설 필터링 (showAll이 false일 때만)
    if (!showAll) {
      countQuery = countQuery.not('admin_name', 'is', null).neq('admin_name', '')
      dataQuery = dataQuery.not('admin_name', 'is', null).neq('admin_name', '')
    }

    // 필터 적용
    if (search) {
      const searchFilter = `admin_name.ilike.%${search}%,address.ilike.%${search}%`
      countQuery = countQuery.or(searchFilter)
      dataQuery = dataQuery.or(searchFilter)
    }

    if (sido_code && sido_code !== 'all') {
      countQuery = countQuery.eq('sido_code', sido_code)
      dataQuery = dataQuery.eq('sido_code', sido_code)
    }

    if (sigungu_code && sigungu_code !== 'all') {
      countQuery = countQuery.eq('sigungu_code', sigungu_code)
      dataQuery = dataQuery.eq('sigungu_code', sigungu_code)
    }

    if (rating && rating !== 'all') {
      countQuery = countQuery.eq('final_rating', rating)
      dataQuery = dataQuery.eq('final_rating', rating)
    }

    // 시설 유형 필터 적용
    if (type_codes && type_codes.length > 0) {
      countQuery = countQuery.in('admin_type_code', type_codes)
      dataQuery = dataQuery.in('admin_type_code', type_codes)
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

  async getFacilityByAdminCode(adminCode: string): Promise<FacilityWithRelations> {
    // 기본 정보 조회
    const { data: facilities, error: facilityError } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*')
      .eq('admin_code', adminCode)

    if (facilityError) throw facilityError
    if (!facilities || facilities.length === 0) {
      throw new Error('시설을 찾을 수 없습니다.')
    }
    if (facilities.length > 1) {
      console.error(`중복된 admin_code 발견: ${adminCode}, 개수: ${facilities.length}`)
      throw new Error('중복된 시설 코드가 발견되었습니다.')
    }
    
    const facility = facilities[0]

    // 비급여 항목 조회
    const { data: nonbenefits, error: nonbenefitError } = await supabase
      .from('facilities_ssmn_etc_nonbenefit')
      .select('*')
      .eq('admin_code', adminCode)
      .order('nonbenefit_registered_at', { ascending: false })

    if (nonbenefitError) throw nonbenefitError

    // 프로그램 조회
    const { data: programs, error: programError } = await supabase
      .from('facilities_ssmn_etc_program')
      .select('*')
      .eq('admin_code', adminCode)
      .order('program_type', { ascending: true })

    if (programError) throw programError

    return {
      ...facility,
      nonbenefits: nonbenefits || [],
      programs: programs || [],
    }
  }

  async createFacility(dto: CreateFacilityDto) {
    // admin_code 생성
    const adminCode = await this.generateAdminCode()

    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .insert({
        admin_code: adminCode,
        ...dto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateFacility(adminCode: string, dto: UpdateFacilityDto) {
    // 먼저 해당 admin_code로 시설이 존재하는지 확인
    const { data: existingData, error: checkError } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('admin_code')
      .eq('admin_code', adminCode)
    
    if (checkError) throw checkError
    if (!existingData || existingData.length === 0) {
      throw new Error('시설을 찾을 수 없습니다.')
    }
    if (existingData.length > 1) {
      console.error(`중복된 admin_code 발견: ${adminCode}, 개수: ${existingData.length}`)
      throw new Error('중복된 시설 코드가 발견되었습니다.')
    }

    // 업데이트 수행
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
    // 관련 데이터 삭제
    await supabase
      .from('facilities_ssmn_etc_nonbenefit')
      .delete()
      .eq('admin_code', adminCode)

    await supabase
      .from('facilities_ssmn_etc_program')
      .delete()
      .eq('admin_code', adminCode)

    // 메인 데이터 삭제
    const { error } = await supabase
      .from('facilities_ssmn_basic_full')
      .delete()
      .eq('admin_code', adminCode)

    if (error) throw error
    return true
  }

  async getFacilityStats(): Promise<FacilityStats> {
    // 전체 시설 수
    const { count: totalCount } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*', { count: 'exact', head: true })

    // 평가등급별 통계
    const { data: ratingData } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('final_rating')
      .not('final_rating', 'is', null)

    const byRating: Record<string, number> = {}
    ratingData?.forEach((item) => {
      if (item.final_rating) {
        byRating[item.final_rating] = (byRating[item.final_rating] || 0) + 1
      }
    })

    // 시도별 통계
    const { data: sidoData } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('sido_name')
      .not('sido_name', 'is', null)

    const bySido: Record<string, number> = {}
    sidoData?.forEach((item) => {
      if (item.sido_name) {
        bySido[item.sido_name] = (bySido[item.sido_name] || 0) + 1
      }
    })

    // 정원 및 현원 통계
    const { data: capacityData } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('capacity, current_male, current_female')

    let totalCapacity = 0
    let currentOccupancy = 0
    let validCapacityCount = 0

    capacityData?.forEach((item) => {
      if (item.capacity) {
        totalCapacity += item.capacity
        validCapacityCount++
      }
      if (item.current_male) currentOccupancy += item.current_male
      if (item.current_female) currentOccupancy += item.current_female
    })

    const averageCapacity = validCapacityCount > 0 ? Math.round(totalCapacity / validCapacityCount) : 0

    return {
      total: totalCount || 0,
      byRating,
      bySido,
      averageCapacity,
      totalCapacity,
      currentOccupancy,
    }
  }

  async getFacilityTypes() {
    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('admin_type_code')
      .not('admin_type_code', 'is', null)

    if (error) throw error

    // 중복 제거
    const uniqueTypes = new Set<string>()
    data?.forEach(item => {
      if (item.admin_type_code) {
        uniqueTypes.add(item.admin_type_code)
      }
    })

    return Array.from(uniqueTypes).sort()
  }

  async getFacilityTypesWithCount() {
    console.log('[getFacilityTypesWithCount] 시작')
    
    // Supabase는 기본적으로 1000개만 반환하므로 모든 데이터를 가져오기 위해 페이지네이션 사용
    const allData: any[] = []
    const limit = 1000
    let offset = 0
    
    while (true) {
      const { data, error } = await supabase
        .from('facilities_ssmn_basic_full')
        .select('admin_type_code')
        .not('admin_type_code', 'is', null)
        .range(offset, offset + limit - 1)
      
      if (error) {
        console.error('[getFacilityTypesWithCount] 쿼리 에러:', error)
        throw error
      }
      
      if (!data || data.length === 0) break
      
      allData.push(...data)
      
      if (data.length < limit) break
      offset += limit
    }

    console.log('[getFacilityTypesWithCount] 조회된 데이터 수:', allData.length)
    
    // 샘플 데이터 출력 (처음 5개)
    if (allData && allData.length > 0) {
      console.log('[getFacilityTypesWithCount] 샘플 데이터 (처음 5개):')
      allData.slice(0, 5).forEach((item, index) => {
        console.log(`  [${index + 1}] admin_type_code:`, item.admin_type_code)
      })
    }

    // 유형별 카운트 계산
    const typeCounts = new Map<string, number>()
    allData?.forEach(item => {
      if (item.admin_type_code) {
        const codes = item.admin_type_code.split(',').map((c: string) => c.trim())
        codes.forEach((code: string) => {
          typeCounts.set(code, (typeCounts.get(code) || 0) + 1)
        })
      }
    })

    console.log('[getFacilityTypesWithCount] 고유한 유형 수:', typeCounts.size)
    console.log('[getFacilityTypesWithCount] 유형별 카운트:', Object.fromEntries(typeCounts))

    const result = Array.from(typeCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => a.code.localeCompare(b.code))
    
    console.log('[getFacilityTypesWithCount] 최종 결과:', result)
    
    return result
  }

  async getSidoList() {
    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('sido_code, sido_name')
      .not('sido_code', 'is', null)
      .not('sido_name', 'is', null)

    if (error) throw error

    // 중복 제거
    const uniqueSidos = new Map<string, string>()
    data?.forEach(item => {
      if (item.sido_code && item.sido_name) {
        uniqueSidos.set(item.sido_code, item.sido_name)
      }
    })

    return Array.from(uniqueSidos.entries()).map(([code, name]) => ({
      code,
      name,
    }))
  }

  async getSigunguList(sidoCode: string) {
    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('sigungu_code, sigungu_name')
      .eq('sido_code', sidoCode)
      .not('sigungu_code', 'is', null)
      .not('sigungu_name', 'is', null)

    if (error) throw error

    // 중복 제거
    const uniqueSigungus = new Map<string, string>()
    data?.forEach(item => {
      if (item.sigungu_code && item.sigungu_name) {
        uniqueSigungus.set(item.sigungu_code, item.sigungu_name)
      }
    })

    return Array.from(uniqueSigungus.entries()).map(([code, name]) => ({
      code,
      name,
    }))
  }

  // 비급여 항목 관리
  async addNonBenefit(adminCode: string, nonbenefit: Omit<FacilityNonBenefit, 'id' | 'admin_code' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('facilities_ssmn_etc_nonbenefit')
      .insert({
        admin_code: adminCode,
        ...nonbenefit,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateNonBenefit(id: number, nonbenefit: Partial<Omit<FacilityNonBenefit, 'id' | 'admin_code' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('facilities_ssmn_etc_nonbenefit')
      .update(nonbenefit)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteNonBenefit(id: number) {
    const { error } = await supabase
      .from('facilities_ssmn_etc_nonbenefit')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  // 프로그램 관리
  async addProgram(adminCode: string, program: Omit<FacilityProgram, 'id' | 'admin_code' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('facilities_ssmn_etc_program')
      .insert({
        admin_code: adminCode,
        ...program,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateProgram(id: number, program: Partial<Omit<FacilityProgram, 'id' | 'admin_code' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('facilities_ssmn_etc_program')
      .update(program)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteProgram(id: number) {
    const { error } = await supabase
      .from('facilities_ssmn_etc_program')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
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