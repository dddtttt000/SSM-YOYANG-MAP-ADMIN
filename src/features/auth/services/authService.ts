import { supabase } from '@/lib/supabase'
import { LoginCredentials } from '@/types/auth.types'
import { AdminUser } from '@/types/database.types'
import type { User, Session } from '@supabase/supabase-js'

interface AdminUserMetadata {
  admin_user_id: number
  email: string
  role: string
  permissions: string[]
  full_name: string
}

export const authService = {
  // Supabase Auth + JWT 메타데이터 기반 로그인
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

    // 2. Supabase Auth에서 해당 사용자 확인/생성
    let authUser: User | null = null

    // 2-1. 기존 Supabase 사용자가 있는지 확인
    if (adminUser.supabase_user_id) {
      const { data: existingSession } = await supabase.auth.getUser()
      if (existingSession.user?.id === adminUser.supabase_user_id) {
        authUser = existingSession.user
      }
    }

    // 2-2. Supabase Auth 계정 생성/로그인
    if (!authUser) {
      // 고정된 임시 비밀번호로 Supabase Auth 계정 생성/로그인
      const tempPassword = `temp_admin_${adminUser.id}_fixed_password`

      // 유효한 이메일 형식으로 변환
      const hasValidDomain =
        adminUser.email.includes('@') && !adminUser.email.includes('@test.') && !adminUser.email.endsWith('.test')
      const validEmail = hasValidDomain ? adminUser.email : `admin_${adminUser.id}@temp-domain.com`

      // 먼저 로그인 시도 (계정이 이미 있을 가능성이 높음)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: validEmail,
        password: tempPassword,
      })

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        // 계정이 없으면 생성 시도
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: validEmail,
          password: tempPassword,
          options: {
            emailRedirectTo: undefined, // 이메일 확인 비활성화
            data: {
              admin_user_id: adminUser.id,
              email: adminUser.email, // 원본 이메일 유지
              role: adminUser.role,
              permissions: adminUser.permissions,
              full_name: adminUser.name,
            },
          },
        })

        if (signUpError) {
          throw new Error(`Supabase Auth 계정 생성 실패: ${signUpError.message}`)
        }

        // signUp 성공 시 바로 사용자 사용 (세션이 없어도 진행)
        authUser = signUpData.user
      } else if (signInError) {
        throw new Error(`Supabase Auth 로그인 실패: ${signInError.message}`)
      } else {
        authUser = signInData.user
      }
    }

    if (!authUser) {
      throw new Error('Supabase Auth 사용자 생성/로그인 실패')
    }

    // 3. admin_users 테이블에 supabase_user_id 연결
    if (!adminUser.supabase_user_id) {
      await supabase
        .from('admin_users')
        .update({
          supabase_user_id: authUser.id,
          last_login_at: new Date().toISOString(),
        })
        .eq('id', adminUser.id)

      adminUser.supabase_user_id = authUser.id
    } else {
      // 로그인 시간만 업데이트
      await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', adminUser.id)
    }

    // 4. 세션 확인 (세션이 없어도 진행하도록 수정)
    const { data: session } = await supabase.auth.getSession()

    // 세션 확인 및 강제 생성
    if (!session.session) {
      // 세션 새로고침 시도
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !refreshData.session) {
          // localStorage fallback
          localStorage.setItem('admin_user_fallback', JSON.stringify({
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            permissions: adminUser.permissions,
            supabase_user_id: adminUser.supabase_user_id,
            last_login_at: adminUser.last_login_at,
            is_active: adminUser.is_active
          }))
        }
      } catch (refreshError) {
        // localStorage fallback
        localStorage.setItem('admin_user_fallback', JSON.stringify({
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          permissions: adminUser.permissions,
          supabase_user_id: adminUser.supabase_user_id,
          last_login_at: adminUser.last_login_at,
          is_active: adminUser.is_active
        }))
      }
    }

    // 5. JWT user_metadata 업데이트 (세션이 있을 때만)
    if (session.session) {
      const userMetadata: AdminUserMetadata = {
        admin_user_id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions,
        full_name: adminUser.name,
      }

      const { error: updateMetadataError } = await supabase.auth.updateUser({
        data: userMetadata,
      })

      if (updateMetadataError) {
        // 메타데이터 업데이트 실패해도 로그인은 계속 진행
      }
    }

    return adminUser
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
          // admin_users 테이블에서 최신 상태 확인
          const { data: currentAdminUser, error } = await supabase
            .from('admin_users')
            .select('*')
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

    // 5. 최신 admin 사용자 정보 조회
    const { data: currentAdminUser, error } = await supabase
      .from('admin_users')
      .select('*')
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
      JSON.stringify(metadata.permissions) !== JSON.stringify(currentAdminUser.permissions)

    if (needsMetadataUpdate) {
      const updatedMetadata: AdminUserMetadata = {
        admin_user_id: currentAdminUser.id,
        email: currentAdminUser.email,
        role: currentAdminUser.role,
        permissions: currentAdminUser.permissions,
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
