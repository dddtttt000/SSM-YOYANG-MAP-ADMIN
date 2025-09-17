import { supabase } from '@/lib/supabase'
import type { CommunityPost } from '@/types/database.types'

export interface PostFilters {
  category1?: string
  category2?: string
  status?: string
  adminCode?: string
  search?: string
  startDate?: string
  endDate?: string
  minViews?: number
  minLikes?: number
  hasReports?: boolean
  page?: number
  pageSize?: number
}

export interface PostStats {
  totalPosts: number
  activePosts: number
  reportedPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
}

export interface PostsResponse {
  data: CommunityPost[]
  totalCount: number
  totalPages: number
}

class PostService {
  /**
   * 게시글 목록 조회
   */
  async getPosts(filters?: PostFilters): Promise<PostsResponse> {
    try {
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || 10
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // 기본 쿼리 설정 (count 포함)
      let query = supabase
        .from('community_writing_list')
        .select(`
          *,
          members!community_writing_list_author_id_fkey (
            nickname,
            profile_image
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // 필터 적용
      if (filters?.category1) {
        query = query.eq('category_1', filters.category1)
      }

      if (filters?.category2) {
        query = query.eq('category_2', filters.category2)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.adminCode) {
        query = query.eq('admin_code', filters.adminCode)
      }

      if (filters?.search) {
        // 제목으로 검색
        query = query.ilike('title', `%${filters.search}%`)
      }

      if (filters?.startDate && filters?.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      if (filters?.minViews) {
        query = query.gte('views_count', filters.minViews)
      }

      if (filters?.minLikes) {
        query = query.gte('likes_count', filters.minLikes)
      }

      if (filters?.hasReports) {
        query = query.gt('reported_count', 0)
      }

      // 페이지네이션 적용
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('게시글 목록 조회 오류:', error)
        throw new Error('게시글 목록을 불러오는데 실패했습니다.')
      }

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / pageSize)

      return {
        data: data || [],
        totalCount,
        totalPages,
      }
    } catch (error) {
      console.error('PostService.getPosts 오류:', error)
      throw error
    }
  }

  /**
   * 게시글 상세 조회
   */
  async getPostById(id: string): Promise<CommunityPost | null> {
    try {
      const { data, error } = await supabase
        .from('community_writing_list')
        .select(`
          *,
          members!community_writing_list_author_id_fkey (
            nickname,
            profile_image
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('게시글 상세 조회 오류:', error)
        throw new Error('게시글을 불러오는데 실패했습니다.')
      }

      return data
    } catch (error) {
      console.error('PostService.getPostById 오류:', error)
      throw error
    }
  }

  /**
   * 게시글 상태 업데이트
   */
  async updatePostStatus(id: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_writing_list')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('게시글 상태 업데이트 오류:', error)
        throw new Error('게시글 상태 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('PostService.updatePostStatus 오류:', error)
      throw error
    }
  }

  /**
   * 게시글 통계 조회
   */
  async getPostStats(): Promise<PostStats> {
    try {
      const { data, error } = await supabase
        .from('community_writing_list')
        .select('status, views_count, likes_count, comments_count, reported_count')

      if (error) {
        console.error('게시글 통계 조회 오류:', error)
        throw new Error('게시글 통계를 불러오는데 실패했습니다.')
      }

      const posts = data || []

      return {
        totalPosts: posts.length,
        activePosts: posts.filter(p => p.status === 'active').length,
        reportedPosts: posts.filter(p => p.reported_count > 0).length,
        totalViews: posts.reduce((sum, p) => sum + (p.views_count || 0), 0),
        totalLikes: posts.reduce((sum, p) => sum + (p.likes_count || 0), 0),
        totalComments: posts.reduce((sum, p) => sum + (p.comments_count || 0), 0),
      }
    } catch (error) {
      console.error('PostService.getPostStats 오류:', error)
      throw error
    }
  }

  /**
   * 카테고리별 게시글 수 조회
   */
  async getPostsByCategory(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('community_writing_list')
        .select('category_1')

      if (error) {
        console.error('카테고리별 게시글 조회 오류:', error)
        throw new Error('카테고리별 통계를 불러오는데 실패했습니다.')
      }

      const posts = data || []
      const categoryCount: Record<string, number> = {}

      posts.forEach(post => {
        if (post.category_1) {
          categoryCount[post.category_1] = (categoryCount[post.category_1] || 0) + 1
        }
      })

      return categoryCount
    } catch (error) {
      console.error('PostService.getPostsByCategory 오류:', error)
      throw error
    }
  }
}

export const postService = new PostService()