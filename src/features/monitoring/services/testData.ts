// 테스트 데이터 생성을 위한 유틸리티

import { logger } from '@/utils/logger'
import {
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'

export const createTestData = async () => {
  try {
    // AI 분석 테스트 데이터
    const aiAnalysisData = {
      memberId: '386',
      facilityId: '21165000009',
      facilityName: '서초노인주간보호센터',
      facilityAddress: '서울특별시 서초구 강남대로30길 73-7 (양재동)',
      facilityType: 'B03',
      customerAge: null,
      customerGender: 'male',
      longTermCareGrade: '4등급',
      dementiaLevel: '초기',
      preferredLocation: '현재 위치 기준',
      preferredCareType: 'day_night',
      aiSummary: '테스트 AI 분석 요약입니다.',
      aiModelUsed: 'gemini-2.5-pro',
      createdAt: Timestamp.now(),
      updatedAt: null,
    }

    // 평가 결과 테스트 데이터
    const assessmentData = {
      user_id: 'test-user-002',
      grade: '3등급',
      grade_range: '60-74점',
      total_score: 65,
      description: '일상생활에서 부분적인 도움이 필요한 상태',
      recommendations: [
        '방문요양 서비스 이용 권장',
        '주간보호센터 이용 가능',
        '재가서비스 월 한도액 1,520,700원',
      ],
      answers: {},
      answer_statistics: {
        completion_rate: 100,
        total_questions: 52,
        answered_questions: 52,
        questions_by_category: {
          '일상생활': 12,
          '인지기능': 7,
          '행동변화': 14,
          '간호처치': 9,
          '재활': 10,
        },
      },
      category_scores: {
        '일상생활': 24,
        '인지기능': 15,
        '행동변화': 8,
        '간호처치': 12,
        '재활': 6,
      },
      summary_scores: {
        category_scores: {},
        service_scores: {},
        raw_scores: {},
      },
      created_at: Timestamp.now(),
      data_version: '1.0',
    }

    // 전화 상담 테스트 데이터
    const callEventData = {
      user_id: 'test-user-003',
      admin_code: 'B000002',
      facility_name: '행복요양센터',
      phone_number: '02-1234-5678',
      call_duration: 180,
      call_status: 'completed',
      created_at: Timestamp.now(),
      data_version: '1.0',
    }

    // 즐겨찾기 테스트 데이터
    const favoriteData = {
      user_id: 'test-user-004',
      admin_code: 'C000003',
      created_at: Timestamp.now(),
      is_active: true,
      data_version: '1.0',
    }

    // 데이터 추가
    logger.log('Adding test data to Firestore...')
    
    await addDoc(collection(firestore, 'ai_facility_analyses'), aiAnalysisData)
    await addDoc(collection(firestore, 'assessment_results'), assessmentData)
    await addDoc(collection(firestore, 'call_events'), callEventData)
    await addDoc(collection(firestore, 'favorite_facilities'), favoriteData)
    
    logger.log('Test data added successfully!')
  } catch (error) {
    logger.error('Error adding test data:', error)
  }
}

// 테스트 데이터 삭제 함수
export const clearTestData = async () => {
  // 실제 구현은 필요시 추가
  logger.log('Clear test data function - not implemented')
}