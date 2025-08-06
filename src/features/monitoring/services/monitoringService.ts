import {
  collection,
  query,
  where,
  limit,
  getDocs,
  QueryConstraint,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import {
  AIFacilityAnalysis,
  AssessmentResult,
  CallEvent,
  FavoriteFacility,
  MonitoringFilters,
} from '../types'
import { supabase } from '@/lib/supabase'
import { Member } from '@/types/database.types'

class MonitoringService {
  // Firestore 컬렉션 이름
  private readonly collections = {
    aiAnalyses: 'ai_facility_analyses',
    assessmentResults: 'assessment_results',
    callEvents: 'call_events',
    favoriteFacilities: 'favorite_facilities',
  }

  // AI 시설 분석 이벤트 조회
  async getAIAnalyses(filters: MonitoringFilters): Promise<AIFacilityAnalysis[]> {
    try {
      // Firebase 설정 확인
      if (!firestore) {
        console.error('Firebase가 초기화되지 않았습니다.')
        return []
      }

      const constraints: QueryConstraint[] = []

      // orderBy와 where 조건을 함께 사용할 때는 인덱스가 필요할 수 있으므로
      // 일단 where 조건 없이 전체 데이터를 가져온 후 필터링
      if (!filters.userId && !filters.adminCode && !filters.startDate && !filters.endDate) {
        constraints.push(limit(100))
      }

      if (filters.userId) {
        constraints.push(where('memberId', '==', filters.userId))
      }

      if (filters.adminCode) {
        constraints.push(where('facilityId', '==', filters.adminCode))
      }

      console.log('Fetching AI analyses:', {
        collection: this.collections.aiAnalyses,
        constraints: constraints.length,
      })
      
      const q = query(collection(firestore, this.collections.aiAnalyses), ...constraints)
      const snapshot = await getDocs(q)
      console.log('AI analyses fetched:', snapshot.size, 'documents')

      let results = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as AIFacilityAnalysis))

      // 클라이언트 사이드에서 날짜 필터링
      if (filters.startDate) {
        results = results.filter(item => {
          const itemDate = item.createdAt?.toDate?.() || new Date(0)
          return itemDate >= filters.startDate!
        })
      }

      if (filters.endDate) {
        results = results.filter(item => {
          const itemDate = item.createdAt?.toDate?.() || new Date(0)
          return itemDate <= filters.endDate!
        })
      }

      // 클라이언트 사이드에서 정렬
      results.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      return results
    } catch (error) {
      console.error('Error fetching AI analyses:', error)
      throw error
    }
  }

  // 요양등급 평가 결과 조회
  async getAssessmentResults(filters: MonitoringFilters): Promise<AssessmentResult[]> {
    try {
      const constraints: QueryConstraint[] = []

      if (!filters.userId && !filters.startDate && !filters.endDate) {
        constraints.push(limit(100))
      }

      if (filters.userId) {
        constraints.push(where('user_id', '==', filters.userId))
      }

      console.log('Fetching assessment results')
      const q = query(collection(firestore, this.collections.assessmentResults), ...constraints)
      const snapshot = await getDocs(q)
      console.log('Assessment results fetched:', snapshot.size, 'documents')

      let results = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as AssessmentResult))

      // 클라이언트 사이드에서 날짜 필터링
      if (filters.startDate) {
        results = results.filter(item => {
          const itemDate = item.created_at?.toDate?.() || new Date(0)
          return itemDate >= filters.startDate!
        })
      }

      if (filters.endDate) {
        results = results.filter(item => {
          const itemDate = item.created_at?.toDate?.() || new Date(0)
          return itemDate <= filters.endDate!
        })
      }

      // 클라이언트 사이드에서 정렬
      results.sort((a, b) => {
        const dateA = a.created_at?.toDate?.() || new Date(0)
        const dateB = b.created_at?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      return results
    } catch (error) {
      console.error('Error fetching assessment results:', error)
      throw error
    }
  }

  // 상담 전화 이벤트 조회
  async getCallEvents(filters: MonitoringFilters): Promise<CallEvent[]> {
    try {
      const constraints: QueryConstraint[] = []

      if (!filters.userId && !filters.adminCode) {
        constraints.push(limit(100))
      }

      if (filters.userId) {
        constraints.push(where('memberId', '==', filters.userId))
      }

      if (filters.adminCode) {
        constraints.push(where('facilityId', '==', filters.adminCode))
      }

      console.log('Fetching call events')
      const q = query(collection(firestore, this.collections.callEvents), ...constraints)
      const snapshot = await getDocs(q)
      console.log('Call events fetched:', snapshot.size, 'documents')

      let results = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as CallEvent))

      // 날짜 필터링 (createdAt이 문자열인 경우 처리)
      if (filters.startDate || filters.endDate) {
        results = results.filter(item => {
          let itemDate: Date
          if (typeof item.createdAt === 'string') {
            itemDate = new Date(item.createdAt)
          } else {
            itemDate = item.createdAt?.toDate?.() || new Date(0)
          }
          
          if (filters.startDate && itemDate < filters.startDate) return false
          if (filters.endDate && itemDate > filters.endDate) return false
          return true
        })
      }

      // 정렬
      results.sort((a, b) => {
        let dateA: Date
        let dateB: Date
        
        if (typeof a.createdAt === 'string') {
          dateA = new Date(a.createdAt)
        } else {
          dateA = a.createdAt?.toDate?.() || new Date(0)
        }
        
        if (typeof b.createdAt === 'string') {
          dateB = new Date(b.createdAt)
        } else {
          dateB = b.createdAt?.toDate?.() || new Date(0)
        }
        
        return dateB.getTime() - dateA.getTime()
      })

      return results
    } catch (error) {
      console.error('Error fetching call events:', error)
      throw error
    }
  }

  // 즐겨찾기 시설 조회
  async getFavoriteFacilities(filters: MonitoringFilters): Promise<FavoriteFacility[]> {
    try {
      const constraints: QueryConstraint[] = []

      if (!filters.userId && !filters.adminCode) {
        constraints.push(limit(100))
      }

      if (filters.userId) {
        constraints.push(where('memberId', '==', filters.userId))
      }

      if (filters.adminCode) {
        constraints.push(where('facilityId', '==', filters.adminCode))
      }

      console.log('Fetching favorite facilities')
      const q = query(collection(firestore, this.collections.favoriteFacilities), ...constraints)
      const snapshot = await getDocs(q)
      console.log('Favorite facilities fetched:', snapshot.size, 'documents')

      let results = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as FavoriteFacility))

      // 날짜 필터링
      if (filters.startDate) {
        results = results.filter(item => {
          const itemDate = item.createdAt?.toDate?.() || new Date(0)
          return itemDate >= filters.startDate!
        })
      }

      if (filters.endDate) {
        results = results.filter(item => {
          const itemDate = item.createdAt?.toDate?.() || new Date(0)
          return itemDate <= filters.endDate!
        })
      }

      // 정렬
      results.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      return results
    } catch (error) {
      console.error('Error fetching favorite facilities:', error)
      throw error
    }
  }

  // 통합 모니터링 데이터 조회
  async getMonitoringData(filters: MonitoringFilters): Promise<{
    aiAnalyses: AIFacilityAnalysis[]
    assessmentResults: AssessmentResult[]
    callEvents: CallEvent[]
    favoriteFacilities: FavoriteFacility[]
  }> {
    const promises = []

    // 활동 유형별 조회
    if (!filters.activityType || filters.activityType === 'all' || filters.activityType === 'ai_analysis') {
      promises.push(this.getAIAnalyses(filters))
    } else {
      promises.push(Promise.resolve([]))
    }

    if (!filters.activityType || filters.activityType === 'all' || filters.activityType === 'assessment') {
      promises.push(this.getAssessmentResults(filters))
    } else {
      promises.push(Promise.resolve([]))
    }

    if (!filters.activityType || filters.activityType === 'all' || filters.activityType === 'call') {
      promises.push(this.getCallEvents(filters))
    } else {
      promises.push(Promise.resolve([]))
    }

    if (!filters.activityType || filters.activityType === 'all' || filters.activityType === 'favorite') {
      promises.push(this.getFavoriteFacilities(filters))
    } else {
      promises.push(Promise.resolve([]))
    }

    const results = await Promise.all(promises)

    return {
      aiAnalyses: results[0] as AIFacilityAnalysis[],
      assessmentResults: results[1] as AssessmentResult[],
      callEvents: results[2] as CallEvent[],
      favoriteFacilities: results[3] as FavoriteFacility[],
    }
  }

  // 회원 정보 조회 (Supabase)
  async getMemberInfo(userIds: string[]): Promise<Map<string, Member>> {
    if (userIds.length === 0) return new Map()

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .in('id', userIds)

    if (error) throw error

    const memberMap = new Map<string, Member>()
    data?.forEach(member => {
      memberMap.set(member.id, member)
    })

    return memberMap
  }

  // 시설 정보 조회 (Supabase)
  async getFacilityInfo(adminCodes: string[]): Promise<Map<string, any>> {
    if (adminCodes.length === 0) return new Map()

    const { data, error } = await supabase
      .from('facilities_ssmn_basic_full')
      .select('admin_code, admin_name, admin_type_code, address, phone_number')
      .in('admin_code', adminCodes)

    if (error) throw error

    const facilityMap = new Map<string, any>()
    data?.forEach(facility => {
      facilityMap.set(facility.admin_code, facility)
    })

    return facilityMap
  }

  // 활동 통계 조회
  async getActivityStats(filters: MonitoringFilters) {
    const data = await this.getMonitoringData(filters)

    return {
      totalActivities: 
        data.aiAnalyses.length + 
        data.assessmentResults.length + 
        data.callEvents.length + 
        data.favoriteFacilities.length,
      byType: {
        aiAnalysis: data.aiAnalyses.length,
        assessment: data.assessmentResults.length,
        call: data.callEvents.length,
        favorite: data.favoriteFacilities.length,
      },
      uniqueUsers: new Set([
        ...data.aiAnalyses.map(item => item.memberId),
        ...data.assessmentResults.map(item => item.user_id),
        ...data.callEvents.map(item => item.memberId),
        ...data.favoriteFacilities.map(item => item.memberId),
      ]).size,
      uniqueFacilities: new Set([
        ...data.aiAnalyses.map(item => item.facilityId),
        ...data.callEvents.map(item => item.facilityId),
        ...data.favoriteFacilities.map(item => item.facilityId),
      ].filter(Boolean)).size,
    }
  }
}

export const monitoringService = new MonitoringService()