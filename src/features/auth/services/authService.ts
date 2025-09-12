import { supabase } from '@/lib/supabase'
import type { LoginCredentials } from '@/types/auth.types'
import type { AdminUser } from '@/types/database.types'
import type { Session } from '@supabase/supabase-js'

export const authService = {
  // 로그인 - 단순화된 Supabase Auth 전용
  async login(credentials: LoginCredentials): Promise<AdminUser> {
    try {
      // eslint-disable-next-line no-console
      console.log('🚀 로그인 시작:', credentials.email)

      // 1. Supabase Auth 로그인
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (signInError) {
        // eslint-disable-next-line no-console
        console.error('❌ Supabase Auth 로그인 실패:', signInError.message)
        throw new Error(signInError.message)
      }

      if (!authData.user) {
        throw new Error('로그인 실패: 사용자 정보가 없습니다.')
      }

      // eslint-disable-next-line no-console
      console.log('✅ Supabase Auth 로그인 성공:', authData.user.id)

      // 2. admin_users 테이블에서 관리자 정보 조회
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, name, role, is_active, supabase_user_id, last_login_at, created_at, updated_at')
        .eq('supabase_user_id', authData.user.id)
        .single()

      if (adminError || !adminUser) {
        // eslint-disable-next-line no-console
        console.error('❌ 관리자 정보 조회 실패:', adminError)
        
        // Supabase Auth에서는 로그인 성공했지만 admin_users에 정보가 없는 경우
        await supabase.auth.signOut()
        throw new Error('관리자 권한이 없는 계정입니다.')
      }

      if (!adminUser.is_active) {
        await supabase.auth.signOut()
        throw new Error('비활성화된 계정입니다. 관리자에게 문의하세요.')
      }

      // 3. 마지막 로그인 시간 업데이트
      await supabase
        .from('admin_users')
        .update({ 
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', adminUser.id)

      // eslint-disable-next-line no-console
      console.log('✅ 로그인 완료:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      })

      return adminUser
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('💥 로그인 중 오류:', error)
      throw error
    }
  },

  // 현재 세션 확인
  async checkSession(): Promise<AdminUser> {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(`세션 확인 실패: ${error.message}`)
    }
    
    if (!session) {
      throw new Error('Auth session missing!')
    }

    // admin_users에서 관리자 정보 조회
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, name, role, is_active, supabase_user_id, last_login_at, created_at, updated_at')
      .eq('supabase_user_id', session.user.id)
      .single()

    if (adminError || !adminUser) {
      throw new Error('관리자 정보를 찾을 수 없습니다.')
    }

    if (!adminUser.is_active) {
      throw new Error('비활성화된 계정입니다.')
    }

    return adminUser
  },

  // 로그아웃
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`로그아웃 실패: ${error.message}`)
    }

    // localStorage 정리 (기존 커스텀 세션 데이터가 있다면)
    localStorage.removeItem('admin_session_token')
    localStorage.removeItem('admin_user_data')
    localStorage.removeItem('admin_user_fallback')
  },

  // 세션 상태 리스너 (AuthContext에서 사용)
  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
  },

  // JWT 토큰 수동 갱신
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw new Error(`세션 갱신 실패: ${error.message}`)
    return data.session
  },

  // 현재 Supabase 사용자 정보 가져오기
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw new Error(`사용자 정보 조회 실패: ${error.message}`)
    return user
  },

  // 비밀번호 변경 (기존 사용자용)
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      throw new Error(`비밀번호 변경 실패: ${error.message}`)
    }

    // eslint-disable-next-line no-console
    console.log('✅ 비밀번호가 성공적으로 변경되었습니다.')
  },

  // 이메일 변경
  async updateEmail(newEmail: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    })
    
    if (error) {
      throw new Error(`이메일 변경 실패: ${error.message}`)
    }

    // admin_users 테이블도 업데이트
    const currentUser = await this.getCurrentUser()
    if (currentUser) {
      await supabase
        .from('admin_users')
        .update({ 
          email: newEmail,
          updated_at: new Date().toISOString()
        })
        .eq('supabase_user_id', currentUser.id)
    }

    // eslint-disable-next-line no-console
    console.log('✅ 이메일이 성공적으로 변경되었습니다.')
  }
}