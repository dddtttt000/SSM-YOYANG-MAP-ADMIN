import { useQuery } from '@tanstack/react-query'
import { monitoringService } from '../services/monitoringService'
import { MonitoringFilters } from '../types'

// 통합 모니터링 데이터 조회
export const useMonitoringData = (filters: MonitoringFilters) => {
  return useQuery({
    queryKey: ['monitoring', filters],
    queryFn: () => monitoringService.getMonitoringData(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 활동 통계 조회
export const useActivityStats = (filters: MonitoringFilters) => {
  return useQuery({
    queryKey: ['activityStats', filters],
    queryFn: () => monitoringService.getActivityStats(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// AI 분석 이벤트 조회
export const useAIAnalyses = (filters: MonitoringFilters) => {
  return useQuery({
    queryKey: ['aiAnalyses', filters],
    queryFn: () => monitoringService.getAIAnalyses(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 요양등급 평가 결과 조회
export const useAssessmentResults = (filters: MonitoringFilters) => {
  return useQuery({
    queryKey: ['assessmentResults', filters],
    queryFn: () => monitoringService.getAssessmentResults(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 상담 전화 이벤트 조회
export const useCallEvents = (filters: MonitoringFilters) => {
  return useQuery({
    queryKey: ['callEvents', filters],
    queryFn: () => monitoringService.getCallEvents(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 즐겨찾기 시설 조회
export const useFavoriteFacilities = (filters: MonitoringFilters) => {
  return useQuery({
    queryKey: ['favoriteFacilities', filters],
    queryFn: () => monitoringService.getFavoriteFacilities(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 회원 정보 조회
export const useMemberInfo = (userIds: string[], isSocialId: boolean = false) => {
  return useQuery({
    queryKey: ['memberInfo', userIds, isSocialId],
    queryFn: () => monitoringService.getMemberInfo(userIds, isSocialId),
    enabled: userIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10분
  })
}

// 시설 정보 조회
export const useFacilityInfo = (adminCodes: string[]) => {
  return useQuery({
    queryKey: ['facilityInfo', adminCodes],
    queryFn: () => monitoringService.getFacilityInfo(adminCodes),
    enabled: adminCodes.length > 0,
    staleTime: 10 * 60 * 1000, // 10분
  })
}