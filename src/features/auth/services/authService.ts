import { supabase } from '@/lib/supabase'
import { LoginCredentials } from '@/types/auth.types'
import { AdminUser } from '@/types/database.types'

export const authService = {
  // 커스텀 로그인 (password_digest 사용)
  async login(credentials: LoginCredentials): Promise<AdminUser> {
    // RPC 함수를 사용하여 비밀번호 검증
    const { data, error } = await supabase
      .rpc('verify_admin_password', {
        p_email: credentials.email,
        p_password: credentials.password
      })

    if (error) {
      throw new Error('로그인 중 오류가 발생했습니다.')
    }

    if (!data || data.length === 0) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const adminUser = data[0]
    
    if (!adminUser.is_active) {
      throw new Error('비활성화된 계정입니다.')
    }

    // 로그인 시간 업데이트
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminUser.id)

    return adminUser
  },

  // 세션 체크 (로컬 스토리지 사용)
  async checkSession(): Promise<AdminUser | null> {
    const storedUser = localStorage.getItem('admin_user')
    if (!storedUser) return null

    try {
      const user = JSON.parse(storedUser)
      
      // 사용자 상태 재확인
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        localStorage.removeItem('admin_user')
        return null
      }

      return data
    } catch {
      localStorage.removeItem('admin_user')
      return null
    }
  },

  // 로그아웃
  async logout(): Promise<void> {
    localStorage.removeItem('admin_user')
  }
}