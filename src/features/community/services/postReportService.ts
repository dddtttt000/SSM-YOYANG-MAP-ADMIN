import { supabase } from '@/lib/supabase'
import { type ReportReason, type ReportStatus, type PostStatus } from '../types'

export interface PostReport {
  id: string
  reporter_id: number
  post_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  created_at: string
  resolved_at: string | null
  resolved_by: number | null
}

export interface PostReportWithDetails extends PostReport {
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
  resolver?: {
    nickname: string | null
  } | null
}

export interface PostReportFilters {
  status?: ReportStatus
  reason?: ReportReason
  startDate?: string
  endDate?: string
  search?: string
}

class PostReportService {
  /**
   * 게시글 신고 목록 조회
   */
  async getPostReports(filters?: PostReportFilters): Promise<PostReportWithDetails[]> {
    try {
      let query = supabase
        .from('community_reports')
        .select('*')
        .not('post_id', 'is', null) // 게시글 신고만
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
        console.error('게시글 신고 목록 조회 오류:', error)
        throw new Error('게시글 신고 목록을 불러오는데 실패했습니다.')
      }

      // 게시글 정보 추가
      return await this.enrichPostReportsWithContent(data || [])
    } catch (error) {
      console.error('PostReportService.getPostReports 오류:', error)
      throw error
    }
  }

  /**
   * 게시글 신고 상태 업데이트
   */
  async updatePostReportStatus(id: string, status: ReportStatus, resolvedBy?: number): Promise<void> {
    try {
      const updateData: any = { status }

      if (status === 'resolved' && resolvedBy) {
        updateData.resolved_by = resolvedBy
      }

      const { error } = await supabase
        .from('community_reports')
        .update(updateData)
        .eq('id', id)
        .not('post_id', 'is', null) // 게시글 신고인지 확인

      if (error) {
        console.error('게시글 신고 상태 업데이트 오류:', error)
        throw new Error('게시글 신고 상태 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('PostReportService.updatePostReportStatus 오류:', error)
      throw error
    }
  }

  /**
   * 게시글 신고 통계 조회
   */
  async getPostReportStats() {
    try {
      const { data: stats, error } = await supabase
        .from('community_reports')
        .select('status, reason')
        .not('post_id', 'is', null) // 게시글 신고만

      if (error) {
        console.error('게시글 신고 통계 조회 오류:', error)
        throw new Error('게시글 신고 통계를 불러오는데 실패했습니다.')
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
      console.error('PostReportService.getPostReportStats 오류:', error)
      throw error
    }
  }

  /**
   * 게시글 신고에 게시글 정보 추가
   */
  private async enrichPostReportsWithContent(reports: any[]): Promise<PostReportWithDetails[]> {
    if (reports.length === 0) return []

    try {
      // 게시글 ID 수집
      const postIds = [...new Set(reports.map(r => r.post_id).filter(Boolean))]

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

      // 신고에 게시글/사용자 정보 추가
      return reports.map(report => ({
        ...report,
        reporter: report.reporter_id ? usersMap.get(report.reporter_id) || null : null,
        resolver: report.resolved_by ? usersMap.get(report.resolved_by) || null : null,
        post: report.post_id ? postsMap.get(report.post_id) || null : null,
      }))
    } catch (error) {
      console.error('게시글 신고 정보 조회 오류:', error)
      return reports.map(report => ({
        ...report,
        reporter: null,
        resolver: null,
        post: null,
      }))
    }
  }
}

export const postReportService = new PostReportService()