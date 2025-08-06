import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Skeleton,
  Text,
  HStack,
  Tooltip,
} from '@chakra-ui/react'
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Facility } from '@/types/database.types'
import { usePermission } from '@/hooks/usePermission'
import { getFacilityTypeLabel } from '../constants/facilityTypes'

interface FacilityTableProps {
  facilities: Facility[]
  isLoading: boolean
  onView: (facility: Facility) => void
  onEdit: (facility: Facility) => void
  onDelete: (facility: Facility) => void
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

const FacilityTable = ({ facilities, isLoading, onView, onEdit, onDelete }: FacilityTableProps) => {
  const { canUpdate, canDelete } = usePermission()

  if (isLoading) {
    return (
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>시설명</Th>
              <Th>유형</Th>
              <Th>주소</Th>
              <Th>정원</Th>
              <Th>평가등급</Th>
              <Th>설치일</Th>
              <Th>연락처</Th>
              <Th width="100px">작업</Th>
            </Tr>
          </Thead>
          <Tbody>
            {[...Array(5)].map((_, index) => (
              <Tr key={index}>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" width="80px" /></Td>
                <Td><Skeleton height="20px" width="100px" /></Td>
                <Td><Skeleton height="20px" width="40px" /></Td>
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
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>시설명</Th>
              <Th>유형</Th>
              <Th>주소</Th>
              <Th>정원</Th>
              <Th>평가등급</Th>
              <Th>설치일</Th>
              <Th>연락처</Th>
              <Th width="100px">작업</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={8}>
                <Text textAlign="center" color="gray.500" py="8">
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
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>시설명</Th>
            <Th>유형</Th>
            <Th>지역</Th>
            <Th>연락처</Th>
            <Th>정원/현원</Th>
            <Th>평가등급</Th>
            <Th>설치일</Th>
            <Th width="100px">작업</Th>
          </Tr>
        </Thead>
        <Tbody>
          {facilities.map((facility) => (
            <Tr key={facility.admin_code}>
              <Td fontWeight="medium">{facility.admin_name || '시설명 없음'}</Td>
              <Td>
                {facility.admin_type_code && (
                  <Tooltip 
                    label={getFacilityTypeLabel(facility.admin_type_code)}
                    placement="top"
                    hasArrow
                  >
                    <Badge colorScheme="blue" size="sm" cursor="help">
                      {facility.admin_type_code}
                    </Badge>
                  </Tooltip>
                )}
              </Td>
              <Td>
                <Text fontSize="sm">
                  {facility.address || '-'}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm">
                  {facility.capacity || 0}명
                </Text>
              </Td>
              <Td>
                <HStack spacing="2">
                  {facility.final_rating && (
                    <Badge colorScheme={getRatingBadgeColor(facility.final_rating)}>
                      {facility.final_rating}
                    </Badge>
                  )}
                  {facility['2023_rating'] && facility['2023_rating'] !== facility.final_rating && (
                    <Badge colorScheme="gray" size="sm">
                      2023: {facility['2023_rating']}
                    </Badge>
                  )}
                </HStack>
              </Td>
              <Td>
                {facility.install_date 
                  ? new Date(facility.install_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })
                  : '-'}
              </Td>
              <Td>{facility.phone_number || '-'}</Td>
              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                    aria-label="작업 메뉴"
                  />
                  <MenuList>
                    <MenuItem icon={<FiEye />} onClick={() => onView(facility)}>
                      상세 보기
                    </MenuItem>
                    {canUpdate('facilities') && (
                      <MenuItem icon={<FiEdit2 />} onClick={() => onEdit(facility)}>
                        수정
                      </MenuItem>
                    )}
                    {canDelete('facilities') && (
                      <MenuItem 
                        icon={<FiTrash2 />} 
                        onClick={() => onDelete(facility)}
                        color="red.500"
                      >
                        삭제
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default FacilityTable