import { supabase } from '@/lib/supabase'
import { LoginCredentials } from '@/types/auth.types'
import { AdminUser } from '@/types/database.types'

export const authService = {
  // 커스텀 로그인
  async login(credentials: LoginCredentials): Promise<AdminUser> {
    // 커스텀 인증으로 비밀번호 확인
    const { data: adminUsers, error: rpcError } = await supabase.rpc('verify_admin_password', {
      p_email: credentials.email,
      p_password: credentials.password,
    })

    if (rpcError || !adminUsers || adminUsers.length === 0) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const adminUser = adminUsers[0]

    if (!adminUser.is_active) {
      throw new Error('비활성화된 계정입니다.')
    }

    // 세션 토큰 생성 (24시간 유효)
    const sessionToken = {
      admin_user_id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      permissions: adminUser.permissions,
      login_time: Date.now(),
      expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24시간
    }

    // localStorage에 세션 저장
    localStorage.setItem('admin_session_token', JSON.stringify(sessionToken))
    localStorage.setItem('admin_user_data', JSON.stringify(adminUser))
    
    // 로그인 시간 업데이트
    await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', adminUser.id)

    return adminUser
  },

  // 커스텀 세션 체크
  async checkSession(): Promise<AdminUser | null> {
    try {
      // localStorage에서 세션 토큰 확인
      const sessionTokenStr = localStorage.getItem('admin_session_token')
      const adminUserStr = localStorage.getItem('admin_user_data')

      if (!sessionTokenStr || !adminUserStr) {
        return null
      }

      const sessionToken = JSON.parse(sessionTokenStr)
      const adminUser = JSON.parse(adminUserStr)

      // 세션 만료 확인
      if (Date.now() > sessionToken.expires_at) {
        localStorage.removeItem('admin_session_token')
        localStorage.removeItem('admin_user_data')
        return null
      }

      // DB에서 최신 사용자 정보 확인 (active 상태 등)
      const { data: currentAdminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', adminUser.id)
        .eq('is_active', true)
        .single()

      if (error || !currentAdminUser) {
        localStorage.removeItem('admin_session_token')
        localStorage.removeItem('admin_user_data')
        return null
      }

      return currentAdminUser
    } catch (err) {
      localStorage.removeItem('admin_session_token')
      localStorage.removeItem('admin_user_data')
      return null
    }
  },

  // 커스텀 세션 로그아웃
  async logout(): Promise<void> {
    localStorage.removeItem('admin_session_token')
    localStorage.removeItem('admin_user_data')
  },
}
