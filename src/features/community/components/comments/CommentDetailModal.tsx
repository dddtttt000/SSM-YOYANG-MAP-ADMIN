import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Divider,
  Box,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FiExternalLink } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { commentService } from '../../services/commentService'
import { formatDate } from '@/utils/date'
import { getContentStatusBadge } from '@/utils/statusBadge'
import { REPORT_REASON_LABELS, type ReportReason } from '../../types'
import type { CommentReportWithDetails } from '../../services/commentReportService'

interface CommentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  commentId: string | null
  mode?: 'management' | 'report'
  existingCommentData?: CommentReportWithDetails | null
}

const CommentDetailModal = ({
  isOpen,
  onClose,
  commentId,
  mode = 'management',
  existingCommentData = null,
}: CommentDetailModalProps) => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // 댓글 상태를 로컬에서 추적하여 즉시 UI 업데이트
  const [currentStatus, setCurrentStatus] = useState<string>('active')

  // 기존 댓글 데이터가 있으면 사용, 없으면 새로 조회
  const shouldFetchComment = !existingCommentData && !!commentId && isOpen

  const {
    data: fetchedComment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['commentDetail', commentId],
    queryFn: () => (commentId ? commentService.getCommentWithReports(commentId) : null),
    enabled: shouldFetchComment,
  })

  // 기존 데이터가 있으면 사용, 없으면 조회된 데이터 사용
  const comment = existingCommentData
    ? {
        // CommentReportWithDetails를 CommentWithReports 형식으로 변환
        id: existingCommentData.comment?.id || '',
        content: existingCommentData.comment?.content || '',
        author_id: existingCommentData.comment?.author_id || 0,
        status: currentStatus, // 로컬 상태 사용
        created_at: existingCommentData.created_at,
        updated_at: existingCommentData.created_at,
        post_id: existingCommentData.comment?.post_id || '',
        likes_count: 0,
        reported_count: 1, // 신고된 댓글이므로 최소 1개
        total_reports: 1,
        members: {
          nickname: existingCommentData.comment?.author_nickname,
          profile_image: existingCommentData.comment?.author_profile_image || null,
        },
        original_post: {
          id: existingCommentData.comment?.post_id || '',
          title: existingCommentData.comment?.post_title || '',
          author_nickname: existingCommentData.comment?.author_nickname || null,
        },
        reports: [
          {
            id: existingCommentData.id,
            reporter_id: existingCommentData.reporter_id,
            reason: existingCommentData.reason,
            description: existingCommentData.description,
            status: existingCommentData.status,
            created_at: existingCommentData.created_at,
            reporter: existingCommentData.reporter,
          },
        ],
        reports_by_reason: {
          [existingCommentData.reason]: 1,
        },
      }
    : fetchedComment

  // 댓글 데이터가 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    if (existingCommentData?.comment?.status) {
      setCurrentStatus(existingCommentData.comment.status)
    } else if (fetchedComment?.status) {
      setCurrentStatus(fetchedComment.status)
    }
  }, [existingCommentData, fetchedComment])

  const updateStatusMutation = useMutation({
    mutationFn: ({ commentId, status }: { commentId: string; status: string }) =>
      commentService.updateCommentStatus(commentId, status),
    onMutate: async ({ status }) => {
      // 낙관적 업데이트: 즉시 UI 상태 변경
      setCurrentStatus(status)
    },
    onSuccess: () => {
      // mode에 따라 적절한 쿼리 무효화
      if (mode === 'management') {
        queryClient.invalidateQueries({ queryKey: ['managementComments'] })
      } else if (mode === 'report') {
        queryClient.invalidateQueries({ queryKey: ['commentReports'] })
        queryClient.invalidateQueries({ queryKey: ['commentReportStats'] })
        queryClient.invalidateQueries({ queryKey: ['communityDashboardStats'] })
      }
      queryClient.invalidateQueries({ queryKey: ['commentDetail', commentId] })
      toast({
        title: '댓글 상태 변경 완료',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error) => {
      console.error('댓글 상태 변경 실패:', error)
      // 실패 시 이전 상태로 롤백
      const originalStatus = existingCommentData?.comment?.status || fetchedComment?.status || 'active'
      setCurrentStatus(originalStatus)
      toast({
        title: '댓글 상태 변경 실패',
        description: '상태 변경 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })

  const handleStatusChange = (status: string) => {
    const targetCommentId = commentId || existingCommentData?.comment?.id
    if (targetCommentId) {
      updateStatusMutation.mutate({ commentId: targetCommentId, status })
    }
  }

  const handleViewPost = () => {
    const postId = comment?.original_post?.id
    if (postId) {
      navigate(`/community/posts/${postId}`)
    }
  }



  if (!isOpen || (!commentId && !existingCommentData)) return null

  // mode에 따른 모달 제목 설정
  const modalTitle = mode === 'report' ? '신고된 댓글 상세' : '댓글 상세 정보'

  // 로딩 상태는 새로 조회하는 경우에만 표시
  const showLoading = shouldFetchComment && isLoading

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent maxW='800px'>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {showLoading && (
            <Center py={8}>
              <VStack spacing={3}>
                <Spinner size='lg' color='blue.500' />
                <Text>댓글 정보를 불러오는 중...</Text>
              </VStack>
            </Center>
          )}

          {error && (
            <Alert status='error'>
              <AlertIcon />
              댓글 정보를 불러오는데 실패했습니다.
            </Alert>
          )}

          {comment && (
            <Tabs variant='enclosed' defaultIndex={0}>
              <TabList>
                <Tab>기본 정보</Tab>
                <Tab>신고 내역 ({comment.reports?.length || 0})</Tab>
                <Tab>원글 정보</Tab>
              </TabList>

              <TabPanels>
                {/* 기본 정보 탭 */}
                <TabPanel px={0}>
                  <VStack align='stretch' spacing={4}>
                    {/* 댓글 헤더 */}
                    <HStack justify='space-between'>
                      <HStack spacing={3}>
                        <Avatar
                          size='md'
                          src={comment.members?.profile_image || undefined}
                          name={comment.members?.nickname || `User ${comment.author_id}`}
                        />
                        <VStack align='flex-start' spacing={0}>
                          <Text fontWeight='medium'>{comment.members?.nickname || `사용자 ${comment.author_id}`}</Text>
                          <Text fontSize='xs' color='gray.500'>
                            작성일: {formatDate(comment.created_at)}
                          </Text>
                          {comment.updated_at !== comment.created_at && (
                            <Text fontSize='xs' color='gray.500'>
                              수정일: {formatDate(comment.updated_at)}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      {getContentStatusBadge(comment.status as any)}
                    </HStack>

                    <Divider />
                    {/* 댓글 내용 */}
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={2}>
                        댓글 내용
                      </Text>
                      <Box p={4} bg={bgColor} border='1px' borderColor={borderColor} borderRadius='md'>
                        <Text whiteSpace='pre-wrap' lineHeight='1.6'>
                          {comment.content}
                        </Text>
                      </Box>
                    </Box>

                    {/* 통계 정보 */}
                    <HStack spacing={6}>
                      <VStack align='flex-start' spacing={0}>
                        <Text fontSize='sm' color='gray.600'>
                          좋아요
                        </Text>
                        <Text fontWeight='medium'>{comment.likes_count || 0}개</Text>
                      </VStack>
                      <VStack align='flex-start' spacing={0}>
                        <Text fontSize='sm' color='gray.600'>
                          신고 수
                        </Text>
                        <Text
                          fontWeight='medium'
                          color={comment.total_reports && comment.total_reports > 0 ? 'red.500' : 'gray.700'}
                        >
                          {comment.total_reports || 0}건
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </TabPanel>

                {/* 신고 내역 탭 */}
                <TabPanel px={0}>
                  <VStack align='stretch' spacing={4}>
                    {comment.reports && comment.reports.length > 0 ? (
                      <>
                        {/* 신고 통계 */}
                        {comment.reports_by_reason && Object.keys(comment.reports_by_reason).length > 0 && (
                          <Box>
                            <Text fontSize='sm' color='gray.600' mb={2}>
                              신고 사유별 통계
                            </Text>
                            <HStack wrap='wrap' spacing={2}>
                              {Object.entries(comment.reports_by_reason).map(([reason, count]) => (
                                <Badge key={reason} colorScheme='red' variant='outline'>
                                  {REPORT_REASON_LABELS[reason as ReportReason] || reason}: {count}건
                                </Badge>
                              ))}
                            </HStack>
                          </Box>
                        )}

                        <Divider />

                        {/* 신고 목록 */}
                        <VStack align='stretch' spacing={3}>
                          <Text fontSize='sm' color='gray.600'>
                            신고 내역
                          </Text>
                          {comment.reports.map(report => (
                            <Box
                              key={report.id}
                              p={4}
                              bg={bgColor}
                              border='1px'
                              borderColor={borderColor}
                              borderRadius='md'
                            >
                              <VStack align='stretch' spacing={2}>
                                <HStack justify='space-between'>
                                  <HStack spacing={2}>
                                    <Text fontSize='sm' fontWeight='medium'>
                                      {report.reporter?.nickname || `사용자 ${report.reporter_id}`}
                                    </Text>
                                    <HStack spacing={1}>
                                      <Badge colorScheme='red' size='sm'>
                                        {REPORT_REASON_LABELS[report.reason as ReportReason] || report.reason}
                                      </Badge>
                                      {report.description && (
                                        <Text fontSize='xs' color='gray.600' ml={1}>
                                          ({report.description})
                                        </Text>
                                      )}
                                    </HStack>
                                  </HStack>
                                  <Text fontSize='xs' color='gray.500'>
                                    {formatDate(report.created_at)}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Box>
                          ))}
                        </VStack>
                      </>
                    ) : (
                      <Text textAlign='center' color='gray.500' py={8}>
                        신고 내역이 없습니다.
                      </Text>
                    )}
                  </VStack>
                </TabPanel>

                {/* 원글 정보 탭 */}
                <TabPanel px={0}>
                  <VStack align='stretch' spacing={4}>
                    {comment.original_post ? (
                      <>
                        <VStack align='flex-start' spacing={2}>
                          <Text fontSize='sm' color='gray.600'>
                            게시글 제목
                          </Text>
                          <HStack justify='space-between' align='center' w='full'>
                            <Text fontWeight='medium' flex={1}>
                              {comment.original_post.title}
                            </Text>
                            <Button
                              size='sm'
                              colorScheme='blue'
                              variant='outline'
                              leftIcon={<FiExternalLink />}
                              onClick={handleViewPost}
                            >
                              원글 보러가기
                            </Button>
                          </HStack>
                        </VStack>
                        <VStack align='flex-start' spacing={2}>
                          <Text fontSize='sm' color='gray.600'>
                            게시글 작성자
                          </Text>
                          <Text>{comment.original_post.author_nickname || '알 수 없음'}</Text>
                        </VStack>
                      </>
                    ) : (
                      <Text textAlign='center' color='gray.500' py={8}>
                        원글 정보를 불러올 수 없습니다.
                      </Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={2}>
            {currentStatus === 'active' && (
              <Button
                size='sm'
                colorScheme='yellow'
                onClick={() => handleStatusChange('hidden')}
                isLoading={updateStatusMutation.isPending}
              >
                숨기기
              </Button>
            )}
            {currentStatus === 'hidden' && (
              <Button
                size='sm'
                colorScheme='green'
                onClick={() => handleStatusChange('active')}
                isLoading={updateStatusMutation.isPending}
              >
                복원
              </Button>
            )}
            {currentStatus === 'deleted' && (
              <Text color='gray.500' fontSize='sm'>
                사용자가 삭제한 댓글입니다. 관리자는 수정할 수 없습니다.
              </Text>
            )}
            <Button variant='outline' onClick={onClose} ml={3}>
              닫기
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CommentDetailModal
