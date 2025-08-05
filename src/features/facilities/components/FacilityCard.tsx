import {
  Card,
  CardBody,
  CardFooter,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Tooltip,
} from '@chakra-ui/react'
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2, FiMapPin, FiPhone, FiUsers } from 'react-icons/fi'
import { Facility } from '@/types/database.types'
import { usePermission } from '@/hooks/usePermission'

interface FacilityCardProps {
  facility: Facility
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

const FacilityCard = ({ facility, onView, onEdit, onDelete }: FacilityCardProps) => {
  const { canUpdate, canDelete } = usePermission()

  return (
    <Card h="full" _hover={{ shadow: 'lg' }} transition="all 0.2s">
      <CardBody>
        <VStack align="stretch" spacing="3">
          <HStack justify="space-between" align="start">
            <Box flex="1">
              <Text fontSize="lg" fontWeight="semibold" noOfLines={1}>
                {facility.facility_name}
              </Text>
              {facility.facility_type && (
                <Badge colorScheme="blue" mt="1">
                  {facility.facility_type}
                </Badge>
              )}
            </Box>
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
          </HStack>

          <VStack align="stretch" spacing="2" fontSize="sm" color="gray.600">
            {facility.address && (
              <HStack>
                <FiMapPin size="14" />
                <Text noOfLines={2}>{facility.address}</Text>
              </HStack>
            )}
            
            {(facility.phone || facility.contact_info?.phone) && (
              <HStack>
                <FiPhone size="14" />
                <Text>{facility.phone || facility.contact_info?.phone}</Text>
              </HStack>
            )}

            {facility.capacity && (
              <HStack>
                <FiUsers size="14" />
                <Text>수용인원: {facility.capacity}명</Text>
              </HStack>
            )}
          </VStack>

          {facility.amenities && facility.amenities.length > 0 && (
            <HStack wrap="wrap" spacing="1">
              {facility.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} size="sm" colorScheme="gray">
                  {amenity}
                </Badge>
              ))}
              {facility.amenities.length > 3 && (
                <Tooltip label={facility.amenities.slice(3).join(', ')}>
                  <Badge size="sm" colorScheme="gray" cursor="help">
                    +{facility.amenities.length - 3}
                  </Badge>
                </Tooltip>
              )}
            </HStack>
          )}
        </VStack>
      </CardBody>

      <CardFooter pt="0">
        <HStack justify="space-between" w="full">
          <Badge colorScheme={getStatusBadgeColor(facility.status)}>
            {getStatusLabel(facility.status)}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            등록일: {new Date(facility.created_at).toLocaleDateString('ko-KR')}
          </Text>
        </HStack>
      </CardFooter>
    </Card>
  )
}

export default FacilityCard