import { Timestamp } from 'firebase/firestore'

// AI 시설 분석 결과
export interface AIFacilityAnalysis {
  id?: string
  memberId: string
  facilityId: string
  facilityName: string
  facilityAddress: string
  facilityType: string
  customerAge?: number | null
  customerGender: string
  longTermCareGrade: string
  dementiaLevel: string
  preferredLocation: string
  preferredCareType: string
  aiSummary: string
  aiModelUsed: string
  facilityData?: any
  createdAt: Timestamp
  updatedAt?: Timestamp | null
}

// 요양등급 평가 결과
export interface AssessmentResult {
  id?: string
  user_id: string
  grade: string
  grade_range: string
  total_score: number
  description: string
  recommendations: string[]
  answers: Record<string, any>
  answer_statistics: {
    completion_rate: number
    total_questions: number
    answered_questions: number
    questions_by_category: Record<string, number>
  }
  category_scores?: Record<string, number>
  summary_scores: {
    category_scores: Record<string, number>
    service_scores: Record<string, number>
    raw_scores: Record<string, number>
  }
  detailed_answers?: any[]
  created_at: Timestamp
  data_version: string
}

// 상담 전화 이벤트
export interface CallEvent {
  id?: string
  memberId: string
  facilityId: string
  facilityName: string
  facilityAddress: string
  callStartTime: string
  callEndTime?: string | null
  callDurationSeconds?: number | null
  createdAt: string | Timestamp
}

// 시설 즐겨찾기
export interface FavoriteFacility {
  id?: string
  memberId: string
  facilityId: string
  facilityName: string
  facilityAddress: string
  facilityType: string
  createdAt: Timestamp
}

// 통합 모니터링 데이터
export interface MonitoringData {
  aiAnalyses: AIFacilityAnalysis[]
  assessmentResults: AssessmentResult[]
  callEvents: CallEvent[]
  favoriteFacilities: FavoriteFacility[]
}

// 필터 옵션
export interface MonitoringFilters {
  userId?: string
  adminCode?: string
  startDate?: Date
  endDate?: Date
  activityType?: 'all' | 'ai_analysis' | 'assessment' | 'call' | 'favorite'
}