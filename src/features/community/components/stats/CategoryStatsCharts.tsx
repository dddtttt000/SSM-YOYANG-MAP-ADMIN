import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Badge,
  useColorModeValue,
  Grid,
  GridItem,
  Center,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { statsService } from '../../services'

const CategoryStatsCharts = () => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const {
    data: categoryAnalysis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categoryAnalysis'],
    queryFn: () => statsService.getCategoryAnalysis(),
    staleTime: 300000, // 5분
  })

  const categoryColors = {
    '요양찾기': '#3182CE',
    '사랑방': '#DD6B20',
    '건강관리': '#805AD5',
    '기타': '#718096',
  }

  const getRandomColor = (index: number) => {
    const colors = ['#3182CE', '#38A169', '#805AD5', '#E53E3E', '#D69E2E', '#00B5D8']
    return colors[index % colors.length]
  }

  // 파이차트용 데이터 변환
  const pieChartData = categoryAnalysis?.categories.map((cat, index) => ({
    name: cat.category,
    value: cat.postCount,
    percentage: cat.percentage,
    fill: categoryColors[cat.category as keyof typeof categoryColors] || getRandomColor(index),
  })) || []

  // 막대차트용 데이터 변환 (참여도 기준)
  const barChartData = categoryAnalysis?.topCategories.byEngagement.map((cat, index) => ({
    category: cat.category,
    '평균 조회수': cat.avgViews,
    '평균 좋아요': cat.avgLikes,
    '평균 댓글': cat.avgComments,
    '참여도 점수': cat.engagementScore,
    fill: categoryColors[cat.category as keyof typeof categoryColors] || getRandomColor(index),
  })) || []

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="white" p={3} border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
          <Text fontWeight="bold">{label}</Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} color={entry.color}>
              {entry.dataKey}: {entry.value}
              {entry.dataKey === '참여도 점수' ? '점' : ''}
            </Text>
          ))}
        </Box>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <Box bg="white" p={3} border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
          <Text fontWeight="bold">{data.name}</Text>
          <Text>게시글 수: {data.value}개</Text>
          <Text>비율: {data.payload?.percentage || 0}%</Text>
        </Box>
      )
    }
    return null
  }

  if (isLoading) {
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
        카테고리 통계 데이터를 불러오는데 실패했습니다.
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

  return (
    <VStack spacing={6} align="stretch">
      {/* 전체 통계 요약 */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <Heading size="md" mb={4}>
            카테고리 분석 요약
          </Heading>
          <StatGroup>
            <Stat>
              <StatLabel>전체 게시글</StatLabel>
              <StatNumber>{categoryAnalysis.totalPosts.toLocaleString()}개</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>카테고리 수</StatLabel>
              <StatNumber>{categoryAnalysis.categories.length}개</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>인기 카테고리</StatLabel>
              <StatNumber fontSize="lg">
                <Badge colorScheme="blue" fontSize="md">
                  {categoryAnalysis.topCategories.byPosts[0]?.category || '-'}
                </Badge>
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>참여도 최고</StatLabel>
              <StatNumber fontSize="lg">
                <Badge colorScheme="green" fontSize="md">
                  {categoryAnalysis.topCategories.byEngagement[0]?.category || '-'}
                </Badge>
              </StatNumber>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      {/* 차트 그리드 */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* 파이차트 - 카테고리별 게시글 분포 */}
        <GridItem>
          <Card bg={cardBg} border="1px" borderColor={borderColor} h="400px">
            <CardBody>
              <Heading size="sm" mb={4}>
                카테고리별 게시글 분포
              </Heading>
              <Box h="300px" w="100%">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name} ${entry.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Center h="100%">
                    <Text color="gray.500">차트 데이터가 없습니다</Text>
                  </Center>
                )}
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        {/* 막대차트 - 카테고리별 참여도 */}
        <GridItem>
          <Card bg={cardBg} border="1px" borderColor={borderColor} h="400px">
            <CardBody>
              <Heading size="sm" mb={4}>
                카테고리별 참여도 분석
              </Heading>
              <Box h="300px" w="100%">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="참여도 점수" fill="#3182CE" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Center h="100%">
                    <Text color="gray.500">차트 데이터가 없습니다</Text>
                  </Center>
                )}
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* 상위 카테고리 순위 */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }} gap={4}>
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="xs" mb={3} color="blue.500">
              게시글 수 순위
            </Heading>
            <VStack spacing={2} align="stretch">
              {categoryAnalysis.topCategories.byPosts.slice(0, 3).map((cat, index) => (
                <HStack key={cat.category} justify="space-between">
                  <HStack>
                    <Text fontSize="sm" fontWeight="bold">
                      {index + 1}.
                    </Text>
                    <Text fontSize="sm">{cat.category}</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="blue.500">
                    {cat.postCount}개
                  </Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="xs" mb={3} color="green.500">
              평균 조회수 순위
            </Heading>
            <VStack spacing={2} align="stretch">
              {categoryAnalysis.topCategories.byViews.slice(0, 3).map((cat, index) => (
                <HStack key={cat.category} justify="space-between">
                  <HStack>
                    <Text fontSize="sm" fontWeight="bold">
                      {index + 1}.
                    </Text>
                    <Text fontSize="sm">{cat.category}</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="green.500">
                    {cat.avgViews}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="xs" mb={3} color="purple.500">
              평균 좋아요 순위
            </Heading>
            <VStack spacing={2} align="stretch">
              {categoryAnalysis.topCategories.byLikes.slice(0, 3).map((cat, index) => (
                <HStack key={cat.category} justify="space-between">
                  <HStack>
                    <Text fontSize="sm" fontWeight="bold">
                      {index + 1}.
                    </Text>
                    <Text fontSize="sm">{cat.category}</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="purple.500">
                    {cat.avgLikes}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="xs" mb={3} color="teal.500">
              평균 저장 순위
            </Heading>
            <VStack spacing={2} align="stretch">
              {categoryAnalysis.topCategories.bySaves?.slice(0, 3).map((cat, index) => (
                <HStack key={cat.category} justify="space-between">
                  <HStack>
                    <Text fontSize="sm" fontWeight="bold">
                      {index + 1}.
                    </Text>
                    <Text fontSize="sm">{cat.category}</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="teal.500">
                    {cat.avgSaves}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="xs" mb={3} color="orange.500">
              저장 참여도 순위
            </Heading>
            <VStack spacing={2} align="stretch">
              {categoryAnalysis.topCategories.bySaveEngagement?.slice(0, 3).map((cat, index) => (
                <HStack key={cat.category} justify="space-between">
                  <HStack>
                    <Text fontSize="sm" fontWeight="bold">
                      {index + 1}.
                    </Text>
                    <Text fontSize="sm">{cat.category}</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="orange.500">
                    {cat.saveEngagementScore}점
                  </Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </VStack>
  )
}

export default CategoryStatsCharts