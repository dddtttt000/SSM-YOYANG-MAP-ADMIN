import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { memberService, MemberFilters } from '../services/memberService'

export const useMembers = (filters: MemberFilters = {}) => {
  return useQuery({
    queryKey: ['members', filters],
    queryFn: () => memberService.getMembers(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export const useMember = (id: number) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => memberService.getMemberById(id),
    enabled: !!id,
  })
}

export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      memberService.updateMemberStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member'] })
      toast({
        title: '회원 상태 변경 완료',
        description: '회원 상태가 변경되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '회원 상태 변경 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

export const useMemberStats = () => {
  return useQuery({
    queryKey: ['memberStats'],
    queryFn: () => memberService.getMemberStats(),
    staleTime: 10 * 60 * 1000, // 10분
  })
}

export const useExportMembers = () => {
  const toast = useToast()

  return useMutation({
    mutationFn: (filters: MemberFilters) => memberService.exportMembers(filters),
    onSuccess: (data) => {
      // CSV 형식으로 변환
      const headers = ['ID', '이메일', '이름', '전화번호', '상태', '가입일']
      const csvContent = [
        headers.join(','),
        ...data.map(member => [
          member.id,
          member.email,
          member.name,
          member.phone || '',
          member.status,
          new Date(member.created_at).toLocaleDateString('ko-KR'),
        ].join(','))
      ].join('\n')

      // 다운로드
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `members_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: '내보내기 완료',
        description: `${data.length}명의 회원 정보를 내보냈습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: Error) => {
      toast({
        title: '내보내기 실패',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}