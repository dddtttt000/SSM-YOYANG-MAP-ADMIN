import { supabase } from '@/lib/supabase'
import type { CommunityComment } from '@/types/database.types'
import type { ReportReason } from '../types'

export interface CommentFilters {
  postId?: string
  authorId?: number
  status?: string
  commentType?: string
  search?: string
  startDate?: string
  endDate?: string
}

export interface CommentWithPost extends CommunityComment {
  post?: {
    id: string
    title: string
    author_id: number
  }
}

export interface CommunityCommentWithAuthor extends CommunityComment {
  members?: {
    nickname: string | null
    profile_image: string | null
  } | null
  children?: CommunityCommentWithAuthor[]
  likes_count: number
  reported_count?: number
}


export interface CommentReport {
  id: string
  reporter_id: number
  reporter?: {
    nickname: string | null
  } | null
  reason: ReportReason
  description: string | null
  status: string
  created_at: string
}

export interface CommentWithReports extends CommunityCommentWithAuthor {
  reports?: CommentReport[]
  reports_by_reason?: Record<ReportReason, number>
  total_reports?: number
  original_post?: {
    id: string
    title: string
    author_nickname: string | null
  } | null
}

class CommentService {
  /**
   * 댓글 목록 조회 (게시글 정보 포함)
   */
  async getComments(filters?: CommentFilters): Promise<CommentWithPost[]> {
    try {
      let query = supabase
        .from('community_comments_list')
        .select(`
          *,
          post:community_writing_list!inner(
            id,
            title,
            author_id
          )
        `)
        .order('created_at', { ascending: false })

      // 필터 적용
      if (filters?.postId) {
        query = query.eq('post_id', filters.postId)
      }

      if (filters?.authorId) {
        query = query.eq('author_id', filters.authorId)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.commentType) {
        query = query.eq('comment_type', filters.commentType)
      }

      if (filters?.search) {
        query = query.ilike('content', `%${filters.search}%`)
      }

      if (filters?.startDate && filters?.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('댓글 목록 조회 오류:', error)
        throw new Error('댓글 목록을 불러오는데 실패했습니다.')
      }

      return data || []
    } catch (error) {
      console.error('CommentService.getComments 오류:', error)
      throw error
    }
  }

