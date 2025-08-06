import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { 
  facilityService, 
  FacilityFilters, 
  CreateFacilityDto, 
  UpdateFacilityDto 
} from '../services/facilityService'
import { FacilityNonBenefit, FacilityProgram } from '@/types/database.types'

export const useFacilities = (filters: FacilityFilters = {}) => {
  return useQuery({
    queryKey: ['facilities', filters],
    queryFn: () => facilityService.getFacilities(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export const useFacility = (adminCode: string | null) => {
  return useQuery({
    queryKey: ['facility', adminCode],
    queryFn: () => adminCode ? facilityService.getFacilityByAdminCode(adminCode) : null,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
      queryClient.invalidateQueries({ queryKey: ['facility', variables.adminCode] })
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

export const useFacilityStats = () => {
  return useQuery({
    queryKey: ['facilityStats'],
    queryFn: () => facilityService.getFacilityStats(),
    staleTime: 10 * 60 * 1000, // 10분
  })
}

export const useFacilityTypes = () => {
  return useQuery({
    queryKey: ['facilityTypes'],
    queryFn: () => facilityService.getFacilityTypes(),
    staleTime: 30 * 60 * 1000, // 30분
  })
}

export const useFacilityTypesWithCount = () => {
  return useQuery({
    queryKey: ['facilityTypesWithCount'],
    queryFn: () => facilityService.getFacilityTypesWithCount(),
    staleTime: 10 * 60 * 1000, // 10분
  })
}

export const useSidoList = () => {
  return useQuery({
    queryKey: ['sidoList'],
    queryFn: () => facilityService.getSidoList(),
    staleTime: 30 * 60 * 1000, // 30분
  })
}

export const useSigunguList = (sidoCode: string | undefined) => {
  return useQuery({
    queryKey: ['sigunguList', sidoCode],
    queryFn: () => sidoCode ? facilityService.getSigunguList(sidoCode) : [],
    enabled: !!sidoCode,
    staleTime: 30 * 60 * 1000, // 30분
  })
}

// 비급여 항목 hooks
export const useAddNonBenefit = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ adminCode, nonbenefit }: { 
      adminCode: string; 
      nonbenefit: Omit<FacilityNonBenefit, 'id' | 'admin_code' | 'created_at' | 'updated_at'> 
    }) => facilityService.addNonBenefit(adminCode, nonbenefit),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility', variables.adminCode] })
      toast({
        title: '비급여 항목 추가 완료',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '비급여 항목 추가 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useUpdateNonBenefit = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, nonbenefit, adminCode: _adminCode }: { 
      id: number; 
      nonbenefit: Partial<Omit<FacilityNonBenefit, 'id' | 'admin_code' | 'created_at' | 'updated_at'>>;
      adminCode: string;
    }) => facilityService.updateNonBenefit(id, nonbenefit),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility', variables.adminCode] })
      toast({
        title: '비급여 항목 수정 완료',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '비급여 항목 수정 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useDeleteNonBenefit = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, adminCode: _adminCode }: { id: number; adminCode: string }) => 
      facilityService.deleteNonBenefit(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility', variables.adminCode] })
      toast({
        title: '비급여 항목 삭제 완료',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '비급여 항목 삭제 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

// 프로그램 hooks
export const useAddProgram = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ adminCode, program }: { 
      adminCode: string; 
      program: Omit<FacilityProgram, 'id' | 'admin_code' | 'created_at' | 'updated_at'> 
    }) => facilityService.addProgram(adminCode, program),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility', variables.adminCode] })
      toast({
        title: '프로그램 추가 완료',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '프로그램 추가 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useUpdateProgram = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, program, adminCode: _adminCode }: { 
      id: number; 
      program: Partial<Omit<FacilityProgram, 'id' | 'admin_code' | 'created_at' | 'updated_at'>>;
      adminCode: string;
    }) => facilityService.updateProgram(id, program),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility', variables.adminCode] })
      toast({
        title: '프로그램 수정 완료',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '프로그램 수정 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useDeleteProgram = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, adminCode: _adminCode }: { id: number; adminCode: string }) => 
      facilityService.deleteProgram(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility', variables.adminCode] })
      toast({
        title: '프로그램 삭제 완료',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '프로그램 삭제 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}