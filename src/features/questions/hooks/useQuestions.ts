import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { questionService } from '../services/questionService'
import type { CreateQuestionData, UpdateQuestionData, QuestionFilters } from '../types'

// Query Keys
export const QUESTIONS_QUERY_KEYS = {
  all: ['questions'] as const,
  list: (filters?: QuestionFilters) => [...QUESTIONS_QUERY_KEYS.all, 'list', filters] as const,
  detail: (id: number) => [...QUESTIONS_QUERY_KEYS.all, 'detail', id] as const,
  counts: () => [...QUESTIONS_QUERY_KEYS.all, 'counts'] as const,
}

// FAQ 목록 조회 훅
export const useQuestions = (filters?: QuestionFilters) => {
  return useQuery({
    queryKey: QUESTIONS_QUERY_KEYS.list(filters),
    queryFn: () => questionService.getQuestions(filters),
  })
}

// FAQ 상세 조회 훅
export const useQuestion = (id: number) => {
  return useQuery({
    queryKey: QUESTIONS_QUERY_KEYS.detail(id),
    queryFn: () => questionService.getQuestion(id),
    enabled: !!id,
  })
}

// FAQ 카테고리별 개수 조회 훅
export const useQuestionCounts = () => {
  return useQuery({
    queryKey: QUESTIONS_QUERY_KEYS.counts(),
    queryFn: () => questionService.getQuestionCountsByCategory(),
  })
}

// FAQ Mutations 훅
export const useQuestionMutations = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  const handleMutationError = (error: unknown) => {
    if (error instanceof Error && (error.message.includes('security policy') || error.message.includes('403'))) {
      toast({
        title: '권한 오류',
        description: '권한이 없거나 세션이 만료되었습니다. 다시 로그인 후 시도해주세요.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    toast({
      title: '오류가 발생했습니다.',
      description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateQuestionData) => questionService.createQuestion(data),
    onSuccess: () => {
      toast({
        title: 'FAQ가 등록되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEYS.all })
    },
    onError: handleMutationError,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuestionData }) =>
      questionService.updateQuestion(id, data),
    onSuccess: () => {
      toast({
        title: 'FAQ가 수정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEYS.all })
    },
    onError: handleMutationError,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => questionService.deleteQuestion(id),
    onSuccess: () => {
      toast({
        title: 'FAQ가 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEYS.all })
    },
    onError: handleMutationError,
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  }
}