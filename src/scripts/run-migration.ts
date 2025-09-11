#!/usr/bin/env tsx

/**
 * Admin 계정 마이그레이션 실행 스크립트
 *
 * 사용법:
 * npm run migration:check    - 마이그레이션 상태 확인
 * npm run migration:run      - 전체 마이그레이션 실행
 * npm run migration:single   - 개별 계정 마이그레이션
 */

/* eslint-disable no-console */

// Node.js 환경에서 환경 변수 로드
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

// Node.js 환경용 Supabase 클라이언트 생성
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  console.error('   .env.local 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 있는지 확인하세요.')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

// 개별 admin 계정을 Supabase Auth로 마이그레이션
async function migrateAdminAccount(adminUser: any): Promise<{ success: boolean; message: string }> {
  try {
    // 임시 비밀번호 생성 (보안상 예측 불가능하게)
    const randomString = Math.random().toString(36).substring(2, 15)
    const tempPassword = `${adminUser.email.split('@')[0]}_${randomString}_${Date.now()}`

    // 유효한 이메일 확인
    const hasValidDomain =
      adminUser.email.includes('@') && !adminUser.email.includes('@test.') && !adminUser.email.endsWith('.test')

    if (!hasValidDomain) {
      return {
        success: false,
        message: `유효하지 않은 이메일 형식: ${adminUser.email}`,
      }
    }

    // Supabase Auth 계정 생성
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: adminUser.email,
      password: tempPassword,
      options: {
        emailRedirectTo: undefined, // 이메일 확인 비활성화
        data: {
          admin_user_id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          permissions: adminUser.permissions || [], // 기본값 처리
          full_name: adminUser.name,
        },
      },
    })

    if (signUpError) {
      return {
        success: false,
        message: `Supabase Auth 계정 생성 실패: ${signUpError.message}`,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        message: '계정 생성은 성공했지만 사용자 정보가 반환되지 않았습니다.',
      }
    }

    // admin_users 테이블에 supabase_user_id 연결
    const { error: linkError } = await supabase
      .from('admin_users')
      .update({
        supabase_user_id: authData.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminUser.id)

    if (linkError) {
      return {
        success: false,
        message: `계정 연결 실패: ${linkError.message}`,
      }
    }

    return {
      success: true,
      message: `성공적으로 마이그레이션됨. 임시 비밀번호: ${tempPassword}`,
    }
  } catch (error) {
    return {
      success: false,
      message: `마이그레이션 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    }
  }
}

async function main() {
  const command = process.argv[2]

  try {
    switch (command) {
      case 'check':
        await checkMigrationStatus()
        break
      case 'run':
        await runFullMigration()
        break
      case 'single': {
        const email = process.argv[3]
        if (!email) {
          console.error('❌ 이메일을 입력해주세요: npm run migration:single admin@example.com')
          process.exit(1)
        }
        await runSingleMigration(email)
        break
      }
      default:
        showUsage()
    }
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error)
    process.exit(1)
  } finally {
    // Supabase 연결 정리
    process.exit(0)
  }
}

async function checkMigrationStatus() {
  console.log('🔍 마이그레이션 상태 확인 중...')

  // 마이그레이션 상태 확인
  const { data: allAdmins, error } = await supabase
    .from('admin_users')
    .select('id, email, name, role, supabase_user_id')
    .eq('is_active', true)

  if (error) {
    throw new Error(`마이그레이션 상태 확인 실패: ${error.message}`)
  }

  const totalAdmins = allAdmins?.length || 0
  const migratedAdmins = allAdmins?.filter(admin => admin.supabase_user_id).length || 0
  const pendingAdmins = totalAdmins - migratedAdmins
  const migrationPercentage = totalAdmins > 0 ? Math.round((migratedAdmins / totalAdmins) * 100) : 0

  console.log('\n📊 마이그레이션 상태:')
  console.log(`  전체 관리자: ${totalAdmins}명`)
  console.log(`  마이그레이션 완료: ${migratedAdmins}명`)
  console.log(`  마이그레이션 필요: ${pendingAdmins}명`)
  console.log(`  진행률: ${migrationPercentage}%`)

  const adminsNeedingMigration = allAdmins?.filter(admin => !admin.supabase_user_id) || []

  if (adminsNeedingMigration.length > 0) {
    console.log('\n📋 마이그레이션 필요한 계정들:')
    adminsNeedingMigration.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.email} (${admin.name}) - ${admin.role}`)
    })
  } else {
    console.log('\n✅ 모든 계정이 마이그레이션 완료되었습니다!')
  }
}

