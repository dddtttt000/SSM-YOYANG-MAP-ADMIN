import { supabase } from '@/lib/supabase'

export interface CommunityStats {
  posts: {
    total: number
    active: number
    hidden: number
    deleted: number
    reported: number
  }
  comments: {
    total: number
    active: number
    hidden: number
    deleted: number
  }
  engagement: {
    totalViews: number
    totalLikes: number
    avgViewsPerPost: number
    avgLikesPerPost: number
    avgCommentsPerPost: number
  }
  reports: {
    total: number
    pending: number
    resolved: number
    rejected: number
  }
  savedPosts: {
    total: number
    dailySaves: number
    topSavedPosts: Array<{
      postId: string
      title: string
      saveCount: number
    }>
    userSaveActivity: number
  }
  categories: Record<string, number>
  dailyActivity: {
    date: string
    posts: number
    comments: number
    views: number
    likes: number
    saves: number
  }[]
}

export interface PeriodStats {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate: string
}

export interface CategoryStats {
  category: string
  postCount: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalSaves: number
  avgViews: number
  avgLikes: number
  avgComments: number
  avgSaves: number
  engagementScore: number
  saveEngagementScore: number
  percentage: number
}

export interface CategoryAnalysis {
  totalPosts: number
  categories: CategoryStats[]
  topCategories: {
    byPosts: CategoryStats[]
    byViews: CategoryStats[]
    byLikes: CategoryStats[]
    byEngagement: CategoryStats[]
    bySaves: CategoryStats[]
    bySaveEngagement: CategoryStats[]
  }
}

class StatsService {
  /**
   * 전체 커뮤니티 통계 조회
   */
  async getCommunityStats(period?: PeriodStats): Promise<CommunityStats> {
    try {
      // 게시글 통계
      const { data: posts, error: postsError } = await supabase
        .from('community_writing_list')
        .select('status, views_count, likes_count, comments_count, reported_count, category_1, created_at')

      if (postsError) {
        throw new Error('게시글 통계 조회 실패')
      }

      // 댓글 통계
      const { data: comments, error: commentsError } = await supabase
        .from('community_comments_list')
        .select('status, created_at')

      if (commentsError) {
        throw new Error('댓글 통계 조회 실패')
      }

      // 신고 통계
      const { data: reports, error: reportsError } = await supabase
        .from('community_reports')
        .select('status, created_at')

      if (reportsError) {
        throw new Error('신고 통계 조회 실패')
      }

      // 좋아요 통계
      const { data: likes, error: likesError } = await supabase
        .from('community_likes')
        .select('type, created_at')

      if (likesError) {
        throw new Error('좋아요 통계 조회 실패')
      }

      // 저장된 게시글 통계
      const { data: savedPosts, error: savedError } = await supabase
        .from('community_saved_posts')
        .select('post_id, user_id, created_at')

      if (savedError) {
        throw new Error('저장된 게시글 통계 조회 실패')
      }

      // 필터링 (기간별)
      let filteredPosts = posts || []
      let filteredComments = comments || []
      let filteredReports = reports || []
      let filteredLikes = likes || []
      let filteredSavedPosts = savedPosts || []

      if (period) {
        const startDate = new Date(period.startDate)
        const endDate = new Date(period.endDate)

        filteredPosts = posts?.filter(p => {
          const createdAt = new Date(p.created_at)
          return createdAt >= startDate && createdAt <= endDate
        }) || []

        filteredComments = comments?.filter(c => {
          const createdAt = new Date(c.created_at)
          return createdAt >= startDate && createdAt <= endDate
        }) || []

        filteredReports = reports?.filter(r => {
          const createdAt = new Date(r.created_at)
          return createdAt >= startDate && createdAt <= endDate
        }) || []

        filteredLikes = likes?.filter(l => {
          const createdAt = new Date(l.created_at)
          return createdAt >= startDate && createdAt <= endDate
        }) || []

        filteredSavedPosts = savedPosts?.filter(s => {
          const createdAt = new Date(s.created_at)
          return createdAt >= startDate && createdAt <= endDate
        }) || []
      }

      // 통계 계산
      const totalViews = filteredPosts.reduce((sum, p) => sum + (p.views_count || 0), 0)
      const totalLikes = filteredPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0)
      const totalComments = filteredPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0)

