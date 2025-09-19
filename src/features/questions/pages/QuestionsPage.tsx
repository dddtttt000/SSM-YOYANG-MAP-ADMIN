import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  Button,
  useDisclosure,
  HStack,
  Flex,
  Spacer,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { useAuth } from "@/features/auth"
import { useQuestions, useQuestionMutations } from '../hooks/useQuestions'
import QuestionFormModal from '../components/QuestionFormModal'
import QuestionTable from '../components/QuestionTable'
import QuestionFilters from '../components/QuestionFilters'
import Pagination from '@/components/common/Pagination'
import type { Question, CreateQuestionData, QuestionFilters as QuestionFiltersType } from '../types'

const QuestionsPage = () => {
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null)
  const [filters, setFilters] = useState<QuestionFiltersType>({
    page: 1,
    pageSize: 20,
  })

  // FAQ 목록 조회
  const { data: questionsData, isLoading, error } = useQuestions(filters)

  // FAQ Mutations
  const { createMutation, updateMutation, deleteMutation } = useQuestionMutations()

  const handleSubmit = (data: CreateQuestionData) => {
    if (editingQuestion) {
      updateMutation.mutate(
        { id: editingQuestion.id, data },
        {
          onSuccess: () => {
            handleClose()
          },
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          handleClose()
        },
      })
    }
  }

  const handleCreate = () => {
    setEditingQuestion(null)
    onOpen()
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    onOpen()
  }

  const handleClose = () => {
    setEditingQuestion(null)
    onClose()
  }

  const handleDelete = (questionId: number) => {
    setDeletingQuestionId(questionId)
    onClose()
    onDeleteOpen()
  }

  const confirmDelete = () => {
    if (deletingQuestionId) {
      deleteMutation.mutate(deletingQuestionId)
    }
    onDeleteClose()
    setDeletingQuestionId(null)
  }

  const cancelDelete = () => {
    onDeleteClose()
    setDeletingQuestionId(null)
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, page: 1, pageSize })
  }

  const handleFiltersChange = (newFilters: QuestionFiltersType) => {
    setFilters({ ...newFilters, page: 1, pageSize: filters.pageSize })
  }

  return (
    <Box>
      <VStack align='stretch' spacing='8'>
        {/* 헤더 */}
        <Flex>
          <Box>
            <Heading size='lg' mb='2'>
              자주 묻는 질문 관리
            </Heading>
            <Text color='gray.600'>사용자들이 자주 묻는 질문과 답변을 관리할 수 있습니다.</Text>
          </Box>
          <Spacer />
          {user && (
            <Button leftIcon={<AddIcon />} colorScheme='blue' onClick={handleCreate}>
              FAQ 등록
            </Button>
          )}
        </Flex>

        {/* 필터 */}
        <Card>
          <CardBody>
            <QuestionFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
          </CardBody>
        </Card>

        {/* FAQ 목록 */}
        <Card>
          <CardBody>
            {isLoading ? (
              <Box textAlign='center' py='12'>
                <Spinner size='lg' />
                <Text mt='4' color='gray.500'>
                  FAQ를 불러오는 중...
                </Text>
              </Box>
            ) : error ? (
              <Alert status='error'>
                <AlertIcon />
                {error instanceof Error ? error.message : 'FAQ를 불러오는데 실패했습니다.'}
              </Alert>
            ) : (
              <VStack align='stretch' spacing='4'>
                {questionsData && questionsData.data.length > 0 && (
                  <Box>
                    <Text fontSize='sm' color='gray.600' mb='4'>
                      총 {questionsData.pagination.totalCount}개의 FAQ
                    </Text>
                  </Box>
                )}
                <QuestionTable questions={questionsData?.data || []} onEdit={handleEdit} />

                {questionsData && (
                  <Pagination
                    pagination={{
                      currentPage: questionsData.pagination.currentPage,
                      pageSize: questionsData.pagination.pageSize,
                      totalCount: questionsData.pagination.totalCount,
                      totalPages: questionsData.pagination.totalPages,
                      hasNext: questionsData.pagination.hasNext,
                      hasPrevious: questionsData.pagination.hasPrevious,
                    }}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* FAQ 등록/수정 모달 */}
      <QuestionFormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onDelete={editingQuestion ? () => handleDelete(editingQuestion.id) : undefined}
        editData={editingQuestion}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* 삭제 확인 모달 */}
      <Modal isOpen={isDeleteOpen} onClose={cancelDelete} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>FAQ 삭제</ModalHeader>
          <ModalBody>
            <Text>정말 삭제하시겠습니까?</Text>
            <Text fontSize='sm' color='gray.600' mt='2'>
              삭제된 FAQ는 복구할 수 없습니다.
            </Text>
          </ModalBody>
          <ModalFooter>
            <HStack spacing='3'>
              <Button variant='outline' onClick={cancelDelete}>
                취소
              </Button>
              <Button
                colorScheme='red'
                onClick={confirmDelete}
                isLoading={deleteMutation.isPending}
                loadingText='삭제 중...'
              >
                삭제
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default QuestionsPage
