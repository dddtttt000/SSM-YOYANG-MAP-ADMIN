import {
  Box,
  Flex,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  HStack,
  useToast,
} from '@chakra-ui/react'
import { FiMenu, FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi'
import { useAuth } from '@/features/auth/contexts/AuthContext'

interface HeaderProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth()
  const toast = useToast()

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: '로그아웃 완료',
        description: '안전하게 로그아웃되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: '로그아웃 실패',
        description: '로그아웃 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }


  return (
    <Box px='6' py='4' bg='white' borderBottomWidth='1px' borderBottomColor='gray.200'>
      <Flex justify='space-between' align='center'>
        <HStack spacing='4'>
          <IconButton
            display={{ base: 'flex', md: 'flex' }}
            onClick={onMenuClick}
            variant='ghost'
            aria-label='open menu'
            icon={<FiMenu />}
          />
        </HStack>

        <Menu>
            <MenuButton as={Button} variant='ghost' rightIcon={<FiChevronDown />} py='2'>
              <HStack spacing='3'>
                <Avatar size='sm' name={user?.name} />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontSize='sm' fontWeight='medium'>
                    {user?.name}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
          <MenuList>
            <MenuItem icon={<FiUser />}>
              <Box>
                <Text fontWeight='medium'>{user?.name}</Text>
                <Text fontSize='xs' color='gray.500'>
                  {user?.email}
                </Text>
              </Box>
            </MenuItem>
            <MenuDivider />
            <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
              로그아웃
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  )
}

export default Header
