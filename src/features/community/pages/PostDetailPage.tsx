import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Wrap,
  WrapItem,
  Image,
  SimpleGrid,
  Table,
  Tbody,
  Tr,
  Td,
  Avatar,
} from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postService } from '../services'
import { formatDate } from '@/utils/date'
import CommentList from '../components/comments/CommentList'

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const cardBg = useColorModeValue('white', 'gray.800')
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const tableBg = useColorModeValue('white', 'gray.800')
  const headerBg = useColorModeValue('gray.50', 'gray.700')

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['communityPost', id],
    queryFn: () => postService.getPostById(id!),
    enabled: !!id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => postService.updatePostStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPost', id] })
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] })
    },
  })

  const handleStatusChange = (newStatus: string) => {
    if (id) {
      updateStatusMutation.mutate({ id, status: newStatus })
    }
  }

  const handleGoBack = () => {
    const state = location.state as any
    if (state?.from === 'reports' && state?.returnPath) {
      // 신고 관리에서 온 경우, 필터 정보와 함께 돌아가기
      navigate(state.returnPath, {
        state: {
          activeTab: 1, // 신고 관리 탭
          reportFilters: state.filters,
        },
      })
    } else {
      // 기본 뒤로가기
      navigate(-1)
    }
  }

  // Helper functions removed - logic moved inline for simplicity

  const parseHashtags = (hashtags: any): string[] => {
    if (!hashtags) return []
    if (typeof hashtags === 'string') {
      try {
        return JSON.parse(hashtags)
      } catch {
        return []
      }
    }
    if (Array.isArray(hashtags)) return hashtags
    return []
  }

  const parseImages = (images: any): string[] => {
    if (!images) return []
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    if (Array.isArray(images)) return images
    return []
  }

  if (isLoading) {
    return (
      <Center h='100vh'>
        <Spinner size='lg' color='blue.500' />
      </Center>
    )
  }

  if (error || !post) {
    return (
      <Container maxW='7xl' py={8}>
        <Alert status='error' rounded='md'>
          <AlertIcon />
          게시글을 불러오는데 실패했습니다.
        </Alert>
      </Container>
    )
  }

  const hashtags = parseHashtags(post.hashtags)
  const images = parseImages(post.images)

  return (
    <Box minH='100vh' bg={bgColor}>
      <Container maxW='7xl' py={8}>
        {/* 헤더 */}
        <HStack mb={6} justify='space-between'>
          <Button leftIcon={<FiArrowLeft />} variant='ghost' onClick={handleGoBack}>
            목록으로
          </Button>

          <HStack spacing={2}>
            {post.status === 'active' && (
              <Button
                size='sm'
                colorScheme='yellow'
                variant='solid'
                onClick={() => handleStatusChange('hidden')}
                isLoading={updateStatusMutation.isPending}
              >
                숨기기
              </Button>
            )}
            {post.status === 'hidden' && (
              <Button
                size='sm'
                colorScheme='green'
                variant='solid'
                onClick={() => handleStatusChange('active')}
                isLoading={updateStatusMutation.isPending}
              >
                복원
              </Button>
            )}
            {post.status === 'deleted' && (
              <Button size='sm' colorScheme='gray' variant='solid' isDisabled cursor='not-allowed'>
                삭제된 게시글
              </Button>
            )}
            {post.status === 'pending' && (
              <Button
                size='sm'
                colorScheme='green'
                variant='solid'
                onClick={() => handleStatusChange('active')}
                isLoading={updateStatusMutation.isPending}
              >
                승인
              </Button>
            )}
          </HStack>
        </HStack>

        {/* 게시글 상세 정보 */}
        <Card bg={cardBg} border='1px' borderColor={borderColor} maxW='6xl' mx='auto'>
          <CardBody>
            <VStack align='stretch' spacing={6}>
              {/* 제목 */}
              <Heading size='lg' mb={4}>
                {post.title}
              </Heading>

              {/* 기본 정보 테이블 */}
              <Table variant='simple' size='sm' border='1px' borderColor={borderColor}>
                <Tbody>
                  <Tr>
                    <Td width='120px' fontWeight='semibold' bg={headerBg}>
                      대분류
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          post.category_1 === '요양찾기'
                            ? 'blue'
                            : post.category_1 === '사랑방'
                              ? 'orange'
                              : post.category_1 === '건강관리'
                                ? 'purple'
                                : 'gray'
                        }
                      >
                        {post.category_1}
                      </Badge>
                    </Td>
                    <Td width='120px' fontWeight='semibold' bg={headerBg}>
                      소분류
                    </Td>
                    <Td>
                      {post.category_2 ? (
                        <Badge variant='outline' colorScheme='gray'>
                          {post.category_2}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight='semibold' bg={headerBg}>
                      게시상태
                    </Td>
                    <Td>
                      <Badge
                        size='md'
                        colorScheme={
                          post.status === 'active'
                            ? 'green'
                            : post.status === 'hidden'
                              ? 'yellow'
                              : post.status === 'deleted'
                                ? 'red'
                                : 'gray'
                        }
                      >
                        {post.status === 'active'
                          ? '활성'
                          : post.status === 'hidden'
                            ? '숨김'
                            : post.status === 'deleted'
                              ? '삭제됨'
                              : post.status}
                      </Badge>
                    </Td>
                    <Td fontWeight='semibold' bg={headerBg}>
                      작성자
                    </Td>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          src={post.members?.profile_image || undefined}
                          name={post.members?.nickname || `User ${post.author_id}`}
                        />
                        <Text>{post.members?.nickname || post.author_id}</Text>
                      </HStack>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight='semibold' bg={headerBg}>
                      작성일
                    </Td>
                    <Td>{formatDate(post.created_at)}</Td>
                    <Td fontWeight='semibold' bg={headerBg}>
                      수정일
                    </Td>
                    <Td>{post.updated_at !== post.created_at ? formatDate(post.updated_at) : '-'}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight='semibold' bg={headerBg}>
                      조회수
                    </Td>
                    <Td>{post.views_count.toLocaleString()}</Td>
                    <Td fontWeight='semibold' bg={headerBg}>
                      좋아요
                    </Td>
                    <Td>{post.likes_count.toLocaleString()}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight='semibold' bg={headerBg}>
                      댓글수
                    </Td>
                    <Td>{post.comments_count.toLocaleString()}</Td>
                    <Td fontWeight='semibold' bg={headerBg}>
                      신고횟수
                    </Td>
                    <Td color={post.reported_count > 0 ? 'red.600' : 'inherit'}>{post.reported_count}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight='semibold' bg={headerBg}>
                      인기도
                    </Td>
                    <Td colSpan={3}>{post.popularity_score}</Td>
                  </Tr>
                </Tbody>
              </Table>

              <Divider />

              {/* 본문 */}
              <Box>
                <Text fontSize='sm' fontWeight='semibold' color='gray.600' mb={3}>
                  게시글 내용
                </Text>
                <Box p={4} bg={tableBg} border='1px' borderColor={borderColor} rounded='md'>
                  <Text whiteSpace='pre-wrap' lineHeight='1.8'>
                    {post.content}
                  </Text>
                </Box>
              </Box>

              {/* 이미지 */}
              {images.length > 0 && (
                <Box>
                  <Text fontSize='sm' fontWeight='semibold' color='gray.600' mb={3}>
                    첨부 이미지 ({images.length}개)
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {images.map((imageUrl, index) => (
                      <Box key={index} position='relative'>
                        <Image
                          src={imageUrl}
                          alt={`게시글 이미지 ${index + 1}`}
                          borderRadius='md'
                          border='1px'
                          borderColor={borderColor}
                          objectFit='cover'
                          w='100%'
                          h='200px'
                          cursor='pointer'
                          _hover={{ opacity: 0.8 }}
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {/* 해시태그 */}
              {hashtags.length > 0 && (
                <Box>
                  <Text fontSize='sm' fontWeight='semibold' color='gray.600' mb={3}>
                    해시태그
                  </Text>
                  <Wrap>
                    {hashtags.map((tag, index) => (
                      <WrapItem key={index}>
                        <Badge variant='outline' colorScheme='blue'>
                          #{tag}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* 댓글 섹션 */}
        <Box mt={6} maxW='6xl' mx='auto'>
          <CommentList postId={post.id} />
        </Box>
      </Container>
    </Box>
  )
}

export default PostDetailPage
