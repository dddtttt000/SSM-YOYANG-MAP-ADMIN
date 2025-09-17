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
} from '@chakra-ui/react'
import PostManagementTable from '../components/posts/PostManagementTable'
import PostFilters from '../components/posts/PostFilters'
import CommunityReportList from '../components/reports/CommunityReportList'
import CommunityStats from '../components/stats/CommunityStats'
import type { PostFilters as PostFiltersType, ReportFilters } from '../services'

const CommunityManagementPage = () => {
  const location = useLocation()
  const [selectedTab, setSelectedTab] = useState(0)
  const [postFilters, setPostFilters] = useState<PostFiltersType>({})
  const [reportFilters, setReportFilters] = useState<ReportFilters>({})
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  // 뒤로가기에서 전달받은 state 처리
  useEffect(() => {
    const state = location.state as any
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

  return (
    <Box minH='100vh' bg={bgColor}>
      <Flex align='center' mb={6}>
        <Heading size='lg' color='gray.700'>
          커뮤니티 관리
        </Heading>
        <Spacer />
        {/* <Button colorScheme='blue' size='sm'>
          내보내기
        </Button> */}
      </Flex>

      <Box bg={cardBg} rounded='lg' shadow='base' p={6}>
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
      </Box>
    </Box>
  )
}

export default CommunityManagementPage
