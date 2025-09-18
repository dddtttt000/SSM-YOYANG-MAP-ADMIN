import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiMoreHorizontal, FiHeart, FiMessageCircle } from 'react-icons/fi'
import { formatDate } from '@/utils/date'
import { getContentStatusBadge } from '@/utils/statusBadge'
import type { CommunityCommentWithAuthor } from '../../services/commentService'

interface CommentItemProps {
  comment: CommunityCommentWithAuthor
  depth?: number
  onStatusChange?: (commentId: string, status: string) => void
  isLoading?: boolean
}

const CommentItem = ({ comment, depth = 0, onStatusChange, isLoading }: CommentItemProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const bgColor = useColorModeValue('white', 'gray.800')
  const replyBg = useColorModeValue('gray.50', 'gray.700')


  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(comment.id, newStatus)
    }
  }

  const maxDepth = 3 // 최대 중첩 깊이 제한
  const actualDepth = Math.min(depth, maxDepth)
  const indentWidth = actualDepth * 24 // 24px씩 들여쓰기

  return (
    <Box>
      {/* 메인 댓글 */}
      <Box
        ml={`${indentWidth}px`}
        p={4}
        bg={depth > 0 ? replyBg : bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        mb={2}
      >
        <VStack align="stretch" spacing={3}>
          {/* 댓글 헤더 */}
          <HStack justify="space-between" align="flex-start">
            <HStack spacing={3}>
              <Avatar
                size="sm"
                src={comment.members?.profile_image || undefined}
                name={comment.members?.nickname || `User ${comment.author_id}`}
              />
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium">
                  {comment.members?.nickname || `사용자 ${comment.author_id}`}
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="xs" color="gray.500">
                    {formatDate(comment.created_at)}
                  </Text>
                  {comment.updated_at !== comment.created_at && (
                    <Text fontSize="xs" color="gray.400">
                      (수정됨: {formatDate(comment.updated_at)})
                    </Text>
                  )}
                </HStack>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              {getContentStatusBadge(comment.status as any)}
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreHorizontal size={16} />}
                  variant="ghost"
                  size="sm"
                  aria-label="댓글 관리 메뉴"
                  isLoading={isLoading}
                />
                <MenuList>
                  {comment.status === 'deleted' ? (
                    <MenuItem isDisabled>
                      관리자는 수정할 수 없습니다
                    </MenuItem>
                  ) : (
                    <>
                      {comment.status === 'hidden' && (
                        <MenuItem onClick={() => handleStatusChange('active')}>
                          복원
                        </MenuItem>
                      )}
                      {comment.status === 'active' && (
                        <MenuItem onClick={() => handleStatusChange('hidden')}>
                          숨기기
                        </MenuItem>
                      )}
                    </>
                  )}
                </MenuList>
              </Menu>
            </HStack>
          </HStack>

          {/* 댓글 내용 */}
          <Box>
            <Text whiteSpace="pre-wrap" lineHeight="1.6">
              {comment.content}
            </Text>
          </Box>

          {/* 댓글 통계 */}
          <HStack spacing={4}>
            <HStack spacing={1}>
              <FiHeart size={14} />
              <Text fontSize="sm" color="gray.500">
                {comment.likes_count || 0}
              </Text>
            </HStack>
            {comment.children && comment.children.length > 0 && (
              <HStack spacing={1}>
                <FiMessageCircle size={14} />
                <Text fontSize="sm" color="gray.500">
                  {comment.children.length}개 답글
                </Text>
              </HStack>
            )}
            {comment.reported_count && comment.reported_count > 0 && (
              <Badge colorScheme="red" size="sm">
                신고 {comment.reported_count}건
              </Badge>
            )}
          </HStack>
        </VStack>
      </Box>

      {/* 대댓글들 */}
      {comment.children && comment.children.length > 0 && (
        <VStack align="stretch" spacing={0}>
          {comment.children.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onStatusChange={onStatusChange}
              isLoading={isLoading}
            />
          ))}
        </VStack>
      )}
    </Box>
  )
}

export default CommentItem