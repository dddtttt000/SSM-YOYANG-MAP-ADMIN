import {
  Box,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService, type CommunityCommentWithAuthor } from '../../services/commentService'
import CommentItem from './CommentItem'

interface CommentListProps {
  postId: string
}

const CommentList = ({ postId }: CommentListProps) => {
  const queryClient = useQueryClient()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const {
    data: comments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => commentService.getCommentsByPostId(postId),
    enabled: !!postId,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ commentId, status }: { commentId: string; status: string }) =>
      commentService.updateCommentStatus(commentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] })
    },
  })

  const handleStatusChange = (commentId: string, status: string) => {
    updateStatusMutation.mutate({ commentId, status })
  }

  const getCommentsStats = (comments: CommunityCommentWithAuthor[]) => {
    let total = 0
    let active = 0
    let reported = 0

    const countComments = (commentList: CommunityCommentWithAuthor[]) => {
      commentList.forEach(comment => {
        total++
        if (comment.status === 'active') active++
        if (comment.reported_count && comment.reported_count > 0) reported++

        if (comment.children && comment.children.length > 0) {
          countComments(comment.children)
        }
      })
    }

    countComments(comments)
    return { total, active, reported }
  }

  if (isLoading) {
    return (
      <Box bg={cardBg} border="1px" borderColor={borderColor} rounded="lg" p={6}>
        <Center py={8}>
          <Spinner size="lg" color="blue.500" />
        </Center>
      </Box>
    )
  }

  if (error) {
    return (
      <Box bg={cardBg} border="1px" borderColor={borderColor} rounded="lg" p={6}>
        <Alert status="error" rounded="md">
          <AlertIcon />
          댓글을 불러오는데 실패했습니다.
        </Alert>
      </Box>
    )
  }

  const stats = comments ? getCommentsStats(comments) : { total: 0, active: 0, reported: 0 }

  return (
    <Box bg={cardBg} border="1px" borderColor={borderColor} rounded="lg" p={6}>
      <VStack align="stretch" spacing={4}>
        {/* 댓글 헤더 */}
        <HStack justify="space-between" align="center">
          <Heading size="md" color="gray.700">
            댓글 관리
          </Heading>
          <HStack spacing={2}>
            <Badge colorScheme="blue">전체 {stats.total}개</Badge>
            <Badge colorScheme="green">활성 {stats.active}개</Badge>
            {stats.reported > 0 && (
              <Badge colorScheme="red">신고 {stats.reported}개</Badge>
            )}
          </HStack>
        </HStack>

        {/* 댓글 목록 */}
        {comments && comments.length > 0 ? (
          <VStack align="stretch" spacing={2}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onStatusChange={handleStatusChange}
                isLoading={updateStatusMutation.isPending}
              />
            ))}
          </VStack>
        ) : (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">댓글이 없습니다.</Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default CommentList