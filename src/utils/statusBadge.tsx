import { Badge, HStack, Tooltip } from '@chakra-ui/react'
import { FiLock } from 'react-icons/fi'
import type { PostStatus } from '@/features/community/types'

// 댓글과 게시물이 동일한 상태를 사용
type ContentStatus = PostStatus

// 통합 상태 라벨 (관리자/사용자 행동 명시)
const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  'active': '활성',
  'hidden': '관리자 숨김',
  'deleted': '사용자 삭제'
}

// 핵심 상태 설정 (라벨은 별도 관리)
interface StatusConfig {
  colorScheme: string
  readonly: boolean
}

// 공통 상태 설정 (색상과 권한만)
const STATUS_CONFIGS: Record<ContentStatus, StatusConfig> = {
  active: { colorScheme: 'green', readonly: false },
  hidden: { colorScheme: 'yellow', readonly: false },
  deleted: { colorScheme: 'red', readonly: true },
}

/**
 * 공통 상태 배지 생성 헬퍼 함수
 */
function createStatusBadge(
  status: ContentStatus,
  statusLabels: Record<ContentStatus, string>,
  showAdminInfo = true
) {
  const config = STATUS_CONFIGS[status]

  const badge = (
    <Badge colorScheme={config.colorScheme} size="sm">
      {statusLabels[status]}
    </Badge>
  )

  if (showAdminInfo && config.readonly) {
    return (
      <HStack spacing={1}>
        {badge}
        <Tooltip label="관리자는 수정할 수 없습니다">
          <FiLock size={12} color="#9CA3AF" />
        </Tooltip>
      </HStack>
    )
  }

  return badge
}

/**
 * 컨텐츠 상태 배지 생성 (게시물/댓글 공통)
 * @param status - 컨텐츠 상태 ('active' | 'hidden' | 'deleted')
 * @param showAdminInfo - 관리자 권한 정보 표시 여부 (기본: true)
 */
export const getContentStatusBadge = (status: PostStatus, showAdminInfo = true) => {
  return createStatusBadge(status, CONTENT_STATUS_LABELS, showAdminInfo)
}


/**
 * 일반 상태에 따른 배지 컴포넌트 생성
 */
export const getStatusBadge = (status: string, colorScheme?: string) => {
  const defaultColorScheme = colorScheme || 'gray'
  return <Badge colorScheme={defaultColorScheme} size='sm'>{status}</Badge>
}