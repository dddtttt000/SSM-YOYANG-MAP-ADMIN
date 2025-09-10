import { HStack, Input, Select, InputGroup, InputLeftElement, IconButton, Tooltip } from '@chakra-ui/react'
import { FiSearch, FiX } from 'react-icons/fi'
import { AdminUserFilters as Filters } from '../services/adminUserService'

interface AdminUserFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

const AdminUserFilters = ({ filters, onFiltersChange }: AdminUserFiltersProps) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      role: value === 'all' ? undefined : (value as 'super_admin' | 'admin'),
    })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value === 'all' ? undefined : value === 'active',
    })
  }

  const clearSearch = () => {
    onFiltersChange({ ...filters, search: '' })
  }

  return (
    <HStack spacing='4' w='full'>
      <InputGroup maxW='300px'>
        <InputLeftElement pointerEvents='none'>
          <FiSearch color='gray.400' />
        </InputLeftElement>
        <Input
          placeholder='이름 또는 이메일 검색'
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

      <Select value={filters.role || 'all'} onChange={e => handleRoleChange(e.target.value)} maxW='200px'>
        <option value='all'>모든 역할</option>
        <option value='super_admin'>최고 관리자</option>
        <option value='admin'>관리자</option>
      </Select>

      <Select
        value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
        onChange={e => handleStatusChange(e.target.value)}
        maxW='200px'
      >
        <option value='all'>모든 상태</option>
        <option value='active'>활성</option>
        <option value='inactive'>비활성</option>
      </Select>
    </HStack>
  )
}

export default AdminUserFilters
