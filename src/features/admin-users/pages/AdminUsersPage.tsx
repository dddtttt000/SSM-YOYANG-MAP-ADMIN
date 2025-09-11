import { Box, Heading, Text, Button, Card, CardBody, VStack, HStack, useDisclosure } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { useState } from 'react'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { usePermission } from '@/hooks/usePermission'
import AdminUserTable from '../components/AdminUserTable'
import AdminUserModal from '../components/AdminUserModal'
import AdminUserFilters from '../components/AdminUserFilters'
import { AdminUser } from '@/types/database.types'
import { AdminUserFilters as Filters } from '../services/adminUserService'

const AdminUsersPage = () => {
  const { canCreate } = usePermission()
  const [filters, setFilters] = useState<Filters>({})
  const { data: adminUsers, isLoading } = useAdminUsers(filters)

  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure()

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const handleAddUser = () => {
    setSelectedUser(null)
    onUserModalOpen()
  }

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    onUserModalOpen()
  }

  return (
    <Box>
      <VStack align='stretch' spacing='6'>
        <HStack justify='space-between'>
          <Box>
            <Heading size='lg' mb='2'>
              관리자 관리
            </Heading>
            <Text color='gray.600'>시스템 관리자를 추가하고 권한을 설정할 수 있습니다.</Text>
          </Box>
          {canCreate('admin_users') && (
            <Button colorScheme='brand' leftIcon={<FiPlus />} onClick={handleAddUser}>
              관리자 추가
            </Button>
          )}
        </HStack>

        <Card>
          <CardBody>
            <VStack align='stretch' spacing='4'>
              <AdminUserFilters filters={filters} onFiltersChange={setFilters} />

              <AdminUserTable
                adminUsers={adminUsers || []}
                isLoading={isLoading}
                onEdit={handleEditUser}
              />
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <AdminUserModal isOpen={isUserModalOpen} onClose={onUserModalClose} user={selectedUser} />
    </Box>
  )
}

export default AdminUsersPage
