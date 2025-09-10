// 시설 유형 데이터 디버깅 스크립트
// 실행: npx tsx src/scripts/debug-facility-types.ts

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// 환경 변수 수동 로드
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL!
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugFacilityTypes() {
  console.log('🔍 시설 유형 데이터 디버깅 시작...\n')

  try {
    // 1. 전체 시설 수 확인
    const { count: totalCount } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 전체 시설 수: ${totalCount}개\n`)

    // 2. admin_type_code가 있는 시설 수 확인
    const { count: withTypeCount } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('*', { count: 'exact', head: true })
      .not('admin_type_code', 'is', null)
    
    console.log(`📊 시설 유형이 있는 시설 수: ${withTypeCount}개`)
    console.log(`📊 시설 유형이 없는 시설 수: ${(totalCount || 0) - (withTypeCount || 0)}개\n`)

    // 3. 샘플 데이터 확인
    const { data: sampleData } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('admin_code, admin_name, admin_type_code')
      .not('admin_type_code', 'is', null)
      .limit(10)
    
    console.log('📋 샘플 데이터 (10개):')
    sampleData?.forEach((item, index) => {
      console.log(`  ${index + 1}. [${item.admin_code}] ${item.admin_name}`)
      console.log(`     유형: ${item.admin_type_code}`)
    })
    console.log()

    // 4. 유형별 카운트 계산
    // Supabase는 기본적으로 1000개만 반환하므로 범위를 나누어 가져옴
    const allTypeData: any[] = []
    const limit = 1000
    let offset = 0
    
    let hasMoreData = true
    while (hasMoreData) {
      const { data, error } = await supabase
        .from('facilities_ssmn_basic_full')
        .select('admin_type_code')
        .not('admin_type_code', 'is', null)
        .range(offset, offset + limit - 1)
      
      if (error) {
        console.error('Error fetching data:', error)
        break
      }
      
      if (!data || data.length === 0) {
        hasMoreData = false
        break
      }
      
      allTypeData.push(...data)
      
      if (data.length < limit) {
        hasMoreData = false
      } else {
        offset += limit
      }
    }
    
    console.log(`📊 분석할 데이터 수: ${allTypeData.length}개`)
    
    const typeCounts = new Map<string, number>()
    let multiTypeCount = 0
    
    allTypeData.forEach(item => {
      if (item.admin_type_code) {
        if (item.admin_type_code.includes(',')) {
          multiTypeCount++
        }
        
        const codes = item.admin_type_code.split(',').map((c: string) => c.trim())
        codes.forEach((code: string) => {
          typeCounts.set(code, (typeCounts.get(code) || 0) + 1)
        })
      }
    })

    console.log(`📊 복수 유형을 가진 시설 수: ${multiTypeCount}개\n`)
    
    console.log('📊 시설 유형별 분포:')
    const sortedTypes = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1]) // 카운트 내림차순 정렬
    
    console.log(`총 ${sortedTypes.length}개의 고유한 시설 유형이 발견되었습니다.`)
    console.log('\n상위 20개 유형:')
    sortedTypes.slice(0, 20).forEach(([code, count]) => {
      console.log(`  ${code}: ${count}개`)
    })
    
    // 전체 카운트 합계 확인
    const totalTypeCount = sortedTypes.reduce((sum, [_, count]) => sum + count, 0)
    console.log(`\n📊 전체 유형 카운트 합계: ${totalTypeCount}개`)
    console.log()

    // 5. 알 수 없는 유형 코드 확인
    const knownCodes = new Set(['A01', 'A02', 'A03', 'A04', 'A05', 'AAA', 
                                'B01', 'B02', 'B03', 'B04', 'B05',
                                'C01', 'C02', 'C03', 'C04', 'C05', 'C06',
                                'Z01', 'S41'])
    
    // G, M, H, I 형식 추가
    for (let i = 31; i <= 99; i++) {
      knownCodes.add(`G${i}`)
      knownCodes.add(`M${i}`)
      knownCodes.add(`H${i}`)
      knownCodes.add(`I${i}`)
    }
    
    const unknownCodes = Array.from(typeCounts.keys()).filter(code => !knownCodes.has(code))
    
    if (unknownCodes.length > 0) {
      console.log('⚠️  알 수 없는 유형 코드:')
      unknownCodes.forEach(code => {
        console.log(`  ${code}: ${typeCounts.get(code)}개`)
      })
    } else {
      console.log('✅ 모든 유형 코드가 정의되어 있습니다.')
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

// 스크립트 실행
debugFacilityTypes()
  .then(() => {
    console.log('\n✅ 디버깅 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })