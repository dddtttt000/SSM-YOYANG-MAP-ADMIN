import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  VStack,
  HStack,
  Textarea,
  NumberInput,
  NumberInputField,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Facility } from '@/types/database.types'
import { useCreateFacility, useUpdateFacility, useFacilityTypes } from '../hooks/useFacilities'

interface FacilityFormModalProps {
  isOpen: boolean
  onClose: () => void
  facility?: Facility | null
}

interface FormData {
  facility_name: string
  facility_type: string
  address: string
  phone: string
  email: string
  website: string
  weekday: string
  weekend: string
  holiday: string
  capacity: number | string
  amenities: string[]
  status: string
}

interface FormErrors {
  facility_name?: string
  facility_type?: string
  email?: string
  website?: string
  capacity?: string
}

const FacilityFormModal = ({ isOpen, onClose, facility }: FacilityFormModalProps) => {
  const createFacility = useCreateFacility()
  const updateFacility = useUpdateFacility()
  const { data: facilityTypes } = useFacilityTypes()
  const isEditMode = !!facility

  const [formData, setFormData] = useState<FormData>({
    facility_name: '',
    facility_type: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    weekday: '',
    weekend: '',
    holiday: '',
    capacity: '',
    amenities: [],
    status: 'active',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [newAmenity, setNewAmenity] = useState('')
  const [customType, setCustomType] = useState(false)

  useEffect(() => {
    if (facility) {
      setFormData({
        facility_name: facility.facility_name,
        facility_type: facility.facility_type || '',
        address: facility.address || '',
        phone: facility.phone || facility.contact_info?.phone || '',
        email: facility.contact_info?.email || '',
        website: facility.contact_info?.website || '',
        weekday: facility.operating_hours?.weekday || '',
        weekend: facility.operating_hours?.weekend || '',
        holiday: facility.operating_hours?.holiday || '',
        capacity: facility.capacity || '',
        amenities: facility.amenities || [],
        status: facility.status,
      })
    } else {
      setFormData({
        facility_name: '',
        facility_type: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        weekday: '',
        weekend: '',
        holiday: '',
        capacity: '',
        amenities: [],
        status: 'active',
      })
    }
    setErrors({})
    setNewAmenity('')
    setCustomType(false)
  }, [facility])

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.facility_name) {
      newErrors.facility_name = '시설명을 입력해주세요.'
    }

    if (!formData.facility_type) {
      newErrors.facility_type = '시설 유형을 선택해주세요.'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.'
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = '유효한 웹사이트 주소를 입력해주세요. (http:// 또는 https://로 시작)'
    }

    if (formData.capacity && (Number(formData.capacity) < 0 || !Number.isInteger(Number(formData.capacity)))) {
      newErrors.capacity = '수용 인원은 0 이상의 정수여야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      })
      setNewAmenity('')
    }
  }

  const handleRemoveAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity),
    })
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const dto = {
      facility_name: formData.facility_name,
      facility_type: formData.facility_type || undefined,
      address: formData.address || undefined,
      contact_info: (formData.phone || formData.email || formData.website) ? {
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
      } : undefined,
      operating_hours: (formData.weekday || formData.weekend || formData.holiday) ? {
        weekday: formData.weekday || undefined,
        weekend: formData.weekend || undefined,
        holiday: formData.holiday || undefined,
      } : undefined,
      capacity: formData.capacity ? Number(formData.capacity) : undefined,
      amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
      status: formData.status,
    }

    try {
      if (isEditMode && facility) {
        await updateFacility.mutateAsync({ adminCode: facility.admin_code, dto })
      } else {
        await createFacility.mutateAsync(dto)
      }
      onClose()
    } catch (error) {
      // 에러는 훅에서 toast로 처리됨
    }
  }

  const handleClose = () => {
    setFormData({
      facility_name: '',
      facility_type: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      weekday: '',
      weekend: '',
      holiday: '',
      capacity: '',
      amenities: [],
      status: 'active',
    })
    setErrors({})
    setNewAmenity('')
    setCustomType(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditMode ? '시설 정보 수정' : '새 시설 등록'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>기본 정보</Tab>
              <Tab>연락처</Tab>
              <Tab>운영 정보</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing="4">
                  <FormControl isInvalid={!!errors.facility_name} isRequired>
                    <FormLabel>시설명</FormLabel>
                    <Input
                      value={formData.facility_name}
                      onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                      placeholder="시설명을 입력하세요"
                    />
                    <FormErrorMessage>{errors.facility_name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.facility_type} isRequired>
                    <FormLabel>시설 유형</FormLabel>
                    {!customType ? (
                      <Select
                        value={formData.facility_type}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setCustomType(true)
                            setFormData({ ...formData, facility_type: '' })
                          } else {
                            setFormData({ ...formData, facility_type: e.target.value })
                          }
                        }}
                        placeholder="시설 유형을 선택하세요"
                      >
                        {facilityTypes?.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                        <option value="custom">직접 입력</option>
                      </Select>
                    ) : (
                      <HStack>
                        <Input
                          value={formData.facility_type}
                          onChange={(e) => setFormData({ ...formData, facility_type: e.target.value })}
                          placeholder="시설 유형을 입력하세요"
                        />
                        <Button size="sm" onClick={() => setCustomType(false)}>
                          선택
                        </Button>
                      </HStack>
                    )}
                    <FormErrorMessage>{errors.facility_type}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>주소</FormLabel>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="시설 주소를 입력하세요"
                      rows={2}
                    />
                  </FormControl>

                  <FormControl isInvalid={!!errors.capacity}>
                    <FormLabel>수용 인원</FormLabel>
                    <NumberInput
                      value={formData.capacity}
                      onChange={(value) => setFormData({ ...formData, capacity: value })}
                      min={0}
                    >
                      <NumberInputField placeholder="수용 가능 인원" />
                    </NumberInput>
                    <FormErrorMessage>{errors.capacity}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>상태</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">운영중</option>
                      <option value="inactive">미운영</option>
                      <option value="maintenance">점검중</option>
                    </Select>
                  </FormControl>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing="4">
                  <FormControl>
                    <FormLabel>전화번호</FormLabel>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="02-1234-5678"
                    />
                  </FormControl>

                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>이메일</FormLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="facility@example.com"
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.website}>
                    <FormLabel>웹사이트</FormLabel>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                    <FormErrorMessage>{errors.website}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing="4">
                  <FormControl>
                    <FormLabel>평일 운영시간</FormLabel>
                    <Input
                      value={formData.weekday}
                      onChange={(e) => setFormData({ ...formData, weekday: e.target.value })}
                      placeholder="09:00 - 18:00"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>주말 운영시간</FormLabel>
                    <Input
                      value={formData.weekend}
                      onChange={(e) => setFormData({ ...formData, weekend: e.target.value })}
                      placeholder="10:00 - 17:00"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>공휴일 운영시간</FormLabel>
                    <Input
                      value={formData.holiday}
                      onChange={(e) => setFormData({ ...formData, holiday: e.target.value })}
                      placeholder="휴무"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>편의시설</FormLabel>
                    <HStack mb="2">
                      <Input
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="편의시설 입력"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddAmenity()
                          }
                        }}
                      />
                      <Button onClick={handleAddAmenity} size="sm">
                        추가
                      </Button>
                    </HStack>
                    <Box>
                      {formData.amenities.map((amenity, index) => (
                        <Tag key={index} size="sm" m="1" variant="subtle" colorScheme="gray">
                          <TagLabel>{amenity}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveAmenity(amenity)} />
                        </Tag>
                      ))}
                    </Box>
                  </FormControl>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            취소
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={createFacility.isPending || updateFacility.isPending}
          >
            {isEditMode ? '수정' : '등록'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FacilityFormModal