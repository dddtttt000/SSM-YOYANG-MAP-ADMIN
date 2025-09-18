export interface FilterOption {
  value: string
  label: string
}

export const CATEGORIES_1: FilterOption[] = [
  { value: '', label: '전체 카테고리' },
  { value: '요양찾기', label: '요양찾기' },
  { value: '사랑방', label: '사랑방' },
  { value: '건강관리', label: '건강관리' },
]

export const CATEGORIES_2_MAP: Record<string, FilterOption[]> = {
  요양찾기: [
    { value: '', label: '전체' },
    { value: '효도클럽', label: '효도클럽' },
    { value: '돌봄 팁', label: '돌봄 팁' },
    { value: '시설 리뷰', label: '시설 리뷰' },
  ],
  건강관리: [
    { value: '', label: '전체' },
    { value: '운동', label: '운동' },
    { value: '식단', label: '식단' },
    { value: '정서/마음돌봄', label: '정서/마음돌봄' },
  ],
  사랑방: [
    { value: '', label: '전체' },
    { value: '가입 인사', label: '가입 인사' },
    { value: '고민 나눔', label: '고민 나눔' },
    { value: '취미', label: '취미' },
    { value: '기타', label: '기타' },
  ],
}

export const STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'hidden', label: '숨김' },
  { value: 'deleted', label: '삭제' },
]

export const REPORT_OPTIONS: FilterOption[] = [
  { value: '', label: '전체' },
  { value: 'true', label: '신고 있음' },
]