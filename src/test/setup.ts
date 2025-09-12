import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Mock Supabase with comprehensive client
vi.mock('@/lib/supabase', async () => {
  const { createMockSupabaseClient } = await import('./mocks/supabase')
  return {
    supabase: createMockSupabaseClient()
  }
})

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  firestore: {},
}))

// Mock AuthProvider to prevent act() warnings
vi.mock('@/features/auth/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  })),
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})