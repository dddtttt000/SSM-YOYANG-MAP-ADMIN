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
  // 유니크한 user_id와 admin_code 추출
  const userIds = useMemo(() => 
    [...new Set(data.map(item => item.user_id))],
    [data]
  )
  
  const adminCodes = useMemo(() => 
    [...new Set(data.map(item => item.admin_code))],
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

  // 프롬프트 타입 라벨
  const getPromptTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'facility_info': '시설 정보',
      'comparison': '시설 비교',
      'recommendation': '시설 추천',
      'detailed_analysis': '상세 분석',
    }
    return labels[type] || type
  }

  // 프롬프트 타입 색상
  const getPromptTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'facility_info': 'blue',
      'comparison': 'green',
      'recommendation': 'purple',
      'detailed_analysis': 'orange',
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
            <Th>분석 유형</Th>
            <Th>요약</Th>
            <Th width="60px">동작</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((analysis) => {
            const member = memberMap?.get(analysis.user_id)
            const facility = facilityMap?.get(analysis.admin_code)
            
            return (
              <Tr key={analysis.id}>
                <Td>
                  <Text fontSize="sm">
                    {formatTimestamp(analysis.analysis_date)}
                  </Text>
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="medium">
                      {member?.nickname || member?.name || '-'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {member?.email || analysis.user_id}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="medium">
                      {facility?.admin_name || '-'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {analysis.admin_code}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Badge 
                    colorScheme={getPromptTypeColor(analysis.prompt_type)}
                    variant="subtle"
                  >
                    {getPromptTypeLabel(analysis.prompt_type)}
                  </Badge>
                </Td>
                <Td>
                  <Text 
                    fontSize="sm" 
                    noOfLines={2}
                    title={analysis.response_summary}
                  >
                    {analysis.response_summary || '-'}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label="시설 상세 보기">
                      <Link
                        href={`/facilities/${analysis.admin_code}`}
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