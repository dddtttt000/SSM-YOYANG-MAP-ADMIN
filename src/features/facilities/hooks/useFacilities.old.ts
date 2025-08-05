import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { facilityService, FacilityFilters, CreateFacilityDto, UpdateFacilityDto } from '../services/facilityService'

export const useFacilities = (filters: FacilityFilters = {}) => {
  return useQuery({
    queryKey: ['facilities', filters],
    queryFn: () => facilityService.getFacilities(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export const useFacility = (adminCode: string) => {
  return useQuery({
    queryKey: ['facility', adminCode],
    queryFn: () => facilityService.getFacilityByAdminCode(adminCode),
    enabled: !!adminCode,
  })
}

export const useCreateFacility = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (dto: CreateFacilityDto) => facilityService.createFacility(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
      queryClient.invalidateQueries({ queryKey: ['facilityStats'] })
      toast({
        title: '시설 등록 완료',
        description: '새로운 시설이 등록되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '시설 등록 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useUpdateFacility = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ adminCode, dto }: { adminCode: string; dto: UpdateFacilityDto }) => 
      facilityService.updateFacility(adminCode, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
      queryClient.invalidateQueries({ queryKey: ['facility'] })
      queryClient.invalidateQueries({ queryKey: ['facilityStats'] })
      toast({
        title: '시설 정보 수정 완료',
        description: '시설 정보가 수정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '시설 정보 수정 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useDeleteFacility = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (adminCode: string) => facilityService.deleteFacility(adminCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
      queryClient.invalidateQueries({ queryKey: ['facilityStats'] })
      toast({
        title: '시설 삭제 완료',
        description: '시설이 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '시설 삭제 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useFacilityTypes = () => {
  return useQuery({
    queryKey: ['facilityTypes'],
    queryFn: () => facilityService.getFacilityTypes(),
    staleTime: 10 * 60 * 1000, // 10분
  })
}

export const useFacilityStats = () => {
  return useQuery({
    queryKey: ['facilityStats'],
    queryFn: () => facilityService.getFacilityStats(),
    staleTime: 10 * 60 * 1000, // 10분
  })
}