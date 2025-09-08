import type { ServiceInquiry, InquiryResponse, AdminUser } from '@/types/database.types'

export type { ServiceInquiry, InquiryResponse } from '@/types/database.types'
export type InquiryStatus = 'pending' | 'answered'

// 서비스 문의 목록 표시용 확장 타입
export interface ServiceInquiryWithResponse extends ServiceInquiry {
  inquiry_responses?: InquiryResponse[]
  response_count?: number
}

// 서비스 문의 상세보기용 확장 타입
export interface ServiceInquiryDetail extends ServiceInquiry {
  inquiry_responses: (InquiryResponse & {
    admin_user: Pick<AdminUser, 'id' | 'name' | 'email'>
  })[]
}

// 답변 작성용 타입
export interface CreateInquiryResponse {
  title: string
  content: string
}

// 목록 필터링용 타입
export interface InquiryFilters {
  status?: InquiryStatus | 'all'
  search?: string
}

// 목록 정렬용 타입
export type InquirySortField = 'created_at' | 'updated_at' | 'status'
export type SortOrder = 'asc' | 'desc'

export interface InquirySorting {
  field: InquirySortField
  order: SortOrder
}

// 페이지네이션용 타입
export interface InquiryPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}