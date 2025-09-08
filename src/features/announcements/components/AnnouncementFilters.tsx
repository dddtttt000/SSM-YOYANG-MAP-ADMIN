import {
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Box,
  Switch,
  FormControl,
  FormLabel,
  VStack,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { ANNOUNCEMENT_CATEGORIES } from '../types'
import type { AnnouncementFilters, AnnouncementCategory } from '../types'

interface AnnouncementFiltersProps {
  onFiltersChange: (filters: AnnouncementFilters) => void
  initialFilters?: AnnouncementFilters
}

const AnnouncementFiltersComponent = ({ 
  onFiltersChange, 
  initialFilters 
}: AnnouncementFiltersProps) => {
  const [filters, setFilters] = useState<AnnouncementFilters>({
    category: initialFilters?.category,
    search: initialFilters?.search || '',
    isActive: initialFilters?.isActive,
    isImportant: initialFilters?.isImportant,
  })

  const handleCategoryChange = (category: string) => {
    const newFilters = {
      ...filters,
      category: category === 'all' ? undefined : (category as AnnouncementCategory),
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

  const handleActiveFilterChange = (checked: boolean) => {
    const newFilters = {
      ...filters,
      isActive: checked ? true : undefined,
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleImportantFilterChange = (checked: boolean) => {
    const newFilters = {
      ...filters,
      isImportant: checked ? true : undefined,
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = { 
      category: undefined, 
      search: '', 
      isActive: undefined, 
      isImportant: undefined 
    }
    setFilters(resetFilters)
    onFiltersChange({ 
      category: undefined, 
      search: undefined, 
      isActive: undefined, 
      isImportant: undefined 
    })
  }

  return (
    <Box>
      <VStack spacing="4" align="stretch">
        <HStack spacing="4" wrap="wrap">
          <Select
            width="200px"
            value={filters.category || 'all'}
            onChange={e => handleCategoryChange(e.target.value)}
          >
            <option value="all">전체 카테고리</option>
            {ANNOUNCEMENT_CATEGORIES.map(category => (
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
              placeholder="제목이나 내용으로 검색..."
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

        <HStack spacing="6">
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="active-filter" mb="0" fontSize="sm">
              게시중만
            </FormLabel>
            <Switch
              id="active-filter"
              isChecked={filters.isActive === true}
              onChange={e => handleActiveFilterChange(e.target.checked)}
              size="sm"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="important-filter" mb="0" fontSize="sm">
              중요 공지만
            </FormLabel>
            <Switch
              id="important-filter"
              isChecked={filters.isImportant === true}
              onChange={e => handleImportantFilterChange(e.target.checked)}
              size="sm"
            />
          </FormControl>
        </HStack>
      </VStack>
    </Box>
  )
}

export default AnnouncementFiltersComponent