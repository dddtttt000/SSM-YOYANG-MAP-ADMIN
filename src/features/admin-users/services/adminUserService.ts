import { supabase } from '@/lib/supabase'

export interface AdminUserFilters {
  role?: 'super_admin' | 'admin'
  isActive?: boolean
  search?: string
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
  async getAdminUsers(filters?: AdminUserFilters) {
    let query = supabase
      .from('admin_users')
      .select('id, email, name, role, supabase_user_id, last_login_at, is_active, created_at, updated_at')
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
    // 이메일 중복 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', dto.email)
      .maybeSingle()

    if (checkError) throw checkError
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
        p_password: dto.password
      })

    if (error) throw error
    return data
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