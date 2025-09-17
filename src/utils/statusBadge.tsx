import { Badge } from '@chakra-ui/react'
import { POST_STATUS_LABELS, type PostStatus } from '@/features/community/types'

/**
 * 게시물 상태에 따른 배지 컴포넌트 생성
 */
export const getPostStatusBadge = (status: PostStatus) => {
  const statusConfig = {
    active: { colorScheme: 'green', label: '🟢 활성', icon: '🟢' },
    hidden: { colorScheme: 'yellow', label: '🟡 숨김', icon: '🟡' },
    deleted: { colorScheme: 'red', label: '🔴 삭제', icon: '🔴' },
  }

  const config = statusConfig[status] || {
    colorScheme: 'gray',
    label: status,
    icon: '❓',
  }

  return <Badge colorScheme={config.colorScheme} size='sm'>{POST_STATUS_LABELS[status]}</Badge>
}

/**
 * 일반 상태에 따른 배지 컴포넌트 생성
 */
export const getStatusBadge = (status: string, colorScheme?: string) => {
  const defaultColorScheme = colorScheme || 'gray'
  return <Badge colorScheme={defaultColorScheme} size='sm'>{status}</Badge>
}