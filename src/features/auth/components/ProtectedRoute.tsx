import { Navigate, useLocation } from 'react-router-dom'
import { Center, Spinner } from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'super_admin' | 'admin'
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <Center h='100vh'>
        <Spinner size='xl' color='brand.500' thickness='4px' />
      </Center>
    )
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // 역할 기반 접근 제어
  if (requiredRole && user.role !== 'super_admin' && user.role !== requiredRole) {
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
