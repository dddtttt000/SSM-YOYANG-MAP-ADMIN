import { supabase } from '@/lib/supabase'
import { LoginCredentials } from '@/types/auth.types'
import { AdminUser } from '@/types/database.types'

export const authService = {
  // 하이브리드 로그인 (커스텀 인증 + Supabase Auth)
  async login(credentials: LoginCredentials): Promise<AdminUser> {
    console.log('🔍 AuthService: login 시작', credentials.email)

    // 먼저 커스텀 인증으로 비밀번호 확인
    const { data: adminUsers, error: rpcError } = await supabase.rpc('verify_admin_password', {
      p_email: credentials.email,
      p_password: credentials.password,
    })

    console.log('🔍 AuthService: RPC 결과', { adminUsers, rpcError })

    if (rpcError || !adminUsers || adminUsers.length === 0) {
      console.error('❌ AuthService: RPC 실패', rpcError)
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const adminUser = adminUsers[0]
    console.log('✅ AuthService: admin user 찾음', adminUser)

    if (!adminUser.is_active) {
      throw new Error('비활성화된 계정입니다.')
    }

    // Supabase Auth 계정 존재 여부 확인 후 로그인 시도
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    console.log('🔍 AuthService: Supabase Auth 결과', { authData: authData?.user?.email, authError })

    // Supabase Auth 계정이 없으면 임시 JWT 생성
    if (authError) {
      console.warn('⚠️ Supabase Auth 계정이 없습니다. 임시 세션 생성:', authError.message)

      // 임시로 signUp으로 계정 생성 시도
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: { admin_user_id: adminUser.id },
        },
      })

      console.log('🔍 AuthService: signUp 결과', { signUpData: signUpData?.user?.email, signUpError })

      if (signUpError) {
        console.warn('❌ Supabase Auth 계정 자동 생성 실패:', signUpError.message)
      }
    } else {
      console.log('✅ AuthService: Supabase Auth 로그인 성공')

      // JWT에 admin_user_id 추가
      const { error: updateError } = await supabase.auth.updateUser({
        data: { admin_user_id: adminUser.id },
      })

      console.log('🔍 AuthService: JWT 업데이트 결과', updateError)

      if (updateError) {
        console.warn('⚠️ JWT custom claim 설정 실패:', updateError)
      }
    }

    // 현재 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log('🔍 AuthService: 현재 세션', session?.user?.email)

    // 로그인 시간 업데이트
    await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', adminUser.id)

    console.log('✅ AuthService: login 완료', adminUser)
    return adminUser
  },

  // Supabase Auth 세션 체크
  async checkSession(): Promise<AdminUser | null> {
    console.log('🔍 AuthService: checkSession 시작')

    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log('🔍 AuthService: 세션 상태', session?.user?.email || 'null')

    if (!session?.user?.email) {
      console.log('❌ AuthService: 세션 없음')
      return null
    }

    try {
      // admin_users 테이블에서 사용자 정보 조회
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single()

      console.log('🔍 AuthService: admin_users 조회 결과', { adminUser: adminUser?.email, error })

      if (error || !adminUser) {
        console.log('❌ AuthService: admin user 찾을 수 없음, 로그아웃')
        await supabase.auth.signOut()
        return null
      }

      // JWT에 admin_user_id가 없으면 추가
      const currentClaims = session.user.user_metadata
      console.log('🔍 AuthService: 현재 JWT claims', currentClaims)

      if (!currentClaims.admin_user_id) {
        console.log('⚠️ AuthService: admin_user_id 없음, 추가 중')

        const { error: updateError } = await supabase.auth.updateUser({
          data: { admin_user_id: adminUser.id },
        })

        console.log('🔍 AuthService: JWT 업데이트 결과', updateError)
      }

      console.log('✅ AuthService: checkSession 성공', adminUser)
      return adminUser
    } catch (err) {
      console.error('❌ AuthService: checkSession 에러', err)
      await supabase.auth.signOut()
      return null
    }
  },

  // Supabase Auth 로그아웃
  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },
}
