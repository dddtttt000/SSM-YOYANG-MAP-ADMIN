import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

// 대시보드 통계 조회
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
  })
}

// 최근 활동 조회
export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recentActivities', limit],
    queryFn: () => dashboardService.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000, // 1분
    refetchInterval: 1 * 60 * 1000, // 1분마다 자동 갱신
  })
}

// 시스템 상태 조회
export const useSystemStatus = () => {
  return useQuery({
    queryKey: ['systemStatus'],
    queryFn: () => dashboardService.getSystemStatus(),
    staleTime: 30 * 1000, // 30초
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
  })
}