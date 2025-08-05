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
} from '@chakra-ui/react'
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Facility } from '@/types/database.types'
import { usePermission } from '@/hooks/usePermission'

interface FacilityTableProps {
  facilities: Facility[]
  isLoading: boolean
  onView: (facility: Facility) => void
  onEdit: (facility: Facility) => void
  onDelete: (facility: Facility) => void
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'gray'
    case 'maintenance':
      return 'orange'
    default:
      return 'gray'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return '운영중'
    case 'inactive':
      return '미운영'
    case 'maintenance':
      return '점검중'
    default:
      return status
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
              <Th>연락처</Th>
              <Th>상태</Th>
              <Th>등록일</Th>
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
              <Th>연락처</Th>
              <Th>상태</Th>
              <Th>등록일</Th>
              <Th width="100px">작업</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={7}>
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
            <Th>주소</Th>
            <Th>연락처</Th>
            <Th>상태</Th>
            <Th>등록일</Th>
            <Th width="100px">작업</Th>
          </Tr>
        </Thead>
        <Tbody>
          {facilities.map((facility) => (
            <Tr key={facility.admin_code}>
              <Td fontWeight="medium">{facility.facility_name}</Td>
              <Td>
                {facility.facility_type && (
                  <Badge colorScheme="blue">{facility.facility_type}</Badge>
                )}
              </Td>
              <Td>{facility.address || '-'}</Td>
              <Td>{facility.phone || facility.contact_info?.phone || '-'}</Td>
              <Td>
                <Badge colorScheme={getStatusBadgeColor(facility.status)}>
                  {getStatusLabel(facility.status)}
                </Badge>
              </Td>
              <Td>{new Date(facility.created_at).toLocaleDateString('ko-KR')}</Td>
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