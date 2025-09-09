import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import type { Announcement, Database } from '@/types/database.types'
import type {
  CreateAnnouncementData,
  UpdateAnnouncementData,
  AnnouncementFilters,
  AnnouncementError,
  AnnouncementCategory,
} from '../types'

type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert']
type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update']

class AnnouncementService {
  /**
   * 공지사항 목록 조회
   */
  async getAnnouncements(filters?: AnnouncementFilters): Promise<Announcement[]> {
    try {
      let query = supabase.from('announcements').select('*').order('created_at', { ascending: false })

      // 필터 적용
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      if (filters?.isImportant !== undefined) {
        query = query.eq('is_important', filters.isImportant)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error } = await query

      if (error) {
        logger.error('공지사항 목록 조회 오류:', error)
        const announcementError: AnnouncementError = {
          message: '공지사항 목록을 불러오는데 실패했습니다.',
          code: error.code,
        }
        throw announcementError
      }

      return data || []
    } catch (error) {
      logger.error('공지사항 목록 조회 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 공지사항 상세 조회
   */
  async getAnnouncement(id: number): Promise<Announcement | null> {
    try {
      const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single()

      if (error) {
        logger.error('공지사항 상세 조회 오류:', error)
        throw new Error('공지사항을 불러오는데 실패했습니다.')
      }

      return data
    } catch (error) {
      logger.error('공지사항 상세 조회 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 공지사항 생성
   */
  async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
    try {
      const insertData: AnnouncementInsert = {
        title: data.title,
        content: data.content,
        category: data.category,
        is_important: data.isImportant,
        is_active: data.isActive !== undefined ? data.isActive : true,
      }

      const { data: result, error } = await supabase.from('announcements').insert(insertData).select().single()

      if (error) {
        logger.error('공지사항 생성 오류:', error)
        throw new Error('공지사항 생성에 실패했습니다.')
      }

      return result
    } catch (error) {
      logger.error('공지사항 생성 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 공지사항 수정
   */
  async updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<Announcement> {
    try {
      const updateData: AnnouncementUpdate = {}

      updateData.title = data.title
      updateData.content = data.content
      updateData.category = data.category
      updateData.is_important = data.isImportant
      if (data.isActive !== undefined) updateData.is_active = data.isActive

      const { data: result, error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logger.error('공지사항 수정 오류:', error)
        throw new Error('공지사항 수정에 실패했습니다.')
      }

      return result
    } catch (error) {
      logger.error('공지사항 수정 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 공지사항 삭제
   */
  async deleteAnnouncement(id: number): Promise<void> {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id)

      if (error) {
        logger.error('공지사항 삭제 오류:', error)
        throw new Error('공지사항 삭제에 실패했습니다.')
      }
    } catch (error) {
      logger.error('공지사항 삭제 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 공지사항 상태 토글
   */
  async toggleAnnouncementStatus(id: number): Promise<Announcement> {
    try {
      // 먼저 현재 상태를 조회
      const current = await this.getAnnouncement(id)
      if (!current) {
        throw new Error('공지사항을 찾을 수 없습니다.')
      }

      const newStatus = !current.is_active

      // 현재 데이터를 유지하면서 isActive만 변경
      return await this.updateAnnouncement(id, {
        title: current.title,
        content: current.content,
        category: current.category as AnnouncementCategory,
        isImportant: current.is_important,
        isActive: newStatus,
      })
    } catch (error) {
      logger.error('공지사항 상태 변경 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 활성 공지사항 목록 조회 (사용자용)
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('is_important', { ascending: false }) // 중요 공지사항 먼저
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('활성 공지사항 조회 오류:', error)
        throw new Error('공지사항을 불러오는데 실패했습니다.')
      }

      return data || []
    } catch (error) {
      logger.error('활성 공지사항 조회 중 오류 발생:', error)
      throw error
    }
  }
}

export const announcementService = new AnnouncementService()
export default announcementService
