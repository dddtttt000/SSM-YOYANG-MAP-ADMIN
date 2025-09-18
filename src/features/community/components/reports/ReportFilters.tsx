import { HStack, Select, Button } from '@chakra-ui/react'
import { REPORT_STATUS_OPTIONS, REPORT_REASON_OPTIONS } from '../../constants/reportOptions'

interface BaseReportFilters {
  status?: string
  reason?: string
}

interface ReportFiltersProps<T extends BaseReportFilters = BaseReportFilters> {
  filters: T
  onFiltersChange: (key: keyof T, value: string) => void
  onClearFilters: () => void
}

const ReportFilters = <T extends BaseReportFilters>({
  filters,
  onFiltersChange,
  onClearFilters
}: ReportFiltersProps<T>) => {
  return (
    <HStack spacing={4} mb={4}>
      <Select
        placeholder='상태를 선택하세요'
        size='sm'
        maxW='150px'
        value={filters.status || ''}
        onChange={e => onFiltersChange('status', e.target.value)}
      >
        {REPORT_STATUS_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        placeholder='신고 사유를 선택하세요'
        size='sm'
        maxW='200px'
        value={filters.reason || ''}
        onChange={e => onFiltersChange('reason', e.target.value)}
      >
        {REPORT_REASON_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Button size='sm' onClick={onClearFilters}>
        필터 초기화
      </Button>
    </HStack>
  )
}

export default ReportFilters