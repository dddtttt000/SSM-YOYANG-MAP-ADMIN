import { AdminUser } from '@/types/database.types'

export const mockAdminUsers = {
  valid: {
    id: 1,
    email: 'admin@test.com',
    password_digest: 'hashed_password',
    name: 'Test Admin',
    role: 'admin' as const,
    is_active: true,
    last_login_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  inactive: {
    id: 2,
    email: 'inactive@test.com',
    password_digest: 'hashed_password',
    name: 'Inactive Admin',
    role: 'admin' as const,
    is_active: false,
    last_login_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  superAdmin: {
    id: 3,
    email: 'super@test.com',
    password_digest: 'hashed_password',
    name: 'Super Admin',
    role: 'super_admin' as const,
    is_active: true,
    last_login_at: '2024-01-02T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T10:00:00Z'
  }
} satisfies Record<string, AdminUser>

export const mockSupabaseAuthUser = {
  id: 'supabase-user-id-123',
  email: 'admin@test.com',
  user_metadata: {},
  app_metadata: { admin_user_id: 1 }
}

export const mockLoginCredentials = {
  valid: {
    email: 'admin@test.com',
    password: 'correct_password'
  },
  invalid: {
    email: 'admin@test.com', 
    password: 'wrong_password'
  },
  nonExistent: {
    email: 'nonexistent@test.com',
    password: 'some_password'
  }
}