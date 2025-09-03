import { HStack, Input, Select, InputGroup, InputLeftElement, IconButton, Tooltip, Button } from '@chakra-ui/react'
import { FiSearch, FiX, FiDownload } from 'react-icons/fi'
import { MemberFilters as Filters } from '../services/memberService'
import { useExportMembers } from '../hooks/useMembers'

interface MemberFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

const MemberFilters = ({ filters, onFiltersChange }: MemberFiltersProps) => {
  const exportMembers = useExportMembers()

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    })
  }

  const clearSearch = () => {
    onFiltersChange({ ...filters, search: '' })
  }

  const handleExport = () => {
    exportMembers.mutate(filters)
  }

  return (
    <HStack spacing='4' w='full'>
      <InputGroup maxW='300px'>
        <InputLeftElement pointerEvents='none'>
          <FiSearch color='gray.400' />
        </InputLeftElement>
        <Input
          placeholder='이름, 이메일, 전화번호 검색'
          value={filters.search || ''}
          onChange={e => handleSearchChange(e.target.value)}
        />
        {filters.search && (
          <Tooltip label='검색 초기화'>
            <IconButton
              aria-label='검색 초기화'
              icon={<FiX />}
              size='sm'
              variant='ghost'
              position='absolute'
              right='2'
              top='50%'
              transform='translateY(-50%)'
              onClick={clearSearch}
            />
          </Tooltip>
        )}
      </InputGroup>

      <Select value={filters.status || 'all'} onChange={e => handleStatusChange(e.target.value)} maxW='200px'>
        <option value='all'>모든 상태</option>
        <option value='active'>활성</option>
        <option value='inactive'>비활성</option>
        <option value='suspended'>정지</option>
        <option value='pending'>대기</option>
      </Select>

      <Button
        leftIcon={<FiDownload />}
        variant='outline'
        onClick={handleExport}
        isLoading={exportMembers.isPending}
        loadingText='내보내는 중...'
      >
        내보내기
      </Button>
    </HStack>
  )
}

export default MemberFilters
