#!/usr/bin/env tsx

/**
 * 현재 개발 환경의 데이터베이스 스키마 추출 스크립트
 */

/* eslint-disable no-console */

// Node.js 환경에서 환경 변수 로드
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

// Node.js 환경용 Supabase 클라이언트 생성
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

async function extractDatabaseSchema() {
  console.log('🔍 현재 개발 환경 데이터베이스 스키마 추출 중...')
  
  try {
    // 1. 모든 테이블 목록 조회
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_info')

    if (tablesError) {
      console.log('⚠️  RPC 함수 실패, 대안 방법 시도...')
      
      // PostgreSQL 시스템 카탈로그를 통한 테이블 조회
      const { data: pgTables, error: pgError } = await supabase
        .rpc('exec_sql', {
          sql_query: `
            SELECT 
              tablename as table_name,
              'BASE TABLE' as table_type
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
          `
        })

      if (pgError) {
        console.error('❌ 테이블 목록 조회 실패:', pgError.message)
        console.log('\n🔍 TypeScript 타입 파일에서 테이블 추출 시도...')
        await extractFromTypes()
        return
      }

      console.log('\n📋 발견된 테이블들:')
      pgTables?.forEach((table: any, index: number) => {
        console.log(`${index + 1}. ${table.table_name} (${table.table_type})`)
      })
    } else {
      console.log('\n📋 발견된 테이블들:')
      tables?.forEach((table: any, index: number) => {
        console.log(`${index + 1}. ${table.table_name} (${table.table_type})`)
      })
    }

    // 2. RLS 상태 확인
    console.log('\n🔐 RLS 상태 확인...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status')
    
    if (!rlsError && rlsStatus) {
      console.log('\n📊 RLS 활성화 상태:')
      rlsStatus.forEach((table: any) => {
        const status = table.rls_enabled ? '🔒 활성화' : '🔓 비활성화'
        console.log(`  ${table.table_name}: ${status} (정책 ${table.policy_count}개)`)
      })
    }

    // 3. 함수 존재 확인
    console.log('\n🔧 인증 함수 존재 확인...')
    const { data: functionsTest, error: functionsError } = await supabase
      .rpc('test_rls_functions')
    
    if (!functionsError && functionsTest) {
      console.log('✅ 인증 함수들 정상 존재')
      console.log('  - get_current_admin_user_id:', functionsTest.functions_exist?.get_current_admin_user_id ? '✅' : '❌')
      console.log('  - is_authenticated_user:', functionsTest.functions_exist?.is_authenticated_user ? '✅' : '❌') 
      console.log('  - has_admin_permission:', functionsTest.functions_exist?.has_admin_permission ? '✅' : '❌')
    }

  } catch (error) {
    console.error('💥 스키마 추출 중 오류 발생:', error)
    console.log('\n🔍 TypeScript 타입 파일에서 테이블 추출 시도...')
    await extractFromTypes()
  }
}

async function extractFromTypes() {
  console.log('\n📁 database.generated.types.ts 파일 분석 중...')
  
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const typesPath = path.join(process.cwd(), 'src/types/database.generated.types.ts')
    const content = await fs.readFile(typesPath, 'utf-8')
    
    // 테이블 정의 패턴 매칭
    const tableRegex = /^\s+(\w+):\s*{$/gm
    const matches = [...content.matchAll(tableRegex)]
    
    const tables = matches
      .map(match => match[1])
      .filter(name => !['Row', 'Insert', 'Update', 'Relationships'].includes(name))
    
    console.log('\n📋 TypeScript 타입에서 발견된 테이블들:')
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table}`)
    })
    
    // 중요한 변경사항 확인
    console.log('\n🔍 중요한 스키마 변경사항 확인...')
    
    if (content.includes('supabase_user_id')) {
      console.log('✅ admin_users.supabase_user_id 컬럼 존재')
    } else {
      console.log('❌ admin_users.supabase_user_id 컬럼 누락')
    }
    
    if (content.includes('announcements')) {
      console.log('✅ announcements 테이블 존재')
    }
    
    if (content.includes('questions')) {
      console.log('✅ questions 테이블 존재') 
    }
    
    return tables
    
  } catch (error) {
    console.error('❌ 타입 파일 분석 실패:', error)
  }
}

// 스크립트 실행
extractDatabaseSchema().then(() => {
  console.log('\n✅ 스키마 추출 완료')
  process.exit(0)
}).catch((error) => {
  console.error('❌ 스크립트 실행 실패:', error)
  process.exit(1)
})