// FAQ 카테고리 상수
export const FAQ_CATEGORIES = [
  '회원',
  '서비스', 
  'AI추천',
  '시설정보',
  '기타'
] as const

export type FAQCategory = typeof FAQ_CATEGORIES[number]

// 카테고리별 설명
export const FAQ_CATEGORY_DESCRIPTIONS: Record<FAQCategory, string> = {
  '회원': '회원가입, 로그인, 프로필 관련 질문',
  '서비스': '서비스 이용 방법, 기능 설명',
  'AI추천': 'AI 추천 시스템 관련 질문',
  '시설정보': '시설 등록, 정보 수정 관련',
  '기타': '기타 문의사항'
}