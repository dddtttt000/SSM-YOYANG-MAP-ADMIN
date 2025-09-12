/**
 * 날짜/시간 문자열을 'YYYY-MM-DD HH:MM' 형식으로 포맷팅합니다.
 * @param dateString - 포맷팅할 날짜/시간 문자열 (ISO 8601 형식)
 * @returns 포맷팅된 문자열. 입력이 유효하지 않으면 빈 문자열을 반환합니다.
 */
export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return ''

  return new Date(dateString)
    .toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(/\. /g, '-')
    .replace('.', '')
    .replace(', ', ' ')
    .replace(/-(\d{2}:\d{2})/, ' $1')
}

/**
 * formatDate 별칭 - 기존 코드와의 호환성을 위해 제공
 */
export const formatDate = formatDateTime
