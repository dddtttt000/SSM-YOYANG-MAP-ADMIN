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
  Checkbox,
  Text,
  Box,
  Divider,
  useCheckboxGroup,
  Badge,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { AdminUser, Permission } from '@/types/database.types'
import { useUpdateAdminUserPermissions } from '../hooks/useAdminUsers'

interface PermissionModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
}

interface ResourcePermission {
  resource: string
  label: string
  description: string
  actions: {
    value: string
    label: string
  }[]
}

const resourcePermissions: ResourcePermission[] = [
  {
    resource: 'admin_users',
    label: '관리자 관리',
    description: '시스템 관리자 계정을 관리할 수 있습니다.',
    actions: [
      { value: 'create', label: '추가' },
      { value: 'read', label: '조회' },
      { value: 'update', label: '수정' },
      { value: 'delete', label: '삭제' },
    ],
  },
  {
    resource: 'members',
    label: '회원 관리',
    description: '일반 회원 정보를 관리할 수 있습니다.',
    actions: [
      { value: 'create', label: '추가' },
      { value: 'read', label: '조회' },
      { value: 'update', label: '수정' },
      { value: 'delete', label: '삭제' },
    ],
  },
  {
    resource: 'facilities',
    label: '시설 관리',
    description: '시설 정보를 관리할 수 있습니다.',
    actions: [
      { value: 'create', label: '추가' },
      { value: 'read', label: '조회' },
      { value: 'update', label: '수정' },
      { value: 'delete', label: '삭제' },
    ],
  },
]

const PermissionModal = ({ isOpen, onClose, user }: PermissionModalProps) => {
  const updatePermissions = useUpdateAdminUserPermissions()
  const [permissions, setPermissions] = useState<Permission[]>([])

  useEffect(() => {
    if (user?.permissions) {
      setPermissions(user.permissions)
    } else {
      setPermissions([])
    }
  }, [user])

  const isActionChecked = (resource: string, action: string) => {
    const permission = permissions.find(p => p.resource === resource)
    return permission ? permission.actions.includes(action as any) : false
  }

  const handleActionToggle = (resource: string, action: string, checked: boolean) => {
    const existingPermission = permissions.find(p => p.resource === resource)

    if (existingPermission) {
      const newActions = checked
        ? [...existingPermission.actions, action as any]
        : existingPermission.actions.filter(a => a !== action)

      if (newActions.length === 0) {
        setPermissions(permissions.filter(p => p.resource !== resource))
      } else {
        setPermissions(
          permissions.map(p =>
            p.resource === resource
              ? { ...p, actions: newActions }
              : p
          )
        )
      }
    } else if (checked) {
      setPermissions([...permissions, { resource, actions: [action as any] }])
    }
  }

  const handleSelectAll = (resource: string) => {
    const allActions = resourcePermissions
      .find(r => r.resource === resource)
      ?.actions.map(a => a.value) || []

    const existingPermission = permissions.find(p => p.resource === resource)
    const hasAllActions = existingPermission?.actions.length === allActions.length

    if (hasAllActions) {
      setPermissions(permissions.filter(p => p.resource !== resource))
    } else {
      setPermissions(
        permissions.filter(p => p.resource !== resource).concat({
          resource,
          actions: allActions as any[],
        })
      )
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      await updatePermissions.mutateAsync({
        id: user.id,
        permissions,
      })
      onClose()
    } catch (error) {
      // 에러는 훅에서 toast로 처리됨
    }
  }

  const handleClose = () => {
    setPermissions([])
    onClose()
  }

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          권한 설정 - {user.name}
          <Text fontSize="sm" color="gray.500" fontWeight="normal" mt="1">
            운영자의 접근 권한을 세부적으로 설정할 수 있습니다.
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing="6" align="stretch">
            {user.role === 'super_admin' && (
              <Box p="4" bg="blue.50" borderRadius="md">
                <Text color="blue.700">
                  최고 관리자는 모든 권한을 가지고 있으므로 별도 설정이 필요하지 않습니다.
                </Text>
              </Box>
            )}


            {user.role === 'admin' && (
              <>
                {resourcePermissions.map((resource, index) => (
                  <Box key={resource.resource}>
                    {index > 0 && <Divider my="4" />}
                    <VStack align="stretch" spacing="3">
                      <HStack justify="space-between">
                        <Box>
                          <Text fontWeight="semibold">{resource.label}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {resource.description}
                          </Text>
                        </Box>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSelectAll(resource.resource)}
                        >
                          전체 선택
                        </Button>
                      </HStack>
                      
                      <HStack spacing="4" wrap="wrap">
                        {resource.actions.map(action => (
                          <Checkbox
                            key={`${resource.resource}-${action.value}`}
                            isChecked={isActionChecked(resource.resource, action.value)}
                            onChange={(e) =>
                              handleActionToggle(resource.resource, action.value, e.target.checked)
                            }
                          >
                            {action.label}
                          </Checkbox>
                        ))}
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            취소
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={updatePermissions.isPending}
            isDisabled={user.role !== 'admin'}
          >
            저장
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PermissionModal