import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContextType, LoginCredentials } from '@/types/auth.types'
import { AdminUser } from '@/types/database.types'
import { authService } from '../services/authService'
import { logger } from '@/utils/logger'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      setError(null)
      logger.log('🔍 AuthContext: checkAuth 시작')
      
      const adminUser = await authService.checkSession()
      logger.log('✅ AuthContext: checkSession 결과:', adminUser)
      
      setUser(adminUser)
    } catch (err) {
      logger.error('❌ AuthContext: checkAuth 에러:', err)
      setError(err instanceof Error ? err.message : '인증 확인 중 오류가 발생했습니다.')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)
      logger.log('🔍 AuthContext: login 시작', credentials.email)

      const adminUser = await authService.login(credentials)
      logger.log('✅ AuthContext: login 성공', adminUser)
      
      setUser(adminUser)
      logger.log('🚀 AuthContext: 대시보드로 이동')
      navigate('/dashboard')
    } catch (err) {
      logger.error('❌ AuthContext: login 에러:', err)
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그아웃 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
