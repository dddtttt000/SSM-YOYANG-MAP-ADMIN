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
import { FiStar, FiExternalLink } from 'react-icons/fi'
import { FavoriteFacility } from '../types'
import { useMemberInfo, useFacilityInfo } from '../hooks/useMonitoring'
import { useMemo } from 'react'
import { Timestamp } from 'firebase/firestore'
import { FACILITY_TYPE_LABELS } from '@/features/facilities/constants/facilityTypes'

interface FavoriteFacilitiesTableProps {
  data: FavoriteFacility[]
  isLoading: boolean
}

const FavoriteFacilitiesTable = ({ data, isLoading }: FavoriteFacilitiesTableProps) => {
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

  // 시설 유형 라벨
  const getFacilityTypeLabels = (typeCode?: string) => {
    if (!typeCode) return '-'
    
    // 쉼표로 구분된 여러 유형 처리
    const types = typeCode.split(',').map(code => code.trim())
    const labels = types.map(code => FACILITY_TYPE_LABELS[code] || code)
    
    if (labels.length === 1) {
      return labels[0]
    }
    
    return (
      <Tooltip label={labels.join(', ')}>
        <Text cursor="help">
          {labels[0]} 외 {labels.length - 1}개
        </Text>
      </Tooltip>
    )
  }

  // 시간 차이 계산 (등록 후 경과 시간)
  const getTimeDifference = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return '-'
    
    const now = new Date()
    const created = timestamp.toDate()
    const diffMs = now.getTime() - created.getTime()
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days}일 전`
    } else if (hours > 0) {
      return `${hours}시간 전`
    } else {
      const minutes = Math.floor(diffMs / (1000 * 60))
      return `${minutes}분 전`
    }
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
        <Text color="gray.500">즐겨찾기 활동이 없습니다.</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>등록일시</Th>
            <Th>회원</Th>
            <Th>시설명</Th>
            <Th>시설 유형</Th>
            <Th>주소</Th>
            <Th>상태</Th>
            <Th>경과 시간</Th>
            <Th width="60px">동작</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((favorite) => {
            const member = memberMap?.get(favorite.user_id)
            const facility = facilityMap?.get(favorite.admin_code)
            
            return (
              <Tr key={favorite.id}>
                <Td>
                  <Text fontSize="sm">
                    {formatTimestamp(favorite.created_at)}
                  </Text>
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="medium">
                      {member?.nickname || member?.name || '-'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {member?.email || favorite.user_id}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <HStack spacing={1}>
                      <FiStar size={14} color="gold" />
                      <Text fontWeight="medium">
                        {facility?.admin_name || '-'}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {favorite.admin_code}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Text fontSize="sm">
                    {getFacilityTypeLabels(facility?.admin_type_code)}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" noOfLines={1} title={facility?.address}>
                    {facility?.address || '-'}
                  </Text>
                </Td>
                <Td>
                  <Badge 
                    colorScheme={favorite.is_active ? 'green' : 'gray'}
                    variant="subtle"
                  >
                    {favorite.is_active ? '활성' : '비활성'}
                  </Badge>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {getTimeDifference(favorite.created_at)}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label="시설 상세 보기">
                      <Link
                        href={`/facilities/${favorite.admin_code}`}
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

export default FavoriteFacilitiesTable