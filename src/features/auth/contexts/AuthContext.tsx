import { useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContextType, LoginCredentials } from '@/types/auth.types'
import { AdminUser } from '@/types/database.types'
import { authService } from '../services/authService'
import { AuthContext } from './createAuthContext'
import type { Session } from '@supabase/supabase-js'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Supabase Auth 세션 상태 리스너
  useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (session: Session | null) => {
      if (!mounted) return

      try {
        setIsLoading(true)
        setError(null)

        if (session) {
          // 세션이 있으면 admin 사용자 정보 확인
          const adminUser = await authService.checkSession()
          if (mounted) {
            setUser(adminUser)
          }
        } else {
          // 세션이 없을 때
          if (mounted) {
            setUser(null)
            if (window.location.pathname !== '/login') {
              navigate('/login')
            }
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : '인증 상태 확인 중 오류가 발생했습니다.')
          setUser(null)
          if (window.location.pathname !== '/login') {
            navigate('/login')
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    })

    // 초기 세션 확인
    const checkInitialAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const adminUser = await authService.checkSession()
        if (mounted) {
          setUser(adminUser)
        }
      } catch (err) {
        if (mounted) {
          // 초기 로딩 시 에러는 조용히 처리
          if (err instanceof Error && !err.message.includes('Auth session missing')) {
            setError(err.message)
          }
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkInitialAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [navigate])

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const adminUser = await authService.checkSession()
      setUser(adminUser)
    } catch (err) {
      if (err instanceof Error && err.message === 'Auth session missing!') {
        setUser(null)
        if (window.location.pathname !== '/login') {
          navigate('/login')
        }
      } else {
        setError(err instanceof Error ? err.message : '인증 확인 중 오류가 발생했습니다.')
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await authService.login(credentials)
        setUser(result)

        navigate('/dashboard')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [navigate]
  )

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      setError(null)
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그아웃 중 오류가 발생했습니다.')
      // 로그아웃 에러가 발생해도 사용자 상태는 초기화
      setUser(null)
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      error,
      login,
      logout,
      checkAuth,
    }),
    [user, isLoading, error, login, logout, checkAuth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
