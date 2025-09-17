/**
 * 텍스트를 지정된 길이로 자르고 '...'을 추가하는 함수
 * @param text 자를 텍스트
 * @param maxLength 최대 길이 (기본값: 80)
 * @returns 잘린 텍스트
 */
export const truncateText = (text: string, maxLength: number = 80) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

/**
 * 텍스트를 단어 단위로 자르는 함수
 * @param text 자를 텍스트
 * @param maxLength 최대 길이
 * @returns 단어 단위로 잘린 텍스트
 */
export const truncateTextByWords = (text: string, maxLength: number = 80) => {
  if (!text) return ''
  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }

  return truncated + '...'
}

/**
 * HTML 태그를 제거하고 텍스트만 추출하는 함수
 * @param html HTML 문자열
 * @returns 순수 텍스트
 */
export const stripHtmlTags = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}