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
  useDisclosure,
} from '@chakra-ui/react'
import { useState, useEffect, useCallback, memo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  commentReportService,
  type CommentReportWithDetails,
  type CommentReportFilters,
} from '../../services/commentReportService'
import { DEFAULT_PAGE_SIZE } from '@/types/pagination'
import Pagination from '@/components/common/Pagination'
import { REPORT_REASON_LABELS } from '../../types'
import { formatDate } from '@/utils/date'
import { getContentStatusBadge } from '@/utils/statusBadge'
import { truncateText } from '@/utils/textUtils'
import CommentDetailModal from '../comments/CommentDetailModal'
import ReportFilters from './ReportFilters'
import ReportStats from './ReportStats'

interface CommentReportListProps {
  initialFilters?: CommentReportFilters
}

interface CommentReportRowProps {
  report: CommentReportWithDetails
  borderColor: string
  hoverBg: string
  onStatusChange: (reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => void
  onReportClick: (report: CommentReportWithDetails) => void
  isStatusChanging: boolean
}

const CommentReportRow = memo(({
  report,
  borderColor,
  hoverBg,
  onStatusChange,
  onReportClick,
  isStatusChanging
}: CommentReportRowProps) => {
  return (
    <Tr
      _hover={{ bg: hoverBg, cursor: 'pointer' }}
      borderBottom='1px'
      borderColor={borderColor}
      onClick={() => onReportClick(report)}
    >
      {/* 댓글 내용 컬럼 */}
      <Td maxW='300px'>
        {report.comment ? (
          <Tooltip label={report.comment.content}>
            <Text fontSize='sm' lineHeight='1.4' color='gray.700'>
              {truncateText(report.comment.content, 50)}
            </Text>
          </Tooltip>
        ) : (
          <Text fontSize='sm' color='gray.500'>
            삭제된 댓글
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
        {report.comment?.status ? (
          getContentStatusBadge(report.comment.status)
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

const CommentReportList = ({ initialFilters = {} }: CommentReportListProps) => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<CommentReportFilters>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [selectedReport, setSelectedReport] = useState<CommentReportWithDetails | null>(null)
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure()

  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 초기 필터 적용
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
      }))
    }
  }, [initialFilters])

  const {
    data: reportsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['commentReports', filters],
    queryFn: () => commentReportService.getCommentReports(filters),
    retry: 1,
    staleTime: 5000,
  })

  const reports = reportsResponse?.data || []
  const pagination = reportsResponse?.pagination

  const { data: stats } = useQuery({
    queryKey: ['commentReportStats'],
    queryFn: () => commentReportService.getCommentReportStats(),
    staleTime: 60000,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: 'pending' | 'reviewed' | 'resolved' }) =>
      commentReportService.updateCommentReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentReports'] })
      queryClient.invalidateQueries({ queryKey: ['commentReportStats'] })
      queryClient.invalidateQueries({ queryKey: ['communityDashboardStats'] })
    },
  })

  const handleStatusChange = useCallback((reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    updateStatusMutation.mutate({ reportId, status: newStatus })
  }, [updateStatusMutation])

  const handleFilterChange = useCallback((key: keyof CommentReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1, // 필터 변경 시 첫 페이지로 이동
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }))
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      pageSize,
      page: 1, // 페이지 크기 변경 시 첫 페이지로 이동
    }))
  }, [])

  const handleReportClick = useCallback((report: CommentReportWithDetails) => {
    // 상세 모달 열기로 변경
    setSelectedReport(report)
    onDetailModalOpen()
  }, [onDetailModalOpen])

  const handleDetailModalClose = useCallback(() => {
    setSelectedReport(null)
    onDetailModalClose()
  }, [onDetailModalClose])

  return (
    <Box>
      <ReportStats stats={stats} title="댓글" colorScheme="purple" />

      <ReportFilters<CommentReportFilters>
        filters={filters}
        onFiltersChange={handleFilterChange}
        onClearFilters={() => setFilters({ page: 1, pageSize: DEFAULT_PAGE_SIZE })}
      />

      {/* 댓글 신고 목록 테이블 */}
      <Box overflowX='auto'>
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>댓글 내용</Th>
              <Th>신고자</Th>
              <Th>신고 사유</Th>
              <Th>댓글상태</Th>
              <Th>신고일</Th>
              <Th width='160px'>처리상태/관리</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={6}>
                  <Center py={8}>
                    <Spinner size='lg' color='purple.500' />
                  </Center>
                </Td>
              </Tr>
            ) : error ? (
              <Tr>
                <Td colSpan={6}>
                  <Alert status='error' rounded='md'>
                    <AlertIcon />
                    댓글 신고 데이터를 불러오는데 실패했습니다.
                  </Alert>
                </Td>
              </Tr>
            ) : reports?.length === 0 ? (
              <Tr>
                <Td colSpan={6}>
                  <Box textAlign='center' py={10}>
                    <VStack spacing={4}>
                      <Text color='gray.500' fontSize='lg'>
                        신고된 댓글이 없습니다.
                      </Text>
                      <Text color='gray.400' fontSize='sm'>
                        현재 처리 대기 중인 댓글 신고가 없습니다.
                      </Text>
                    </VStack>
                  </Box>
                </Td>
              </Tr>
            ) : (
              reports.map((report: CommentReportWithDetails) => (
                <CommentReportRow
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

      {/* 페이지네이션 */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      )}

      {/* 댓글 상세 모달 */}
      <CommentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        commentId={selectedReport?.comment?.id || null}
        mode="report"
        existingCommentData={selectedReport}
      />
    </Box>
  )
}

export default CommentReportList
