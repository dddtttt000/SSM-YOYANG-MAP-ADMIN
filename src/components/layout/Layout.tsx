import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useState } from 'react'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Flex h='100vh' overflow='hidden'>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <Flex
        flex='1'
        direction='column'
        ml={{ base: 0, md: isSidebarOpen ? '280px' : '80px' }}
        transition='margin-left 0.3s'
      >
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <Box flex='1' overflow='auto' bg='gray.50' p='6'>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}

export default Layout
