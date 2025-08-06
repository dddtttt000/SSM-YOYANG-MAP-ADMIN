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
import { FiPhone, FiExternalLink } from 'react-icons/fi'
import { CallEvent } from '../types'
import { useMemberInfo, useFacilityInfo } from '../hooks/useMonitoring'
import { useMemo } from 'react'
import { Timestamp } from 'firebase/firestore'

interface CallEventsTableProps {
  data: CallEvent[]
  isLoading: boolean
}

const CallEventsTable = ({ data, isLoading }: CallEventsTableProps) => {
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
  const formatTimestamp = (timestamp: Timestamp | string) => {
    if (!timestamp) return '-'
    
    let date: Date
    if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    } else if (timestamp.toDate) {
      date = timestamp.toDate()
    } else {
      return '-'
    }
    
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 통화 시간 포맷
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}분 ${remainingSeconds}초`
  }

  // 전화번호 포맷
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '-'
    // 하이픈이 없는 경우 추가
    if (phone.length === 11 && !phone.includes('-')) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
    }
    if (phone.length === 10 && !phone.includes('-')) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
    }
    return phone
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
        <Text color="gray.500">상담 전화 활동이 없습니다.</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>통화일시</Th>
            <Th>회원</Th>
            <Th>시설명</Th>
            <Th>주소</Th>
            <Th>통화 시간</Th>
            <Th width="60px">동작</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((call) => {
            const member = memberMap?.get(call.memberId)
            const facility = facilityMap?.get(call.facilityId)
            
            return (
              <Tr key={call.id}>
                <Td>
                  <Text fontSize="sm">
                    {formatTimestamp(call.createdAt || call.callStartTime)}
                  </Text>
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="medium">
                      {member?.nickname || member?.name || '-'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {member?.email || `ID: ${call.memberId}`}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="medium">
                      {call.facilityName || facility?.admin_name || '-'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {call.facilityId}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Text fontSize="sm" noOfLines={1} title={call.facilityAddress}>
                    {call.facilityAddress || '-'}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm">
                    {formatDuration(call.callDurationSeconds)}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label="시설 상세 보기">
                      <Link
                        href={`/facilities/${call.facilityId}`}
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

export default CallEventsTable