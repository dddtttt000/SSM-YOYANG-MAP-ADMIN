import { supabase } from '@/lib/supabase'
import {
  type PaginatedResponse,
  calculatePagination,
  calculateRange,
  DEFAULT_PAGE_SIZE
} from '@/types/pagination'

export interface AdminUserFilters {
  role?: 'super_admin' | 'admin'
  isActive?: boolean
  search?: string
  page?: number
  pageSize?: number
}

export interface CreateAdminUserDto {
  email: string
  name: string
  role: 'super_admin' | 'admin'
  password: string
}

export interface UpdateAdminUserDto {
  name?: string
  role?: 'super_admin' | 'admin'
  is_active?: boolean
}

class AdminUserService {
  async getAdminUsers(filters?: AdminUserFilters): Promise<PaginatedResponse<any>> {
    try {
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || DEFAULT_PAGE_SIZE
      const { from, to } = calculateRange(page, pageSize)

      let query = supabase
        .from('admin_users')
        .select('id, email, name, role, supabase_user_id, last_login_at, is_active, created_at, updated_at', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.role) {
        query = query.eq('role', filters.role)
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      const totalCount = count || 0
      const pagination = calculatePagination(page, pageSize, totalCount)

      return {
        data: data || [],
        pagination,
      }
    } catch (error) {
      console.error('AdminUserService.getAdminUsers 오류:', error)
      throw error
    }
  }

  async getAdminUserById(id: number | string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, supabase_user_id, last_login_at, is_active, created_at, updated_at')
      .eq('id', Number(id))
      .maybeSingle()

    if (error) throw error
    if (!data) {
      throw new Error('해당 관리자를 찾을 수 없습니다.')
    }
    return data
  }

  async createAdminUser(dto: CreateAdminUserDto) {
    try {
      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: dto.email,
          name: dto.name,
          role: dto.role,
          password: dto.password
        }
      })

      if (error) {
        throw new Error(error.message || '관리자 생성 중 오류가 발생했습니다.')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      if (!data?.success || !data?.data) {
        throw new Error('관리자 생성에 실패했습니다.')
      }

      return data.data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('알 수 없는 오류가 발생했습니다.')
    }
  }

  async updateAdminUser(id: number, dto: UpdateAdminUserDto) {
    const { data, error } = await supabase
      .rpc('update_admin_user', {
        admin_id: id,
        admin_name: dto.name,
        admin_role: dto.role,
        admin_is_active: dto.is_active ?? true
      })
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      throw new Error('해당 관리자를 찾을 수 없습니다.')
    }
    
    return data[0]
  }

  async deleteAdminUser(id: number) {
    // RPC 함수를 사용하여 비활성화
    const { data, error } = await supabase
      .rpc('update_admin_user', {
        admin_id: id,
        admin_name: null,
        admin_role: null,
        admin_is_active: false
      })

    if (error) throw error
    
    if (!data || data.length === 0) {
      throw new Error('해당 관리자를 찾을 수 없습니다.')
    }

    return data[0]
  }

  // permissions 컬럼이 없으므로 이 메서드는 사용하지 않음
  // 향후 권한 시스템 구현 시 활성화 가능
  // async updateAdminUserPermissions(id: string, permissions: Permission[]) {
  //   const { data, error } = await supabase
  //     .from('admin_users')
  //     .update({
  //       permissions,
  //       updated_at: new Date().toISOString(),
  //     })
  //     .eq('id', id)
  //     .select()
  //     .single()

  //   if (error) throw error
  //   return data
  // }
}

export const adminUserService = new AdminUserService()