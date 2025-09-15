import { useCallback } from 'react'
import { useAuth } from "@/features/auth"

export const usePermission = () => {
  const { user } = useAuth()

  const hasPermission = useCallback((resource: string, action: string) => {
    if (!user) return false

    // role에 따른 권한
    // super_admin: 모든 권한
    if (user.role === 'super_admin') return true

    // admin: 읽기와 수정만 가능
    // admin_users 리소스에 대한 생성 권한 제한
    if (user.role === 'admin') {
      // 관리자 관리에 대한 생성 권한은 없음
      if (resource === 'admin_users' && action === 'create') {
        return false
      }
      // 그 외 리소스는 삭제를 제외한 모든 권한
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