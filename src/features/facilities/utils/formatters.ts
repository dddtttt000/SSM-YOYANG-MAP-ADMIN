import { Facility } from '@/types/database.types'

/**
 * 시설의 전화번호를 포맷팅합니다.
 * area_code + country_number + phone_number 형식으로 결합합니다.
 * 예: 02-3456-9932
 */
export const formatPhoneNumber = (facility: Facility): string => {
  const { area_code, country_number, phone_number } = facility
  
  // 모든 필드가 없으면 '-' 반환
  if (!area_code && !country_number && !phone_number) {
    return '-'
  }
  
  // 각 부분을 배열에 담아서 필터링
  const parts = [area_code, country_number, phone_number].filter(Boolean)
  
  // 하이픈으로 연결
  return parts.join('-')
}