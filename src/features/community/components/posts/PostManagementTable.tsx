import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Tooltip,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { postService } from '../../services'
import type { CommunityPost } from '@/types/database.types'
import type { PostFilters } from '../../services'
import { formatDate } from '@/utils/date'
import { truncateText } from '@/utils/textUtils'
import Pagination from '@/components/common/Pagination'

interface PostManagementTableProps {
  filters?: PostFilters
  onFiltersChange: (filters: PostFilters) => void
}

const PostManagementTable = ({ filters, onFiltersChange }: PostManagementTableProps) => {
  const navigate = useNavigate()
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  const {
    data: postsResponse,
    error,
  } = useQuery({
    queryKey: ['communityPosts', filters],
    queryFn: () => postService.getPosts(filters),
  })

  // Status change functionality removed - handled in detail page

  const handlePostClick = (postId: string) => {
    navigate(`/community/posts/${postId}`)
  }

  const handlePageChange = (page: number) => {
    onFiltersChange({ ...filters, page })
  }

  const handlePageSizeChange = (pageSize: number) => {
    onFiltersChange({ ...filters, pageSize, page: 1 })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { colorScheme: 'green', label: '활성' },
      hidden: { colorScheme: 'yellow', label: '숨김' },
      deleted: { colorScheme: 'red', label: '삭제' },
      pending: { colorScheme: 'gray', label: '대기' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      colorScheme: 'gray',
      label: status,
    }

    return <Badge colorScheme={config.colorScheme}>{config.label}</Badge>
  }

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      '요양찾기': 'blue',
      '사랑방': 'orange',
      '건강관리': 'purple',
      '기타': 'gray',
    }

    return categoryColors[category] || 'blue'
  }


  if (error) {
    return (
      <Alert status="error" rounded="md">
        <AlertIcon />
        게시글 데이터를 불러오는데 실패했습니다.
      </Alert>
    )
  }

  return (
    <Box>
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>대분류</Th>
              <Th>소분류</Th>
              <Th>제목</Th>
              <Th>조회수</Th>
              <Th>좋아요</Th>
              <Th>댓글</Th>
              <Th>신고</Th>
              <Th>상태</Th>
              <Th>작성일</Th>
              <Th>작성자</Th>
            </Tr>
          </Thead>
          <Tbody>
            {postsResponse?.data.map((post: CommunityPost) => (
              <Tr
                key={post.id}
                _hover={{ bg: hoverBg }}
                borderBottom="1px"
                borderColor={borderColor}
              >
                <Td>
                  <Badge size="sm" colorScheme={getCategoryColor(post.category_1)}>
                    {post.category_1}
                  </Badge>
                </Td>
                <Td>
                  {post.category_2 ? (
                    <Badge size="sm" variant="outline" colorScheme="gray">
                      {post.category_2}
                    </Badge>
                  ) : (
                    <Text fontSize="xs" color="gray.400">-</Text>
                  )}
                </Td>
                <Td maxW="400px">
                  <Tooltip label={post.title}>
                    <Text
                      fontWeight="medium"
                      fontSize="sm"
                      cursor="pointer"
                      color="blue.600"
                      _hover={{ color: "blue.800", textDecoration: "underline" }}
                      onClick={() => handlePostClick(post.id)}
                    >
                      {truncateText(post.title, 50)}
                    </Text>
                  </Tooltip>
                </Td>
                <Td>
                  <Text fontSize="sm">{post.views_count.toLocaleString()}</Text>
                </Td>
                <Td>
                  <Text fontSize="sm">{post.likes_count.toLocaleString()}</Text>
                </Td>
                <Td>
                  <Text fontSize="sm">{post.comments_count.toLocaleString()}</Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color={post.reported_count > 0 ? "red.500" : "gray.500"}>
                    {post.reported_count.toLocaleString()}
                  </Text>
                </Td>
                <Td>{getStatusBadge(post.status)}</Td>
                <Td>
                  <Text fontSize="xs">{formatDate(post.created_at)}</Text>
                </Td>
                <Td>
                  <Text fontSize="sm">{post.members?.nickname || post.author_id}</Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {postsResponse?.data.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">표시할 게시글이 없습니다.</Text>
        </Box>
      )}

      {postsResponse && postsResponse.totalCount > 0 && (
        <Pagination
          pagination={{
            currentPage: filters?.page || 1,
            pageSize: filters?.pageSize || 10,
            totalCount: postsResponse.totalCount,
            totalPages: postsResponse.totalPages,
            hasNext: (filters?.page || 1) < postsResponse.totalPages,
            hasPrevious: (filters?.page || 1) > 1,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </Box>
  )
}

export default PostManagementTable