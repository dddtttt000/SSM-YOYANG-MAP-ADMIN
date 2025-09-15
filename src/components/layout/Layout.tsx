import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Suspense, memo } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ContentLoader from '@/components/common/ContentLoader'
import { useState, useEffect, useMemo } from 'react'

const Layout = memo(() => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen')
    return saved === 'false' ? false : true
  })
  const [isTabletOrBelow, setIsTabletOrBelow] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  )

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(isSidebarOpen))
  }, [isSidebarOpen])

  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrBelow(window.innerWidth < 992)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 안정적인 margin 계산 - 데스크톱에서만 적용
  const marginLeft = useMemo(() => {
    if (isTabletOrBelow) return 0
    return isSidebarOpen ? '280px' : '80px'
  }, [isTabletOrBelow, isSidebarOpen])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Flex h='100vh' overflow='hidden'>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <Flex
        flex='1'
        direction='column'
        ml={{ base: 0, md: marginLeft }}
        transition='margin-left 0.3s ease-out'
      >
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <Box flex='1' overflow='auto' bg='gray.50' p='6'>
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </Box>
      </Flex>
    </Flex>
  )
})

Layout.displayName = 'Layout'

export default Layout
