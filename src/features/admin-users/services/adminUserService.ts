import { supabase } from '@/lib/supabase'
import { Permission } from '@/types/database.types'

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
    // 이메일 중복 확인
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', dto.email)
      .single()

    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.')
    }

    // bcrypt를 사용하여 비밀번호 해시 생성
    // 주의: 실제로는 서버 사이드에서 처리해야 하지만, 
    // 현재는 데이터베이스의 crypt 함수를 사용
    const { data, error } = await supabase
      .rpc('create_admin_user', {
        p_email: dto.email,
        p_name: dto.name,
        p_role: dto.role,
        p_password: dto.password,
        p_permissions: dto.permissions || []
      })

    if (error) throw error
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