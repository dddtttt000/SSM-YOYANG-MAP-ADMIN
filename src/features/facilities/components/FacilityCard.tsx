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
  Progress,
  Image,
  Tooltip,
} from '@chakra-ui/react'
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2, FiMapPin, FiPhone, FiUsers, FiAward } from 'react-icons/fi'
import { Facility } from '@/types/database.types'
import { usePermission } from '@/hooks/usePermission'
import { getFacilityTypeLabel } from '../constants/facilityTypes'

interface FacilityCardProps {
  facility: Facility
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

const FacilityCard = ({ facility, onView, onEdit, onDelete }: FacilityCardProps) => {
  const { canUpdate, canDelete } = usePermission()

  // 입소율 계산
  const occupancyRate = facility.capacity 
    ? Math.round(((facility.current_male || 0) + (facility.current_female || 0)) / facility.capacity * 100)
    : 0

  return (
    <Card h="full" _hover={{ shadow: 'lg' }} transition="all 0.2s">
      <CardBody>
        <VStack align="stretch" spacing="3">
          <HStack justify="space-between" align="start">
            <Box flex="1">
              <Text fontSize="lg" fontWeight="semibold" noOfLines={1}>
                {facility.admin_name || '시설명 없음'}
              </Text>
              <HStack spacing="2" mt="1">
                {facility.admin_type_code && (
                  <Tooltip 
                    label={`${facility.admin_type_code} - ${getFacilityTypeLabel(facility.admin_type_code)}`}
                    placement="top"
                    hasArrow
                  >
                    <Badge colorScheme="blue" size="sm" cursor="help">
                      {facility.admin_type_code}
                    </Badge>
                  </Tooltip>
                )}
                {facility.final_rating && (
                  <Badge colorScheme={getRatingBadgeColor(facility.final_rating)} size="sm">
                    {facility.final_rating}등급
                  </Badge>
                )}
              </HStack>
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

          {facility.thumbnail_url && (
            <Image
              src={facility.thumbnail_url}
              alt={facility.admin_name || ''}
              height="120px"
              width="100%"
              objectFit="cover"
              borderRadius="md"
            />
          )}

          <VStack align="stretch" spacing="2" fontSize="sm" color="gray.600">
            <HStack>
              <FiMapPin size="14" />
              <Text noOfLines={1}>
                {[facility.sido_name, facility.sigungu_name]
                  .filter(Boolean)
                  .join(' ') || facility.address || '주소 없음'}
              </Text>
            </HStack>
            
            {facility.phone_number && (
              <HStack>
                <FiPhone size="14" />
                <Text>{facility.phone_number}</Text>
              </HStack>
            )}

            <HStack>
              <FiUsers size="14" />
              <Text>
                정원: {facility.capacity || 0}명 / 현원: {(facility.current_male || 0) + (facility.current_female || 0)}명
              </Text>
            </HStack>

            {facility.rating_date && (
              <HStack>
                <FiAward size="14" />
                <Text>
                  평가일: {new Date(facility.rating_date).toLocaleDateString('ko-KR')}
                </Text>
              </HStack>
            )}
          </VStack>

          <Box>
            <HStack justify="space-between" mb="1">
              <Text fontSize="xs" color="gray.500">입소율</Text>
              <Text fontSize="xs" fontWeight="bold">{occupancyRate}%</Text>
            </HStack>
            <Progress
              value={occupancyRate}
              size="sm"
              colorScheme={occupancyRate > 90 ? 'red' : occupancyRate > 70 ? 'yellow' : 'green'}
              borderRadius="full"
            />
          </Box>

          {(facility.waiting_male || 0) + (facility.waiting_female || 0) > 0 && (
            <HStack justify="space-between" fontSize="xs" color="orange.600">
              <Text>대기자</Text>
              <Text fontWeight="bold">
                {(facility.waiting_male || 0) + (facility.waiting_female || 0)}명
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>

      <CardFooter pt="0">
        <HStack justify="space-between" w="full">
          <Text fontSize="xs" color="gray.500">
            {facility.admin_code}
          </Text>
          <Text fontSize="xs" color="gray.500">
            설치: {facility.install_date 
              ? new Date(facility.install_date).toLocaleDateString('ko-KR')
              : '정보 없음'}
          </Text>
        </HStack>
      </CardFooter>
    </Card>
  )
}

export default FacilityCard