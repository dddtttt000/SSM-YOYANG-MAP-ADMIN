import { supabase } from '@/lib/supabase'
import { AdminUser, Permission } from '@/types/database.types'

export interface AdminUserFilters {
  role?: 'super_admin' | 'admin'
  isActive?: boolean
  search?: string
}

export interface CreateAdminUserDto {
  email: string
  name: string
  role: 'super_admin' | 'admin'
  permissions?: Permission[]
  password: string
}

export interface UpdateAdminUserDto {
  name?: string
  role?: 'super_admin' | 'admin'
  permissions?: Permission[]
  is_active?: boolean
}

class AdminUserService {
  async getAdminUsers(filters?: AdminUserFilters) {
    let query = supabase
      .from('admin_users')
      .select('*')
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

    const { data, error } = await query

    if (error) throw error
    return data
  }

  async getAdminUserById(id: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async createAdminUser(dto: CreateAdminUserDto) {
    // 1. Supabase Auth에 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    })

    if (authError) throw authError

    // 2. admin_users 테이블에 정보 저장
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: dto.email,
        name: dto.name,
        role: dto.role,
        permissions: dto.permissions || [],
      })
      .select()
      .single()

    if (error) {
      // 실패 시 Auth 사용자도 삭제
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw error
    }

    return data
  }

  async updateAdminUser(id: string, dto: UpdateAdminUserDto) {
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteAdminUser(id: string) {
    // 1. admin_users 테이블에서 삭제 (또는 비활성화)
    const { error: dbError } = await supabase
      .from('admin_users')
      .update({ is_active: false })
      .eq('id', id)

    if (dbError) throw dbError

    // 2. Supabase Auth에서도 사용자 삭제 (선택사항)
    // const { error: authError } = await supabase.auth.admin.deleteUser(id)
    // if (authError) throw authError

    return true
  }

  async updateAdminUserPermissions(id: string, permissions: Permission[]) {
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        permissions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const adminUserService = new AdminUserService()