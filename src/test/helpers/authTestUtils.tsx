import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { vi } from 'vitest'
import { AdminUser } from '@/types/database.types'
import { AuthContextType } from '@/types/auth.types'

// Mock AuthContext for testing
export const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  syncSupabasePassword: vi.fn().mockResolvedValue({ success: true, message: 'Mock sync success' }),
  isMigrationAccount: vi.fn().mockResolvedValue(false),
  ...overrides
})

// AuthProvider wrapper for testing with custom auth state
export const createAuthProviderWrapper = (authContext: AuthContextType) => {
  const AuthContext = React.createContext<AuthContextType | undefined>(authContext)
  
  return ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })

    return (
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthContext.Provider value={authContext}>
              {children}
            </AuthContext.Provider>
          </BrowserRouter>
        </QueryClientProvider>
      </ChakraProvider>
    )
  }
}

// Render component with authenticated user
export const renderWithAuth = (
  ui: React.ReactElement,
  user: AdminUser | null = null,
  authOverrides: Partial<AuthContextType> = {},
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const mockAuthContext = createMockAuthContext({
    user,
    ...authOverrides
  })

  const Wrapper = createAuthProviderWrapper(mockAuthContext)

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    mockAuthContext
  }
}

// Render component with loading state
export const renderWithLoadingAuth = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return renderWithAuth(ui, null, { isLoading: true }, options)
}

// Render component with error state
export const renderWithAuthError = (
  ui: React.ReactElement,
  error: string = 'Auth error',
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return renderWithAuth(ui, null, { error }, options)
}

// Mock navigation for testing
export const createMockNavigate = () => vi.fn()

// Wait for async auth operations
export const waitForAuth = (ms: number = 100) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Test scenarios for auth states
export const authTestScenarios = {
  unauthenticated: {
    user: null,
    isLoading: false,
    error: null
  },
  
  authenticatedAdmin: {
    user: {
      id: 1,
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin' as const,
      is_active: true
    } as AdminUser,
    isLoading: false,
    error: null
  },
  
  authenticatedSuperAdmin: {
    user: {
      id: 2,
      email: 'super@test.com',
      name: 'Super Admin',
      role: 'super_admin' as const,
      is_active: true
    } as AdminUser,
    isLoading: false,
    error: null
  },
  
  loading: {
    user: null,
    isLoading: true,
    error: null
  },
  
  error: {
    user: null,
    isLoading: false,
    error: 'Authentication failed'
  }
}