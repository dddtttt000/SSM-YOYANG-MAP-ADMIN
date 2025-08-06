import { supabase } from '@/lib/supabase'
import { Member } from '@/types/database.types'

export interface MemberFilters {
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

class MemberService {
  async getMembers(filters: MemberFilters = {}): Promise<PaginatedResponse<Member>> {
    const { page = 1, limit = 10, status, search } = filters
    const from = (page - 1) * limit
    const to = from + limit - 1

    let countQuery = supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    let dataQuery = supabase
      .from('members')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false })

    // 필터 적용
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
      dataQuery = dataQuery.eq('status', status)
    }

    if (search) {
      const searchFilter = `name.ilike.%${search}%,nickname.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
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

  async getMemberById(id: number) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async updateMemberStatus(id: number, status: string) {
    const { data, error } = await supabase
      .from('members')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMemberStats() {
    // 전체 회원 수
    const { count: totalCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    // 활성 회원 수
    const { count: activeCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // 최근 7일 가입자 수
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: recentCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    return {
      total: totalCount || 0,
      active: activeCount || 0,
      recent: recentCount || 0,
    }
  }

  async exportMembers(filters: MemberFilters = {}) {
    let query = supabase
      .from('members')
      .select('id, email, name, nickname, social_type, phone, status, created_at')
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,nickname.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }
}

export const memberService = new MemberService()