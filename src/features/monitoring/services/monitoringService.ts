import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
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
    const constraints: QueryConstraint[] = [
      orderBy('created_at', 'desc'),
      limit(100),
    ]

    if (filters.userId) {
      constraints.unshift(where('user_id', '==', filters.userId))
    }

    if (filters.adminCode) {
      constraints.unshift(where('admin_code', '==', filters.adminCode))
    }

    if (filters.startDate) {
      constraints.push(where('created_at', '>=', Timestamp.fromDate(filters.startDate)))
    }

    if (filters.endDate) {
      constraints.push(where('created_at', '<=', Timestamp.fromDate(filters.endDate)))
    }

    const q = query(collection(firestore, this.collections.aiAnalyses), ...constraints)
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as AIFacilityAnalysis))
  }

  // 요양등급 평가 결과 조회
  async getAssessmentResults(filters: MonitoringFilters): Promise<AssessmentResult[]> {
    const constraints: QueryConstraint[] = [
      orderBy('created_at', 'desc'),
      limit(100),
    ]

    if (filters.userId) {
      constraints.unshift(where('user_id', '==', filters.userId))
    }

    if (filters.startDate) {
      constraints.push(where('created_at', '>=', Timestamp.fromDate(filters.startDate)))
    }

    if (filters.endDate) {
      constraints.push(where('created_at', '<=', Timestamp.fromDate(filters.endDate)))
    }

    const q = query(collection(firestore, this.collections.assessmentResults), ...constraints)
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as AssessmentResult))
  }

  // 상담 전화 이벤트 조회
  async getCallEvents(filters: MonitoringFilters): Promise<CallEvent[]> {
    const constraints: QueryConstraint[] = [
      orderBy('created_at', 'desc'),
      limit(100),
    ]

    if (filters.userId) {
      constraints.unshift(where('user_id', '==', filters.userId))
    }

    if (filters.adminCode) {
      constraints.unshift(where('admin_code', '==', filters.adminCode))
    }

    if (filters.startDate) {
      constraints.push(where('created_at', '>=', Timestamp.fromDate(filters.startDate)))
    }

    if (filters.endDate) {
      constraints.push(where('created_at', '<=', Timestamp.fromDate(filters.endDate)))
    }

    const q = query(collection(firestore, this.collections.callEvents), ...constraints)
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as CallEvent))
  }

  // 즐겨찾기 시설 조회
  async getFavoriteFacilities(filters: MonitoringFilters): Promise<FavoriteFacility[]> {
    const constraints: QueryConstraint[] = [
      where('is_active', '==', true),
      orderBy('created_at', 'desc'),
      limit(100),
    ]

    if (filters.userId) {
      constraints.unshift(where('user_id', '==', filters.userId))
    }

    if (filters.adminCode) {
      constraints.unshift(where('admin_code', '==', filters.adminCode))
    }

    if (filters.startDate) {
      constraints.push(where('created_at', '>=', Timestamp.fromDate(filters.startDate)))
    }

    if (filters.endDate) {
      constraints.push(where('created_at', '<=', Timestamp.fromDate(filters.endDate)))
    }

    const q = query(collection(firestore, this.collections.favoriteFacilities), ...constraints)
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FavoriteFacility))
  }

  // 통합 모니터링 데이터 조회
  async getMonitoringData(filters: MonitoringFilters) {
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

    const [aiAnalyses, assessmentResults, callEvents, favoriteFacilities] = await Promise.all(promises)

    return {
      aiAnalyses,
      assessmentResults,
      callEvents,
      favoriteFacilities,
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
        ...data.aiAnalyses.map(item => item.user_id),
        ...data.assessmentResults.map(item => item.user_id),
        ...data.callEvents.map(item => item.user_id),
        ...data.favoriteFacilities.map(item => item.user_id),
      ]).size,
      uniqueFacilities: new Set([
        ...data.aiAnalyses.map(item => item.admin_code),
        ...data.callEvents.map(item => item.admin_code),
        ...data.favoriteFacilities.map(item => item.admin_code),
      ]).size,
    }
  }
}

export const monitoringService = new MonitoringService()