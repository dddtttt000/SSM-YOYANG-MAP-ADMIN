import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Skeleton,
  Text,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'
import { FiTrash2, FiRotateCw } from 'react-icons/fi'
import { AdminUser } from '@/types/database.types'
import { useRef, useState } from 'react'
import { useDeleteAdminUser, useUpdateAdminUser } from '../hooks/useAdminUsers'
import { usePermission } from '@/hooks/usePermission'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { formatDateTime } from '@/utils/date'

interface AdminUserTableProps {
  adminUsers: AdminUser[]
  isLoading: boolean
  onEdit: (user: AdminUser) => void
  onEditPermissions: (user: AdminUser) => void
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'red'
    case 'admin':
      return 'blue'
    default:
      return 'gray'
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'super_admin':
      return '최고 관리자'
    case 'admin':
      return '관리자'
    default:
      return role
  }
}

const AdminUserTable = ({ adminUsers, isLoading, onEdit, onEditPermissions }: AdminUserTableProps) => {
  usePermission() // 권한 체크를 위해 유지 (미래 확장성)
  const { user: currentUser } = useAuth()
  const deleteAdminUser = useDeleteAdminUser()
  const updateAdminUser = useUpdateAdminUser()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user)
    onOpen()
  }

  const handleActivate = async (user: AdminUser) => {
    try {
      await updateAdminUser.mutateAsync({
        id: user.id,
        dto: { is_active: true },
      })
    } catch (error) {
      // 에러는 훅에서 toast로 처리됨
    }
  }

  const confirmDelete = async () => {
    if (selectedUser) {
      await deleteAdminUser.mutateAsync(selectedUser.id)
      onClose()
    }
  }

  if (isLoading) {
    return (
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>이름</Th>
              <Th>이메일</Th>
              <Th>역할</Th>
              <Th>상태</Th>
              <Th>가입일</Th>
              <Th width='100px'>계정관리</Th>
            </Tr>
          </Thead>
          <Tbody>
            {[...Array(5)].map((_, index) => (
              <Tr key={index}>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='80px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='60px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='100px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='40px' />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    )
  }

  if (adminUsers.length === 0) {
    return (
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>이름</Th>
              <Th>이메일</Th>
              <Th>역할</Th>
              <Th>상태</Th>
              <Th>가입일</Th>
              <Th width='100px'>계정관리</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={6}>
                <Text textAlign='center' color='gray.500' py='8'>
                  등록된 관리자가 없습니다.
                </Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>이름</Th>
              <Th>이메일</Th>
              <Th>역할</Th>
              <Th>상태</Th>
              <Th>가입일</Th>
              <Th width='100px'>계정관리</Th>
            </Tr>
          </Thead>
          <Tbody>
            {adminUsers.map(user => (
              <Tr key={user.id} _hover={{ bg: 'gray.50' }} cursor='pointer' onClick={() => onEdit(user)}>
                <Td fontWeight='medium'>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge colorScheme={getRoleBadgeColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                </Td>
                <Td>
                  <Badge colorScheme={user.is_active ? 'green' : 'gray'}>{user.is_active ? '활성' : '비활성'}</Badge>
                </Td>
                <Td>{formatDateTime(user.created_at)}</Td>
                <Td>
                  {user.role !== 'super_admin' ? (
                    user.is_active ? (
                      <Button
                        leftIcon={<FiTrash2 />}
                        colorScheme='red'
                        variant='outline'
                        size='sm'
                        isDisabled={currentUser?.role !== 'super_admin'}
                        onClick={e => {
                          e.stopPropagation()
                          handleDelete(user)
                        }}
                      >
                        비활성화
                      </Button>
                    ) : (
                      <Button
                        leftIcon={<FiRotateCw />}
                        colorScheme='gray'
                        variant='outline'
                        size='sm'
                        isDisabled={currentUser?.role !== 'super_admin'}
                        onClick={e => {
                          e.stopPropagation()
                          handleActivate(user)
                        }}
                      >
                        활성화
                      </Button>
                    )
                  ) : (
                    <Text fontSize='sm' color='gray.400'>
                      -
                    </Text>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              관리자 비활성화
            </AlertDialogHeader>

            <AlertDialogBody>
              정말로 <strong>{selectedUser?.name}</strong> 관리자를 비활성화하시겠습니까? 비활성화된 관리자는 더 이상
              시스템에 로그인할 수 없습니다.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button colorScheme='red' onClick={confirmDelete} ml={3} isLoading={deleteAdminUser.isPending}>
                비활성화
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default AdminUserTable
