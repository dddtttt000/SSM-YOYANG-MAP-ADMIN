import { supabase } from '@/lib/supabase'

export interface CommunityDashboardStats {
  totalPosts: number
  totalComments: number
  postReportsPending: number
  commentReportsPending: number
  postGrowth: number // 이번 달 게시글 증가율
  commentGrowth: number // 이번 달 댓글 증가율
}

class DashboardService {
  /**
   * 커뮤니티 대시보드 통계 조회
   */
  async getDashboardStats(): Promise<CommunityDashboardStats> {
    try {
      // 현재 날짜와 한달 전 날짜 계산
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

      // 병렬로 모든 통계 조회
      const [
        totalPostsResult,
        totalCommentsResult,
        thisMonthPostsResult,
        lastMonthPostsResult,
        thisMonthCommentsResult,
        lastMonthCommentsResult,
        postReportsResult,
        commentReportsResult,
      ] = await Promise.all([
        // 총 게시글 수
        supabase
          .from('community_writing_list')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'deleted'),

        // 총 댓글 수
        supabase
          .from('community_comments_list')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'deleted'),

        // 이번 달 게시글 수
        supabase
          .from('community_writing_list')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonthStart)
          .neq('status', 'deleted'),

        // 지난 달 게시글 수
        supabase
          .from('community_writing_list')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonthStart)
          .lte('created_at', lastMonthEnd)
          .neq('status', 'deleted'),

        // 이번 달 댓글 수
        supabase
          .from('community_comments_list')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonthStart)
          .neq('status', 'deleted'),

        // 지난 달 댓글 수
        supabase
          .from('community_comments_list')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonthStart)
          .lte('created_at', lastMonthEnd)
          .neq('status', 'deleted'),

        // 게시글 신고 대기 건수
        supabase
          .from('community_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .not('post_id', 'is', null),

        // 댓글 신고 대기 건수
        supabase
          .from('community_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .not('comment_id', 'is', null),
      ])

      // 증가율 계산
      const thisMonthPosts = thisMonthPostsResult.count || 0
      const lastMonthPosts = lastMonthPostsResult.count || 0
      const postGrowth = lastMonthPosts > 0 ? Math.round((thisMonthPosts / lastMonthPosts - 1) * 100) : 0

      const thisMonthComments = thisMonthCommentsResult.count || 0
      const lastMonthComments = lastMonthCommentsResult.count || 0
      const commentGrowth = lastMonthComments > 0 ? Math.round((thisMonthComments / lastMonthComments - 1) * 100) : 0

      return {
        totalPosts: totalPostsResult.count || 0,
        totalComments: totalCommentsResult.count || 0,
        postReportsPending: postReportsResult.count || 0,
        commentReportsPending: commentReportsResult.count || 0,
        postGrowth,
        commentGrowth,
      }
    } catch (error) {
      console.error('DashboardService.getDashboardStats 오류:', error)
      // 오류 발생 시 기본값 반환
      return {
        totalPosts: 0,
        totalComments: 0,
        postReportsPending: 0,
        commentReportsPending: 0,
        postGrowth: 0,
        commentGrowth: 0,
      }
    }
  }

  /**
   * 최근 활동 요약 조회
   */
  async getRecentActivity() {
    try {
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()

      const [recentPosts, recentComments, recentReports] = await Promise.all([
        // 최근 24시간 게시글
        supabase
          .from('community_writing_list')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday),

        // 최근 24시간 댓글
        supabase
          .from('community_comments_list')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday),

        // 최근 24시간 신고
        supabase
          .from('community_reports')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday),
      ])

      return {
        recentPosts: recentPosts.count || 0,
        recentComments: recentComments.count || 0,
        recentReports: recentReports.count || 0,
      }
    } catch (error) {
      console.error('DashboardService.getRecentActivity 오류:', error)
      return {
        recentPosts: 0,
        recentComments: 0,
        recentReports: 0,
      }
    }
  }
}

export const dashboardService = new DashboardService()