import { supabase } from '@/lib/supabase'
import type { 
  ServiceInquiryWithResponse, 
  ServiceInquiryDetail,
  CreateInquiryResponse,
  InquiryFilters,
  InquirySorting,
  InquiryPagination
} from '../types/inquiry.types'
import type { InquiryResponse } from '@/types/database.types'

class InquiryService {
  /**
   * 서비스 문의 목록 조회 (페이지네이션 포함)
   */
  async getInquiries(
    page: number = 1,
    limit: number = 20,
    filters?: InquiryFilters,
    sorting?: InquirySorting
  ): Promise<{ data: ServiceInquiryWithResponse[]; pagination: InquiryPagination }> {
    try {
      let query = supabase
        .from('service_inquiries')
        .select('*', { count: 'exact' })

      // 상태 필터
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      // 검색 필터 (제목, 내용, 이메일에서 검색)
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      // 정렬
      const sortField = sorting?.field || 'created_at'
      const sortOrder = sorting?.order || 'desc'
      query = query.order(sortField, { ascending: sortOrder === 'asc' })

      // 페이지네이션
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('서비스 문의 목록 조회 오류:', error)
        throw new Error('서비스 문의 목록을 불러오는데 실패했습니다.')
      }

      // 각 문의별 답변 개수 조회
      const dataWithResponseCount: ServiceInquiryWithResponse[] = await Promise.all(
        (data || []).map(async (item) => {
          const { count } = await supabase
            .from('inquiry_responses')
            .select('*', { count: 'exact', head: true })
            .eq('inquiry_id', item.id)
          
          return {
            ...item,
            response_count: count || 0
          }
        })
      )

      const pagination: InquiryPagination = {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }

      return { data: dataWithResponseCount, pagination }
    } catch (error) {
      console.error('서비스 문의 목록 조회 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 서비스 문의 상세 조회 (답변 포함)
   */
  async getInquiryDetail(id: number): Promise<ServiceInquiryDetail | null> {
    try {
      const { data, error } = await supabase
        .from('service_inquiries')
        .select(`
          *,
          inquiry_responses (
            *,
            admin_user:admin_users (
              id,
              name,
              email
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('서비스 문의 상세 조회 오류:', error)
        throw new Error('서비스 문의를 불러오는데 실패했습니다.')
      }

      return data as ServiceInquiryDetail
    } catch (error) {
      console.error('서비스 문의 상세 조회 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 서비스 문의 답변 작성
   */
  async createResponse(inquiryId: number, responseData: CreateInquiryResponse, adminUserId: number): Promise<InquiryResponse> {
    try {
      // 답변 생성
      const { data: response, error: responseError } = await supabase
        .from('inquiry_responses')
        .insert({
          inquiry_id: inquiryId,
          title: responseData.title,
          content: responseData.content,
          admin_user_id: adminUserId
        })
        .select()
        .single()

      if (responseError) {
        console.error('답변 생성 오류:', responseError)
        throw new Error('답변 생성에 실패했습니다.')
      }

      // 문의 상태를 'answered'로 업데이트
      console.log('💡 상태 업데이트 시도:', { inquiryId, status: 'answered' })
      const { error: updateError } = await supabase
        .from('service_inquiries')
        .update({ 
          status: 'answered',
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId)

      if (updateError) {
        console.error('문의 상태 업데이트 오류:', updateError)
        throw new Error('문의 상태 업데이트에 실패했습니다.')
      }

      return response
    } catch (error) {
      console.error('답변 생성 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 서비스 문의 답변 수정
   */
  async updateResponse(responseId: number, responseData: CreateInquiryResponse): Promise<InquiryResponse> {
    try {
      const { data, error } = await supabase
        .from('inquiry_responses')
        .update({
          title: responseData.title,
          content: responseData.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', responseId)
        .select()
        .single()

      if (error) {
        console.error('답변 수정 오류:', error)
        throw new Error('답변 수정에 실패했습니다.')
      }

      return data
    } catch (error) {
      console.error('답변 수정 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 서비스 문의 답변 삭제
   */
  async deleteResponse(responseId: number, inquiryId: number): Promise<void> {
    try {
      // 답변 삭제
      const { error: deleteError } = await supabase
        .from('inquiry_responses')
        .delete()
        .eq('id', responseId)

      if (deleteError) {
        console.error('답변 삭제 오류:', deleteError)
        throw new Error('답변 삭제에 실패했습니다.')
      }

      // 해당 문의에 답변이 더 있는지 확인
      const { data: responses, error: checkError } = await supabase
        .from('inquiry_responses')
        .select('id')
        .eq('inquiry_id', inquiryId)

      if (checkError) {
        console.error('답변 확인 오류:', checkError)
        throw new Error('답변 상태 확인에 실패했습니다.')
      }

      // 답변이 없으면 문의 상태를 'pending'으로 변경
      if (!responses || responses.length === 0) {
        const { error: updateError } = await supabase
          .from('service_inquiries')
          .update({ 
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', inquiryId)

        if (updateError) {
          console.error('문의 상태 업데이트 오류:', updateError)
          throw new Error('문의 상태 업데이트에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('답변 삭제 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 상태별 서비스 문의 통계
   */
  async getInquiryStats(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('service_inquiries')
        .select('status')

      if (error) {
        console.error('서비스 문의 통계 조회 오류:', error)
        throw new Error('서비스 문의 통계를 불러오는데 실패했습니다.')
      }

      const stats: Record<string, number> = {
        total: data?.length || 0,
        pending: 0,
        answered: 0
      }

      data?.forEach(item => {
        stats[item.status] = (stats[item.status] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('서비스 문의 통계 조회 중 오류 발생:', error)
      throw error
    }
  }
}

export const inquiryService = new InquiryService()
export default inquiryService