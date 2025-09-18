import { HStack, VStack, Text, useColorModeValue } from '@chakra-ui/react'

interface ReportStatsData {
  total: number
  statusStats: {
    pending: number
    reviewed: number
    resolved: number
  }
}

interface ReportStatsProps {
  stats?: ReportStatsData
  title: string // "게시글" | "댓글"
  colorScheme?: string // "blue" | "purple"
}

const ReportStats = ({ stats, title, colorScheme = 'blue' }: ReportStatsProps) => {
  const summaryBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`)

  return (
    <HStack spacing={4} mb={6} p={4} bg={summaryBg} rounded='md'>
      <VStack spacing={0}>
        <Text fontSize='sm' color='gray.600'>
          전체 {title} 신고
        </Text>
        <Text fontSize='xl' fontWeight='bold' color='gray.900'>
          {stats?.total || 0}건
        </Text>
      </VStack>
      <VStack spacing={0}>
        <Text fontSize='sm' color='gray.600'>
          처리 대기
        </Text>
        <Text fontSize='xl' fontWeight='bold' color='orange.600'>
          {stats?.statusStats.pending || 0}건
        </Text>
      </VStack>
      <VStack spacing={0}>
        <Text fontSize='sm' color='gray.600'>
          검토중
        </Text>
        <Text fontSize='xl' fontWeight='bold' color='blue.600'>
          {stats?.statusStats.reviewed || 0}건
        </Text>
      </VStack>
      <VStack spacing={0}>
        <Text fontSize='sm' color='gray.600'>
          처리완료
        </Text>
        <Text fontSize='xl' fontWeight='bold' color='green.600'>
          {stats?.statusStats.resolved || 0}건
        </Text>
      </VStack>
    </HStack>
  )
}

export default ReportStats