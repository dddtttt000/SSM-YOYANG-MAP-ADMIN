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

import { migrationService } from '../features/auth/services/migrationService'
import { supabase } from '../lib/supabase'

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
  
  const status = await migrationService.checkMigrationStatus()
  const admins = await migrationService.getAdminsForMigration()
  
  console.log('\n📊 마이그레이션 상태:')
  console.log(`  전체 관리자: ${status.totalAdmins}명`)
  console.log(`  마이그레이션 완료: ${status.migratedAdmins}명`)
  console.log(`  마이그레이션 필요: ${status.pendingAdmins}명`)
  console.log(`  진행률: ${status.migrationPercentage}%`)
  
  if (admins.length > 0) {
    console.log('\n📋 마이그레이션 필요한 계정들:')
    admins.forEach((admin, index) => {
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
  
  const result = await migrationService.migrateAllAdminAccounts()
  
  console.log('\n📊 마이그레이션 완료 결과:')
  console.log(`  전체: ${result.total}명`)
  console.log(`  성공: ${result.success}명`)
  console.log(`  실패: ${result.failed}명`)
  
  console.log('\n📋 상세 결과:')
  result.results.forEach((res, index) => {
    const status = res.success ? '✅' : '❌'
    console.log(`  ${index + 1}. ${status} ${res.email}`)
    if (res.success && res.message.includes('임시 비밀번호:')) {
      console.log(`     🔑 ${res.message}`)
    } else if (!res.success) {
      console.log(`     ⚠️  ${res.message}`)
    }
  })
  
  if (result.success > 0) {
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
  
  const result = await migrationService.migrateAdminAccount(adminUser)
  
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

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

export { main }