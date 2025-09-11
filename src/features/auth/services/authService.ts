import { supabase } from '@/lib/supabase'
import { LoginCredentials } from '@/types/auth.types'
import { AdminUser } from '@/types/database.types'
import type { Session } from '@supabase/supabase-js'

interface AdminUserMetadata {
  admin_user_id: number
  email: string
  role: string
  permissions?: string[] // TODO: DB 컬럼 추가 시 활성화
  full_name: string
}

export const authService = {
  // 개선된 안전한 로그인 플로우
  async login(credentials: LoginCredentials): Promise<AdminUser> {
    // 1. admin_users 테이블에서 사용자 검증
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

    // 2. Supabase Auth 계정 연결 상태 확인 (개발 환경에서는 유연하게 처리)
    const isDevEnvironment = import.meta.env.MODE === 'development'
    const isDevSupabase = import.meta.env.VITE_SUPABASE_URL?.includes('gfclxscgsoyochbnzipo.supabase.co')

    const allowFlexibleAuth = isDevEnvironment || isDevSupabase

    if (!adminUser.supabase_user_id && !allowFlexibleAuth) {
      throw new Error('계정 마이그레이션이 필요합니다. 관리자에게 문의하여 계정 설정을 완료해주세요.')
    }

    // 3. 로그인 시간 업데이트
    await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', adminUser.id)

    // 4. Supabase Auth 세션 처리
    if (adminUser.supabase_user_id) {
      // Supabase Auth 계정이 연결된 경우 - 실제 로그인 수행
      try {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminUser.email,
          password: credentials.password,
        })

        if (signInError) {
          // eslint-disable-next-line no-console
          console.warn('Supabase Auth 로그인 실패:', signInError.message)
          // Supabase Auth 로그인 실패해도 admin_users 테이블 인증이 성공했으므로 계속 진행
          // 사용자에게 비밀번호 업데이트가 필요함을 알림
          console.warn('힌트: 마이그레이션된 계정의 경우 Supabase Auth 비밀번호 업데이트가 필요할 수 있습니다.')
        } else if (authData.user && authData.user.id === adminUser.supabase_user_id) {
          // 로그인 성공 시 JWT 메타데이터 동기화
          await this.syncUserMetadata(adminUser)
          // eslint-disable-next-line no-console
          console.log('Supabase Auth 로그인 성공 - JWT 토큰이 생성되었습니다.')
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Supabase Auth 로그인 중 오류:', error)
        // 오류가 발생해도 admin_users 테이블 인증이 성공했으므로 계속 진행
      }
    }

    // 5. localStorage fallback 설정 (세션 없는 경우 대비)
    localStorage.setItem(
      'admin_user_fallback',
      JSON.stringify({
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        permissions: adminUser.permissions || [], // 기본값 처리
        supabase_user_id: adminUser.supabase_user_id,
        last_login_at: adminUser.last_login_at,
        is_active: adminUser.is_active,
      })
    )

    return adminUser
  },

  // JWT 메타데이터 동기화
  async syncUserMetadata(adminUser: AdminUser): Promise<void> {
    try {
      const userMetadata: AdminUserMetadata = {
        admin_user_id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions || [], // 기본값 처리
        full_name: adminUser.name,
      }

      const { error } = await supabase.auth.updateUser({
        data: userMetadata,
      })

      if (error) {
        // eslint-disable-next-line no-console
        console.warn('메타데이터 동기화 실패:', error.message)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('메타데이터 동기화 중 오류:', error)
    }
  },

  // JWT 세션 기반 사용자 확인
  async checkSession(): Promise<AdminUser | null> {
    // 1. Supabase Auth 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session || !session.user) {
      // 세션이 없을 때 localStorage fallback 시도
      const fallbackUser = localStorage.getItem('admin_user_fallback')
      if (fallbackUser) {
        try {
          const userData = JSON.parse(fallbackUser)
          // admin_users 테이블에서 최신 상태 확인 (password_digest 제외)
          const { data: currentAdminUser, error } = await supabase
            .from('admin_users')
            .select('id, email, name, role, permissions, supabase_user_id, last_login_at, is_active, created_at, updated_at')
            .eq('id', userData.id)
            .eq('is_active', true)
            .single()

          if (!error && currentAdminUser) {
            return currentAdminUser
          } else {
            // fallback 데이터도 유효하지 않으면 제거
            localStorage.removeItem('admin_user_fallback')
          }
        } catch (e) {
          localStorage.removeItem('admin_user_fallback')
        }
      }
      return null
    }

    // 2. JWT 메타데이터에서 admin_user_id 추출
    const metadata = session.user.user_metadata as AdminUserMetadata
    let adminUserId = metadata?.admin_user_id

    // 3. admin_user_id가 없으면 supabase_user_id로 조회
    if (!adminUserId) {
      const { data: adminUserBySupabaseId } = await supabase
        .from('admin_users')
        .select('id')
        .eq('supabase_user_id', session.user.id)
        .single()

      adminUserId = adminUserBySupabaseId?.id
    }

    // 4. 여전히 없으면 이메일로 조회 (fallback)
    if (!adminUserId) {
      const { data: adminUserByEmail } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', session.user.email)
        .single()

      adminUserId = adminUserByEmail?.id
    }

    if (!adminUserId) {
      return null
    }

    // 5. 최신 admin 사용자 정보 조회 (password_digest 제외)
    const { data: currentAdminUser, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, permissions, supabase_user_id, last_login_at, is_active, created_at, updated_at')
      .eq('id', adminUserId)
      .eq('is_active', true)
      .single()

    if (error || !currentAdminUser) {
      await supabase.auth.signOut()
      return null
    }

    // 6. JWT 메타데이터 동기화 (필요시)
    const needsMetadataUpdate =
      !metadata ||
      metadata.admin_user_id !== currentAdminUser.id ||
      metadata.role !== currentAdminUser.role ||
      JSON.stringify(metadata.permissions || []) !== JSON.stringify(currentAdminUser.permissions || [])

    if (needsMetadataUpdate) {
      const updatedMetadata: AdminUserMetadata = {
        admin_user_id: currentAdminUser.id,
        email: currentAdminUser.email,
        role: currentAdminUser.role,
        permissions: currentAdminUser.permissions || [], // 기본값 처리
        full_name: currentAdminUser.name,
      }

      await supabase.auth.updateUser({
        data: updatedMetadata,
      })
    }

    return currentAdminUser
  },

  // 로그아웃
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }

    // localStorage 정리 (기존 커스텀 세션 데이터)
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
    if (error) throw error
    return data.session
  },

  // 디버깅용: 현재 인증 상태 확인
  async debugAuthState() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const { data: user } = await supabase.auth.getUser()

    return {
      session: !!session,
      user: !!user.user,
      metadata: session?.user?.user_metadata,
      jwt_admin_id: session?.user?.user_metadata?.admin_user_id,
      auth_user_id: session?.user?.id,
      email: session?.user?.email,
    }
  },
}