  /**
   * 특정 게시글의 댓글 트리 구조 조회 (작성자 정보 포함)
   */
  async getCommentsByPostId(postId: string): Promise<CommunityCommentWithAuthor[]> {
    try {
      const { data, error } = await supabase
        .from('community_comments_list')
        .select(`
          *,
          members!community_comments_list_author_id_fkey (
            nickname,
            profile_image
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('게시글 댓글 조회 오류:', error)
        throw new Error('댓글을 불러오는데 실패했습니다.')
      }

      const comments = data || []

      // 댓글 좋아요 수 조회 및 계층 구조 생성
      const commentsWithStats = await this.addCommentStats(comments)
      return this.buildCommentTreeWithAuthor(commentsWithStats)
    } catch (error) {
      console.error('CommentService.getCommentsByPostId 오류:', error)
      throw error
    }
  }

  /**
   * 댓글 상태 업데이트
   */
  async updateCommentStatus(id: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_comments_list')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('댓글 상태 업데이트 오류:', error)
        throw new Error('댓글 상태 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('CommentService.updateCommentStatus 오류:', error)
      throw error
    }
  }

  /**
   * 댓글 삭제
   */
  async deleteComment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_comments_list')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('댓글 삭제 오류:', error)
        throw new Error('댓글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('CommentService.deleteComment 오류:', error)
      throw error
    }
  }

  /**
   * 신고된 댓글 목록 조회 (신고 정보 포함)
   */
  async getReportedComments(): Promise<CommentWithReports[]> {
    try {
      // 먼저 신고된 댓글 ID 목록을 가져옵니다
      const { data: reportedCommentIds, error: reportError } = await supabase
        .from('community_reports')
        .select('comment_id')
        .not('comment_id', 'is', null)

      if (reportError) {
        console.error('신고 댓글 ID 조회 오류:', reportError)
        throw new Error('신고된 댓글 ID를 불러오는데 실패했습니다.')
      }

      if (!reportedCommentIds || reportedCommentIds.length === 0) {
        return []
      }

      // 중복 제거
      const uniqueCommentIds = [...new Set(reportedCommentIds.map(r => r.comment_id).filter(Boolean))]

      // 댓글 정보와 신고 정보를 함께 조회
      const { data, error } = await supabase
        .from('community_comments_list')
        .select(`
          *,
          members!community_comments_list_author_id_fkey (
            nickname,
            profile_image
          )
        `)
        .in('id', uniqueCommentIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('신고된 댓글 조회 오류:', error)
        throw new Error('신고된 댓글을 불러오는데 실패했습니다.')
      }

      // 각 댓글에 대한 신고 정보 조회
      const commentsWithReports = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: reports, error: reportsError } = await supabase
            .from('community_reports')
            .select(`
              id,
              reporter_id,
              reason,
              description,
              status,
              created_at,
              members!community_reports_reporter_id_fkey (
                nickname
              )
            `)
            .eq('comment_id', comment.id)
            .order('created_at', { ascending: false })

          if (reportsError) {
            console.error(`댓글 ${comment.id}의 신고 정보 조회 오류:`, reportsError)
          }

          return {
            ...comment,
            community_reports: reports || []
          }
        })
      )

      // 신고 통계 계산 및 원글 정보 추가
      return await this.processReportedComments(commentsWithReports)
    } catch (error) {
      console.error('CommentService.getReportedComments 오류:', error)
      throw error
    }
  }

  /**
   * 특정 댓글의 상세 정보 조회 (신고 정보 포함)
   */
  async getCommentWithReports(commentId: string): Promise<CommentWithReports | null> {
    try {
      const { data, error } = await supabase
        .from('community_comments_list')
        .select(`
          *,
          members!community_comments_list_author_id_fkey (
            nickname,
            profile_image
          ),
          community_reports!community_reports_comment_id_fkey (
            id,
            reporter_id,
            reason,
            description,
            status,
            created_at,
            members!community_reports_reporter_id_fkey (
              nickname
            )
          )
        `)
        .eq('id', commentId)
        .single()

      if (error) {
        console.error('댓글 상세 조회 오류:', error)
        throw new Error('댓글 정보를 불러오는데 실패했습니다.')
      }

      if (!data) return null

      // 신고 통계 계산 및 원글 정보 추가
      const processedComments = await this.processReportedComments([data])
      return processedComments[0] || null
    } catch (error) {
      console.error('CommentService.getCommentWithReports 오류:', error)
      throw error
    }
  }

  /**
   * 신고된 댓글 데이터 처리 (통계 계산 및 원글 정보 추가)
   */
  private async processReportedComments(comments: any[]): Promise<CommentWithReports[]> {
    if (comments.length === 0) return []

    try {
      // 게시글 ID 수집
      const postIds = [...new Set(comments.map(comment => comment.post_id).filter(Boolean))]

      // 원글 정보 조회
      const { data: posts, error: postsError } = await supabase
        .from('community_writing_list')
        .select(`
          id,
          title,
          author_id,
          members!community_writing_list_author_id_fkey (
            nickname
          )
        `)
        .in('id', postIds)

      if (postsError) {
        console.error('원글 정보 조회 오류:', postsError)
      }

      // 게시글 정보 매핑
      const postsMap = new Map()
      if (posts) {
        posts.forEach(post => {
          postsMap.set(post.id, {
            id: post.id,
            title: post.title,
            author_nickname: (post as any).members?.nickname || null,
          })
        })
      }

      // 댓글별 신고 통계 계산
      return comments.map(comment => {
        const reports = comment.community_reports || []

        // 신고 사유별 통계
        const reportsByReason: Record<string, number> = {}
        reports.forEach((report: any) => {
          if (report.reason) {
            reportsByReason[report.reason] = (reportsByReason[report.reason] || 0) + 1
          }
        })

        return {
          ...comment,
          reports,
          reports_by_reason: reportsByReason,
          total_reports: reports.length,
          original_post: postsMap.get(comment.post_id) || null,
        }
      })
    } catch (error) {
      console.error('신고된 댓글 처리 오류:', error)
      // 처리 실패 시 기본 데이터 반환
      return comments.map(comment => ({
        ...comment,
        reports: comment.community_reports || [],
        reports_by_reason: {},
        total_reports: (comment.community_reports || []).length,
        original_post: null,
      }))
    }
  }

  /**
   * 댓글 통계 정보 추가 (좋아요 수)
   */
  private async addCommentStats(comments: any[]): Promise<CommunityCommentWithAuthor[]> {
    if (comments.length === 0) return []

    try {
      // 댓글 ID 배열
      const commentIds = comments.map(comment => comment.id)

      // 댓글 좋아요 수 조회
      const { data: likesData, error: likesError } = await supabase
        .from('community_likes')
        .select('comment_id')
        .in('comment_id', commentIds)
        .not('comment_id', 'is', null)

      if (likesError) {
        console.error('댓글 좋아요 조회 오류:', likesError)
      }

      // 댓글별 좋아요 수 계산
      const likesCount: Record<string, number> = {}
      if (likesData) {
        likesData.forEach(like => {
          if (like.comment_id) {
            likesCount[like.comment_id] = (likesCount[like.comment_id] || 0) + 1
          }
        })
      }

      // 댓글에 통계 정보 추가
      return comments.map(comment => ({
        ...comment,
        likes_count: likesCount[comment.id] || 0,
      }))
    } catch (error) {
      console.error('댓글 통계 조회 오류:', error)
      // 통계 조회에 실패해도 기본 댓글 정보는 반환
      return comments.map(comment => ({ ...comment, likes_count: 0 }))
    }
  }

  /**
   * 대댓글 트리 구조 생성 (작성자 정보 포함)
   */
  buildCommentTreeWithAuthor(comments: CommunityCommentWithAuthor[]): CommunityCommentWithAuthor[] {
    const commentMap = new Map<string, CommunityCommentWithAuthor>()
    const rootComments: CommunityCommentWithAuthor[] = []

    // 모든 댓글을 Map에 저장
    comments.forEach(comment => {
      comment.children = []
      commentMap.set(comment.id, comment)
    })

    // 트리 구조 생성
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        // 대댓글인 경우 부모에 추가
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(comment)
        } else {
          // 부모 댓글이 없으면 루트 레벨에 추가
          rootComments.push(comment)
        }
      } else {
        // 루트 댓글인 경우
        rootComments.push(comment)
      }
    })

    return rootComments
  }

}

export const commentService = new CommentService()