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
  Card,
  CardBody,
  Heading,
  HStack,
  VStack,
  useColorModeValue,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { FiTrendingUp, FiEye, FiHeart, FiMessageCircle, FiBarChart, FiBookmark } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { statsService } from '../../services'

const CategoryStatsTable = () => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const explanationBg = useColorModeValue('gray.50', 'gray.700')

  const {
    data: categoryAnalysis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categoryAnalysis'],
    queryFn: () => statsService.getCategoryAnalysis(),
    staleTime: 300000, // 5분
  })

  const {
    data: statusDistribution,
    isLoading: statusLoading,
  } = useQuery({
    queryKey: ['categoryStatusDistribution'],
    queryFn: () => statsService.getCategoryStatusDistribution(),
    staleTime: 300000,
  })

  const getCategoryBadgeColor = (category: string) => {
    const colorMap: Record<string, string> = {
      '요양찾기': 'blue',
      '사랑방': 'orange',
      '건강관리': 'purple',
      '기타': 'gray',
    }
    return colorMap[category] || 'gray'
  }

  const formatNumber = (num: number) => {
    return Number(num).toLocaleString()
  }

  const getEngagementLevel = (score: number) => {
    if (score >= 100) return { level: '매우 높음', color: 'green' }
    if (score >= 50) return { level: '높음', color: 'blue' }
    if (score >= 20) return { level: '보통', color: 'yellow' }
    return { level: '낮음', color: 'red' }
  }

  const getMaxValue = (categories: any[], key: string) => {
    return Math.max(...categories.map(cat => cat[key]), 1)
  }

  if (isLoading || statusLoading) {
    return (
      <Center py={8}>
        <Spinner size="lg" color="blue.500" />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error" rounded="md">
        <AlertIcon />
        카테고리 통계 테이블 데이터를 불러오는데 실패했습니다.
      </Alert>
    )
  }

  if (!categoryAnalysis || categoryAnalysis.categories.length === 0) {
    return (
      <Alert status="info" rounded="md">
        <AlertIcon />
        카테고리 통계 데이터가 없습니다.
      </Alert>
    )
  }

  const maxValues = {
    postCount: getMaxValue(categoryAnalysis.categories, 'postCount'),
    totalViews: getMaxValue(categoryAnalysis.categories, 'totalViews'),
    totalLikes: getMaxValue(categoryAnalysis.categories, 'totalLikes'),
    totalComments: getMaxValue(categoryAnalysis.categories, 'totalComments'),
    totalSaves: getMaxValue(categoryAnalysis.categories, 'totalSaves'),
    engagementScore: getMaxValue(categoryAnalysis.categories, 'engagementScore'),
    saveEngagementScore: getMaxValue(categoryAnalysis.categories, 'saveEngagementScore'),
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* 상세 통계 테이블 */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <Heading size="md" mb={4}>
            카테고리별 상세 통계
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>카테고리</Th>
                  <Th textAlign="center">
                    <HStack justify="center" spacing={1}>
                      <Icon as={FiBarChart} />
                      <Text>게시글 수</Text>
                    </HStack>
                  </Th>
                  <Th textAlign="center">
                    <HStack justify="center" spacing={1}>
                      <Icon as={FiEye} />
                      <Text>총 조회수</Text>
                    </HStack>
                  </Th>
                  <Th textAlign="center">
                    <HStack justify="center" spacing={1}>
                      <Icon as={FiHeart} />
                      <Text>총 좋아요</Text>
                    </HStack>
                  </Th>
                  <Th textAlign="center">
                    <HStack justify="center" spacing={1}>
                      <Icon as={FiMessageCircle} />
                      <Text>총 댓글</Text>
                    </HStack>
                  </Th>
                  <Th textAlign="center">
                    <HStack justify="center" spacing={1}>
                      <Icon as={FiBookmark} />
                      <Text>총 저장</Text>
                    </HStack>
                  </Th>
                  <Th textAlign="center">평균 조회수</Th>
                  <Th textAlign="center">평균 좋아요</Th>
                  <Th textAlign="center">평균 댓글</Th>
                  <Th textAlign="center">평균 저장</Th>
                  <Th textAlign="center">
                    <HStack justify="center" spacing={1}>
                      <Icon as={FiTrendingUp} />
                      <Text>참여도 점수</Text>
                    </HStack>
                  </Th>
                  <Th textAlign="center">비율</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categoryAnalysis.categories.map((category) => {
                  const engagement = getEngagementLevel(category.engagementScore)
                  const statusData = statusDistribution?.[category.category]

                  return (
                    <Tr key={category.category} _hover={{ bg: hoverBg }}>
                      <Td>
                        <VStack align="flex-start" spacing={1}>
                          <Badge
                            colorScheme={getCategoryBadgeColor(category.category)}
                            variant="subtle"
                            fontSize="sm"
                          >
                            {category.category}
                          </Badge>
                          {statusData && (
                            <HStack spacing={1}>
                              <Tooltip label={`활성: ${statusData.active || 0}개`}>
                                <Badge size="xs" colorScheme="green">
                                  {statusData.active || 0}
                                </Badge>
                              </Tooltip>
                              {statusData.hidden > 0 && (
                                <Tooltip label={`숨김: ${statusData.hidden}개`}>
                                  <Badge size="xs" colorScheme="yellow">
                                    {statusData.hidden}
                                  </Badge>
                                </Tooltip>
                              )}
                              {statusData.deleted > 0 && (
                                <Tooltip label={`삭제: ${statusData.deleted}개`}>
                                  <Badge size="xs" colorScheme="red">
                                    {statusData.deleted}
                                  </Badge>
                                </Tooltip>
                              )}
                            </HStack>
                          )}
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <VStack spacing={1}>
                          <Text fontWeight="bold">{formatNumber(category.postCount)}</Text>
                          <Progress
                            value={(category.postCount / maxValues.postCount) * 100}
                            size="sm"
                            colorScheme="blue"
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <VStack spacing={1}>
                          <Text>{formatNumber(category.totalViews)}</Text>
                          <Progress
                            value={(category.totalViews / maxValues.totalViews) * 100}
                            size="sm"
                            colorScheme="green"
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <VStack spacing={1}>
                          <Text>{formatNumber(category.totalLikes)}</Text>
                          <Progress
                            value={(category.totalLikes / maxValues.totalLikes) * 100}
                            size="sm"
                            colorScheme="pink"
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <VStack spacing={1}>
                          <Text>{formatNumber(category.totalComments)}</Text>
                          <Progress
                            value={(category.totalComments / maxValues.totalComments) * 100}
                            size="sm"
                            colorScheme="purple"
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <VStack spacing={1}>
                          <Text>{formatNumber(category.totalSaves)}</Text>
                          <Progress
                            value={(category.totalSaves / maxValues.totalSaves) * 100}
                            size="sm"
                            colorScheme="teal"
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <Text>{category.avgViews}</Text>
                      </Td>
                      <Td textAlign="center">
                        <Text>{category.avgLikes}</Text>
                      </Td>
                      <Td textAlign="center">
                        <Text>{category.avgComments}</Text>
                      </Td>
                      <Td textAlign="center">
                        <Text>{category.avgSaves}</Text>
                      </Td>
                      <Td textAlign="center">
                        <VStack spacing={1}>
                          <Text fontWeight="bold">{category.engagementScore}점</Text>
                          <Badge colorScheme={engagement.color} size="sm">
                            {engagement.level}
                          </Badge>
                          <Progress
                            value={(category.engagementScore / maxValues.engagementScore) * 100}
                            size="sm"
                            colorScheme={engagement.color}
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <VStack spacing={1}>
                          <Text fontWeight="bold">{category.percentage}%</Text>
                          <Progress
                            value={category.percentage}
                            size="sm"
                            colorScheme="orange"
                            w="60px"
                          />
                        </VStack>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>

          {/* 테이블 설명 */}
          <Box mt={4} p={3} bg={explanationBg} rounded="md">
            <Text fontSize="sm" color="gray.600" mb={2} fontWeight="bold">
              📊 참여도 점수 계산 방식
            </Text>
            <Text fontSize="xs" color="gray.500">
              기본 참여도 점수 = (평균 조회수 × 0.2) + (평균 좋아요 × 3) + (평균 댓글 × 5)
            </Text>
            <Text fontSize="xs" color="gray.500">
              저장 기반 참여도 점수 = (평균 조회수 × 0.1) + (평균 좋아요 × 2) + (평균 댓글 × 3) + (평균 저장 × 10)
            </Text>
            <Text fontSize="xs" color="gray.500">
              • 매우 높음: 100점 이상 • 높음: 50-99점 • 보통: 20-49점 • 낮음: 20점 미만
            </Text>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default CategoryStatsTable