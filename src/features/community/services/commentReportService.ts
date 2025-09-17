import { supabase } from '@/lib/supabase'
import { type ReportReason, type ReportStatus, type PostStatus } from '../types'

export interface CommentReport {
  id: string
  reporter_id: number
  comment_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  created_at: string
  resolved_at: string | null
  resolved_by: number | null
}

export interface CommentReportWithDetails extends CommentReport {
  reporter?: {
    nickname: string | null
  } | null
  comment?: {
    id: string
    content: string
    author_id: number
    author_nickname: string | null
    post_id: string
    post_title: string | null
    status: PostStatus
  } | null
  resolver?: {
    nickname: string | null
  } | null
}

export interface CommentReportFilters {
  status?: ReportStatus
  reason?: ReportReason
  startDate?: string
  endDate?: string
  search?: string
}

class CommentReportService {
  /**
   * 댓글 신고 목록 조회
   */
  async getCommentReports(filters?: CommentReportFilters): Promise<CommentReportWithDetails[]> {
    try {
      let query = supabase
        .from('community_reports')
        .select('*')
        .not('comment_id', 'is', null) // 댓글 신고만
        .order('created_at', { ascending: false })

      // 필터 적용
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.reason) {
        query = query.eq('reason', filters.reason)
      }

      if (filters?.startDate && filters?.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('댓글 신고 목록 조회 오류:', error)
        throw new Error('댓글 신고 목록을 불러오는데 실패했습니다.')
      }

      // 댓글 정보 추가
      return await this.enrichCommentReportsWithContent(data || [])
    } catch (error) {
      console.error('CommentReportService.getCommentReports 오류:', error)
      throw error
    }
  }

  /**
   * 댓글 신고 상태 업데이트
   */
  async updateCommentReportStatus(id: string, status: ReportStatus, resolvedBy?: number): Promise<void> {
    try {
      const updateData: any = { status }

      if (status === 'resolved' && resolvedBy) {
        updateData.resolved_by = resolvedBy
      }

      const { error } = await supabase
        .from('community_reports')
        .update(updateData)
        .eq('id', id)
        .not('comment_id', 'is', null) // 댓글 신고인지 확인

      if (error) {
        console.error('댓글 신고 상태 업데이트 오류:', error)
        throw new Error('댓글 신고 상태 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('CommentReportService.updateCommentReportStatus 오류:', error)
      throw error
    }
  }

  /**
   * 댓글 신고 통계 조회
   */
  async getCommentReportStats() {
    try {
      const { data: stats, error } = await supabase
        .from('community_reports')
        .select('status, reason')
        .not('comment_id', 'is', null) // 댓글 신고만

      if (error) {
        console.error('댓글 신고 통계 조회 오류:', error)
        throw new Error('댓글 신고 통계를 불러오는데 실패했습니다.')
      }

      const statusStats = {
        pending: 0,
        reviewed: 0,
        resolved: 0,
      }

      const reasonStats: Record<ReportReason, number> = {
        spam: 0,
        inappropriate: 0,
        harassment: 0,
        false_info: 0,
        copyright: 0,
        other: 0,
      }

      stats?.forEach(report => {
        statusStats[report.status as ReportStatus]++
        reasonStats[report.reason as ReportReason]++
      })

      return {
        total: stats?.length || 0,
        statusStats,
        reasonStats,
      }
    } catch (error) {
      console.error('CommentReportService.getCommentReportStats 오류:', error)
      throw error
    }
  }

  /**
   * 댓글 신고에 댓글 정보 추가
   */
  private async enrichCommentReportsWithContent(reports: any[]): Promise<CommentReportWithDetails[]> {
    if (reports.length === 0) return []

    try {
      // 댓글 ID 수집
      const commentIds = [...new Set(reports.map(r => r.comment_id).filter(Boolean))]

      // 사용자 ID 수집 (신고자, 처리자)
      const userIds = [
        ...new Set([
          ...reports.map(r => r.reporter_id).filter(Boolean),
          ...reports.map(r => r.resolved_by).filter(Boolean),
        ]),
      ]

      // 사용자 정보 조회
      let usersMap = new Map()
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('members')
          .select('id, nickname')
          .in('id', userIds)

        if (!usersError && users) {
          users.forEach(user => {
            usersMap.set(user.id, user)
          })
        }
      }

      // 댓글 정보 조회 (해당 게시글 정보 포함)
      let commentsMap = new Map()
      if (commentIds.length > 0) {
        const { data: comments, error: commentsError } = await supabase
          .from('community_comments_list')
          .select(`
            id,
            content,
            author_id,
            post_id,
            status,
            members!community_comments_list_author_id_fkey (
              nickname
            ),
            community_writing_list!community_comments_list_post_id_fkey (
              id,
              title
            )
          `)
          .in('id', commentIds)

        if (!commentsError && comments) {
          comments.forEach(comment => {
            commentsMap.set(comment.id, {
              id: comment.id,
              content: comment.content,
              author_id: comment.author_id,
              author_nickname: (comment as any).members?.nickname || null,
              post_id: comment.post_id,
              post_title: (comment as any).community_writing_list?.title || null,
              status: comment.status,
            })
          })
        }
      }

      // 신고에 댓글/사용자 정보 추가
      return reports.map(report => ({
        ...report,
        reporter: report.reporter_id ? usersMap.get(report.reporter_id) || null : null,
        resolver: report.resolved_by ? usersMap.get(report.resolved_by) || null : null,
        comment: report.comment_id ? commentsMap.get(report.comment_id) || null : null,
      }))
    } catch (error) {
      console.error('댓글 신고 정보 조회 오류:', error)
      return reports.map(report => ({
        ...report,
        reporter: null,
        resolver: null,
        comment: null,
      }))
    }
  }
}

export const commentReportService = new CommentReportService()