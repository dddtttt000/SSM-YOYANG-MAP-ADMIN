import { vi } from 'vitest'
import { mockAdminUsers, mockSupabaseAuthUser } from '../fixtures/adminUsers'
import { mockFacility } from '../fixtures/facilities'

// Mock query builder with chainable methods
export const createMockQueryBuilder = (tableName: string): any => {
  const mockQueryBuilder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),

    // Default implementations that can be overridden in tests
    ...getTableDefaults(tableName)
  }

  return mockQueryBuilder
}

// Table-specific default behaviors
function getTableDefaults(tableName: string): any {
  switch (tableName) {
    case 'admin_users':
      return {
        single: vi.fn().mockResolvedValue({
          data: mockAdminUsers.valid,
          error: null
        }),
        select: vi.fn().mockReturnValue({
          ...createMockQueryBuilder(tableName),
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAdminUsers.valid,
              error: null
            })
          })
        })
      }

    case 'facilities_ssmn_basic_full':
      return {
        single: vi.fn().mockResolvedValue({
          data: mockFacility.basic,
          error: null
        }),
        select: vi.fn().mockReturnValue({
          ...createMockQueryBuilder(tableName),
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockFacility.basic,
              error: null
            })
          })
        })
      }

    default:
      return {
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn().mockReturnThis()
      }
  }
}

// Mock Supabase Auth
export const createMockAuth = () => ({
  signInWithPassword: vi.fn().mockResolvedValue({
    data: {
      user: mockSupabaseAuthUser,
      session: {
        access_token: 'mock_jwt_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000
      }
    },
    error: null
  }),

  signOut: vi.fn().mockResolvedValue({
    error: null
  }),

  getSession: vi.fn().mockResolvedValue({
    data: {
      session: {
        user: mockSupabaseAuthUser,
        access_token: 'mock_jwt_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000
      }
    },
    error: null
  }),

  updateUser: vi.fn().mockResolvedValue({
    data: { user: mockSupabaseAuthUser },
    error: null
  }),

  getUser: vi.fn().mockResolvedValue({
    data: { user: mockSupabaseAuthUser },
    error: null
  }),

  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } }
  })
})

// Mock RPC function
export const createMockRpc = () => 
  vi.fn().mockImplementation((functionName: string, params?: any) => {
    switch (functionName) {
      case 'verify_admin_credentials':
        if (params?.email === 'admin@test.com' && params?.password === 'correct_password') {
          return Promise.resolve({ data: mockAdminUsers.valid, error: null })
        }
        return Promise.resolve({ 
          data: null, 
          error: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
        })

      case 'update_last_login':
        return Promise.resolve({ data: null, error: null })

      default:
        return Promise.resolve({ data: null, error: null })
    }
  })

// Complete mock Supabase client factory
export const createMockSupabaseClient = () => {
  const mockTables = new Map()
  
  return {
    from: vi.fn().mockImplementation((tableName: string) => {
      if (!mockTables.has(tableName)) {
        mockTables.set(tableName, createMockQueryBuilder(tableName))
      }
      return mockTables.get(tableName)
    }),
    
    auth: createMockAuth(),
    rpc: createMockRpc(),
    
    // Storage and other APIs (if needed)
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    }
  }
}

// Test utilities for common scenarios
export const mockSupabaseResponses = {
  success: (data: any = null) => ({ data, error: null }),
  error: (message: string) => ({ data: null, error: { message } }),
  notFound: () => ({ data: null, error: null }),
  unauthorized: () => ({ data: null, error: { message: 'Unauthorized', code: 401 } }),
  serverError: () => ({ data: null, error: { message: 'Internal Server Error', code: 500 } })
}