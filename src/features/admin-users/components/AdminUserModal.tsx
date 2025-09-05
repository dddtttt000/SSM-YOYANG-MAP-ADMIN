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
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { AdminUser } from '@/types/database.types'
import { useCreateAdminUser, useUpdateAdminUser } from '../hooks/useAdminUsers'
import { useAuth } from '@/features/auth/contexts/AuthContext'

interface AdminUserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: AdminUser | null
}

interface FormData {
  email: string
  name: string
  role: 'super_admin' | 'admin'
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  name?: string
  password?: string
  confirmPassword?: string
}

const AdminUserModal = ({ isOpen, onClose, user }: AdminUserModalProps) => {
  const { user: currentUser } = useAuth()
  const createAdminUser = useCreateAdminUser()
  const updateAdminUser = useUpdateAdminUser()
  const isEditMode = !!user

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    role: 'admin',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
        password: '',
        confirmPassword: '',
      })
    } else {
      setFormData({
        email: '',
        name: '',
        role: 'admin',
        password: '',
        confirmPassword: '',
      })
    }
    setErrors({})
  }, [user])

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.'
    }

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요.'
    }

    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = '비밀번호를 입력해주세요.'
      } else if (formData.password.length < 6) {
        newErrors.password = '비밀번호는 6자 이상이어야 합니다.'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      if (isEditMode && user) {
        await updateAdminUser.mutateAsync({
          id: String(user.id),
          dto: {
            name: formData.name,
            role: formData.role,
          },
        })
      } else {
        await createAdminUser.mutateAsync({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          password: formData.password,
        })
      }
      onClose()
    } catch (error) {
      // 에러는 훅에서 toast로 처리됨
    }
  }

  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      role: 'admin',
      password: '',
      confirmPassword: '',
    })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='md'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditMode ? '관리자 정보 수정' : '새 관리자 추가'}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing='4'>
            <FormControl isInvalid={!!errors.email} isDisabled={isEditMode}>
              <FormLabel>이메일</FormLabel>
              <Input
                type='email'
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder='admin@example.com'
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.name}>
              <FormLabel>이름</FormLabel>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder='관리자 이름'
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>역할</FormLabel>
              <Select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                isDisabled={currentUser?.role !== 'super_admin'}
              >
                <option value='admin'>관리자</option>
                {currentUser?.role === 'super_admin' && <option value='super_admin'>최고 관리자</option>}
              </Select>
              {formData.role === 'admin' && (
                <Text fontSize='sm' color='gray.500' mt='2'>
                  관리자는 별도로 권한을 설정해야 합니다.
                </Text>
              )}
            </FormControl>

            {!isEditMode && (
              <>
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>비밀번호</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder='6자 이상'
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant='ghost'
                        size='sm'
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder='비밀번호 재입력'
                  />
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={handleClose}>
            취소
          </Button>
          <Button
            colorScheme='brand'
            onClick={handleSubmit}
            isLoading={createAdminUser.isPending || updateAdminUser.isPending}
          >
            {isEditMode ? '수정' : '추가'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AdminUserModal