      // 카테고리별 통계
      const categories: Record<string, number> = {}
      filteredPosts.forEach(post => {
        if (post.category_1) {
          categories[post.category_1] = (categories[post.category_1] || 0) + 1
        }
      })

      // 저장된 게시글 통계 계산
      const savedPostsStats = await this.calculateSavedPostsStats(filteredSavedPosts, filteredPosts)

      // 일별 활동 통계 (최근 30일)
      const dailyActivity = this.calculateDailyActivity(
        filteredPosts,
        filteredComments,
        filteredLikes,
        filteredSavedPosts
      )

      return {
        posts: {
          total: filteredPosts.length,
          active: filteredPosts.filter(p => p.status === 'active').length,
          hidden: filteredPosts.filter(p => p.status === 'hidden').length,
          deleted: filteredPosts.filter(p => p.status === 'deleted').length,
          reported: filteredPosts.filter(p => (p.reported_count || 0) > 0).length,
        },
        comments: {
          total: filteredComments.length,
          active: filteredComments.filter(c => c.status === 'active').length,
          hidden: filteredComments.filter(c => c.status === 'hidden').length,
          deleted: filteredComments.filter(c => c.status === 'deleted').length,
        },
        engagement: {
          totalViews,
          totalLikes,
          avgViewsPerPost: filteredPosts.length > 0 ? totalViews / filteredPosts.length : 0,
          avgLikesPerPost: filteredPosts.length > 0 ? totalLikes / filteredPosts.length : 0,
          avgCommentsPerPost: filteredPosts.length > 0 ? totalComments / filteredPosts.length : 0,
        },
        reports: {
          total: filteredReports.length,
          pending: filteredReports.filter(r => r.status === 'pending').length,
          resolved: filteredReports.filter(r => r.status === 'resolved').length,
          rejected: filteredReports.filter(r => r.status === 'rejected').length,
        },
        savedPosts: savedPostsStats,
        categories,
        dailyActivity,
      }
    } catch (error) {
      console.error('StatsService.getCommunityStats 오류:', error)
      throw error
    }
  }

  /**
   * 인기 게시글 조회 (조회수, 좋아요, 댓글 수 기준)
   */
  async getPopularPosts(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('community_writing_list')
        .select('id, title, views_count, likes_count, comments_count, popularity_score, created_at')
        .eq('status', 'active')
        .order('popularity_score', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error('인기 게시글 조회 실패')
      }

      return data || []
    } catch (error) {
      console.error('StatsService.getPopularPosts 오류:', error)
      throw error
    }
  }

  /**
   * 활성 사용자 통계
   */
  async getActiveUsers(period: PeriodStats) {
    try {
      const { data: postAuthors, error: postError } = await supabase
        .from('community_writing_list')
        .select('author_id, created_at')
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate)

      if (postError) {
        throw new Error('게시글 작성자 조회 실패')
      }

      const { data: commentAuthors, error: commentError } = await supabase
        .from('community_comments_list')
        .select('author_id, created_at')
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate)

      if (commentError) {
        throw new Error('댓글 작성자 조회 실패')
      }

      // 활성 사용자 계산
      const activeUserIds = new Set<number>()

      postAuthors?.forEach(p => activeUserIds.add(p.author_id))
      commentAuthors?.forEach(c => activeUserIds.add(c.author_id))

      return {
        totalActiveUsers: activeUserIds.size,
        postWriters: new Set(postAuthors?.map(p => p.author_id)).size,
        commentWriters: new Set(commentAuthors?.map(c => c.author_id)).size,
      }
    } catch (error) {
      console.error('StatsService.getActiveUsers 오류:', error)
      throw error
    }
  }

  /**
   * 카테고리 분석 데이터 조회
   */
  async getCategoryAnalysis(): Promise<CategoryAnalysis> {
    try {
      const { data: posts, error } = await supabase
        .from('community_writing_list')
        .select('id, category_1, views_count, likes_count, comments_count, status')
        .eq('status', 'active')

      if (error) {
        throw new Error('카테고리 분석 데이터 조회 실패')
      }

      // 저장된 게시글 데이터 조회
      const { data: savedPosts, error: savedError } = await supabase
        .from('community_saved_posts')
        .select('post_id')

      if (savedError) {
        throw new Error('저장된 게시글 데이터 조회 실패')
      }

      const postsData = posts || []
      const savedPostsData = savedPosts || []
      const totalPosts = postsData.length

      // 게시글별 저장 횟수 계산
      const saveCountMap = new Map<string, number>()
      savedPostsData.forEach(save => {
        const postId = save.post_id
        saveCountMap.set(postId, (saveCountMap.get(postId) || 0) + 1)
      })

      // 카테고리별 데이터 집계
      const categoryMap = new Map<string, any>()

      postsData.forEach(post => {
        const category = post.category_1 || '기타'
        const saveCount = saveCountMap.get(post.id) || 0

        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            postCount: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalSaves: 0,
          })
        }

        const categoryData = categoryMap.get(category)
        categoryData.postCount += 1
        categoryData.totalViews += post.views_count || 0
        categoryData.totalLikes += post.likes_count || 0
        categoryData.totalComments += post.comments_count || 0
        categoryData.totalSaves += saveCount
      })

      // 카테고리별 통계 계산
      const categories: CategoryStats[] = Array.from(categoryMap.values()).map(cat => {
        const avgViews = cat.postCount > 0 ? cat.totalViews / cat.postCount : 0
        const avgLikes = cat.postCount > 0 ? cat.totalLikes / cat.postCount : 0
        const avgComments = cat.postCount > 0 ? cat.totalComments / cat.postCount : 0
        const avgSaves = cat.postCount > 0 ? cat.totalSaves / cat.postCount : 0

        // 기존 참여도 점수 계산 (가중평균)
        const engagementScore = (avgViews * 0.2) + (avgLikes * 3) + (avgComments * 5)

        // 저장 기반 참여도 점수 (저장이 더 높은 가중치)
        const saveEngagementScore = (avgViews * 0.1) + (avgLikes * 2) + (avgComments * 3) + (avgSaves * 10)

        return {
          ...cat,
          avgViews: Math.round(avgViews * 10) / 10,
          avgLikes: Math.round(avgLikes * 10) / 10,
          avgComments: Math.round(avgComments * 10) / 10,
          avgSaves: Math.round(avgSaves * 10) / 10,
          engagementScore: Math.round(engagementScore * 10) / 10,
          saveEngagementScore: Math.round(saveEngagementScore * 10) / 10,
          percentage: totalPosts > 0 ? Math.round((cat.postCount / totalPosts) * 1000) / 10 : 0,
        }
      })

      // 정렬된 상위 카테고리들
      const topCategories = {
        byPosts: [...categories].sort((a, b) => b.postCount - a.postCount),
        byViews: [...categories].sort((a, b) => b.avgViews - a.avgViews),
        byLikes: [...categories].sort((a, b) => b.avgLikes - a.avgLikes),
        byEngagement: [...categories].sort((a, b) => b.engagementScore - a.engagementScore),
        bySaves: [...categories].sort((a, b) => b.avgSaves - a.avgSaves),
        bySaveEngagement: [...categories].sort((a, b) => b.saveEngagementScore - a.saveEngagementScore),
      }

      return {
        totalPosts,
        categories: categories.sort((a, b) => b.postCount - a.postCount),
        topCategories,
      }
    } catch (error) {
      console.error('StatsService.getCategoryAnalysis 오류:', error)
      throw error
    }
  }

  /**
   * 카테고리별 상태 분포 조회
   */
  async getCategoryStatusDistribution(): Promise<Record<string, Record<string, number>>> {
    try {
      const { data: posts, error } = await supabase
        .from('community_writing_list')
        .select('category_1, status')

      if (error) {
        throw new Error('카테고리별 상태 분포 조회 실패')
      }

      const distribution: Record<string, Record<string, number>> = {}

      posts?.forEach(post => {
        const category = post.category_1 || '기타'
        if (!distribution[category]) {
          distribution[category] = {
            active: 0,
            hidden: 0,
            deleted: 0,
            pending: 0,
          }
        }
        distribution[category][post.status] = (distribution[category][post.status] || 0) + 1
      })

      return distribution
    } catch (error) {
      console.error('StatsService.getCategoryStatusDistribution 오류:', error)
      throw error
    }
  }

  /**
   * 저장된 게시글 통계 계산
   */
  private async calculateSavedPostsStats(savedPosts: any[], posts: any[]) {
    // 오늘 저장된 게시글 수
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dailySaves = savedPosts.filter(save => {
      const saveDate = new Date(save.created_at)
      saveDate.setHours(0, 0, 0, 0)
      return saveDate.getTime() === today.getTime()
    }).length

    // 활성 사용자 수 (저장 활동을 한 사용자)
    const activeUsers = new Set(savedPosts.map(save => save.user_id)).size

    // 가장 많이 저장된 게시글 TOP 5
    const saveCountMap = new Map<string, number>()
    savedPosts.forEach(save => {
      const postId = save.post_id
      saveCountMap.set(postId, (saveCountMap.get(postId) || 0) + 1)
    })

    // 게시글 제목과 함께 TOP 5 추출
    const topSavedPosts = Array.from(saveCountMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([postId, saveCount]) => {
        const post = posts.find(p => p.id === postId)
        return {
          postId,
          title: post?.title || '제목 없음',
          saveCount,
        }
      })

    return {
      total: savedPosts.length,
      dailySaves,
      topSavedPosts,
      userSaveActivity: activeUsers,
    }
  }

  /**
   * 일별 활동 통계 계산
   */
  private calculateDailyActivity(
    posts: any[],
    comments: any[],
    likes: any[],
    savedPosts: any[] = []
  ) {
    const dailyMap = new Map<string, any>()

    // 최근 30일 초기화
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      dailyMap.set(dateStr, {
        date: dateStr,
        posts: 0,
        comments: 0,
        views: 0,
        likes: 0,
        saves: 0,
      })
    }

    // 게시글 데이터 집계
    posts.forEach(post => {
      const dateStr = post.created_at.split('T')[0]
      if (dailyMap.has(dateStr)) {
        const day = dailyMap.get(dateStr)
        day.posts += 1
        day.views += post.views_count || 0
      }
    })

    // 댓글 데이터 집계
    comments.forEach(comment => {
      const dateStr = comment.created_at.split('T')[0]
      if (dailyMap.has(dateStr)) {
        const day = dailyMap.get(dateStr)
        day.comments += 1
      }
    })

    // 좋아요 데이터 집계
    likes.forEach(like => {
      const dateStr = like.created_at.split('T')[0]
      if (dailyMap.has(dateStr)) {
        const day = dailyMap.get(dateStr)
        day.likes += 1
      }
    })

    // 저장 데이터 집계
    savedPosts.forEach(save => {
      const dateStr = save.created_at.split('T')[0]
      if (dailyMap.has(dateStr)) {
        const day = dailyMap.get(dateStr)
        day.saves += 1
      }
    })

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }
}

export const statsService = new StatsService()