import {
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Box,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { FAQ_CATEGORIES } from '../constants'
import type { QuestionFilters, FAQCategory } from '../types'

interface QuestionFiltersProps {
  onFiltersChange: (filters: QuestionFilters) => void
  initialFilters?: QuestionFilters
}

const QuestionFiltersComponent = ({ onFiltersChange, initialFilters }: QuestionFiltersProps) => {
  const [filters, setFilters] = useState<QuestionFilters>({
    category: initialFilters?.category,
    search: initialFilters?.search || '',
  })

  const handleCategoryChange = (category: string) => {
    const newFilters = {
      ...filters,
      category: category === 'all' ? undefined : (category as FAQCategory),
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value
    setFilters(prev => ({ ...prev, search }))
  }

  const handleSearchSubmit = () => {
    onFiltersChange({
      ...filters,
      search: filters.search?.trim() || undefined,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleReset = () => {
    const resetFilters = { category: undefined, search: '' }
    setFilters(resetFilters)
    onFiltersChange({ category: undefined, search: undefined })
  }

  return (
    <Box>
      <HStack spacing="4" wrap="wrap">
        <Select
          width="200px"
          value={filters.category || 'all'}
          onChange={e => handleCategoryChange(e.target.value)}
        >
          <option value="all">전체 카테고리</option>
          {FAQ_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <InputGroup width="300px">
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="질문이나 답변 내용으로 검색..."
            value={filters.search}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </InputGroup>

        <Button onClick={handleSearchSubmit} colorScheme="blue" variant="outline">
          검색
        </Button>

        <Button onClick={handleReset} variant="ghost">
          초기화
        </Button>
      </HStack>
    </Box>
  )
}

export default QuestionFiltersComponent