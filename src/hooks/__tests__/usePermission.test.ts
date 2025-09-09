import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermission } from '../usePermission'
import { mockAdminUsers } from '@/test/fixtures/adminUsers'
import { renderWithAuth } from '@/test/helpers/authTestUtils'

// Mock the AuthContext to avoid external dependencies
vi.mock('@/features/auth/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '@/features/auth/contexts/AuthContext'

describe('usePermission', () => {
  const mockUseAuth = vi.mocked(useAuth)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('super_admin role', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockAdminUsers.superAdmin,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })
    })

    it('should have permission for all resources and actions', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert - Test all possible combinations
      const resources = ['admin_users', 'facilities', 'members', 'monitoring', 'announcements', 'questions']
      const actions = ['create', 'read', 'update', 'delete']

      resources.forEach(resource => {
        actions.forEach(action => {
          expect(result.current.hasPermission(resource as any, action as any)).toBe(true)
        })
      })
    })

    it('should have all convenience method permissions', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      expect(result.current.canCreate('admin_users')).toBe(true)
      expect(result.current.canRead('facilities')).toBe(true)
      expect(result.current.canUpdate('members')).toBe(true)
      expect(result.current.canDelete('announcements')).toBe(true)
    })
  })

  describe('admin role', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockAdminUsers.valid,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })
    })

    it('should NOT have permission to create admin_users', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      expect(result.current.hasPermission('admin_users', 'create')).toBe(false)
      expect(result.current.canCreate('admin_users')).toBe(false)
    })

    it('should have read permissions for all resources', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      const resources = ['admin_users', 'facilities', 'members', 'monitoring', 'announcements', 'questions']
      
      resources.forEach(resource => {
        expect(result.current.hasPermission(resource as any, 'read')).toBe(true)
        expect(result.current.canRead(resource as any)).toBe(true)
      })
    })

    it('should have create/update permissions for non-admin_users resources', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      const allowedResources = ['facilities', 'members', 'monitoring', 'announcements', 'questions']
      
      allowedResources.forEach(resource => {
        expect(result.current.hasPermission(resource as any, 'create')).toBe(true)
        expect(result.current.hasPermission(resource as any, 'update')).toBe(true)
        expect(result.current.canCreate(resource as any)).toBe(true)
        expect(result.current.canUpdate(resource as any)).toBe(true)
      })
    })

    it('should NOT have delete permissions for any resources', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      const resources = ['admin_users', 'facilities', 'members', 'monitoring', 'announcements', 'questions']
      
      resources.forEach(resource => {
        expect(result.current.hasPermission(resource as any, 'delete')).toBe(false)
        expect(result.current.canDelete(resource as any)).toBe(false)
      })
    })

    it('should have update permission for admin_users (but not create)', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      expect(result.current.hasPermission('admin_users', 'update')).toBe(true)
      expect(result.current.hasPermission('admin_users', 'create')).toBe(false)
      expect(result.current.canUpdate('admin_users')).toBe(true)
      expect(result.current.canCreate('admin_users')).toBe(false)
    })
  })

  describe('no user (unauthenticated)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })
    })

    it('should have no permissions for any resources or actions', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      const resources = ['admin_users', 'facilities', 'members', 'monitoring', 'announcements', 'questions']
      const actions = ['create', 'read', 'update', 'delete']

      resources.forEach(resource => {
        actions.forEach(action => {
          expect(result.current.hasPermission(resource as any, action as any)).toBe(false)
        })
      })
    })

    it('should return false for all convenience methods', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      expect(result.current.canCreate('facilities')).toBe(false)
      expect(result.current.canRead('members')).toBe(false)
      expect(result.current.canUpdate('announcements')).toBe(false)
      expect(result.current.canDelete('questions')).toBe(false)
    })
  })

  describe('inactive user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockAdminUsers.inactive,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })
    })

    it('should still have permissions based on role (implementation does not check is_active)', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert - Current implementation doesn't check is_active, only role
      // inactive user still has admin role, so should have admin permissions
      expect(result.current.hasPermission('facilities', 'read')).toBe(true)
      expect(result.current.hasPermission('facilities', 'create')).toBe(true)
      expect(result.current.hasPermission('facilities', 'delete')).toBe(false)
      expect(result.current.hasPermission('admin_users', 'create')).toBe(false)
    })
  })

  describe('unknown role', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          ...mockAdminUsers.valid,
          role: 'unknown_role' as any
        },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })
    })

    it('should have no permissions for unknown role', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      expect(result.current.hasPermission('facilities', 'read')).toBe(false)
      expect(result.current.canRead('facilities')).toBe(false)
    })
  })

  describe('edge cases and security', () => {
    it('should handle undefined resource gracefully', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: mockAdminUsers.superAdmin,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })

      // Act
      const { result } = renderHook(() => usePermission())

      // Assert - super_admin returns true for any input (current implementation)
      expect(result.current.hasPermission(undefined as any, 'read')).toBe(true)
      expect(result.current.hasPermission('valid_resource', undefined as any)).toBe(true)
      
      // But for non-super_admin, should be more restrictive
      mockUseAuth.mockReturnValue({
        user: mockAdminUsers.valid,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })
      
      const { result: adminResult } = renderHook(() => usePermission())
      expect(adminResult.current.hasPermission(undefined as any, 'read')).toBe(true) // admin has read access
      expect(adminResult.current.hasPermission('valid_resource', 'delete')).toBe(false) // admin can't delete
    })

    it('should handle malformed user object', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: {} as any, // Malformed user object
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })

      // Act
      const { result } = renderHook(() => usePermission())

      // Assert
      expect(result.current.hasPermission('facilities', 'read')).toBe(false)
    })

    it('should be consistent across multiple calls', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: mockAdminUsers.valid,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })

      // Act
      const { result } = renderHook(() => usePermission())

      // Assert - Multiple calls should return same result
      const firstResult = result.current.hasPermission('facilities', 'create')
      const secondResult = result.current.hasPermission('facilities', 'create')
      const thirdResult = result.current.canCreate('facilities')

      expect(firstResult).toBe(secondResult)
      expect(secondResult).toBe(thirdResult)
      expect(firstResult).toBe(true) // admin should have create permission for facilities
    })

    it('should handle resource name case sensitivity', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: mockAdminUsers.valid,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })

      // Act
      const { result } = renderHook(() => usePermission())

      // Assert - Current implementation doesn't check resource name, only action
      // admin role allows read for any resource name
      expect(result.current.hasPermission('facilities', 'read')).toBe(true)
      expect(result.current.hasPermission('FACILITIES' as any, 'read')).toBe(true)
      expect(result.current.hasPermission('Facilities' as any, 'read')).toBe(true)
      
      // But delete should still be false regardless of resource name
      expect(result.current.hasPermission('facilities', 'delete')).toBe(false)
      expect(result.current.hasPermission('FACILITIES' as any, 'delete')).toBe(false)
    })
  })

  describe('convenience methods behavior', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockAdminUsers.valid,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      })
    })

    it('should delegate to hasPermission correctly', () => {
      // Act
      const { result } = renderHook(() => usePermission())

      // Assert - Convenience methods should mirror hasPermission results
      expect(result.current.canCreate('facilities')).toBe(
        result.current.hasPermission('facilities', 'create')
      )
      expect(result.current.canRead('members')).toBe(
        result.current.hasPermission('members', 'read')
      )
      expect(result.current.canUpdate('announcements')).toBe(
        result.current.hasPermission('announcements', 'update')
      )
      expect(result.current.canDelete('questions')).toBe(
        result.current.hasPermission('questions', 'delete')
      )
    })
  })
})