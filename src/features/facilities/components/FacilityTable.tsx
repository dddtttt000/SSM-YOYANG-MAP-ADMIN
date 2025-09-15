import React, { useMemo } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { Facility } from '@/types/database.types'
import { getFacilityTypeLabel } from '../constants/facilityTypes'
import { formatPhoneNumber } from '../utils/formatters'

interface FacilityTableProps {
  facilities: Facility[]
  isLoading: boolean
  onView: (facility: Facility) => void
}

const getRatingBadgeColor = (rating: string | null) => {
  if (!rating) return 'gray'
  switch (rating) {
    case 'A':
      return 'green'
    case 'B':
      return 'blue'
    case 'C':
      return 'yellow'
    case 'D':
      return 'orange'
    case 'E':
      return 'red'
    default:
      return 'gray'
  }
}

const FacilityTable = React.memo(({ facilities, isLoading, onView }: FacilityTableProps) => {

  // 렌더링 최적화를 위한 memoization
  const facilitiesWithFormatting = useMemo(() => 
    facilities.map(facility => ({
      ...facility,
      formattedPhone: formatPhoneNumber(facility),
      typeLabel: facility.admin_type_code ? getFacilityTypeLabel(facility.admin_type_code) : '',
      ratingColor: getRatingBadgeColor(facility.final_rating)
    })), [facilities]
  )

  if (isLoading) {
    return (
      <TableContainer overflowX='auto'>
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>시설명</Th>
              <Th>유형</Th>
              <Th>주소</Th>
              <Th>정원</Th>
              <Th>평가 등급</Th>
              <Th>설치일</Th>
              <Th>연락처</Th>
            </Tr>
          </Thead>
          <Tbody>
            {[...Array(5)].map((_, index) => (
              <Tr key={index}>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='40px' />
                </Td>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='20px' />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    )
  }

  if (facilities.length === 0) {
    return (
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>시설명</Th>
              <Th>유형</Th>
              <Th>주소</Th>
              <Th>정원</Th>
              <Th>평가 등급</Th>
              <Th>설치일</Th>
              <Th>연락처</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={7}>
                <Text textAlign='center' color='gray.500' py='8'>
                  등록된 시설이 없습니다.
                </Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <TableContainer overflowX='auto'>
      <Table variant='simple' size='sm'>
        <Thead>
          <Tr>
            <Th>시설명</Th>
            <Th>유형</Th>
            <Th>주소</Th>
            <Th>정원</Th>
            <Th>평가 등급</Th>
            <Th>설치일</Th>
            <Th>연락처</Th>
          </Tr>
        </Thead>
        <Tbody>
          {facilitiesWithFormatting.map(facility => (
            <Tr key={facility.admin_code} _hover={{ bg: 'gray.50', cursor: 'pointer' }} onClick={() => onView(facility)}>
              <Td fontWeight='medium'>{facility.admin_name || '시설명 없음'}</Td>
              <Td>
                {facility.admin_type_code && (
                  <Tooltip
                    label={`${facility.admin_type_code} - ${facility.typeLabel}`}
                    placement='top'
                    hasArrow
                  >
                    <Badge colorScheme='blue' size='sm' cursor='help'>
                      {facility.admin_type_code}
                    </Badge>
                  </Tooltip>
                )}
              </Td>
              <Td>
                <Text
                  fontSize='sm'
                  whiteSpace='normal'
                  wordBreak='break-all'
                  lineHeight='1.3'
                >
                  {facility.address || '-'}
                </Text>
              </Td>
              <Td>
                <Text fontSize='sm'>{facility.capacity || 0}명</Text>
              </Td>
              <Td>
                {facility.final_rating && (
                  <Badge colorScheme={facility.ratingColor}>{facility.final_rating}</Badge>
                )}
              </Td>
              <Td>
                {facility.install_date
                  ? new Date(facility.install_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                  : '-'}
              </Td>
              <Td>{facility.formattedPhone}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
})

export default FacilityTable
