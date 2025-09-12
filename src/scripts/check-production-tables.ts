#!/usr/bin/env tsx

/**
 * 상용환경 테이블 확인 스크립트 (.env.production 사용)
 */

/* eslint-disable no-console */

import dotenv from 'dotenv'
// 상용환경 설정 로드
dotenv.config({ path: '.env.production' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 상용환경 Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProductionTables() {
  console.log('🔍 상용환경 테이블 확인 중...')
  console.log(`📍 상용환경: ${supabaseUrl}\n`)
  
  const requiredTables = [
    'admin_users',
    'announcements', 
    'announcement_reads',
    'questions',
    'service_inquiries',
    'inquiry_responses', // 누락 의심
    'members'
  ]
  
  const missingTables = []
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
        
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ ${table}: 테이블이 존재하지 않음`)
          missingTables.push(table)
        } else {
          console.log(`⚠️  ${table}: ${error.message}`)
        }
      } else {
        console.log(`✅ ${table}: 존재함 (데이터 ${data?.length || 0}건)`)
      }
    } catch (err) {
      console.log(`🚨 ${table}: 확인 실패 - ${err}`)
      missingTables.push(table)
    }
  }
  
  return missingTables
}

function showInquiryResponsesSQL() {
  console.log('\n' + '='.repeat(80))
  console.log('📝 inquiry_responses 테이블 생성 SQL')
  console.log('='.repeat(80))
  console.log('\n상용환경 Supabase Dashboard → SQL Editor에서 실행하세요:\n')
  
  console.log(`
-- inquiry_responses 테이블 생성
CREATE TABLE IF NOT EXISTS inquiry_responses (
  id SERIAL PRIMARY KEY,
  inquiry_id INTEGER NOT NULL REFERENCES service_inquiries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_inquiry_id ON inquiry_responses(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_created_by ON inquiry_responses(created_by);

-- RLS 활성화
ALTER TABLE inquiry_responses ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근 가능한 정책
CREATE POLICY "관리자 접근" ON inquiry_responses
  FOR ALL USING (is_authenticated_user());

-- 생성 확인
SELECT tablename FROM pg_tables WHERE tablename = 'inquiry_responses';
`)

  console.log('='.repeat(80))
}

async function main() {
  console.log('🚀 상용환경 누락 테이블 확인')
  
  const missingTables = await checkProductionTables()
  
  if (missingTables.length > 0) {
    console.log('\n⚠️  다음 테이블들이 상용환경에 누락되어 있습니다:')
    missingTables.forEach(table => {
      console.log(`   - ${table}`)
    })
    
    if (missingTables.includes('inquiry_responses')) {
      showInquiryResponsesSQL()
    }
    
    console.log('\n📋 작업 순서:')
    console.log('1. 상용환경 Supabase Dashboard 접속')
    console.log('2. SQL Editor에서 위 테이블 생성 SQL 실행')
    console.log('3. dev→main 브랜치 병합 후 배포')
  } else {
    console.log('\n✅ 모든 필수 테이블이 상용환경에 존재합니다!')
  }
  
  console.log('\n✅ 상용환경 확인 완료')
}

main().catch(console.error)