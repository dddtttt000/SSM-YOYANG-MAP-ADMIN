import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Skeleton,
  Box,
  HStack,
  IconButton,
  Tooltip,
  Link,
} from '@chakra-ui/react'
import { FiExternalLink } from 'react-icons/fi'
import { AIFacilityAnalysis } from '../types'
import { useMemberInfo, useFacilityInfo } from '../hooks/useMonitoring'
import { useMemo } from 'react'
import { Timestamp } from 'firebase/firestore'

interface AIAnalysisTableProps {
  data: AIFacilityAnalysis[]
  isLoading: boolean
}

const AIAnalysisTable = ({ data, isLoading }: AIAnalysisTableProps) => {
  // 유니크한 memberId와 facilityId 추출
  const userIds = useMemo(() => 
    [...new Set(data.map(item => item.memberId))],
    [data]
  )
  
  const adminCodes = useMemo(() => 
    [...new Set(data.map(item => item.facilityId))],
    [data]
  )

  // 회원 및 시설 정보 조회
  const { data: memberMap } = useMemberInfo(userIds)
  const { data: facilityMap } = useFacilityInfo(adminCodes)

  // Timestamp를 날짜 문자열로 변환
  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return '-'
    return timestamp.toDate().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 돌봄 유형 라벨
  const getCareTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'day_night': '주야간보호',
      'visit': '방문요양',
      'facility': '요양시설',
      'short_term': '단기보호',
    }
    return labels[type] || type
  }

  // 돌봄 유형 색상
  const getCareTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'day_night': 'blue',
      'visit': 'green',
      'facility': 'purple',
      'short_term': 'orange',
    }
    return colors[type] || 'gray'
  }

  if (isLoading) {
    return (
      <Box>
        <Skeleton height="300px" />
      </Box>
    )
  }

  if (data.length === 0) {
    return (
      <Box textAlign="center" py="8">
        <Text color="gray.500">AI 분석 활동이 없습니다.</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>분석일시</Th>
            <Th>회원</Th>
            <Th>시설명</Th>
            <Th>요양등급</Th>
            <Th>희망 돌봄</Th>
            <Th>AI 모델</Th>
            <Th width="60px">동작</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((analysis) => {
            const member = memberMap?.get(analysis.memberId)
            const facility = facilityMap?.get(analysis.facilityId)
            
            return (
              <Tr key={analysis.id}>
                <Td>
                  <Text fontSize="sm">
                    {formatTimestamp(analysis.createdAt)}
                  </Text>
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="medium">
                      {member?.nickname || member?.name || '-'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {member?.email || `ID: ${analysis.memberId}`}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="medium">
                      {analysis.facilityName || facility?.admin_name || '-'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {analysis.facilityId}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Badge 
                    colorScheme="teal"
                    variant="solid"
                  >
                    {analysis.longTermCareGrade}
                  </Badge>
                </Td>
                <Td>
                  <Badge 
                    colorScheme={getCareTypeColor(analysis.preferredCareType)}
                    variant="subtle"
                  >
                    {getCareTypeLabel(analysis.preferredCareType)}
                  </Badge>
                </Td>
                <Td>
                  <Text fontSize="xs" color="gray.600">
                    {analysis.aiModelUsed}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label="시설 상세 보기">
                      <Link
                        href={`/facilities/${analysis.facilityId}`}
                        isExternal
                      >
                        <IconButton
                          aria-label="시설 상세"
                          icon={<FiExternalLink />}
                          size="sm"
                          variant="ghost"
                        />
                      </Link>
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </Box>
  )
}

export default AIAnalysisTable