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
  Collapse,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
} from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiUsers, FiShield, FiMapPin, FiX, FiActivity, FiBell, FiHelpCircle, FiMessageSquare, FiMessageCircle, FiChevronDown, FiChevronRight, FiBarChart, FiEdit3, FiAlertTriangle, FiFlag } from 'react-icons/fi'
import { useAuth } from "@/features/auth"
import { usePermission } from '@/hooks/usePermission'
import { useState, useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface SubNavItem {
  name: string
  path: string
  icon: typeof FiHome
  requiredPermission?: {
    resource: string
    action: string
  }
}

interface NavItem {
  name: string
  path: string
  icon: typeof FiHome
  requiredPermission?: {
    resource: string
    action: string
  }
  subItems?: SubNavItem[]
}

const navItems: NavItem[] = [
  { name: '대시보드', path: '/dashboard', icon: FiHome },
  {
    name: '관리자 관리',
    path: '/admin-users',
    icon: FiShield,
    requiredPermission: { resource: 'admin_users', action: 'read' },
  },
  {
    name: '회원 관리',
    path: '/members',
    icon: FiUsers,
    requiredPermission: { resource: 'members', action: 'read' },
  },
  {
    name: '시설 관리',
    path: '/facilities',
    icon: FiMapPin,
    requiredPermission: { resource: 'facilities', action: 'read' },
  },
  {
    name: '공지사항',
    path: '/announcements',
    icon: FiBell,
    requiredPermission: { resource: 'announcements', action: 'read' },
  },
  {
    name: '자주 묻는 질문',
    path: '/questions',
    icon: FiHelpCircle,
    requiredPermission: { resource: 'questions', action: 'read' },
  },
  {
    name: '서비스 문의',
    path: '/service-inquiries',
    icon: FiMessageSquare,
    requiredPermission: { resource: 'service_inquiries', action: 'read' },
  },
  {
    name: '커뮤니티 관리',
    path: '/community',
    icon: FiMessageCircle,
    requiredPermission: { resource: 'community', action: 'read' },
    subItems: [
      {
        name: '대시보드',
        path: '/community',
        icon: FiBarChart,
        requiredPermission: { resource: 'community', action: 'read' },
      },
      {
        name: '게시글 관리',
        path: '/community/posts',
        icon: FiEdit3,
        requiredPermission: { resource: 'community', action: 'read' },
      },
      {
        name: '게시글 신고',
        path: '/community/reports/posts',
        icon: FiAlertTriangle,
        requiredPermission: { resource: 'community', action: 'read' },
      },
      {
        name: '댓글 신고',
        path: '/community/reports/comments',
        icon: FiFlag,
        requiredPermission: { resource: 'community', action: 'read' },
      },
    ],
  },
  {
    name: '모니터링',
    path: '/monitoring',
    icon: FiActivity,
    requiredPermission: { resource: 'monitoring', action: 'read' },
  },
]

const SidebarContent = ({ onClose, isOpen, isInDrawer }: { onClose?: () => void; isOpen?: boolean; isInDrawer?: boolean }) => {
  const location = useLocation()
  const { user } = useAuth()
  const { hasPermission } = usePermission()

  // 확장된 메뉴 상태 관리
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('expandedMenus')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return {}
      }
    }
    // 기본적으로 현재 경로에 해당하는 메뉴는 확장
    const defaultExpanded: Record<string, boolean> = {}
    navItems.forEach(item => {
      if (item.subItems && location.pathname.startsWith(item.path)) {
        defaultExpanded[item.path] = true
      }
    })
    return defaultExpanded
  })

  // 확장 상태를 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus))
  }, [expandedMenus])

  // 메뉴 확장/축소 토글
  const toggleMenu = (path: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  // 현재 경로에 해당하는 메뉴 자동 확장
  useEffect(() => {
    navItems.forEach(item => {
      if (item.subItems && location.pathname.startsWith(item.path)) {
        setExpandedMenus(prev => ({
          ...prev,
          [item.path]: true
        }))
      }
    })
  }, [location.pathname])

  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredPermission) return true
    return hasPermission(item.requiredPermission.resource, item.requiredPermission.action)
  })

  return (
    <Box
      bg='white'
      w={{ base: 'full', md: isInDrawer ? 'full' : (isOpen ? '280px' : '80px') }}
      pos='fixed'
      h='full'
      borderRightWidth='1px'
      borderRightColor='gray.200'
    >
      <Flex h='20' alignItems='center' mx='8' justifyContent='space-between'>
        <Link to='/dashboard'>
          <Text
            fontSize='xl'
            fontWeight='bold'
            color='brand.600'
            cursor='pointer'
            _hover={{ color: 'brand.700' }}
            transition='color 0.2s'
            display={{ base: 'block', md: isOpen ? 'block' : 'none' }}
          >
            순시미네 관리자
          </Text>
        </Link>
        {onClose && (
          <IconButton
            display={{ base: 'flex', lg: 'none' }}
            onClick={onClose}
            variant='ghost'
            aria-label='close menu'
            icon={<FiX />}
          />
        )}
      </Flex>

      <VStack spacing='1' align='stretch' mt='8'>
        {filteredNavItems.map(item => {
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isExpanded = expandedMenus[item.path]
          const isParentActive = location.pathname.startsWith(item.path)

          // 하위 메뉴가 있는 경우
          if (hasSubItems) {
            // 사이드바가 닫혀있을 때는 Popover 사용
            if (!isOpen) {
              return (
                <Popover key={item.path} trigger="hover" placement="right-start">
                  <PopoverTrigger>
                    <Box>
                      <Flex
                        align='center'
                        p='4'
                        mx='4'
                        borderRadius='lg'
                        cursor='pointer'
                        bg={isParentActive ? 'brand.50' : 'transparent'}
                        color={isParentActive ? 'brand.600' : 'gray.600'}
                        _hover={{
                          bg: isParentActive ? 'brand.100' : 'gray.100',
                          color: isParentActive ? 'brand.700' : 'gray.900',
                        }}
                      >
                        <Icon fontSize='20' as={item.icon} />
                      </Flex>
                    </Box>
                  </PopoverTrigger>
                  <Portal>
                    <PopoverContent
                      w="auto"
                      minW="220px"
                      ml="2"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      shadow="lg"
                      borderRadius="lg"
                    >
                      <PopoverBody p="3">
                        <VStack spacing="2" align="stretch">
                          <Text fontSize="sm" fontWeight="bold" color="gray.700" px="2" py="1">
                            {item.name}
                          </Text>
                          <Divider borderColor="gray.200" />
                          {item.subItems?.map(subItem => {
                            if (subItem.requiredPermission && !hasPermission(subItem.requiredPermission.resource, subItem.requiredPermission.action)) {
                              return null
                            }

                            const isSubActive = location.pathname === subItem.path
                            return (
                              <Link key={subItem.path} to={subItem.path}>
                                <Flex
                                  align='center'
                                  p='3'
                                  borderRadius='md'
                                  cursor='pointer'
                                  bg={isSubActive ? 'brand.100' : 'transparent'}
                                  color={isSubActive ? 'brand.700' : 'gray.600'}
                                  fontSize='sm'
                                  transition="all 0.2s"
                                  _hover={{
                                    bg: isSubActive ? 'brand.200' : 'gray.50',
                                    color: isSubActive ? 'brand.800' : 'gray.700',
                                    transform: 'translateX(2px)',
                                  }}
                                >
                                  <Icon mr='3' fontSize='16' as={subItem.icon} />
                                  <Text fontWeight={isSubActive ? 'semibold' : 'medium'}>
                                    {subItem.name}
                                  </Text>
                                </Flex>
                              </Link>
                            )
                          })}
                        </VStack>
                      </PopoverBody>
                    </PopoverContent>
                  </Portal>
                </Popover>
              )
            }

            // 사이드바가 열려있을 때는 기존 방식 사용
            return (
              <Box key={item.path}>
                {/* 상위 메뉴 */}
                <Flex
                  align='center'
                  p='4'
                  mx='4'
                  borderRadius='lg'
                  cursor='pointer'
                  bg={isParentActive ? 'brand.50' : 'transparent'}
                  color={isParentActive ? 'brand.600' : 'gray.600'}
                  _hover={{
                    bg: isParentActive ? 'brand.100' : 'gray.100',
                    color: isParentActive ? 'brand.700' : 'gray.900',
                  }}
                  onClick={() => toggleMenu(item.path)}
                >
                  <Icon mr='4' fontSize='20' as={item.icon} />
                  <Text fontWeight={isParentActive ? 'semibold' : 'medium'} flex='1'>
                    {item.name}
                  </Text>
                  <Icon
                    as={isExpanded ? FiChevronDown : FiChevronRight}
                    fontSize='16'
                    transition='transform 0.2s'
                  />
                </Flex>

                {/* 하위 메뉴 */}
                <Collapse in={isExpanded} animateOpacity>
                  <VStack spacing='1' align='stretch' mt='1'>
                    {item.subItems?.map(subItem => {
                      if (subItem.requiredPermission && !hasPermission(subItem.requiredPermission.resource, subItem.requiredPermission.action)) {
                        return null
                      }

                      const isSubActive = location.pathname === subItem.path
                      return (
                        <Link key={subItem.path} to={subItem.path}>
                          <Flex
                            align='center'
                            p='3'
                            mx='4'
                            ml='8'
                            borderRadius='md'
                            cursor='pointer'
                            bg={isSubActive ? 'brand.100' : 'transparent'}
                            color={isSubActive ? 'brand.700' : 'gray.500'}
                            fontSize='sm'
                            _hover={{
                              bg: isSubActive ? 'brand.200' : 'gray.50',
                              color: isSubActive ? 'brand.800' : 'gray.700',
                            }}
                          >
                            <Icon mr='3' fontSize='16' as={subItem.icon} />
                            <Text fontWeight={isSubActive ? 'semibold' : 'medium'}>
                              {subItem.name}
                            </Text>
                          </Flex>
                        </Link>
                      )
                    })}
                  </VStack>
                </Collapse>
              </Box>
            )
          }

          // 하위 메뉴가 없는 일반 메뉴
          const isActive = location.pathname === item.path ||
            (item.path === '/service-inquiries' && location.pathname.startsWith('/service-inquiries'))

          return (
            <Link key={item.path} to={item.path}>
              <Flex
                align='center'
                p='4'
                mx='4'
                borderRadius='lg'
                role='group'
                cursor='pointer'
                bg={isActive ? 'brand.50' : 'transparent'}
                color={isActive ? 'brand.600' : 'gray.600'}
                _hover={{
                  bg: isActive ? 'brand.100' : 'gray.100',
                  color: isActive ? 'brand.700' : 'gray.900',
                }}
              >
                <Icon mr='4' fontSize='20' as={item.icon} />
                {isOpen && <Text fontWeight={isActive ? 'semibold' : 'medium'}>{item.name}</Text>}
              </Flex>
            </Link>
          )
        })}
      </VStack>

      {isOpen && (
        <Box position='absolute' bottom='0' w='full' p='4'>
          <Divider mb='4' />
          <VStack align='stretch' spacing='2'>
            <Text fontSize='sm' color='gray.500'>
              로그인 계정
            </Text>
            <Text fontSize='sm' fontWeight='semibold'>
              {user?.name}
            </Text>
            <Text fontSize='xs' color='gray.500'>
              {user?.role === 'super_admin' && '최고 관리자'}
              {user?.role === 'admin' && '관리자'}
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  )
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  // Treat md (tablet) and below as mobile (Drawer behavior)
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false })

  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement='left' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent onClose={onClose} isOpen={true} isInDrawer={true} />
        </DrawerContent>
      </Drawer>
    )
  }

  return <SidebarContent isOpen={isOpen} onClose={onClose} isInDrawer={false} />
}

export default Sidebar
