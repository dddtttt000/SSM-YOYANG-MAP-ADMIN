import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  VStack,
  Select,
  Input,
  Button,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useMonitoringData, useActivityStats } from '../hooks/useMonitoring'
import { MonitoringFilters } from '../types'
import { FiActivity, FiPhone, FiStar, FiDatabase } from 'react-icons/fi'
import { createTestData } from '../services/testData'
import AIAnalysisTable from '../components/AIAnalysisTable'
import AssessmentResultsTable from '../components/AssessmentResultsTable'
import CallEventsTable from '../components/CallEventsTable'
import FavoriteFacilitiesTable from '../components/FavoriteFacilitiesTable'
import { firestore } from '@/lib/firebase'
import { logger } from '@/utils/logger'

const MonitoringPage = () => {
  const [filters, setFilters] = useState<MonitoringFilters>({
    activityType: 'all',
  })

  const { data: monitoringData, isLoading: isLoadingData, error: dataError } = useMonitoringData(filters)
  const { data: stats, isLoading: isLoadingStats } = useActivityStats(filters)

  // Firebase 연결 상태 확인
  useEffect(() => {
    logger.log('Firebase 연결 상태:', {
      firestore: !!firestore,
      // Firestore 인스턴스가 있으면 연결됨
      connected: !!firestore,
    })
  }, [])

  // 날짜 필터 핸들러
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (value) {
      setFilters(prev => ({
        ...prev,
        [field]: new Date(value),
      }))
    } else {
      const newFilters = { ...filters }
      delete newFilters[field]
      setFilters(newFilters)
    }
  }

  // 활동 유형 필터 핸들러
  const handleActivityTypeChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      activityType: value as MonitoringFilters['activityType'],
    }))
  }

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      activityType: 'all',
    })
  }

  // 테스트 데이터 생성 (개발용)
  const handleCreateTestData = async () => {
    try {
      await createTestData()
      alert('테스트 데이터가 생성되었습니다. 페이지를 새로고침해주세요.')
    } catch (error) {
      logger.error('테스트 데이터 생성 실패:', error)
      alert('테스트 데이터 생성에 실패했습니다.')
    }
  }

  // 날짜 포맷
  const formatDate = (date?: Date) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  if (dataError) {
    return (
      <Container maxW='container.xl' py='8'>
        <Alert status='error'>
          <AlertIcon />
          모니터링 데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW='container.xl' py='8'>
      <VStack spacing='8' align='stretch'>
        {/* 헤더 */}
        <Box>
          <HStack justify='space-between' align='start'>
            <Box>
              <Heading size='lg' mb='2'>
                모니터링
              </Heading>
              <Text color='gray.600'>회원들의 서비스 이용 활동을 모니터링합니다.</Text>
            </Box>
            {/* 개발 환경에서만 표시 */}
            {import.meta.env.DEV && (
              <Button size='sm' colorScheme='purple' onClick={handleCreateTestData}>
                테스트 데이터 생성
              </Button>
            )}
          </HStack>
        </Box>

        {/* 필터 섹션 */}
        <Card>
          <CardBody>
            <HStack spacing='4' wrap='wrap'>
              <Box>
                <Text fontSize='sm' mb='1' color='gray.600'>
                  시작일
                </Text>
                <Input
                  type='date'
                  value={formatDate(filters.startDate)}
                  onChange={e => handleDateChange('startDate', e.target.value)}
                  size='sm'
                />
              </Box>
              <Box>
                <Text fontSize='sm' mb='1' color='gray.600'>
                  종료일
                </Text>
                <Input
                  type='date'
                  value={formatDate(filters.endDate)}
                  onChange={e => handleDateChange('endDate', e.target.value)}
                  size='sm'
                />
              </Box>
              <Box>
                <Text fontSize='sm' mb='1' color='gray.600'>
                  활동 유형
                </Text>
                <Select
                  value={filters.activityType}
                  onChange={e => handleActivityTypeChange(e.target.value)}
                  size='sm'
                  width='150px'
                >
                  <option value='all'>전체</option>
                  <option value='ai_analysis'>AI 분석</option>
                  <option value='assessment'>등급 평가</option>
                  <option value='call'>상담 전화</option>
                  <option value='favorite'>즐겨찾기</option>
                </Select>
              </Box>
              <Box alignSelf='flex-end'>
                <Button size='sm' onClick={handleResetFilters} variant='outline'>
                  필터 초기화
                </Button>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* 통계 카드 */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap='6'>
          <GridItem>
            <Card>
              <CardBody>
                {isLoadingStats ? (
                  <Skeleton height='80px' />
                ) : (
                  <Stat>
                    <StatLabel>전체 활동</StatLabel>
                    <StatNumber>{stats?.totalActivities || 0}</StatNumber>
                    <StatHelpText>
                      <StatArrow type='increase' />
                      최근 7일
                    </StatHelpText>
                  </Stat>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                {isLoadingStats ? (
                  <Skeleton height='80px' />
                ) : (
                  <Stat>
                    <StatLabel>활성 회원</StatLabel>
                    <StatNumber>{stats?.uniqueUsers || 0}</StatNumber>
                    <StatHelpText>중복 제외</StatHelpText>
                  </Stat>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                {isLoadingStats ? (
                  <Skeleton height='80px' />
                ) : (
                  <Stat>
                    <StatLabel>이용 시설</StatLabel>
                    <StatNumber>{stats?.uniqueFacilities || 0}</StatNumber>
                    <StatHelpText>중복 제외</StatHelpText>
                  </Stat>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                {isLoadingStats ? (
                  <Skeleton height='80px' />
                ) : (
                  <Stat>
                    <StatLabel>평균 활동</StatLabel>
                    <StatNumber>
                      {stats?.uniqueUsers ? (stats.totalActivities / stats.uniqueUsers).toFixed(1) : 0}
                    </StatNumber>
                    <StatHelpText>회원당</StatHelpText>
                  </Stat>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* 활동 탭 */}
        <Card>
          <CardBody>
            <Tabs variant='enclosed'>
              <TabList>
                <Tab>
                  <HStack spacing='2'>
                    <FiDatabase />
                    <Text>AI 분석 ({monitoringData?.aiAnalyses.length || 0})</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing='2'>
                    <FiActivity />
                    <Text>등급 평가 ({monitoringData?.assessmentResults.length || 0})</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing='2'>
                    <FiPhone />
                    <Text>상담 전화 ({monitoringData?.callEvents.length || 0})</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing='2'>
                    <FiStar />
                    <Text>즐겨찾기 ({monitoringData?.favoriteFacilities.length || 0})</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <AIAnalysisTable data={monitoringData?.aiAnalyses || []} isLoading={isLoadingData} />
                </TabPanel>
                <TabPanel>
                  <AssessmentResultsTable data={monitoringData?.assessmentResults || []} isLoading={isLoadingData} />
                </TabPanel>
                <TabPanel>
                  <CallEventsTable data={monitoringData?.callEvents || []} isLoading={isLoadingData} />
                </TabPanel>
                <TabPanel>
                  <FavoriteFacilitiesTable data={monitoringData?.favoriteFacilities || []} isLoading={isLoadingData} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default MonitoringPage
