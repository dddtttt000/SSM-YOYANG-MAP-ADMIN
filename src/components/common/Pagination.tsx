import { HStack, Button, Text, Select, IconButton } from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  totalItems: number
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    const halfRange = Math.floor(maxPagesToShow / 2)

    let startPage = Math.max(1, currentPage - halfRange)
    let endPage = Math.min(totalPages, currentPage + halfRange)

    if (currentPage <= halfRange) {
      endPage = Math.min(totalPages, maxPagesToShow)
    }

    if (currentPage + halfRange >= totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <HStack justify='space-between' w='full' py='4'>
      <HStack spacing='2'>
        <Text fontSize='sm' color='gray.600'>
          페이지당 표시:
        </Text>
        <Select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))} size='sm' width='80px'>
          <option value={10}>10개</option>
          <option value={20}>20개</option>
          <option value={50}>50개</option>
          <option value={100}>100개</option>
        </Select>
      </HStack>

      <HStack spacing='4'>
        <Text fontSize='sm' color='gray.600'>
          {totalItems}개 중 {startItem}-{endItem}
        </Text>

        <HStack spacing='1'>
          <IconButton
            aria-label='처음 페이지'
            icon={<FiChevronsLeft />}
            size='sm'
            variant='ghost'
            onClick={() => onPageChange(1)}
            isDisabled={currentPage === 1}
          />
          <IconButton
            aria-label='이전 페이지'
            icon={<FiChevronLeft />}
            size='sm'
            variant='ghost'
            onClick={() => onPageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
          />

          {getPageNumbers().map(page => (
            <Button
              key={page}
              size='sm'
              variant={page === currentPage ? 'solid' : 'ghost'}
              colorScheme={page === currentPage ? 'brand' : 'gray'}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}

          <IconButton
            aria-label='다음 페이지'
            icon={<FiChevronRight />}
            size='sm'
            variant='ghost'
            onClick={() => onPageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          />
          <IconButton
            aria-label='마지막 페이지'
            icon={<FiChevronsRight />}
            size='sm'
            variant='ghost'
            onClick={() => onPageChange(totalPages)}
            isDisabled={currentPage === totalPages}
          />
        </HStack>
      </HStack>
    </HStack>
  )
}

export default Pagination
