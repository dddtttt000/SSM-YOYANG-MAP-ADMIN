import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  VStack,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Button,
  Input,
  Select,
  IconButton,
  useBreakpointValue,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { inquiryService } from '../services/inquiryService'
import { formatDate } from '@/utils/date'
import type { InquiryFilters, InquirySorting } from '../types/inquiry.types'

const ServiceInquiriesPage = () => {
  const navigate = useNavigate()
  
  // State
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [filters, setFilters] = useState<InquiryFilters>({
    status: 'all',
    search: ''
  })
  const [sorting, setSorting] = useState<InquirySorting>({
    field: 'created_at',
    order: 'desc'
  })
  const [searchInput, setSearchInput] = useState('')

  // Responsive
  const isMobile = useBreakpointValue({ base: true, md: false })

  // 서비스 문의 목록 조회
  const {
    data: inquiriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['service-inquiries', page, limit, filters, sorting],
    queryFn: () => inquiryService.getInquiries(page, limit, filters, sorting),
  })

  // 통계 조회
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ['service-inquiries-stats'],
    queryFn: () => inquiryService.getInquiryStats(),
  })

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }))
    setPage(1)
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput.trim() }))
    setPage(1)
  }

  const handleSort = (field: string) => {
    setSorting(prev => ({
      field: field as any,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }))
  }

  const handleViewDetail = (inquiryId: number) => {
    navigate(`/service-inquiries/${inquiryId}`)
  }


  const getStatusBadge = (status: string) => {
    return status === 'answered' ? (
      <Badge colorScheme="green" variant="solid">답변 완료</Badge>
    ) : (
      <Badge colorScheme="yellow" variant="solid">답변 대기</Badge>
    )
  }


  return (
    <Container maxW="container.xl" py="8">
      <VStack align="stretch" spacing="8">
        {/* 헤더 */}
        <Box>
          <Heading size="lg" mb="2">
            서비스 문의 관리
          </Heading>
          <Text color="gray.600">사용자들의 서비스 문의를 확인하고 답변할 수 있습니다.</Text>
        </Box>

        {/* 통계 */}
        {!isStatsLoading && stats && (
          <HStack spacing="4" wrap="wrap">
            <Badge colorScheme="blue" p="2" fontSize="md">
              전체: {stats.total}개
            </Badge>
            <Badge colorScheme="yellow" p="2" fontSize="md">
              답변 대기: {stats.pending}개
            </Badge>
            <Badge colorScheme="green" p="2" fontSize="md">
              답변 완료: {stats.answered}개
            </Badge>
          </HStack>
        )}

        {/* 필터 및 검색 */}
        <Card>
          <CardBody>
            <Flex direction={isMobile ? 'column' : 'row'} gap="4" align="flex-end">
              <Box>
                <Text mb="2" fontSize="sm" fontWeight="semibold">상태</Text>
                <Select
                  value={filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  w="140px"
                >
                  <option value="all">전체</option>
                  <option value="pending">답변 대기</option>
                  <option value="answered">답변 완료</option>
                </Select>
              </Box>
              
              <Box flex="1" maxW="300px">
                <Text mb="2" fontSize="sm" fontWeight="semibold">검색</Text>
                <HStack>
                  <Input
                    placeholder="제목, 내용, 이메일로 검색"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} colorScheme="blue">
                    검색
                  </Button>
                </HStack>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* 서비스 문의 목록 */}
        <Card>
          <CardBody>
            {isLoading ? (
              <Box textAlign="center" py="12">
                <Spinner size="lg" />
                <Text mt="4" color="gray.500">
                  문의 목록을 불러오는 중...
                </Text>
              </Box>
            ) : error ? (
              <Alert status="error">
                <AlertIcon />
                {error instanceof Error ? error.message : '서비스 문의를 불러오는데 실패했습니다.'}
              </Alert>
            ) : (
              <VStack align="stretch" spacing="4">
                {inquiriesData?.data && inquiriesData.data.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb="4">
                      총 {inquiriesData.pagination.total}개의 서비스 문의
                    </Text>
                  </Box>
                )}
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th cursor="pointer" onClick={() => handleSort('id')}>
                          ID
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort('status')}>
                          상태
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort('title')}>
                          제목
                        </Th>
                        <Th>이메일</Th>
                        <Th>휴대폰</Th>
                        <Th cursor="pointer" onClick={() => handleSort('created_at')}>
                          문의일시
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {inquiriesData?.data.length === 0 ? (
                        <Tr>
                          <Td colSpan={6}>
                            <Box textAlign="center" py="12">
                              <Text color="gray.500">등록된 서비스 문의가 없습니다.</Text>
                            </Box>
                          </Td>
                        </Tr>
                      ) : (
                        inquiriesData?.data.map((inquiry) => (
                          <Tr 
                            key={inquiry.id}
                            cursor="pointer" 
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => handleViewDetail(inquiry.id)}
                          >
                            <Td>{inquiry.id}</Td>
                            <Td>{getStatusBadge(inquiry.status)}</Td>
                            <Td maxW="200px" isTruncated>{inquiry.title}</Td>
                            <Td>{inquiry.email}</Td>
                            <Td>{inquiry.phone}</Td>
                            <Td>{formatDate(inquiry.created_at)}</Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* 페이지네이션 */}
        {inquiriesData?.pagination && inquiriesData.pagination.totalPages > 1 && (
          <Flex justify="center" align="center" gap="4">
            <IconButton
              aria-label="이전 페이지"
              icon={<ChevronLeftIcon />}
              isDisabled={page <= 1}
              onClick={() => setPage(prev => prev - 1)}
            />
            
            <HStack spacing="1">
              {Array.from({ length: Math.min(5, inquiriesData.pagination.totalPages) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <Button
                    key={pageNumber}
                    size="sm"
                    variant={page === pageNumber ? "solid" : "ghost"}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </HStack>
            
            <IconButton
              aria-label="다음 페이지"
              icon={<ChevronRightIcon />}
              isDisabled={page >= inquiriesData.pagination.totalPages}
              onClick={() => setPage(prev => prev + 1)}
            />
            
            <Text fontSize="sm" color="gray.600">
              {page} / {inquiriesData.pagination.totalPages} 페이지
            </Text>
          </Flex>
        )}
      </VStack>
    </Container>
  )
}

export default ServiceInquiriesPage