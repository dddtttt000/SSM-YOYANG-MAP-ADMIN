/**
 * 페이지네이션 공통 타입 정의
 */

export interface PaginationParams {
  page: number          // 현재 페이지 (1부터 시작)
  pageSize: number      // 페이지당 항목 수
}

export interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// 기본 페이지네이션 설정
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

// 페이지네이션 헬퍼 함수들
export const calculatePagination = (
  page: number,
  pageSize: number,
  totalCount: number
): PaginationInfo => {
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    currentPage: page,
    pageSize,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  }
}

export const calculateRange = (page: number, pageSize: number) => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}