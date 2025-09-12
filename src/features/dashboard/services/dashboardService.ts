import { supabase } from '@/lib/supabase'
import { firestore } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore'

export interface DashboardStats {
  totalMembers: number
  activeMembersToday: number
  totalFacilities: number
  activeFacilities: number
  totalAdmins: number
  activeAdmins: number
  recentActivities: number
  todayActivities: number
}

export interface RecentActivity {
  id: string
  type: 'ai_analysis' | 'assessment' | 'call' | 'favorite' | 'member_join' | 'facility_add'
  description: string
  timestamp: Date
  userId?: string
  userName?: string
  facilityId?: string
  facilityName?: string
}

export interface SystemStatus {
  database: 'normal' | 'warning' | 'error'
  api: 'normal' | 'warning' | 'error'
  auth: 'normal' | 'warning' | 'error'
  storage: {
    status: 'normal' | 'warning' | 'error'
    usage: number
  }
}

class DashboardService {
  // 대시보드 통계 조회
  async getStats(): Promise<DashboardStats> {
    try {
      // 전체 회원 수
      const { count: totalMembers } = await supabase.from('members').select('*', { count: 'exact', head: true })

      // 오늘 활동한 회원 수 (Firestore에서 조회)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const collections = ['ai_facility_analyses', 'assessment_results', 'call_events', 'favorite_facilities']
      const activeUserIds = new Set<string>()

      for (const collectionName of collections) {
        const q = query(collection(firestore, collectionName), where('createdAt', '>=', Timestamp.fromDate(today)))
        const snapshot = await getDocs(q)
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.memberId) activeUserIds.add(data.memberId)
          if (data.user_id) activeUserIds.add(data.user_id)
        })
      }

      // 전체 시설 수
      const { count: totalFacilities } = await supabase
        .from('facilities_ssmn_basic_full')
        .select('*', { count: 'exact', head: true })

      // 서비스 중인 시설 수
      const { count: activeFacilities } = await supabase
        .from('facilities_ssmn_basic_full')
        .select('*', { count: 'exact', head: true })
        .not('admin_name', 'is', null)
        .neq('admin_name', '')

      // 전체 관리자 수
      const { count: totalAdmins } = await supabase.from('admin_users').select('*', { count: 'exact', head: true })

      // 활성 관리자 수
      const { count: activeAdmins } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // 최근 활동 수 (최근 7일)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      let recentActivities = 0
      let todayActivities = 0

      for (const collectionName of collections) {
        const q = query(
          collection(firestore, collectionName),
          where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
        )
        const snapshot = await getDocs(q)
        recentActivities += snapshot.size

        // 오늘 활동 수
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          const createdAt = data.createdAt?.toDate?.() || new Date(0)
          if (createdAt >= today) {
            todayActivities++
          }
        })
      }

      return {
        totalMembers: totalMembers || 0,
        activeMembersToday: activeUserIds.size,
        totalFacilities: totalFacilities || 0,
        activeFacilities: activeFacilities || 0,
        totalAdmins: totalAdmins || 0,
        activeAdmins: activeAdmins || 0,
        recentActivities,
        todayActivities,
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  // 최근 활동 조회
  async getRecentActivities(limitCount: number = 10): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = []

      // AI 분석 활동
      const aiAnalysesQuery = query(
        collection(firestore, 'ai_facility_analyses'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const aiSnapshot = await getDocs(aiAnalysesQuery)

      for (const doc of aiSnapshot.docs) {
        const data = doc.data()
        activities.push({
          id: doc.id,
          type: 'ai_analysis',
          description: 'AI 시설 분석',
          timestamp: data.createdAt?.toDate?.() || new Date(),
          userId: data.memberId,
          facilityId: data.facilityId,
        })
      }

      // 등급 평가 활동
      const assessmentQuery = query(
        collection(firestore, 'assessment_results'),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      )
      const assessmentSnapshot = await getDocs(assessmentQuery)

      for (const doc of assessmentSnapshot.docs) {
        const data = doc.data()
        activities.push({
          id: doc.id,
          type: 'assessment',
          description: `요양등급 평가: ${data.grade || '미평가'}`,
          timestamp: data.created_at?.toDate?.() || new Date(),
          userId: data.user_id,
        })
      }

      // 상담 전화 활동
      const callQuery = query(collection(firestore, 'call_events'), orderBy('createdAt', 'desc'), limit(limitCount))
      const callSnapshot = await getDocs(callQuery)

      for (const doc of callSnapshot.docs) {
        const data = doc.data()
        activities.push({
          id: doc.id,
          type: 'call',
          description: '상담 전화',
          timestamp:
            typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt?.toDate?.() || new Date(),
          userId: data.memberId,
          facilityId: data.facilityId,
        })
      }

      // 정렬 및 제한
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      const limitedActivities = activities.slice(0, limitCount)

      // 사용자 및 시설 정보 추가
      const userIds = [...new Set(limitedActivities.map(a => a.userId).filter(Boolean))]
      const facilityIds = [...new Set(limitedActivities.map(a => a.facilityId).filter(Boolean))]

      // 사용자 정보 조회
      if (userIds.length > 0) {
        // 숫자처럼 보이는 값 중에서도 DB의 id(int4) 범위를 초과하는 큰 숫자(소셜ID 형태)는 social_id로 조회해야 함
        const INT32_MAX = 2147483647
        const isDigits = (v: unknown) => /^\d+$/.test(String(v))
        const isValidIntId = (v: unknown) => isDigits(v) && Number(v) <= INT32_MAX

        const numericIds = userIds.filter(id => isValidIntId(id))
        const socialIds = userIds.filter(id => !isValidIntId(id))

        if (numericIds.length > 0) {
          const { data: membersByIds } = await supabase
            .from('members')
            .select('id, email, nickname, name')
            .in('id', numericIds.map(Number))

          membersByIds?.forEach(member => {
            limitedActivities.forEach(activity => {
              if (activity.userId === member.id.toString()) {
                activity.userName = member.nickname || member.name || member.email
              }
            })
          })
        }

        if (socialIds.length > 0) {
          const { data: membersBySocialIds } = await supabase
            .from('members')
            .select('social_id, email, nickname, name')
            .in('social_id', socialIds)

          membersBySocialIds?.forEach(member => {
            limitedActivities.forEach(activity => {
              if (activity.userId === member.social_id) {
                activity.userName = member.nickname || member.name || member.email
              }
            })
          })
        }
      }

      // 시설 정보 조회
      if (facilityIds.length > 0) {
        const { data: facilities } = await supabase
          .from('facilities_ssmn_basic_full')
          .select('admin_code, admin_name')
          .in('admin_code', facilityIds)

        facilities?.forEach(facility => {
          limitedActivities.forEach(activity => {
            if (activity.facilityId === facility.admin_code) {
              activity.facilityName = facility.admin_name
            }
          })
        })
      }

      return limitedActivities
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      throw error
    }
  }

  // 시스템 상태 조회
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // 데이터베이스 상태 체크
      const dbStart = Date.now()
      const { error: dbError } = await supabase.from('admin_users').select('id').limit(1)
      const dbResponseTime = Date.now() - dbStart

      // API 상태 체크
      const apiStart = Date.now()
      const { error: apiError } = await supabase.auth.getSession()
      const apiResponseTime = Date.now() - apiStart

      // 스토리지 사용량 (임시 값 - 실제로는 Supabase API에서 조회)
      const storageUsage = Math.floor(Math.random() * 30) + 60 // 60-90%

      return {
        database: dbError ? 'error' : dbResponseTime > 1000 ? 'warning' : 'normal',
        api: apiError ? 'error' : apiResponseTime > 1000 ? 'warning' : 'normal',
        auth: 'normal', // 인증은 이미 로그인했으므로 정상
        storage: {
          status: storageUsage > 90 ? 'error' : storageUsage > 80 ? 'warning' : 'normal',
          usage: storageUsage,
        },
      }
    } catch (error) {
      console.error('Error checking system status:', error)
      return {
        database: 'error',
        api: 'error',
        auth: 'error',
        storage: {
          status: 'error',
          usage: 0,
        },
      }
    }
  }
}

export const dashboardService = new DashboardService()
