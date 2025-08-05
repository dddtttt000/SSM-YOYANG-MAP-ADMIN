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
} from '@chakra-ui/react'
import { FiUsers, FiShield, FiMapPin, FiActivity } from 'react-icons/fi'
import { useAuth } from '@/features/auth/contexts/AuthContext'

const DashboardPage = () => {
  const { user } = useAuth()

  // 임시 데이터 - 실제로는 API에서 가져옴
  const stats = [
    {
      label: '전체 회원',
      value: '1,234',
      change: 12,
      icon: FiUsers,
      color: 'blue',
    },
    {
      label: '관리자',
      value: '12',
      change: 0,
      icon: FiShield,
      color: 'purple',
    },
    {
      label: '시설',
      value: '456',
      change: 5,
      icon: FiMapPin,
      color: 'green',
    },
    {
      label: '활성 세션',
      value: '89',
      change: -3,
      icon: FiActivity,
      color: 'orange',
    },
  ]

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

        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="6">
          {stats.map((stat, index) => (
            <GridItem key={index}>
              <Card>
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <Stat>
                      <StatLabel color="gray.600">{stat.label}</StatLabel>
                      <StatNumber fontSize="3xl">{stat.value}</StatNumber>
                      <StatHelpText>
                        <StatArrow type={stat.change > 0 ? 'increase' : 'decrease'} />
                        {Math.abs(stat.change)}%
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
          ))}
        </Grid>

        <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap="6">
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">최근 활동</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing="4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Box key={item}>
                      <Skeleton height="60px" />
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">시스템 상태</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing="4">
                  <HStack justify="space-between">
                    <Text>데이터베이스</Text>
                    <Text color="green.500" fontWeight="semibold">정상</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>API 서버</Text>
                    <Text color="green.500" fontWeight="semibold">정상</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>인증 서비스</Text>
                    <Text color="green.500" fontWeight="semibold">정상</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>스토리지</Text>
                    <Text color="yellow.500" fontWeight="semibold">85% 사용</Text>
                  </HStack>
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