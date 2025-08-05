import {
  HStack,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  ButtonGroup,
} from '@chakra-ui/react'
import { FiSearch, FiX, FiGrid, FiList } from 'react-icons/fi'
import { FacilityFilters as Filters } from '../services/facilityService'
import { useFacilityTypes } from '../hooks/useFacilities'

interface FacilityFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  viewMode: 'card' | 'table'
  onViewModeChange: (mode: 'card' | 'table') => void
}

const FacilityFilters = ({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange 
}: FacilityFiltersProps) => {
  const { data: facilityTypes } = useFacilityTypes()

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      type: value === 'all' ? undefined : value 
    })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      status: value === 'all' ? undefined : value 
    })
  }

  const clearSearch = () => {
    onFiltersChange({ ...filters, search: '' })
  }

  return (
    <HStack spacing="4" w="full" justify="space-between">
      <HStack spacing="4" flex="1">
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="시설명 또는 주소 검색"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {filters.search && (
            <Tooltip label="검색 초기화">
              <IconButton
                aria-label="검색 초기화"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                position="absolute"
                right="2"
                top="50%"
                transform="translateY(-50%)"
                onClick={clearSearch}
              />
            </Tooltip>
          )}
        </InputGroup>

        <Select
          value={filters.type || 'all'}
          onChange={(e) => handleTypeChange(e.target.value)}
          maxW="200px"
        >
          <option value="all">모든 유형</option>
          {facilityTypes?.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>

        <Select
          value={filters.status || 'all'}
          onChange={(e) => handleStatusChange(e.target.value)}
          maxW="200px"
        >
          <option value="all">모든 상태</option>
          <option value="active">운영중</option>
          <option value="inactive">미운영</option>
          <option value="maintenance">점검중</option>
        </Select>
      </HStack>

      <ButtonGroup size="sm" isAttached variant="outline">
        <Tooltip label="카드 뷰">
          <IconButton
            aria-label="카드 뷰"
            icon={<FiGrid />}
            isActive={viewMode === 'card'}
            onClick={() => onViewModeChange('card')}
          />
        </Tooltip>
        <Tooltip label="테이블 뷰">
          <IconButton
            aria-label="테이블 뷰"
            icon={<FiList />}
            isActive={viewMode === 'table'}
            onClick={() => onViewModeChange('table')}
          />
        </Tooltip>
      </ButtonGroup>
    </HStack>
  )
}

export default FacilityFilters