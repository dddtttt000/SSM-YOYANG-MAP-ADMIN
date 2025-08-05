import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Divider,
  Badge,
  Skeleton,
  SkeletonText,
  Grid,
  GridItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
import { FiMapPin, FiPhone, FiMail, FiGlobe, FiClock, FiUsers } from 'react-icons/fi'
import { useFacility } from '../hooks/useFacilities'

interface FacilityDetailModalProps {
  isOpen: boolean
  onClose: () => void
  facilityId: string | null
  onEdit?: (facility: any) => void
}

const InfoItem = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | React.ReactNode }) => (
  <HStack align="start" spacing="3">
    {icon && <Box color="gray.500" mt="1">{icon}</Box>}
    <Box flex="1">
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Text fontWeight="medium">{value || '-'}</Text>
    </Box>
  </HStack>
)

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

const FacilityDetailModal = ({ isOpen, onClose, facilityId, onEdit }: FacilityDetailModalProps) => {
  const { data: facility, isLoading } = useFacility(facilityId || '')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>시설 상세 정보</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {isLoading ? (
            <VStack spacing="4" align="stretch">
              <Skeleton height="40px" />
              <SkeletonText mt="4" noOfLines={4} spacing="4" />
              <Skeleton height="200px" />
            </VStack>
          ) : facility ? (
            <Tabs>
              <TabList>
                <Tab>기본 정보</Tab>
                <Tab>연락처 정보</Tab>
                <Tab>운영 정보</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack align="stretch" spacing="4">
                    <Box>
                      <HStack justify="space-between" mb="4">
                        <Text fontSize="xl" fontWeight="bold">
                          {facility.facility_name}
                        </Text>
                        <Badge colorScheme={getStatusBadgeColor(facility.status)}>
                          {getStatusLabel(facility.status)}
                        </Badge>
                      </HStack>
                      
                      {facility.facility_type && (
                        <Badge colorScheme="blue" size="sm">
                          {facility.facility_type}
                        </Badge>
                      )}
                    </Box>

                    <Divider />

                    <Grid templateColumns="repeat(1, 1fr)" gap="4">
                      <GridItem>
                        <InfoItem 
                          icon={<FiMapPin />}
                          label="주소" 
                          value={facility.address || '등록된 주소가 없습니다'}
                        />
                      </GridItem>
                      
                      <GridItem>
                        <InfoItem 
                          icon={<FiUsers />}
                          label="수용 인원" 
                          value={facility.capacity ? `${facility.capacity}명` : '정보 없음'}
                        />
                      </GridItem>

                      <GridItem>
                        <InfoItem 
                          label="시설 코드" 
                          value={facility.admin_code}
                        />
                      </GridItem>
                    </Grid>

                    {facility.amenities && facility.amenities.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb="2">
                            편의시설
                          </Text>
                          <HStack wrap="wrap" spacing="2">
                            {facility.amenities.map((amenity: string, index: number) => (
                              <Badge key={index} colorScheme="gray">
                                {amenity}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      </>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack align="stretch" spacing="4">
                    {(facility.phone || facility.contact_info) ? (
                      <>
                        {(facility.phone || facility.contact_info?.phone) && (
                          <InfoItem 
                            icon={<FiPhone />}
                            label="전화번호" 
                            value={facility.phone || facility.contact_info?.phone}
                          />
                        )}
                        {facility.contact_info?.email && (
                          <InfoItem 
                            icon={<FiMail />}
                            label="이메일" 
                            value={facility.contact_info.email}
                          />
                        )}
                        {facility.contact_info?.website && (
                          <InfoItem 
                            icon={<FiGlobe />}
                            label="웹사이트" 
                            value={
                              <Text
                                as="a"
                                href={facility.contact_info.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="brand.500"
                                textDecoration="underline"
                              >
                                {facility.contact_info.website}
                              </Text>
                            }
                          />
                        )}
                      </>
                    ) : (
                      <Text color="gray.500">등록된 연락처 정보가 없습니다.</Text>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack align="stretch" spacing="4">
                    {facility.operating_hours ? (
                      <>
                        {facility.operating_hours.weekday && (
                          <InfoItem 
                            icon={<FiClock />}
                            label="평일 운영시간" 
                            value={facility.operating_hours.weekday}
                          />
                        )}
                        {facility.operating_hours.weekend && (
                          <InfoItem 
                            icon={<FiClock />}
                            label="주말 운영시간" 
                            value={facility.operating_hours.weekend}
                          />
                        )}
                        {facility.operating_hours.holiday && (
                          <InfoItem 
                            icon={<FiClock />}
                            label="공휴일 운영시간" 
                            value={facility.operating_hours.holiday}
                          />
                        )}
                      </>
                    ) : (
                      <Text color="gray.500">등록된 운영시간 정보가 없습니다.</Text>
                    )}

                    <Divider />

                    <Grid templateColumns="repeat(2, 1fr)" gap="4">
                      <GridItem>
                        <InfoItem 
                          label="등록일" 
                          value={new Date(facility.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        />
                      </GridItem>
                      <GridItem>
                        <InfoItem 
                          label="최종 수정일" 
                          value={new Date(facility.updated_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        />
                      </GridItem>
                    </Grid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Text color="gray.500">시설 정보를 불러올 수 없습니다.</Text>
          )}
        </ModalBody>

        <ModalFooter>
          {facility && onEdit && (
            <Button
              colorScheme="brand"
              variant="outline"
              mr={3}
              onClick={() => onEdit(facility)}
            >
              수정
            </Button>
          )}
          <Button onClick={onClose}>닫기</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FacilityDetailModal