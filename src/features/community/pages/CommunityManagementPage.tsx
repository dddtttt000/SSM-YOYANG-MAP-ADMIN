import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Flex,
  Spacer,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FiEdit3, FiAlertTriangle, FiMessageSquare, FiBarChart } from 'react-icons/fi'
import PostManagementTable from '../components/posts/PostManagementTable'
import PostFilters from '../components/posts/PostFilters'
import CommunityReportList from '../components/reports/CommunityReportList'
import PostReportList from '../components/reports/PostReportList'
import CommentReportList from '../components/reports/CommentReportList'
import CommunityStats from '../components/stats/CommunityStats'
import { dashboardService } from '../services/dashboardService'
import type { PostFilters as PostFiltersType, ReportFilters } from '../services'
import { useQuery } from '@tanstack/react-query'

const CommunityManagementPage = () => {
  const location = useLocation()
  const [selectedTab, setSelectedTab] = useState(0)
  const [postFilters, setPostFilters] = useState<PostFiltersType>({})
  const [reportFilters, setReportFilters] = useState<ReportFilters>({})
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  // 현재 경로에 따라 컨텐츠 결정
  const currentPath = location.pathname

  // 대시보드 통계 데이터 조회
  const { data: dashboardStats, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['communityDashboardStats'],
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    refetchInterval: 10 * 60 * 1000, // 10분마다 자동 갱신
  })

  // 뒤로가기에서 전달받은 state 처리
  useEffect(() => {
    const state = location.state
    if (state?.activeTab !== undefined) {
      setSelectedTab(state.activeTab)
    }
    if (state?.reportFilters) {
      setReportFilters(state.reportFilters)
    }
    // location state를 처리한 후 정리
    if (state) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // 경로 변경 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPath])

  // 경로별 페이지 제목
  const getPageTitle = () => {
    switch (currentPath) {
      case '/community':
        return '커뮤니티 대시보드'
      case '/community/posts':
        return '게시글 관리'
      case '/community/reports/posts':
        return '게시글 신고 관리'
      case '/community/reports/comments':
        return '댓글 신고 관리'
      case '/community/stats':
        return '커뮤니티 통계'
      default:
        return '커뮤니티 관리'
    }
  }

  // 경로별 컨텐츠 렌더링
  const renderContent = () => {
    switch (currentPath) {
      case '/community':
        return (
          <Box>
            {/* 커뮤니티 대시보드 */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
              <Card
                as={Link}
                to="/community/posts"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                  bg: 'blue.50'
                }}
                transition="all 0.2s"
                cursor="pointer"
                border="1px solid"
                borderColor="transparent"
                _active={{ borderColor: 'blue.200' }}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color="blue.600">총 게시글 📝</StatLabel>
                    <StatNumber color="blue.700">
                      {isDashboardLoading ? '-' : (dashboardStats?.totalPosts || 0).toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      {isDashboardLoading
                        ? '로딩 중...'
                        : dashboardStats?.postGrowth
                          ? `이번 달 ${dashboardStats.postGrowth > 0 ? '+' : ''}${dashboardStats.postGrowth}%`
                          : '변화 없음'
                      }
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                as={Link}
                to="/community/stats"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                  bg: 'green.50'
                }}
                transition="all 0.2s"
                cursor="pointer"
                border="1px solid"
                borderColor="transparent"
                _active={{ borderColor: 'green.200' }}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color="green.600">총 댓글 💬</StatLabel>
                    <StatNumber color="green.700">
                      {isDashboardLoading ? '-' : (dashboardStats?.totalComments || 0).toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      {isDashboardLoading
                        ? '로딩 중...'
                        : dashboardStats?.commentGrowth
                          ? `이번 달 ${dashboardStats.commentGrowth > 0 ? '+' : ''}${dashboardStats.commentGrowth}%`
                          : '변화 없음'
                      }
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                as={Link}
                to="/community/reports/posts"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                  bg: 'orange.50'
                }}
                transition="all 0.2s"
                cursor="pointer"
                border="1px solid"
                borderColor="transparent"
                _active={{ borderColor: 'orange.200' }}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color="orange.600">게시글 신고 대기 🚨</StatLabel>
                    <StatNumber color={dashboardStats?.postReportsPending ? 'orange.600' : 'green.600'}>
                      {isDashboardLoading ? '-' : (dashboardStats?.postReportsPending || 0)}
                    </StatNumber>
                    <StatHelpText>
                      {isDashboardLoading
                        ? '로딩 중...'
                        : dashboardStats?.postReportsPending
                          ? '처리 필요'
                          : '처리 완료'
                      }
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                as={Link}
                to="/community/reports/comments"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                  bg: 'purple.50'
                }}
                transition="all 0.2s"
                cursor="pointer"
                border="1px solid"
                borderColor="transparent"
                _active={{ borderColor: 'purple.200' }}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color="purple.600">댓글 신고 대기 ⚠️</StatLabel>
                    <StatNumber color={dashboardStats?.commentReportsPending ? 'purple.600' : 'green.600'}>
                      {isDashboardLoading ? '-' : (dashboardStats?.commentReportsPending || 0)}
                    </StatNumber>
                    <StatHelpText>
                      {isDashboardLoading
                        ? '로딩 중...'
                        : dashboardStats?.commentReportsPending
                          ? '처리 필요'
                          : '처리 완료'
                      }
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* 빠른 액세스 카드들 */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Icon as={FiEdit3} color="blue.500" />
                      <Text fontSize="lg" fontWeight="semibold">게시글 관리</Text>
                    </HStack>
                    <Text color="gray.600">게시글 목록, 수정, 삭제 및 상태 관리</Text>
                    <Button as={Link} to="/community/posts" colorScheme="blue" size="sm">
                      게시글 관리하기
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Icon as={FiBarChart} color="green.500" />
                      <Text fontSize="lg" fontWeight="semibold">통계 및 분석</Text>
                    </HStack>
                    <Text color="gray.600">커뮤니티 활동 통계 및 트렌드 분석</Text>
                    <Button as={Link} to="/community/stats" colorScheme="green" size="sm">
                      통계 보기
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Icon as={FiAlertTriangle} color="orange.500" />
                      <Text fontSize="lg" fontWeight="semibold">게시글 신고</Text>
                      {!isDashboardLoading && dashboardStats?.postReportsPending && dashboardStats.postReportsPending > 0 && (
                        <Text fontSize="sm" bg="orange.100" color="orange.800" px={2} py={1} rounded="md">
                          {dashboardStats.postReportsPending}건 대기
                        </Text>
                      )}
                    </HStack>
                    <Text color="gray.600">신고된 게시글 검토 및 처리</Text>
                    <Button as={Link} to="/community/reports/posts" colorScheme="orange" size="sm">
                      신고 처리하기
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Icon as={FiMessageSquare} color="purple.500" />
                      <Text fontSize="lg" fontWeight="semibold">댓글 신고</Text>
                      {!isDashboardLoading && dashboardStats?.commentReportsPending && dashboardStats.commentReportsPending > 0 && (
                        <Text fontSize="sm" bg="purple.100" color="purple.800" px={2} py={1} rounded="md">
                          {dashboardStats.commentReportsPending}건 대기
                        </Text>
                      )}
                    </HStack>
                    <Text color="gray.600">신고된 댓글 검토 및 처리</Text>
                    <Button as={Link} to="/community/reports/comments" colorScheme="purple" size="sm">
                      댓글 신고 처리하기
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Box>
        )

      case '/community/posts':
        return (
          <Box>
            <PostFilters onFiltersChange={setPostFilters} initialFilters={postFilters} />
            <PostManagementTable filters={postFilters} onFiltersChange={setPostFilters} />
          </Box>
        )

      case '/community/reports/posts':
        return (
          <Box>
            <PostReportList />
          </Box>
        )

      case '/community/reports/comments':
        return (
          <Box>
            <CommentReportList />
          </Box>
        )

      case '/community/stats':
        return (
          <Box>
            <CommunityStats />
          </Box>
        )

      default:
        // 기존 탭 기반 UI (fallback)
        return (
          <Tabs index={selectedTab} onChange={setSelectedTab} colorScheme='blue'>
            <TabList>
              <Tab>게시글 관리</Tab>
              <Tab>신고 관리</Tab>
              <Tab>통계</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Box>
                  <PostFilters onFiltersChange={setPostFilters} initialFilters={postFilters} />
                  <PostManagementTable filters={postFilters} onFiltersChange={setPostFilters} />
                </Box>
              </TabPanel>

              <TabPanel>
                <Box>
                  <CommunityReportList initialFilters={reportFilters} />
                </Box>
              </TabPanel>

              <TabPanel>
                <Box>
                  <CommunityStats />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )
    }
  }

  return (
    <Box minH='100vh' bg={bgColor}>
      <Flex align='center' mb={6}>
        <Heading size='lg' color='gray.700'>
          {getPageTitle()}
        </Heading>
        <Spacer />
      </Flex>

      <Box
        bg={cardBg}
        rounded='lg'
        shadow='base'
        p={6}
        key={currentPath} // 경로가 변경될 때마다 컴포넌트 재렌더링
        style={{
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        {renderContent()}
      </Box>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  )
}

export default CommunityManagementPage
