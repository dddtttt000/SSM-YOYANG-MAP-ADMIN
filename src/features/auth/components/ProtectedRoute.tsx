import { Navigate, useLocation } from 'react-router-dom'
import { Center, Spinner } from '@chakra-ui/react'
import { useAuth } from '../hooks/useAuth'
import { ReactNode, memo } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'super_admin' | 'admin'
}

const ProtectedRoute = memo(({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // 초기 로딩은 빠르게 처리, 라우트 변경 시 로딩 스피너 최소화
  if (isLoading && !user) {
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
})

ProtectedRoute.displayName = 'ProtectedRoute'

export default ProtectedRoute
