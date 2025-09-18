export interface ReportOption {
  value: string
  label: string
}

export const REPORT_STATUS_OPTIONS: ReportOption[] = [
  { value: 'pending', label: '대기' },
  { value: 'reviewed', label: '검토중' },
  { value: 'resolved', label: '처리완료' },
]

export const REPORT_REASON_OPTIONS: ReportOption[] = [
  { value: 'spam', label: '스팸/광고성 내용' },
  { value: 'inappropriate', label: '욕설, 비방, 혐오 표현' },
  { value: 'harassment', label: '개인정보 침해' },
  { value: 'false_info', label: '잘못된 정보' },
  { value: 'copyright', label: '저작권 침해나 명예훼손' },
  { value: 'other', label: '기타' },
]