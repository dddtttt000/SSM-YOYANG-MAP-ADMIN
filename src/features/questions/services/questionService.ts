import { supabase } from '@/lib/supabase'
import type { Question, CreateQuestionData, UpdateQuestionData, QuestionFilters } from '../types'

class QuestionService {
  /**
   * FAQ 목록 조회
   */
  async getQuestions(filters?: QuestionFilters): Promise<Question[]> {
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      // 카테고리 필터
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      // 검색 필터 (제목과 내용에서 검색)
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('FAQ 목록 조회 오류:', error)
        throw new Error('FAQ 목록을 불러오는데 실패했습니다.')
      }

      return data || []
    } catch (error) {
      console.error('FAQ 목록 조회 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * FAQ 상세 조회
   */
  async getQuestion(id: number): Promise<Question | null> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('FAQ 상세 조회 오류:', error)
        throw new Error('FAQ를 불러오는데 실패했습니다.')
      }

      return data
    } catch (error) {
      console.error('FAQ 상세 조회 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * FAQ 생성
   */
  async createQuestion(data: CreateQuestionData): Promise<Question> {
    try {
      const { data: result, error } = await supabase
        .from('questions')
        .insert({
          title: data.title,
          content: data.content,
          category: data.category,
        })
        .select()
        .single()

      if (error) {
        console.error('FAQ 생성 오류:', error)
        throw new Error('FAQ 생성에 실패했습니다.')
      }

      return result
    } catch (error) {
      console.error('FAQ 생성 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * FAQ 수정
   */
  async updateQuestion(id: number, data: UpdateQuestionData): Promise<Question> {
    try {
      const { data: result, error } = await supabase
        .from('questions')
        .update({
          title: data.title,
          content: data.content,
          category: data.category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('FAQ 수정 오류:', error)
        throw new Error('FAQ 수정에 실패했습니다.')
      }

      return result
    } catch (error) {
      console.error('FAQ 수정 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * FAQ 삭제
   */
  async deleteQuestion(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('FAQ 삭제 오류:', error)
        throw new Error('FAQ 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('FAQ 삭제 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 카테고리별 FAQ 개수 조회
   */
  async getQuestionCountsByCategory(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('category')

      if (error) {
        console.error('FAQ 카테고리별 개수 조회 오류:', error)
        throw new Error('FAQ 통계를 불러오는데 실패했습니다.')
      }

      const counts: Record<string, number> = {}
      data?.forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1
      })

      return counts
    } catch (error) {
      console.error('FAQ 카테고리별 개수 조회 중 오류 발생:', error)
      throw error
    }
  }
}

export const questionService = new QuestionService()
export default questionService