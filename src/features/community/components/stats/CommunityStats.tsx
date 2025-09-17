import { VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import CategoryStatsCharts from './CategoryStatsCharts'
import CategoryStatsTable from './CategoryStatsTable'

const CommunityStats = () => {
  return (
    <VStack spacing={6} align="stretch">
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>📊 차트 분석</Tab>
          <Tab>📋 상세 테이블</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <CategoryStatsCharts />
          </TabPanel>
          <TabPanel px={0}>
            <CategoryStatsTable />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}

export default CommunityStats