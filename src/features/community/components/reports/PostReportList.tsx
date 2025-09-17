import {
  Box,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Tooltip,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  Button,
  Select,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  postReportService,
  type PostReportWithDetails,
  type PostReportFilters,
} from '../../services/postReportService'
import {
  REPORT_REASON_LABELS,
} from '../../types'
import { formatDate } from '@/utils/date'
import { getPostStatusBadge } from '@/utils/statusBadge'
import { truncateText } from '@/utils/textUtils'

interface PostReportListProps {
  initialFilters?: PostReportFilters
}

const PostReportList = ({ initialFilters = {} }: PostReportListProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<PostReportFilters>({})

  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const summaryBg = useColorModeValue('blue.50', 'blue.900')

  // 초기 필터 적용
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters)
    }
  }, [initialFilters])

  const {
    data: reports,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['postReports', filters],
    queryFn: () => postReportService.getPostReports(filters),
    retry: 1,
    staleTime: 5000,
  })

  const { data: stats } = useQuery({
    queryKey: ['postReportStats'],
    queryFn: () => postReportService.getPostReportStats(),
    staleTime: 60000,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: 'pending' | 'reviewed' | 'resolved' }) =>
      postReportService.updatePostReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postReports'] })
      queryClient.invalidateQueries({ queryKey: ['postReportStats'] })
      queryClient.invalidateQueries({ queryKey: ['communityDashboardStats'] })
    },
  })

  const handleStatusChange = (reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    updateStatusMutation.mutate({ reportId, status: newStatus })
  }

  const handleFilterChange = (key: keyof PostReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }))
  }

  const handleReportClick = (report: PostReportWithDetails) => {
    if (report.post?.id) {
      navigate(`/community/posts/${report.post.id}`, {
        state: {
          from: 'post-reports',
          filters,
          returnPath: '/community/reports/posts',
        },
      })
    }
  }

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size='lg' color='blue.500' />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status='error' rounded='md'>
        <AlertIcon />
        게시글 신고 데이터를 불러오는데 실패했습니다.
      </Alert>
    )
  }

  return (
    <Box>
      {/* 요약 통계 */}
      <HStack spacing={4} mb={6} p={4} bg={summaryBg} rounded='md'>
        <VStack spacing={0}>
          <Text fontSize='sm' color='gray.600'>
            전체 게시글 신고
          </Text>
          <Text fontSize='xl' fontWeight='bold' color='gray.900'>
            {stats?.total || 0}건
          </Text>
        </VStack>
        <VStack spacing={0}>
          <Text fontSize='sm' color='gray.600'>
            처리 대기
          </Text>
          <Text fontSize='xl' fontWeight='bold' color='orange.600'>
            {stats?.statusStats.pending || 0}건
          </Text>
        </VStack>
        <VStack spacing={0}>
          <Text fontSize='sm' color='gray.600'>
            검토중
          </Text>
          <Text fontSize='xl' fontWeight='bold' color='blue.600'>
            {stats?.statusStats.reviewed || 0}건
          </Text>
        </VStack>
        <VStack spacing={0}>
          <Text fontSize='sm' color='gray.600'>
            처리완료
          </Text>
          <Text fontSize='xl' fontWeight='bold' color='green.600'>
            {stats?.statusStats.resolved || 0}건
          </Text>
        </VStack>
      </HStack>

      {/* 필터 */}
      <HStack spacing={4} mb={4}>
        <Select
          placeholder='상태를 선택하세요'
          size='sm'
          maxW='150px'
          value={filters.status || ''}
          onChange={e => handleFilterChange('status', e.target.value)}
        >
          <option value='pending'>대기</option>
          <option value='reviewed'>검토중</option>
          <option value='resolved'>처리완료</option>
        </Select>

        <Select
          placeholder='신고 사유를 선택하세요'
          size='sm'
          maxW='200px'
          value={filters.reason || ''}
          onChange={e => handleFilterChange('reason', e.target.value)}
        >
          <option value='spam'>스팸/광고성 내용</option>
          <option value='inappropriate'>욕설, 비방, 혐오 표현</option>
          <option value='harassment'>개인정보 침해</option>
          <option value='false_info'>잘못된 정보</option>
          <option value='copyright'>저작권 침해나 명예훼손</option>
          <option value='other'>기타</option>
        </Select>

        <Button size='sm' onClick={() => setFilters({})}>
          필터 초기화
        </Button>
      </HStack>

      {/* 게시글 신고 목록 테이블 */}
      <Box overflowX='auto'>
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>게시글 제목</Th>
              <Th>신고자</Th>
              <Th>신고 사유</Th>
              <Th>게시상태</Th>
              <Th>신고일</Th>
              <Th width='160px'>처리상태/관리</Th>
            </Tr>
          </Thead>
          <Tbody>
            {reports?.map((report: PostReportWithDetails) => (
              <Tr
                key={report.id}
                _hover={{ bg: hoverBg, cursor: 'pointer' }}
                borderBottom='1px'
                borderColor={borderColor}
                onClick={() => handleReportClick(report)}
              >
                <Td maxW='300px'>
                  {report.post ? (
                    <Tooltip label={report.post.title}>
                      <Text fontSize='sm' fontWeight='medium' lineHeight='1.4'>
                        {truncateText(report.post.title, 50)}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text fontSize='sm' color='gray.500'>
                      삭제된 게시글
                    </Text>
                  )}
                </Td>
                <Td>
                  <Text fontSize='sm'>{report.reporter?.nickname || `사용자 ${report.reporter_id}`}</Text>
                </Td>
                <Td>
                  <VStack spacing={1} align='flex-start'>
                    <Text fontSize='sm' fontWeight='medium'>
                      {REPORT_REASON_LABELS[report.reason] || report.reason}
                    </Text>
                    {report.description && (
                      <Text fontSize='xs' color='gray.600' lineHeight='1.4'>
                        {report.description.length > 100
                          ? `${report.description.substring(0, 100)}...`
                          : report.description}
                      </Text>
                    )}
                  </VStack>
                </Td>
                <Td>
                  {report.post?.status ? (
                    getPostStatusBadge(report.post.status)
                  ) : (
                    <Badge colorScheme='gray' size='sm'>
                      알 수 없음
                    </Badge>
                  )}
                </Td>
                <Td>
                  <Text fontSize='xs'>{formatDate(report.created_at)}</Text>
                </Td>
                <Td onClick={e => e.stopPropagation()}>
                  <Select
                    size='sm'
                    value={report.status}
                    onChange={e => handleStatusChange(report.id, e.target.value as 'pending' | 'reviewed' | 'resolved')}
                    isDisabled={updateStatusMutation.isPending}
                    maxW='160px'
                  >
                    <option value='pending'>대기</option>
                    <option value='reviewed'>검토중</option>
                    <option value='resolved'>✅ 처리완료</option>
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {reports?.length === 0 && (
        <Box textAlign='center' py={10}>
          <VStack spacing={4}>
            <Text color='gray.500' fontSize='lg'>
              신고된 게시글이 없습니다.
            </Text>
            <Text color='gray.400' fontSize='sm'>
              현재 처리 대기 중인 게시글 신고가 없습니다.
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  )
}

export default PostReportList