async function runFullMigration() {
  console.log('🚀 전체 마이그레이션 시작...')

  // 확인 메시지
  console.log('⚠️  이 작업은 모든 미마이그레이션 계정에 대해 Supabase Auth 계정을 생성합니다.')
  console.log('⚠️  생성된 임시 비밀번호는 안전한 곳에 보관해주세요.')

  // 마이그레이션이 필요한 계정들 조회
  const { data: adminsToMigrate, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('is_active', true)
    .is('supabase_user_id', null)

  if (error) {
    throw new Error(`마이그레이션 대상 조회 실패: ${error.message}`)
  }

  if (!adminsToMigrate || adminsToMigrate.length === 0) {
    console.log('✅ 마이그레이션이 필요한 계정이 없습니다.')
    return
  }

  const results = []
  let successCount = 0
  let failedCount = 0

  for (const admin of adminsToMigrate) {
    const result = await migrateAdminAccount(admin)

    results.push({
      admin_id: admin.id,
      email: admin.email,
      success: result.success,
      message: result.message,
    })

    if (result.success) {
      successCount++
    } else {
      failedCount++
    }

    // API 제한 방지를 위한 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n📊 마이그레이션 완료 결과:')
  console.log(`  전체: ${adminsToMigrate.length}명`)
  console.log(`  성공: ${successCount}명`)
  console.log(`  실패: ${failedCount}명`)

  console.log('\n📋 상세 결과:')
  results.forEach((res, index) => {
    const status = res.success ? '✅' : '❌'
    console.log(`  ${index + 1}. ${status} ${res.email}`)
    if (res.success && res.message.includes('임시 비밀번호:')) {
      console.log(`     🔑 ${res.message}`)
    } else if (!res.success) {
      console.log(`     ⚠️  ${res.message}`)
    }
  })

  if (successCount > 0) {
    console.log('\n🔔 중요 안내:')
    console.log('1. 생성된 임시 비밀번호를 각 관리자에게 안전하게 전달하세요')
    console.log('2. 관리자들에게 첫 로그인 후 비밀번호 변경을 안내하세요')
    console.log('3. 마이그레이션된 계정들이 정상 작동하는지 테스트하세요')
  }
}

async function runSingleMigration(email: string) {
  console.log(`🎯 개별 마이그레이션 시작: ${email}`)

  // 해당 이메일의 admin 사용자 조회
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  if (error || !adminUser) {
    console.error(`❌ 해당 이메일의 활성 관리자를 찾을 수 없습니다: ${email}`)
    return
  }

  if (adminUser.supabase_user_id) {
    console.log(`ℹ️  이미 마이그레이션된 계정입니다: ${email}`)
    return
  }

  const result = await migrateAdminAccount(adminUser)

  if (result.success) {
    console.log(`✅ 마이그레이션 성공: ${email}`)
    console.log(`🔑 ${result.message}`)
    console.log('\n🔔 안내: 생성된 임시 비밀번호를 해당 관리자에게 안전하게 전달하세요')
  } else {
    console.error(`❌ 마이그레이션 실패: ${email}`)
    console.error(`⚠️  ${result.message}`)
  }
}

function showUsage() {
  console.log(`
🛠️  Admin 계정 마이그레이션 도구

사용법:
  npm run migration:check              - 마이그레이션 상태 확인
  npm run migration:run                - 전체 마이그레이션 실행
  npm run migration:single <email>     - 개별 계정 마이그레이션

예시:
  npm run migration:check
  npm run migration:single admin@example.com
  npm run migration:run

⚠️  주의사항:
- 마이그레이션은 되돌릴 수 없습니다
- 실행 전 데이터베이스 백업을 권장합니다
- 생성된 임시 비밀번호는 안전하게 보관하세요
`)
}

// 스크립트 직접 실행
main()
