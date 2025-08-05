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
  admin_name: string
  admin_type_code: string
  address: string
  phone_number: string
  homepage_url: string
  admin_introduce: string
  capacity: number | string
}

interface FormErrors {
  admin_name?: string
  admin_type_code?: string
  homepage_url?: string
  capacity?: string
}

const FacilityFormModal = ({ isOpen, onClose, facility }: FacilityFormModalProps) => {
  const createFacility = useCreateFacility()
  const updateFacility = useUpdateFacility()
  const { data: facilityTypes } = useFacilityTypes()
  const isEditMode = !!facility

  const [formData, setFormData] = useState<FormData>({
    admin_name: '',
    admin_type_code: '',
    address: '',
    phone_number: '',
    homepage_url: '',
    admin_introduce: '',
    capacity: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [customType, setCustomType] = useState(false)

  useEffect(() => {
    if (facility) {
      setFormData({
        admin_name: facility.admin_name || '',
        admin_type_code: facility.admin_type_code || '',
        address: facility.address || '',
        phone_number: facility.phone_number || '',
        homepage_url: facility.homepage_url || '',
        admin_introduce: facility.admin_introduce || '',
        capacity: facility.capacity || '',
      })
    } else {
      setFormData({
        admin_name: '',
        admin_type_code: '',
        address: '',
        phone_number: '',
        homepage_url: '',
        admin_introduce: '',
        capacity: '',
      })
    }
    setErrors({})
    setCustomType(false)
  }, [facility])

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.admin_name) {
      newErrors.admin_name = '시설명을 입력해주세요.'
    }

    if (!formData.admin_type_code) {
      newErrors.admin_type_code = '시설 유형을 선택해주세요.'
    }

    if (formData.homepage_url && !/^https?:\/\/.+/.test(formData.homepage_url)) {
      newErrors.homepage_url = '유효한 웹사이트 주소를 입력해주세요. (http:// 또는 https://로 시작)'
    }

    if (formData.capacity && (Number(formData.capacity) < 0 || !Number.isInteger(Number(formData.capacity)))) {
      newErrors.capacity = '수용 인원은 0 이상의 정수여야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Amenity functions removed as they're not in the current schema

  const handleSubmit = async () => {
    if (!validateForm()) return

    const dto = {
      admin_name: formData.admin_name,
      admin_type_code: formData.admin_type_code || undefined,
      address: formData.address || undefined,
      phone_number: formData.phone_number || undefined,
      homepage_url: formData.homepage_url || undefined,
      admin_introduce: formData.admin_introduce || undefined,
      capacity: formData.capacity ? Number(formData.capacity) : undefined,
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
      admin_name: '',
      admin_type_code: '',
      address: '',
      phone_number: '',
      homepage_url: '',
      admin_introduce: '',
      capacity: '',
    })
    setErrors({})
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
                  <FormControl isInvalid={!!errors.admin_name} isRequired>
                    <FormLabel>시설명</FormLabel>
                    <Input
                      value={formData.admin_name}
                      onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                      placeholder="시설명을 입력하세요"
                    />
                    <FormErrorMessage>{errors.admin_name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.admin_type_code} isRequired>
                    <FormLabel>시설 유형</FormLabel>
                    {!customType ? (
                      <Select
                        value={formData.admin_type_code}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setCustomType(true)
                            setFormData({ ...formData, admin_type_code: '' })
                          } else {
                            setFormData({ ...formData, admin_type_code: e.target.value })
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
                          value={formData.admin_type_code}
                          onChange={(e) => setFormData({ ...formData, admin_type_code: e.target.value })}
                          placeholder="시설 유형을 입력하세요"
                        />
                        <Button size="sm" onClick={() => setCustomType(false)}>
                          선택
                        </Button>
                      </HStack>
                    )}
                    <FormErrorMessage>{errors.admin_type_code}</FormErrorMessage>
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
                    <FormLabel>시설 소개</FormLabel>
                    <Textarea
                      value={formData.admin_introduce}
                      onChange={(e) => setFormData({ ...formData, admin_introduce: e.target.value })}
                      placeholder="시설 소개를 입력하세요"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing="4">
                  <FormControl>
                    <FormLabel>전화번호</FormLabel>
                    <Input
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="02-1234-5678"
                    />
                  </FormControl>

                  <FormControl isInvalid={!!errors.homepage_url}>
                    <FormLabel>홈페이지</FormLabel>
                    <Input
                      value={formData.homepage_url}
                      onChange={(e) => setFormData({ ...formData, homepage_url: e.target.value })}
                      placeholder="https://example.com"
                    />
                    <FormErrorMessage>{errors.homepage_url}</FormErrorMessage>
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