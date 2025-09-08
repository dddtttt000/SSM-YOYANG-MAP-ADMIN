// 공지사항 관련 타입 정의
import type { Announcement } from '@/types/database.types'

// 공지사항 카테고리 타입
export const ANNOUNCEMENT_CATEGORIES = [
  '일반',
  '중요', 
  '긴급',
  '시스템',
  '공지'
] as const

export type AnnouncementCategory = typeof ANNOUNCEMENT_CATEGORIES[number]

// 공지사항 생성 데이터 타입
export interface CreateAnnouncementData {
  title: string
  content: string
  category: AnnouncementCategory
  isImportant: boolean
  isActive?: boolean
}

// 공지사항 수정 데이터 타입
export interface UpdateAnnouncementData {
  title: string
  content: string
  category: AnnouncementCategory
  isImportant: boolean
  isActive?: boolean
}

// 공지사항 필터 타입
export interface AnnouncementFilters {
  isActive?: boolean
  isImportant?: boolean
  search?: string
  category?: AnnouncementCategory
}

// 공지사항 폼 상태 타입
export interface AnnouncementFormData extends CreateAnnouncementData {}

// 공지사항 목록 응답 타입
export interface AnnouncementListResponse {
  data: Announcement[]
  total: number
}

// 공지사항 에러 타입
export interface AnnouncementError {
  message: string
  code?: string
  field?: string
}

// 공지사항 관련 상수
export const ANNOUNCEMENT_CONSTANTS = {
  CATEGORIES: ANNOUNCEMENT_CATEGORIES,
  DEFAULT_CATEGORY: '일반' as AnnouncementCategory,
  MAX_TITLE_LENGTH: 100,
  MAX_CONTENT_LENGTH: 5000,
} as const

// 타입 가드 함수
export const isAnnouncementCategory = (value: string): value is AnnouncementCategory => {
  return ANNOUNCEMENT_CATEGORIES.includes(value as AnnouncementCategory)
}

// 공지사항 유효성 검사 타입
export interface AnnouncementValidation {
  title: {
    isValid: boolean
    message?: string
  }
  content: {
    isValid: boolean
    message?: string
  }
  category: {
    isValid: boolean
    message?: string
  }
}