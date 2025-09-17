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
  reportService,
  type CommunityReportWithDetails,
  type ReportFilters,
} from '../../services/reportService'
import {
  REPORT_REASON_LABELS,
} from '../../types'
import { formatDate } from '@/utils/date'
import { getPostStatusBadge } from '@/utils/statusBadge'
import { truncateText } from '@/utils/textUtils'

interface CommunityReportListProps {
  initialFilters?: ReportFilters
}

const CommunityReportList = ({ initialFilters = {} }: CommunityReportListProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<ReportFilters>({})

  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // 초기 필터 적용
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters)
    }
  }, [initialFilters])
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const summaryBg = useColorModeValue('blue.50', 'blue.900')

  const {
    data: reports,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['communityReports', filters],
    queryFn: () => reportService.getReports(filters),
    retry: 1,
    staleTime: 5000,
  })

  const { data: stats } = useQuery({
    queryKey: ['reportStats'],
    queryFn: () => reportService.getReportStats(),
    staleTime: 60000,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: 'pending' | 'reviewed' | 'resolved' }) =>
      reportService.updateReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityReports'] })
      queryClient.invalidateQueries({ queryKey: ['reportStats'] })
    },
  })

  const handleStatusChange = (reportId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    updateStatusMutation.mutate({ reportId, status: newStatus })
  }

  const getReportTypeBadge = (post: any, comment: any) => {
    if (post && !comment) {
      return (
        <Badge colorScheme='blue' size='sm'>
          게시글
        </Badge>
      )
    } else if (comment && !post) {
      return (
        <Badge colorScheme='purple' size='sm'>
          댓글
        </Badge>
      )
    } else {
      return (
        <Badge colorScheme='gray' size='sm'>
          기타
        </Badge>
      )
    }
  }


  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }))
  }

  const handleReportClick = (report: CommunityReportWithDetails) => {
    // 게시글 신고인 경우
    if (report.post?.id) {
      navigate(`/community/posts/${report.post.id}`, {
        state: {
          from: 'reports',
          filters,
          returnPath: '/community',
        },
      })
    }
    // 댓글 신고인 경우 - 댓글이 속한 게시글로 이동
    else if (report.comment?.post_id) {
      navigate(`/community/posts/${report.comment.post_id}`, {
        state: {
          from: 'reports',
          filters,
          returnPath: '/community',
          highlightCommentId: report.comment.id, // 댓글 하이라이트용
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
        신고 데이터를 불러오는데 실패했습니다.
      </Alert>
    )
  }

  return (
    <Box>
      {/* 요약 통계 */}
      <HStack spacing={4} mb={6} p={4} bg={summaryBg} rounded='md'>
        <VStack spacing={0}>
          <Text fontSize='sm' color='gray.600'>
            전체 신고
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
          placeholder='신고 유형을 선택하세요'
          size='sm'
          maxW='150px'
          value={filters.reportType || ''}
          onChange={e => handleFilterChange('reportType', e.target.value)}
        >
          <option value='all'>전체</option>
          <option value='post'>게시글</option>
          <option value='comment'>댓글</option>
        </Select>

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

      {/* 신고 목록 테이블 */}
      <Box overflowX='auto'>
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>신고 유형</Th>
              <Th>신고 내용</Th>
              <Th>신고자</Th>
              <Th>신고 사유</Th>
              <Th>게시상태</Th>
              <Th>신고일</Th>
              <Th width='160px'>처리상태/관리</Th>
            </Tr>
          </Thead>
          <Tbody>
            {reports?.map((report: CommunityReportWithDetails) => (
              <Tr
                key={report.id}
                _hover={{ bg: hoverBg, cursor: 'pointer' }}
                borderBottom='1px'
                borderColor={borderColor}
                onClick={() => handleReportClick(report)}
              >
                <Td>{getReportTypeBadge(report.post, report.comment)}</Td>
                <Td maxW='300px'>
                  <VStack align='flex-start' spacing={1}>
                    {report.post && (
                      <Tooltip label={report.post.title}>
                        <Text fontSize='sm' fontWeight='medium' lineHeight='1.4'>
                          {truncateText(report.post.title, 50)}
                        </Text>
                      </Tooltip>
                    )}
                    {report.comment && (
                      <VStack align='flex-start' spacing={1}>
                        {/* 댓글이 속한 게시글 제목 */}
                        {report.comment.post_title && (
                          <Text fontSize='xs' color='blue.600' fontWeight='medium' lineHeight='1.4'>
                            📝 {truncateText(report.comment.post_title, 40)}
                          </Text>
                        )}
                        {/* 댓글 내용 */}
                        <Tooltip label={report.comment.content}>
                          <Text fontSize='sm' lineHeight='1.4' color='gray.700'>
                            💬 {truncateText(report.comment.content, 45)}
                          </Text>
                        </Tooltip>
                      </VStack>
                    )}
                    {!report.post && !report.comment && (
                      <Text fontSize='sm' color='gray.500'>
                        -
                      </Text>
                    )}
                  </VStack>
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
                  {report.post?.status && getPostStatusBadge(report.post.status)}
                  {report.comment?.status && getPostStatusBadge(report.comment.status)}
                  {!report.post && !report.comment && (
                    <Text fontSize='sm' color='gray.500'>
                      -
                    </Text>
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
              신고된 내용이 없습니다.
            </Text>
            <Text color='gray.400' fontSize='sm'>
              현재 데이터베이스에 신고 데이터가 없습니다.
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  )
}

export default CommunityReportList
