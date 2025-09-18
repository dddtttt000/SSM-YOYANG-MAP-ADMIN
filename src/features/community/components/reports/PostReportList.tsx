import {
  Box,
  VStack,
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
  Select,
} from '@chakra-ui/react'
import { useState, useEffect, useCallback, memo } from 'react'
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
import { getContentStatusBadge } from '@/utils/statusBadge'
import { truncateText } from '@/utils/textUtils'
import ReportFilters from './ReportFilters'
import ReportStats from './ReportStats'

interface PostReportListProps {
  initialFilters?: PostReportFilters
}

interface PostReportRowProps {
  report: PostReportWithDetails
  borderColor: string
  hoverBg: string
  onStatusChange: (reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => void
  onReportClick: (report: PostReportWithDetails) => void
  isStatusChanging: boolean
}

const PostReportRow = memo(({
  report,
  borderColor,
  hoverBg,
  onStatusChange,
  onReportClick,
  isStatusChanging
}: PostReportRowProps) => {
  return (
    <Tr
      _hover={{ bg: hoverBg, cursor: 'pointer' }}
      borderBottom='1px'
      borderColor={borderColor}
      onClick={() => onReportClick(report)}
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
          getContentStatusBadge(report.post.status)
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
          onChange={e => onStatusChange(report.id, e.target.value as 'pending' | 'reviewed' | 'resolved')}
          isDisabled={isStatusChanging}
          maxW='160px'
        >
          <option value='pending'>대기</option>
          <option value='reviewed'>검토중</option>
          <option value='resolved'>✅ 처리완료</option>
        </Select>
      </Td>
    </Tr>
  )
})

const PostReportList = ({ initialFilters = {} }: PostReportListProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<PostReportFilters>({})

  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

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

  const handleStatusChange = useCallback((reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    updateStatusMutation.mutate({ reportId, status: newStatus })
  }, [updateStatusMutation])

  const handleFilterChange = useCallback((key: keyof PostReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }))
  }, [])

  const handleReportClick = useCallback((report: PostReportWithDetails) => {
    if (report.post?.id) {
      navigate(`/community/posts/${report.post.id}`, {
        state: {
          from: 'post-reports',
          filters,
          returnPath: '/community/reports/posts',
        },
      })
    }
  }, [navigate, filters])

  return (
    <Box>
      <ReportStats stats={stats} title="게시글" colorScheme="blue" />

      <ReportFilters<PostReportFilters>
        filters={filters}
        onFiltersChange={handleFilterChange}
        onClearFilters={() => setFilters({})}
      />

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
            {isLoading ? (
              <Tr>
                <Td colSpan={6}>
                  <Center py={8}>
                    <Spinner size='lg' color='blue.500' />
                  </Center>
                </Td>
              </Tr>
            ) : error ? (
              <Tr>
                <Td colSpan={6}>
                  <Alert status='error' rounded='md'>
                    <AlertIcon />
                    게시글 신고 데이터를 불러오는데 실패했습니다.
                  </Alert>
                </Td>
              </Tr>
            ) : reports?.length === 0 ? (
              <Tr>
                <Td colSpan={6}>
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
                </Td>
              </Tr>
            ) : (
              reports?.map((report: PostReportWithDetails) => (
                <PostReportRow
                  key={report.id}
                  report={report}
                  borderColor={borderColor}
                  hoverBg={hoverBg}
                  onStatusChange={handleStatusChange}
                  onReportClick={handleReportClick}
                  isStatusChanging={updateStatusMutation.isPending}
                />
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default PostReportList