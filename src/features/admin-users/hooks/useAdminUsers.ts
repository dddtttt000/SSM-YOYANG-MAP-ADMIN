import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { adminUserService, AdminUserFilters, CreateAdminUserDto, UpdateAdminUserDto } from '../services/adminUserService'

export const useAdminUsers = (filters?: AdminUserFilters) => {
  return useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: () => adminUserService.getAdminUsers(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => adminUserService.getAdminUserById(id),
    enabled: !!id,
  })
}

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (dto: CreateAdminUserDto) => adminUserService.createAdminUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast({
        title: '관리자 추가 완료',
        description: '새로운 관리자가 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '관리자 추가 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAdminUserDto }) => 
      adminUserService.updateAdminUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminUser'] })
      toast({
        title: '관리자 정보 수정 완료',
        description: '관리자 정보가 수정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '관리자 정보 수정 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (id: string) => adminUserService.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast({
        title: '관리자 비활성화 완료',
        description: '관리자가 비활성화되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '관리자 비활성화 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

// permissions 기능은 현재 사용하지 않음
// 향후 권한 시스템 구현 시 활성화 가능
// export const useUpdateAdminUserPermissions = () => {
//   const queryClient = useQueryClient()
//   const toast = useToast()

//   return useMutation({
//     mutationFn: ({ id, permissions }: { id: string; permissions: Permission[] }) => 
//       adminUserService.updateAdminUserPermissions(id, permissions),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
//       queryClient.invalidateQueries({ queryKey: ['adminUser'] })
//       toast({
//         title: '권한 설정 완료',
//         description: '관리자 권한이 업데이트되었습니다.',
//         status: 'success',
//         duration: 3000,
//         isClosable: true,
//       })
//     },
//     onError: (error: Error) => {
//       toast({
//         title: '권한 설정 실패',
//         description: error.message,
//         status: 'error',
//         duration: 5000,
//         isClosable: true,
//       })
//     },
//   })
// }