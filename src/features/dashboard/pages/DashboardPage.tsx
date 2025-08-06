import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Icon,
  Skeleton,
  Badge,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react'
import { 
  FiUsers, 
  FiShield, 
  FiMapPin, 
  FiActivity,
  FiPhone,
  FiStar,
  FiFileText,
  FiTrendingUp,
  FiClock,
} from 'react-icons/fi'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useDashboardStats, useRecentActivities, useSystemStatus } from '../hooks/useDashboard'
import { useMemo } from 'react'

const DashboardPage = () => {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities(10)
  const { data: systemStatus, isLoading: systemLoading } = useSystemStatus()

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // 통계 카드 데이터
  const statCards = useMemo(() => {
    if (!stats) return []

    const prevMembers = stats.totalMembers * 0.95 // 임시 이전 데이터
    const prevFacilities = stats.totalFacilities * 0.98
    const prevAdmins = stats.totalAdmins
    const prevActivities = stats.todayActivities * 0.8

    return [
      {
        label: '전체 회원',
        value: stats.totalMembers.toLocaleString(),
        subValue: `오늘 활동: ${stats.activeMembersToday}명`,
        change: Math.round(((stats.totalMembers - prevMembers) / prevMembers) * 100),
        icon: FiUsers,
        color: 'blue',
      },
      {
        label: '시설',
        value: stats.activeFacilities.toLocaleString(),
        subValue: `전체: ${stats.totalFacilities.toLocaleString()}개`,
        change: Math.round(((stats.totalFacilities - prevFacilities) / prevFacilities) * 100),
        icon: FiMapPin,
        color: 'green',
      },
      {
        label: '관리자',
        value: stats.activeAdmins.toLocaleString(),
        subValue: `전체: ${stats.totalAdmins}명`,
        change: Math.round(((stats.totalAdmins - prevAdmins) / prevAdmins) * 100),
        icon: FiShield,
        color: 'purple',
      },
      {
        label: '오늘 활동',
        value: stats.todayActivities.toLocaleString(),
        subValue: `최근 7일: ${stats.recentActivities.toLocaleString()}건`,
        change: Math.round(((stats.todayActivities - prevActivities) / prevActivities) * 100),
        icon: FiActivity,
        color: 'orange',
      },
    ]
  }, [stats])

  // 활동 타입별 아이콘과 색상
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ai_analysis':
        return { icon: FiFileText, color: 'blue' }
      case 'assessment':
        return { icon: FiTrendingUp, color: 'green' }
      case 'call':
        return { icon: FiPhone, color: 'orange' }
      case 'favorite':
        return { icon: FiStar, color: 'yellow' }
      default:
        return { icon: FiActivity, color: 'gray' }
    }
  }

  // 시스템 상태 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'green'
      case 'warning':
        return 'yellow'
      case 'error':
        return 'red'
      default:
        return 'gray'
    }
  }

  // 상대 시간 계산
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  return (
    <Box>
      <VStack align="stretch" spacing="6">
        <Box>
          <Heading size="lg" mb="2">
            대시보드
          </Heading>
          <Text color="gray.600">
            {user?.name}님, 환영합니다! 오늘의 현황을 확인해보세요.
          </Text>
        </Box>

        {/* 통계 카드 */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="6">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <GridItem key={i}>
                  <Card>
                    <CardBody>
                      <Skeleton height="100px" />
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </>
          ) : (
            statCards.map((stat, index) => (
              <GridItem key={index}>
                <Card>
                  <CardBody>
                    <HStack justify="space-between" align="start">
                      <Stat>
                        <StatLabel color="gray.600">{stat.label}</StatLabel>
                        <StatNumber fontSize="3xl">{stat.value}</StatNumber>
                        <StatHelpText>
                          {stat.change !== 0 && (
                            <StatArrow type={stat.change > 0 ? 'increase' : 'decrease'} />
                          )}
                          {stat.change !== 0 && `${Math.abs(stat.change)}%`}
                          {stat.subValue && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              {stat.subValue}
                            </Text>
                          )}
                        </StatHelpText>
                      </Stat>
                      <Box
                        p="3"
                        bg={`${stat.color}.50`}
                        borderRadius="lg"
                      >
                        <Icon
                          as={stat.icon}
                          boxSize="6"
                          color={`${stat.color}.500`}
                        />
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              </GridItem>
            ))
          )}
        </Grid>

        <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap="6">
          {/* 최근 활동 */}
          <GridItem>
            <Card>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">최근 활동</Heading>
                  <Icon as={FiClock} color="gray.500" />
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing="4">
                  {activitiesLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} height="60px" />
                      ))}
                    </>
                  ) : activities && activities.length > 0 ? (
                    activities.map((activity) => {
                      const { icon, color } = getActivityIcon(activity.type)
                      return (
                        <HStack
                          key={activity.id}
                          p={3}
                          bg={cardBg}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="md"
                          spacing={3}
                        >
                          <Box
                            p={2}
                            bg={`${color}.50`}
                            borderRadius="md"
                          >
                            <Icon as={icon} color={`${color}.500`} />
                          </Box>
                          <VStack align="start" flex={1} spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {activity.description}
                            </Text>
                            <HStack spacing={2} fontSize="xs" color="gray.500">
                              {activity.userName && (
                                <Text>{activity.userName}</Text>
                              )}
                              {activity.facilityName && (
                                <>
                                  <Text>•</Text>
                                  <Text>{activity.facilityName}</Text>
                                </>
                              )}
                            </HStack>
                          </VStack>
                          <Text fontSize="xs" color="gray.500">
                            {getRelativeTime(activity.timestamp)}
                          </Text>
                        </HStack>
                      )
                    })
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>
                      최근 활동이 없습니다.
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* 시스템 상태 */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">시스템 상태</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing="4">
                  {systemLoading ? (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} height="30px" />
                      ))}
                    </>
                  ) : systemStatus ? (
                    <>
                      <HStack justify="space-between">
                        <Text>데이터베이스</Text>
                        <Badge colorScheme={getStatusColor(systemStatus.database)}>
                          {systemStatus.database === 'normal' ? '정상' : 
                           systemStatus.database === 'warning' ? '경고' : '오류'}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>API 서버</Text>
                        <Badge colorScheme={getStatusColor(systemStatus.api)}>
                          {systemStatus.api === 'normal' ? '정상' : 
                           systemStatus.api === 'warning' ? '경고' : '오류'}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>인증 서비스</Text>
                        <Badge colorScheme={getStatusColor(systemStatus.auth)}>
                          {systemStatus.auth === 'normal' ? '정상' : 
                           systemStatus.auth === 'warning' ? '경고' : '오류'}
                        </Badge>
                      </HStack>
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text>스토리지</Text>
                          <Text 
                            fontSize="sm" 
                            color={`${getStatusColor(systemStatus.storage.status)}.500`}
                            fontWeight="semibold"
                          >
                            {systemStatus.storage.usage}% 사용
                          </Text>
                        </HStack>
                        <Progress 
                          value={systemStatus.storage.usage} 
                          size="sm" 
                          colorScheme={getStatusColor(systemStatus.storage.status)}
                          borderRadius="full"
                        />
                      </Box>
                    </>
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>
                      상태 정보를 불러올 수 없습니다.
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  )
}

export default DashboardPage