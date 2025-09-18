// 커뮤니티 관리용 확장 타입들
export interface CommunityPostWithDetails {
  id: string
  title: string
  content: string
  author_id: number
  category_1: string
  category_2: string
  images?: string[]
  youtube_url?: string
  hashtags?: string[]
  views_count: number
  likes_count: number
  comments_count: number
  popularity_score: number
  status: 'active' | 'hidden' | 'deleted' | 'pending'
  reported_count: number
  admin_code: string
  created_at: string
  updated_at: string
  author?: {
    name: string
    email: string
  }
}

export interface CommunityCommentWithDetails {
  id: string
  post_id: string
  author_id: number
  parent_comment_id?: string
  comment_type: string
  content: string
  likes_count: number
  status: 'active' | 'hidden' | 'deleted' | 'pending'
  created_at: string
  updated_at: string
  author?: {
    name: string
    email: string
  }
  post?: {
    title: string
  }
  children?: CommunityCommentWithDetails[]
}


// 관리자 액션 타입들
export type PostAction = 'approve' | 'hide' | 'delete' | 'restore'
export type CommentAction = 'approve' | 'hide' | 'delete' | 'restore'
export type ReportAction = 'resolve' | 'reject' | 'pending'

// 필터 및 정렬 옵션
export interface CommunityFilters {
  status?: string[]
  category?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
  sortBy?: 'created_at' | 'views_count' | 'likes_count' | 'popularity_score'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// 통계 차트 데이터 타입
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface SimpleCategoryStats {
  category: string
  count: number
  percentage: number
}

export interface EngagementMetrics {
  totalViews: number
  totalLikes: number
  totalComments: number
  avgEngagementRate: number
  topCategories: SimpleCategoryStats[]
}

// 신고 관련 타입들
export type ReportReason =
  | 'spam'           // 스팸
  | 'inappropriate'  // 욕설, 비방, 혐오 표현
  | 'harassment'     // 괴롭힘
  | 'false_info'     // 잘못된 정보
  | 'copyright'      // 저작권 침해나 명예훼손
  | 'other'          // 기타

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  'copyright': '저작권 침해나 명예훼손이 우려돼요',
  'inappropriate': '욕설, 비방, 혐오 표현이 있어요',
  'false_info': '잘못된 정보가 포함되어 있어요',
  'harassment': '개인정보가 포함되어 있어요',
  'spam': '스팸/광고성 내용이에요',
  'other': '기타'
}

export type ReportStatus = 'pending' | 'reviewed' | 'resolved'

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  'pending': '대기',
  'reviewed': '검토중',
  'resolved': '처리완료'
}

export type PostStatus = 'active' | 'hidden' | 'deleted'

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  'active': '활성',
  'hidden': '숨김',
  'deleted': '삭제'
}

// 알림 및 모니터링 타입
export interface CommunityAlert {
  id: string
  type: 'high_reports' | 'suspicious_activity' | 'viral_post' | 'spam_detected'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  related_id?: string
  created_at: string
  is_read: boolean
}

// 대시보드 위젯 타입
export interface DashboardWidget {
  id: string
  title: string
  type: 'stat' | 'chart' | 'list' | 'alert'
  data: any
  size: 'small' | 'medium' | 'large'
  position: {
    x: number
    y: number
  }
}