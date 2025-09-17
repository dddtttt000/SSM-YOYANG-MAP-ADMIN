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

interface PostFiltersProps {
  onFiltersChange: (filters: PostFiltersType) => void
  initialFilters?: PostFiltersType
}

const PostFilters = ({ onFiltersChange, initialFilters = {} }: PostFiltersProps) => {
  const [filters, setFilters] = useState<PostFiltersType>(initialFilters)

  const categories1 = [
    { value: '', label: '전체 카테고리' },
    { value: '요양찾기', label: '요양찾기' },
    { value: '사랑방', label: '사랑방' },
    { value: '건강관리', label: '건강관리' },
    // { value: 'general', label: '일반' },
    // { value: 'question', label: '질문' },
    // { value: 'notice', label: '공지' },
    // { value: 'event', label: '이벤트' },
    // { value: 'review', label: '후기' },
  ]

  const statusOptions = [
    { value: '', label: '전체 상태' },
    { value: 'active', label: '활성' },
    { value: 'hidden', label: '숨김' },
    { value: 'deleted', label: '삭제' },
  ]

  const reportOptions = [
    { value: '', label: '전체' },
    { value: 'true', label: '신고 있음' },
  ]

  const handleFilterChange = (key: keyof PostFiltersType, value: string | number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {}
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    const { search: _search, ...otherFilters } = filters
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

        <Select
          placeholder='대분류 선택'
          maxW='150px'
          size='md'
          value={filters.category1 || ''}
          onChange={e => handleFilterChange('category1', e.target.value)}
        >
          {categories1.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>

        <Select
          placeholder='상태 선택'
          maxW='130px'
          size='md'
          value={filters.status || ''}
          onChange={e => handleFilterChange('status', e.target.value)}
        >
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>

        <Select
          placeholder='신고 여부'
          maxW='130px'
          size='md'
          value={filters.hasReports ? 'true' : ''}
          onChange={e => handleFilterChange('hasReports', e.target.value === 'true' ? true : undefined)}
        >
          {reportOptions.map(report => (
            <option key={report.value} value={report.value}>
              {report.label}
            </option>
          ))}
        </Select>

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
            <WrapItem>
              <Badge colorScheme='blue' variant='subtle'>
                카테고리: {categories1.find(c => c.value === filters.category1)?.label}
                <IconButton
                  size='xs'
                  variant='ghost'
                  icon={<FiX size={12} />}
                  ml={1}
                  aria-label='카테고리 필터 제거'
                  onClick={() => handleFilterChange('category1', '')}
                />
              </Badge>
            </WrapItem>
          )}
          {filters.status && (
            <WrapItem>
              <Badge colorScheme='blue' variant='subtle'>
                상태: {statusOptions.find(s => s.value === filters.status)?.label}
                <IconButton
                  size='xs'
                  variant='ghost'
                  icon={<FiX size={12} />}
                  ml={1}
                  aria-label='상태 필터 제거'
                  onClick={() => handleFilterChange('status', '')}
                />
              </Badge>
            </WrapItem>
          )}
        </Wrap>
      )}
    </Box>
  )
}

export default PostFilters
