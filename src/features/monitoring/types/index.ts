import { Timestamp } from 'firebase/firestore'

// AI 시설 분석 결과
export interface AIFacilityAnalysis {
  id?: string
  user_id: string
  admin_code: string
  analysis_date: Timestamp
  prompt_type: string
  response_summary?: string
  created_at: Timestamp
  data_version?: string
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
  category_scores: Record<string, number>
  summary_scores: {
    category_scores: Record<string, number>
    service_scores: Record<string, number>
    raw_scores: Record<string, number>
  }
  created_at: Timestamp
  data_version: string
}

// 상담 전화 이벤트
export interface CallEvent {
  id?: string
  user_id: string
  admin_code: string
  facility_name: string
  phone_number: string
  call_duration?: number
  call_status?: string
  created_at: Timestamp
  data_version?: string
}

// 시설 즐겨찾기
export interface FavoriteFacility {
  id?: string
  user_id: string
  admin_code: string
  created_at: Timestamp
  updated_at?: Timestamp
  is_active: boolean
  data_version?: string
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