import {
  Box,
  Button,
  HStack,
  Select,
  Text,
  IconButton,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import { type PaginationInfo, PAGE_SIZE_OPTIONS } from '@/types/pagination'

interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isLoading?: boolean
}


// 새로운 페이지네이션 컴포넌트
const Pagination = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: PaginationProps) => {
  const { currentPage, pageSize, totalCount, totalPages, hasNext, hasPrevious } = pagination

  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const bg = useColorModeValue('white', 'gray.800')

  // 페이지 번호 생성 (현재 페이지 중심으로 최대 5개)
  const generatePageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    // 끝에서 시작점 조정
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  if (totalCount === 0) {
    return null
  }

  return (
    <Box
      p={4}
      bg={bg}
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      mt={4}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={4}
      >
        {/* 총 개수 및 페이지 정보 */}
        <Text fontSize="sm" color="gray.600" textAlign={{ base: 'center', md: 'left' }}>
          전체 <Text as="span" fontWeight="semibold">{totalCount.toLocaleString()}</Text>개 중{' '}
          <Text as="span" fontWeight="semibold">
            {((currentPage - 1) * pageSize + 1).toLocaleString()}
          </Text>
          -
          <Text as="span" fontWeight="semibold">
            {Math.min(currentPage * pageSize, totalCount).toLocaleString()}
          </Text>개 표시
        </Text>

        {/* 페이지 네비게이션 */}
        <HStack spacing={2}>
          {/* 첫 페이지 */}
          <IconButton
            aria-label="첫 페이지"
            icon={<FiChevronsLeft />}
            size="sm"
            variant="outline"
            isDisabled={!hasPrevious || isLoading}
            onClick={() => onPageChange(1)}
          />

          {/* 이전 페이지 */}
          <IconButton
            aria-label="이전 페이지"
            icon={<FiChevronLeft />}
            size="sm"
            variant="outline"
            isDisabled={!hasPrevious || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
          />

          {/* 페이지 번호들 */}
          {pageNumbers.map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? 'solid' : 'outline'}
              colorScheme={page === currentPage ? 'blue' : 'gray'}
              isDisabled={isLoading}
              onClick={() => onPageChange(page)}
              minW="40px"
            >
              {page}
            </Button>
          ))}

          {/* 다음 페이지 */}
          <IconButton
            aria-label="다음 페이지"
            icon={<FiChevronRight />}
            size="sm"
            variant="outline"
            isDisabled={!hasNext || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
          />

          {/* 마지막 페이지 */}
          <IconButton
            aria-label="마지막 페이지"
            icon={<FiChevronsRight />}
            size="sm"
            variant="outline"
            isDisabled={!hasNext || isLoading}
            onClick={() => onPageChange(totalPages)}
          />
        </HStack>

        {/* 페이지 크기 선택 */}
        <HStack spacing={2}>
          <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
            페이지당
          </Text>
          <Select
            size="sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            isDisabled={isLoading}
            maxW="80px"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
            개씩
          </Text>
        </HStack>
      </Flex>
    </Box>
  )
}

export default Pagination
