import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useBreakpointValue,
  IconButton,
  Divider,
} from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiUsers, FiShield, FiMapPin, FiX, FiActivity } from 'react-icons/fi'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { usePermission } from '@/hooks/usePermission'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  path: string
  icon: typeof FiHome
  requiredPermission?: {
    resource: string
    action: string
  }
}

const navItems: NavItem[] = [
  { name: '대시보드', path: '/dashboard', icon: FiHome },
  { 
    name: '관리자 관리', 
    path: '/admin-users', 
    icon: FiShield,
    requiredPermission: { resource: 'admin_users', action: 'read' }
  },
  { 
    name: '회원 관리', 
    path: '/members', 
    icon: FiUsers,
    requiredPermission: { resource: 'members', action: 'read' }
  },
  { 
    name: '시설 관리', 
    path: '/facilities', 
    icon: FiMapPin,
    requiredPermission: { resource: 'facilities', action: 'read' }
  },
  { 
    name: '모니터링', 
    path: '/monitoring', 
    icon: FiActivity,
    requiredPermission: { resource: 'monitoring', action: 'read' }
  },
]

const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation()
  const { user } = useAuth()
  const { hasPermission } = usePermission()

  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredPermission) return true
    return hasPermission(item.requiredPermission.resource, item.requiredPermission.action)
  })

  return (
    <Box
      bg="white"
      w={{ base: 'full', md: '280px' }}
      pos="fixed"
      h="full"
      borderRightWidth="1px"
      borderRightColor="gray.200"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold" color="brand.600">
          SSM-YOYANG
        </Text>
        {onClose && (
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onClose}
            variant="ghost"
            aria-label="close menu"
            icon={<FiX />}
          />
        )}
      </Flex>

      <VStack spacing="1" align="stretch" mt="8">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}>
              <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                bg={isActive ? 'brand.50' : 'transparent'}
                color={isActive ? 'brand.600' : 'gray.600'}
                _hover={{
                  bg: isActive ? 'brand.100' : 'gray.100',
                  color: isActive ? 'brand.700' : 'gray.900',
                }}
              >
                <Icon
                  mr="4"
                  fontSize="20"
                  as={item.icon}
                />
                <Text fontWeight={isActive ? 'semibold' : 'medium'}>
                  {item.name}
                </Text>
              </Flex>
            </Link>
          )
        })}
      </VStack>

      <Box position="absolute" bottom="0" w="full" p="4">
        <Divider mb="4" />
        <VStack align="stretch" spacing="2">
          <Text fontSize="sm" color="gray.500">
            로그인 계정
          </Text>
          <Text fontSize="sm" fontWeight="semibold">
            {user?.name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {user?.role === 'super_admin' && '최고 관리자'}
            {user?.role === 'admin' && '관리자'}
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    )
  }

  return <SidebarContent />
}

export default Sidebar