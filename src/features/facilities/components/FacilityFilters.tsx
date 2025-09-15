import {
  HStack,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  ButtonGroup,
  Checkbox,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  Button,
  Wrap,
  WrapItem,
  Badge,
  Box,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FiSearch, FiX, FiGrid, FiList, FiFilter } from 'react-icons/fi'
import { FacilityFilters as Filters } from '../services/facilityService'
import { useSidoList, useSigunguList, useFacilityTypesWithCount } from '../hooks/useFacilities'
import { getFacilityTypeLabel } from '../constants/facilityTypes'

interface FacilityFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  viewMode: 'card' | 'table'
  onViewModeChange: (mode: 'card' | 'table') => void
}

const FacilityFilters = ({ filters, onFiltersChange, viewMode, onViewModeChange }: FacilityFiltersProps) => {
  const { data: sidoList } = useSidoList()
  const { data: sigunguList } = useSigunguList(filters.sido_code)
  const { data: facilityTypes } = useFacilityTypesWithCount()

  const selectedTypeCodes = filters.type_codes || []

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 })
  }

  const handleSidoChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sido_code: value === 'all' ? undefined : value,
      sigungu_code: undefined, // 시도 변경시 시군구 초기화
      page: 1,
    })
  }

  const handleSigunguChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sigungu_code: value === 'all' ? undefined : value,
      page: 1,
    })
  }

  const handleRatingChange = (value: string) => {
    onFiltersChange({
      ...filters,
      rating: value === 'all' ? undefined : value,
      page: 1,
    })
  }

  const clearSearch = () => {
    onFiltersChange({ ...filters, search: '', page: 1 })
  }

  const handleShowAllChange = (checked: boolean) => {
    onFiltersChange({ ...filters, showAll: checked, page: 1 })
  }

  const handleTypeToggle = (typeCode: string) => {
    const newTypeCodes = selectedTypeCodes.includes(typeCode)
      ? selectedTypeCodes.filter(code => code !== typeCode)
      : [...selectedTypeCodes, typeCode]

    onFiltersChange({ ...filters, type_codes: newTypeCodes, page: 1 })
  }

  const clearTypeFilters = () => {
    onFiltersChange({ ...filters, type_codes: [], page: 1 })
  }

  return (
    <Box w='full'>
      <HStack spacing='4' w='full' justify='space-between' flexWrap='wrap' gap='4'>
        <Wrap spacing='4' flex='1' align='center'>
          <WrapItem>
            <InputGroup maxW='300px' minW='250px'>
              <InputLeftElement pointerEvents='none'>
                <FiSearch color='gray.400' />
              </InputLeftElement>
              <Input
                placeholder='시설명 또는 주소 검색'
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
          </WrapItem>

          <WrapItem>
            <Select value={filters.sido_code || 'all'} onChange={e => handleSidoChange(e.target.value)} maxW='150px' minW='120px'>
              <option value='all'>모든 시도</option>
              {sidoList?.map(sido => (
                <option key={sido.code} value={sido.code}>
                  {sido.name}
                </option>
              ))}
            </Select>
          </WrapItem>

          <WrapItem>
            <Select
              value={filters.sigungu_code || 'all'}
              onChange={e => handleSigunguChange(e.target.value)}
              maxW='150px'
              minW='120px'
              isDisabled={!filters.sido_code}
            >
              <option value='all'>모든 시군구</option>
              {sigunguList?.map(sigungu => (
                <option key={sigungu.code} value={sigungu.code}>
                  {sigungu.name}
                </option>
              ))}
            </Select>
          </WrapItem>

          <WrapItem>
            <Select value={filters.rating || 'all'} onChange={e => handleRatingChange(e.target.value)} maxW='150px' minW='120px'>
              <option value='all'>모든 등급</option>
              <option value='A'>A등급</option>
              <option value='B'>B등급</option>
              <option value='C'>C등급</option>
              <option value='D'>D등급</option>
              <option value='E'>E등급</option>
            </Select>
          </WrapItem>

          <WrapItem>
            <Popover placement='bottom-start'>
              <PopoverTrigger>
                <Button
                  size='sm'
                  leftIcon={<FiFilter />}
                  variant={selectedTypeCodes.length > 0 ? 'solid' : 'outline'}
                  colorScheme={selectedTypeCodes.length > 0 ? 'brand' : 'gray'}
                >
                  시설 유형 {selectedTypeCodes.length > 0 && `(${selectedTypeCodes.length})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent width='600px'>
                <PopoverHeader>
                  <HStack justify='space-between'>
                    <Text>시설 유형 선택</Text>
                    {selectedTypeCodes.length > 0 && (
                      <Button size='xs' variant='ghost' onClick={clearTypeFilters}>
                        초기화
                      </Button>
                    )}
                  </HStack>
                </PopoverHeader>
                <PopoverCloseButton />
                <PopoverBody maxH='400px' overflowY='auto'>
                  <VStack align='stretch' spacing='2'>
                    <Text fontSize='sm' color='gray.600' mb='2'>
                      클릭하여 필터링할 시설 유형을 선택하세요
                    </Text>
                    <Wrap spacing='2'>
                      {facilityTypes?.map(type => (
                        <WrapItem key={type.code}>
                          <Box
                            as='button'
                            onClick={() => handleTypeToggle(type.code)}
                            borderWidth='1px'
                            borderRadius='md'
                            px='3'
                            py='2'
                            bg={selectedTypeCodes.includes(type.code) ? 'brand.50' : 'white'}
                            borderColor={selectedTypeCodes.includes(type.code) ? 'brand.500' : 'gray.200'}
                            _hover={{ borderColor: 'brand.500' }}
                            transition='all 0.2s'
                          >
                            <VStack spacing='1' align='start'>
                              <HStack spacing='2'>
                                <Badge colorScheme={selectedTypeCodes.includes(type.code) ? 'brand' : 'gray'} fontSize='sm'>
                                  {type.code}
                                </Badge>
                                <Text fontSize='xs' color='gray.500'>
                                  ({type.count}개)
                                </Text>
                              </HStack>
                              <Text fontSize='xs' textAlign='left'>
                                {getFacilityTypeLabel(type.code)}
                              </Text>
                            </VStack>
                          </Box>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </WrapItem>

          <WrapItem>
            <Checkbox isChecked={filters.showAll || false} onChange={e => handleShowAllChange(e.target.checked)}>
              등록된 모든 시설 보기
            </Checkbox>
          </WrapItem>
        </Wrap>

        <Box>
          <ButtonGroup size='sm' isAttached variant='outline'>
            <Tooltip label='카드 뷰'>
              <IconButton
                aria-label='카드 뷰'
                icon={<FiGrid />}
                isActive={viewMode === 'card'}
                onClick={() => onViewModeChange('card')}
              />
            </Tooltip>
            <Tooltip label='테이블 뷰'>
              <IconButton
                aria-label='테이블 뷰'
                icon={<FiList />}
                isActive={viewMode === 'table'}
                onClick={() => onViewModeChange('table')}
              />
            </Tooltip>
          </ButtonGroup>
        </Box>
      </HStack>
    </Box>
  )
}

export default FacilityFilters
