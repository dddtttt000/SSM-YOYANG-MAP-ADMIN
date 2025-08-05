import { createClient } from '@supabase/supabase-js'

// Supabase 설정 (Service Role Key 필요)
const supabaseUrl = 'https://gfclxscgsoyochbnzipo.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // Supabase Dashboard > Settings > API에서 확인

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    // 1. Auth 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123456', // 실제 운영에서는 강력한 비밀번호 사용
      email_confirm: true
    })

    if (authError) {
      console.error('Auth 사용자 생성 실패:', authError)
      return
    }

    console.log('Auth 사용자 생성 성공:', authData.user?.email)

    // 2. admin_users 테이블에 정보 추가
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@example.com',
        name: '시스템 관리자',
        role: 'super_admin',
        permissions: {},
        is_active: true
      })
      .select()

    if (error) {
      console.error('관리자 정보 추가 실패:', error)
      return
    }

    console.log('관리자 계정 생성 완료:', data)
    console.log('\n로그인 정보:')
    console.log('이메일: admin@example.com')
    console.log('비밀번호: admin123456')
    
  } catch (error) {
    console.error('오류 발생:', error)
  }
}

// 스크립트 실행
createAdminUser()