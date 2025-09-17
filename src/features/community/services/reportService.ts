import { supabase } from '@/lib/supabase'
import {
  type ReportReason,
  type ReportStatus,
  type PostStatus,
} from '../types'

export interface CommunityReport {
  id: string
  reporter_id: number
  post_id: string | null
  comment_id: string | null
  reason: ReportReason
  description: string | null
  status: ReportStatus
  created_at: string
  resolved_at: string | null
  resolved_by: number | null
}

export interface CommunityReportWithDetails extends CommunityReport {
  reporter?: {
    nickname: string | null
  } | null
  post?: {
    id: string
    title: string
    author_id: number
    author_nickname: string | null
    status: PostStatus
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

export interface ReportFilters {
  status?: ReportStatus
  reason?: ReportReason
  reportType?: 'post' | 'comment' | 'all'
  startDate?: string
  endDate?: string
  search?: string
}

class ReportService {
  /**
   * 커뮤니티 신고 목록 조회
   */
  async getReports(filters?: ReportFilters): Promise<CommunityReportWithDetails[]> {
    try {
      let query = supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false })

      // 필터 적용
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.reason) {
        query = query.eq('reason', filters.reason)
      }

      if (filters?.reportType && filters.reportType !== 'all') {
        if (filters.reportType === 'post') {
          query = query.not('post_id', 'is', null)
        } else if (filters.reportType === 'comment') {
          query = query.not('comment_id', 'is', null)
        }
      }

      if (filters?.startDate && filters?.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('신고 목록 조회 오류:', error)
        throw new Error('신고 목록을 불러오는데 실패했습니다.')
      }

      console.log('조회된 신고 목록 ID들:', data?.map(item => item.id) || [])

      // 게시글 및 댓글 정보 추가
      return await this.enrichReportsWithContent(data || [])
    } catch (error) {
      console.error('ReportService.getReports 오류:', error)
      throw error
    }
  }

  /**
   * 신고 상태 업데이트
   */
  async updateReportStatus(id: string, status: ReportStatus, resolvedBy?: number): Promise<void> {
    try {
      const updateData: any = {
        status,
      }

      if (status === 'resolved') {
        // resolved_at 컬럼이 데이터베이스에 없으므로 주석 처리
        // updateData.resolved_at = new Date().toISOString()
        if (resolvedBy) {
          updateData.resolved_by = resolvedBy
        }
      }

      console.log('업데이트 요청 데이터:', { id, updateData })

      // 먼저 해당 ID가 존재하는지 확인
      const { data: existingData, error: selectError } = await supabase
        .from('community_reports')
        .select('*')
        .eq('id', id)

      console.log('기존 데이터 확인:', { existingData, selectError })

      // RLS 정책을 우회하기 위해 service role 사용 시도
      const { data, error, count } = await supabase
        .from('community_reports')
        .update(updateData, { count: 'exact' })
        .eq('id', id)
        .select()

      console.log('Supabase 응답:', { data, error, count })

      if (error) {
        console.error('신고 상태 업데이트 오류:', error)
        throw new Error('신고 상태 업데이트에 실패했습니다.')
      }

      if (!data || data.length === 0) {
        console.error('업데이트된 행이 없습니다. ID가 존재하지 않을 수 있습니다:', id)
        throw new Error('해당 신고를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('ReportService.updateReportStatus 오류:', error)
      throw error
    }
  }

  /**
   * 신고 통계 조회
   */
  async getReportStats() {
    try {
      const { data: stats, error } = await supabase
        .from('community_reports')
        .select('status, reason')

      if (error) {
        console.error('신고 통계 조회 오류:', error)
        throw new Error('신고 통계를 불러오는데 실패했습니다.')
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
      console.error('ReportService.getReportStats 오류:', error)
      throw error
    }
  }

  /**
   * 신고된 게시글/댓글 정보를 추가로 조회
   */
  private async enrichReportsWithContent(reports: any[]): Promise<CommunityReportWithDetails[]> {
    if (reports.length === 0) return []

    try {
      // 게시글 ID 수집
      const postIds = [...new Set(reports.map(r => r.post_id).filter(Boolean))]

      // 댓글 ID 수집
      const commentIds = [...new Set(reports.map(r => r.comment_id).filter(Boolean))]

      // 사용자 ID 수집 (신고자, 처리자)
      const userIds = [...new Set([
        ...reports.map(r => r.reporter_id).filter(Boolean),
        ...reports.map(r => r.resolved_by).filter(Boolean)
      ])]

      // 사용자 정보 조회 (신고자, 처리자)
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

      // 게시글 정보 조회
      let postsMap = new Map()
      if (postIds.length > 0) {
        const { data: posts, error: postsError } = await supabase
          .from('community_writing_list')
          .select(`
            id,
            title,
            author_id,
            status,
            members!community_writing_list_author_id_fkey (
              nickname
            )
          `)
          .in('id', postIds)

        if (!postsError && posts) {
          posts.forEach(post => {
            postsMap.set(post.id, {
              id: post.id,
              title: post.title,
              author_id: post.author_id,
              author_nickname: (post as any).members?.nickname || null,
              status: post.status,
            })
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

      // 신고에 게시글/댓글/사용자 정보 추가
      return reports.map(report => ({
        ...report,
        reporter: report.reporter_id ? usersMap.get(report.reporter_id) || null : null,
        resolver: report.resolved_by ? usersMap.get(report.resolved_by) || null : null,
        post: report.post_id ? postsMap.get(report.post_id) || null : null,
        comment: report.comment_id ? commentsMap.get(report.comment_id) || null : null,
      }))
    } catch (error) {
      console.error('신고 내용 정보 조회 오류:', error)
      // 오류 발생 시 기본 데이터 반환
      return reports.map(report => ({
        ...report,
        reporter: null,
        resolver: null,
        post: null,
        comment: null,
      }))
    }
  }
}

export const reportService = new ReportService()