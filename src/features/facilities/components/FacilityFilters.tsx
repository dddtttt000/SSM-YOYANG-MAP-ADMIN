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
import { useSidoList, useSigunguList } from '../hooks/useFacilities'

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
  const { data: sidoList } = useSidoList()
  const { data: sigunguList } = useSigunguList(filters.sido_code)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 })
  }

  const handleSidoChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      sido_code: value === 'all' ? undefined : value,
      sigungu_code: undefined, // 시도 변경시 시군구 초기화
      page: 1
    })
  }

  const handleSigunguChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      sigungu_code: value === 'all' ? undefined : value,
      page: 1
    })
  }

  const handleRatingChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      rating: value === 'all' ? undefined : value,
      page: 1
    })
  }

  const clearSearch = () => {
    onFiltersChange({ ...filters, search: '', page: 1 })
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
          value={filters.sido_code || 'all'}
          onChange={(e) => handleSidoChange(e.target.value)}
          maxW="150px"
        >
          <option value="all">모든 시도</option>
          {sidoList?.map((sido) => (
            <option key={sido.code} value={sido.code}>
              {sido.name}
            </option>
          ))}
        </Select>

        <Select
          value={filters.sigungu_code || 'all'}
          onChange={(e) => handleSigunguChange(e.target.value)}
          maxW="150px"
          isDisabled={!filters.sido_code}
        >
          <option value="all">모든 시군구</option>
          {sigunguList?.map((sigungu) => (
            <option key={sigungu.code} value={sigungu.code}>
              {sigungu.name}
            </option>
          ))}
        </Select>

        <Select
          value={filters.rating || 'all'}
          onChange={(e) => handleRatingChange(e.target.value)}
          maxW="150px"
        >
          <option value="all">모든 등급</option>
          <option value="A">A등급</option>
          <option value="B">B등급</option>
          <option value="C">C등급</option>
          <option value="D">D등급</option>
          <option value="E">E등급</option>
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