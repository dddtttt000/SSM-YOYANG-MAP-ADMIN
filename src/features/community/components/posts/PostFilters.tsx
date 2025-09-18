import { useState } from 'react'
import {
  Box,
  HStack,
  Input,
  Select,
  Button,
  InputGroup,
  InputLeftElement,
  Badge,
  Wrap,
  WrapItem,
  IconButton,
} from '@chakra-ui/react'
import { FiSearch, FiX } from 'react-icons/fi'
import type { PostFilters as PostFiltersType } from '../../services'
import { CATEGORIES_1, CATEGORIES_2_MAP, STATUS_OPTIONS, REPORT_OPTIONS } from '../../constants/filterOptions'

interface PostFiltersProps {
  onFiltersChange: (filters: PostFiltersType) => void
  initialFilters?: PostFiltersType
}

const PostFilters = ({ onFiltersChange, initialFilters = {} }: PostFiltersProps) => {
  const [filters, setFilters] = useState<PostFiltersType>(initialFilters)

  const FilterBadge = ({
    label,
    value,
    colorScheme = 'blue',
    onRemove
  }: {
    label: string
    value: string
    colorScheme?: string
    onRemove: () => void
  }) => (
    <WrapItem>
      <Badge colorScheme={colorScheme} variant='subtle'>
        {label}: {value}
        <IconButton
          size='xs'
          variant='ghost'
          icon={<FiX size={12} />}
          ml={1}
          aria-label={`${label} 필터 제거`}
          onClick={onRemove}
        />
      </Badge>
    </WrapItem>
  )

  const FilterSelect = ({
    placeholder,
    options,
    value,
    onChange,
    maxW = '150px',
    isDisabled = false
  }: {
    placeholder: string
    options: { value: string; label: string }[]
    value: string
    onChange: (value: string) => void
    maxW?: string
    isDisabled?: boolean
  }) => (
    <Select
      placeholder={placeholder}
      maxW={maxW}
      size='md'
      value={value}
      onChange={e => onChange(e.target.value)}
      isDisabled={isDisabled}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )

  const getAvailableCategories2 = () => {
    if (!filters.category1 || filters.category1 === '') {
      return [{ value: '', label: '대분류를 먼저 선택하세요' }]
    }
    return CATEGORIES_2_MAP[filters.category1] || []
  }

  const handleFilterChange = (key: keyof PostFiltersType, value: string | number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value }

    // 대분류가 변경되면 소분류 초기화
    if (key === 'category1') {
      newFilters.category2 = ''
    }

    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {}
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    const { ...otherFilters } = filters
    return Object.values(otherFilters).filter(value => value !== undefined && value !== '' && value !== null).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Box>
      <HStack spacing={4} mb={4} flexWrap='wrap'>
        <InputGroup maxW='400px'>
          <InputLeftElement pointerEvents='none'>
            <FiSearch size={16} />
          </InputLeftElement>
          <Input
            placeholder='제목으로 검색...'
            value={filters.search || ''}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
        </InputGroup>

        <FilterSelect
          placeholder='대분류 선택'
          options={CATEGORIES_1}
          value={filters.category1 || ''}
          onChange={value => handleFilterChange('category1', value)}
        />

        <FilterSelect
          placeholder='소분류 선택'
          options={getAvailableCategories2()}
          value={filters.category2 || ''}
          onChange={value => handleFilterChange('category2', value)}
          isDisabled={!filters.category1 || filters.category1 === ''}
        />

        <FilterSelect
          placeholder='상태 선택'
          options={STATUS_OPTIONS}
          value={filters.status || ''}
          onChange={value => handleFilterChange('status', value)}
          maxW='130px'
        />

        <FilterSelect
          placeholder='신고 여부'
          options={REPORT_OPTIONS}
          value={filters.hasReports ? 'true' : ''}
          onChange={value => handleFilterChange('hasReports', value === 'true' ? true : undefined)}
          maxW='130px'
        />

        {activeFiltersCount > 0 && (
          <Button leftIcon={<FiX size={16} />} variant='ghost' size='sm' onClick={clearFilters}>
            초기화
          </Button>
        )}
      </HStack>

      {/* 활성 필터 표시 */}
      {activeFiltersCount > 0 && (
        <Wrap spacing={2} mb={4}>
          {filters.category1 && (
            <FilterBadge
              label="대분류"
              value={CATEGORIES_1.find(c => c.value === filters.category1)?.label || ''}
              onRemove={() => handleFilterChange('category1', '')}
            />
          )}
          {filters.category2 && (
            <FilterBadge
              label="소분류"
              value={getAvailableCategories2().find(c => c.value === filters.category2)?.label || ''}
              colorScheme="green"
              onRemove={() => handleFilterChange('category2', '')}
            />
          )}
          {filters.status && (
            <FilterBadge
              label="상태"
              value={STATUS_OPTIONS.find(s => s.value === filters.status)?.label || ''}
              onRemove={() => handleFilterChange('status', '')}
            />
          )}
        </Wrap>
      )}
    </Box>
  )
}

export default PostFilters
