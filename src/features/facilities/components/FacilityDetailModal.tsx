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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Link,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Tooltip,
} from '@chakra-ui/react'
import { 
  FiMapPin, 
  FiPhone, 
  FiGlobe, 
  FiCalendar, 
  FiAward,
  FiExternalLink
} from 'react-icons/fi'
import { useFacility } from '../hooks/useFacilities'
import { usePermission } from '@/hooks/usePermission'
import { FacilityWithRelations } from '../services/facilityService'
import { getFacilityTypeLabel } from '../constants/facilityTypes'

interface FacilityDetailModalProps {
  isOpen: boolean
  onClose: () => void
  facilityId: string | null
  onEdit?: (facility: FacilityWithRelations) => void
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

const FacilityDetailModal = ({ isOpen, onClose, facilityId, onEdit }: FacilityDetailModalProps) => {
  const { data: facility, isLoading } = useFacility(facilityId)
  const { canUpdate } = usePermission()

  // 총 직원 수 계산
  const getTotalStaff = () => {
    if (!facility) return 0
    const staffFields = [
      'facility_director', 'office_director', 'social_worker', 
      'doctor_regular', 'doctor_parttime', 'nurse', 'nurse_aide',
      'dental_hygienist', 'physical_therapist', 'occupational_therapist',
      'caregiver_level1', 'caregiver_level2', 'caregiver_deferred',
      'clerk', 'nutritionist', 'cook', 'hygienist', 'manager',
      'assistant', 'others'
    ]
    return staffFields.reduce((sum, field) => sum + (facility[field as keyof typeof facility] as number || 0), 0)
  }

  // 총 방 수 계산
  const getTotalRooms = () => {
    if (!facility) return 0
    const roomFields = ['room_1', 'room_2', 'room_3', 'room_4', 'special_room']
    return roomFields.reduce((sum, field) => sum + (facility[field as keyof typeof facility] as number || 0), 0)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
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
            <Tabs colorScheme="brand">
              <TabList>
                <Tab>기본 정보</Tab>
                <Tab>인력 현황</Tab>
                <Tab>시설 현황</Tab>
                <Tab>입소 현황</Tab>
                <Tab>비급여 항목</Tab>
                <Tab>프로그램</Tab>
              </TabList>

              <TabPanels>
                {/* 기본 정보 탭 */}
                <TabPanel>
                  <VStack align="stretch" spacing="6">
                    {/* 헤더 정보 */}
                    <Box>
                      <HStack justify="space-between" mb="4">
                        <VStack align="start" spacing="2">
                          <Text fontSize="2xl" fontWeight="bold">
                            {facility.admin_name || '시설명 없음'}
                          </Text>
                          <HStack spacing="2">
                            {facility.admin_type_code && (
                              <Tooltip 
                                label={`${facility.admin_type_code} - ${getFacilityTypeLabel(facility.admin_type_code)}`}
                                placement="top"
                                hasArrow
                              >
                                <Badge colorScheme="blue" cursor="help">
                                  {facility.admin_type_code}
                                </Badge>
                              </Tooltip>
                            )}
                            {facility.final_rating && (
                              <Badge colorScheme={getRatingBadgeColor(facility.final_rating)}>
                                평가등급: {facility.final_rating}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                        {facility.thumbnail_url && (
                          <Image
                            src={facility.thumbnail_url}
                            alt={facility.admin_name || ''}
                            boxSize="100px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        )}
                      </HStack>
                    </Box>

                    <Divider />

                    {/* 통계 요약 */}
                    <StatGroup>
                      <Stat>
                        <StatLabel>정원</StatLabel>
                        <StatNumber>{facility.capacity || 0}명</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>현원</StatLabel>
                        <StatNumber>
                          {(facility.current_male || 0) + (facility.current_female || 0)}명
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>대기</StatLabel>
                        <StatNumber>
                          {(facility.waiting_male || 0) + (facility.waiting_female || 0)}명
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>총 직원</StatLabel>
                        <StatNumber>{getTotalStaff()}명</StatNumber>
                      </Stat>
                    </StatGroup>

                    <Divider />

                    {/* 기본 정보 그리드 */}
                    <Grid templateColumns="repeat(2, 1fr)" gap="6">
                      <GridItem>
                        <InfoItem 
                          icon={<FiMapPin />}
                          label="주소" 
                          value={
                            <VStack align="start" spacing="1">
                              <Text>{facility.address || '주소 없음'}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {[facility.sido_name, facility.sigungu_name, facility.bdong_name]
                                  .filter(Boolean)
                                  .join(' ')}
                              </Text>
                            </VStack>
                          }
                        />
                      </GridItem>
                      
                      <GridItem>
                        <InfoItem 
                          icon={<FiPhone />}
                          label="연락처" 
                          value={facility.phone_number || '연락처 없음'}
                        />
                      </GridItem>

                      <GridItem>
                        <InfoItem 
                          icon={<FiGlobe />}
                          label="홈페이지" 
                          value={
                            facility.homepage_url ? (
                              <Link href={facility.homepage_url} isExternal color="brand.500">
                                {facility.homepage_url} <FiExternalLink style={{ display: 'inline' }} />
                              </Link>
                            ) : (
                              '홈페이지 없음'
                            )
                          }
                        />
                      </GridItem>

                      <GridItem>
                        <InfoItem 
                          icon={<FiCalendar />}
                          label="설치일" 
                          value={
                            facility.install_date 
                              ? new Date(facility.install_date).toLocaleDateString('ko-KR')
                              : '정보 없음'
                          }
                        />
                      </GridItem>

                      <GridItem>
                        <InfoItem 
                          icon={<FiAward />}
                          label="평가 정보" 
                          value={
                            <VStack align="start" spacing="1">
                              {facility.rating_date && (
                                <Text fontSize="sm">
                                  평가일: {new Date(facility.rating_date).toLocaleDateString('ko-KR')}
                                </Text>
                              )}
                              {facility.score !== null && (
                                <Text fontSize="sm">점수: {facility.score}점</Text>
                              )}
                            </VStack>
                          }
                        />
                      </GridItem>

                      <GridItem>
                        <InfoItem 
                          label="시설 코드" 
                          value={facility.admin_code}
                        />
                      </GridItem>
                    </Grid>

                    {/* 추가 정보 */}
                    {(facility.transport_desc || facility.parking_info || facility.admin_introduce) && (
                      <>
                        <Divider />
                        <VStack align="stretch" spacing="4">
                          {facility.admin_introduce && (
                            <Box>
                              <Text fontSize="sm" color="gray.500" mb="2">시설 소개</Text>
                              <Text>{facility.admin_introduce}</Text>
                            </Box>
                          )}
                          {facility.transport_desc && (
                            <Box>
                              <Text fontSize="sm" color="gray.500" mb="2">교통편</Text>
                              <Text>{facility.transport_desc}</Text>
                            </Box>
                          )}
                          {facility.parking_info && (
                            <Box>
                              <Text fontSize="sm" color="gray.500" mb="2">주차 정보</Text>
                              <Text>{facility.parking_info}</Text>
                            </Box>
                          )}
                        </VStack>
                      </>
                    )}
                  </VStack>
                </TabPanel>

                {/* 인력 현황 탭 */}
                <TabPanel>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>직종</Th>
                          <Th isNumeric>인원</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>시설장</Td>
                          <Td isNumeric>{facility.facility_director || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>사무국장</Td>
                          <Td isNumeric>{facility.office_director || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>사회복지사</Td>
                          <Td isNumeric>{facility.social_worker || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>의사 (정규)</Td>
                          <Td isNumeric>{facility.doctor_regular || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>의사 (비정규)</Td>
                          <Td isNumeric>{facility.doctor_parttime || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>간호사</Td>
                          <Td isNumeric>{facility.nurse || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>간호조무사</Td>
                          <Td isNumeric>{facility.nurse_aide || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>치과위생사</Td>
                          <Td isNumeric>{facility.dental_hygienist || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>물리치료사</Td>
                          <Td isNumeric>{facility.physical_therapist || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>작업치료사</Td>
                          <Td isNumeric>{facility.occupational_therapist || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>요양보호사 1급</Td>
                          <Td isNumeric>{facility.caregiver_level1 || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>요양보호사 2급</Td>
                          <Td isNumeric>{facility.caregiver_level2 || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>요양보호사 기타</Td>
                          <Td isNumeric>{facility.caregiver_deferred || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>사무원</Td>
                          <Td isNumeric>{facility.clerk || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>영양사</Td>
                          <Td isNumeric>{facility.nutritionist || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>조리원</Td>
                          <Td isNumeric>{facility.cook || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>위생원</Td>
                          <Td isNumeric>{facility.hygienist || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>관리원</Td>
                          <Td isNumeric>{facility.manager || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>보조원</Td>
                          <Td isNumeric>{facility.assistant || 0}명</Td>
                        </Tr>
                        <Tr>
                          <Td>기타</Td>
                          <Td isNumeric>{facility.others || 0}명</Td>
                        </Tr>
                        <Tr fontWeight="bold" bg="gray.50">
                          <Td>합계</Td>
                          <Td isNumeric>{getTotalStaff()}명</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                {/* 시설 현황 탭 */}
                <TabPanel>
                  <Grid templateColumns="repeat(2, 1fr)" gap="6">
                    <GridItem>
                      <Text fontWeight="bold" mb="4">침실</Text>
                      <TableContainer>
                        <Table size="sm">
                          <Tbody>
                            <Tr>
                              <Td>1인실</Td>
                              <Td isNumeric>{facility.room_1 || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>2인실</Td>
                              <Td isNumeric>{facility.room_2 || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>3인실</Td>
                              <Td isNumeric>{facility.room_3 || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>4인실</Td>
                              <Td isNumeric>{facility.room_4 || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>특별실</Td>
                              <Td isNumeric>{facility.special_room || 0}개</Td>
                            </Tr>
                            <Tr fontWeight="bold">
                              <Td>총 침실</Td>
                              <Td isNumeric>{getTotalRooms()}개</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="bold" mb="4">기타 시설</Text>
                      <TableContainer>
                        <Table size="sm">
                          <Tbody>
                            <Tr>
                              <Td>사무실</Td>
                              <Td isNumeric>{facility.office || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>의무실</Td>
                              <Td isNumeric>{facility.medical_room || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>물리치료실</Td>
                              <Td isNumeric>{facility.training_room || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>프로그램실</Td>
                              <Td isNumeric>{facility.program_room || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>식당</Td>
                              <Td isNumeric>{facility.dining_room || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>화장실</Td>
                              <Td isNumeric>{facility.restroom || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>목욕실</Td>
                              <Td isNumeric>{facility.bath_room || 0}개</Td>
                            </Tr>
                            <Tr>
                              <Td>세탁실</Td>
                              <Td isNumeric>{facility.laundry_room || 0}개</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </GridItem>
                  </Grid>
                </TabPanel>

                {/* 입소 현황 탭 */}
                <TabPanel>
                  <Grid templateColumns="repeat(2, 1fr)" gap="6">
                    <GridItem>
                      <Text fontWeight="bold" mb="4">현원</Text>
                      <TableContainer>
                        <Table size="sm">
                          <Tbody>
                            <Tr>
                              <Td>남성</Td>
                              <Td isNumeric>{facility.current_male || 0}명</Td>
                            </Tr>
                            <Tr>
                              <Td>여성</Td>
                              <Td isNumeric>{facility.current_female || 0}명</Td>
                            </Tr>
                            <Tr fontWeight="bold">
                              <Td>합계</Td>
                              <Td isNumeric>
                                {(facility.current_male || 0) + (facility.current_female || 0)}명
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </GridItem>

                    <GridItem>
                      <Text fontWeight="bold" mb="4">대기자</Text>
                      <TableContainer>
                        <Table size="sm">
                          <Tbody>
                            <Tr>
                              <Td>남성</Td>
                              <Td isNumeric>{facility.waiting_male || 0}명</Td>
                            </Tr>
                            <Tr>
                              <Td>여성</Td>
                              <Td isNumeric>{facility.waiting_female || 0}명</Td>
                            </Tr>
                            <Tr fontWeight="bold">
                              <Td>합계</Td>
                              <Td isNumeric>
                                {(facility.waiting_male || 0) + (facility.waiting_female || 0)}명
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </GridItem>

                    <GridItem colSpan={2}>
                      <Box bg="gray.50" p="4" borderRadius="md" mt="4">
                        <Text fontWeight="bold" mb="2">입소율</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                          {facility.capacity 
                            ? Math.round(((facility.current_male || 0) + (facility.current_female || 0)) / facility.capacity * 100)
                            : 0}%
                        </Text>
                      </Box>
                    </GridItem>
                  </Grid>
                </TabPanel>

                {/* 비급여 항목 탭 */}
                <TabPanel>
                  <VStack align="stretch" spacing="4">
                    {facility.nonbenefits && facility.nonbenefits.length > 0 ? (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>항목</Th>
                              <Th>산정기준</Th>
                              <Th>비용</Th>
                              <Th>등록일</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {facility.nonbenefits.map((item) => (
                              <Tr key={item.id}>
                                <Td>{item.nonbenefit_kind || '-'}</Td>
                                <Td>{item.nonbenefit_basis || '-'}</Td>
                                <Td>{item.nonbenefit_amount || '-'}</Td>
                                <Td>
                                  {item.nonbenefit_registered_at 
                                    ? new Date(item.nonbenefit_registered_at).toLocaleDateString('ko-KR')
                                    : '-'}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text color="gray.500" textAlign="center" py="8">
                        등록된 비급여 항목이 없습니다.
                      </Text>
                    )}
                  </VStack>
                </TabPanel>

                {/* 프로그램 탭 */}
                <TabPanel>
                  <VStack align="stretch" spacing="4">
                    {facility.programs && facility.programs.length > 0 ? (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>프로그램 유형</Th>
                              <Th>프로그램명</Th>
                              <Th>대상 인원</Th>
                              <Th>주기</Th>
                              <Th>장소</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {facility.programs.map((program) => (
                              <Tr key={program.id}>
                                <Td>{program.program_type || '-'}</Td>
                                <Td>{program.program_name || '-'}</Td>
                                <Td>{program.program_target_count || '-'}</Td>
                                <Td>{program.program_cycle || '-'}</Td>
                                <Td>{program.program_location || '-'}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text color="gray.500" textAlign="center" py="8">
                        등록된 프로그램이 없습니다.
                      </Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Text color="gray.500">시설 정보를 불러올 수 없습니다.</Text>
          )}
        </ModalBody>

        <ModalFooter>
          {facility && onEdit && canUpdate('facilities') && (
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