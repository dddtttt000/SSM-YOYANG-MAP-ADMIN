import { useCallback } from 'react'
import { useAuth } from '@/features/auth/contexts/AuthContext'

export const usePermission = () => {
  const { user } = useAuth()

  const hasPermission = useCallback((resource: string, action: string) => {
    if (!user) return false

    // role에 따른 권한
    // super_admin: 모든 권한
    if (user.role === 'super_admin') return true

    // admin: 삭제를 제외한 모든 권한
    if (user.role === 'admin') {
      return action === 'read' || action === 'update' || action === 'create'
    }

    return false
  }, [user])

  const canCreate = useCallback((resource: string) => hasPermission(resource, 'create'), [hasPermission])
  const canRead = useCallback((resource: string) => hasPermission(resource, 'read'), [hasPermission])
  const canUpdate = useCallback((resource: string) => hasPermission(resource, 'update'), [hasPermission])
  const canDelete = useCallback((resource: string) => hasPermission(resource, 'delete'), [hasPermission])

  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
  }
}