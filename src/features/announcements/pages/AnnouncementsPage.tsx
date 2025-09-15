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
  useToast,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AddIcon } from '@chakra-ui/icons'
import AnnouncementFormModal from '../components/AnnouncementFormModal'
import AnnouncementTable from '../components/AnnouncementTable'
import AnnouncementFiltersComponent from '../components/AnnouncementFilters'
import { useState } from 'react'
import { announcementService } from '../services/announcementService'
import type { Announcement } from '@/types/database.types'
import type { CreateAnnouncementData, UpdateAnnouncementData, AnnouncementFilters } from '../types'
import { useAuth } from "@/features/auth"

const AnnouncementsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<number | null>(null)
  const [filters, setFilters] = useState<AnnouncementFilters>({})
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // 공지사항 목록 조회 (useQuery 사용)
  const {
    data: announcementsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['announcements', filters],
    queryFn: () => announcementService.getAnnouncements(filters),
  })

  // 공통 Mutation 에러 핸들러
  const handleMutationError = (err: unknown) => {
    // RLS 에러(PostgREST에선 403 Forbidden으로 나타날 수 있음) 또는 유사한 권한 오류 처리
    if (err instanceof Error && (err.message.includes('security policy') || err.message.includes('403'))) {
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
      description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  // 공지사항 생성/수정 Mutation
  const upsertMutation = useMutation({
    mutationFn: (data: CreateAnnouncementData | UpdateAnnouncementData) => {
      if (editingAnnouncement) {
        return announcementService.updateAnnouncement(editingAnnouncement.id, data as UpdateAnnouncementData)
      }
      return announcementService.createAnnouncement(data as CreateAnnouncementData)
    },
    onSuccess: () => {
      toast({
        title: `공지사항이 ${editingAnnouncement ? '수정' : '등록'}되었습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      handleClose() // 모달 닫기
    },
    onError: handleMutationError,
  })

  // 공지사항 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: (announcementId: number) => announcementService.deleteAnnouncement(announcementId),
    onSuccess: () => {
      toast({
        title: '공지사항이 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
    onError: handleMutationError,
  })

  // 공지사항 상태 토글 Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (announcementId: number) => announcementService.toggleAnnouncementStatus(announcementId),
    onSuccess: () => {
      toast({
        title: '공지사항 상태가 변경되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
    onError: handleMutationError,
  })

  const handleSubmit = (data: CreateAnnouncementData) => {
    upsertMutation.mutate(data)
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    onOpen()
  }

  const handleCreate = () => {
    setEditingAnnouncement(null)
    onOpen()
  }

  const handleClose = () => {
    setEditingAnnouncement(null)
    onClose()
  }

  const handleDelete = (announcementId: number) => {
    setDeletingAnnouncementId(announcementId)
    onClose() // 편집 모달 닫기
    onDeleteOpen()
  }

  const handleModalDelete = () => {
    if (editingAnnouncement) {
      handleDelete(editingAnnouncement.id)
    }
  }

  const handleToggleStatus = () => {
    if (editingAnnouncement) {
      toggleStatusMutation.mutate(editingAnnouncement.id)
      onClose() // 모달 닫기
    }
  }

  const confirmDelete = () => {
    if (deletingAnnouncementId) {
      deleteMutation.mutate(deletingAnnouncementId)
    }
    onDeleteClose()
    setDeletingAnnouncementId(null)
  }

  const cancelDelete = () => {
    onDeleteClose()
    setDeletingAnnouncementId(null)
  }

  const handleFiltersChange = (newFilters: AnnouncementFilters) => {
    setFilters(newFilters)
  }

  return (
    <Box>
      <VStack align='stretch' spacing='8'>
        <Flex>
          <Box>
            <Heading size='lg' mb='2'>
              공지사항 관리
            </Heading>
            <Text color='gray.600'>사용자들에게 전달할 공지사항을 작성하고 관리할 수 있습니다.</Text>
          </Box>
          <Spacer />
          {user && (
            <Button leftIcon={<AddIcon />} colorScheme='blue' onClick={handleCreate}>
              공지사항 작성
            </Button>
          )}
        </Flex>

        {/* 필터 */}
        <Card>
          <CardBody>
            <AnnouncementFiltersComponent onFiltersChange={handleFiltersChange} initialFilters={filters} />
          </CardBody>
        </Card>

        {/* 공지사항 목록 */}
        <Card>
          <CardBody>
            {isLoading ? (
              <Box textAlign='center' py='12'>
                <Spinner size='lg' />
                <Text mt='4' color='gray.500'>
                  공지사항을 불러오는 중...
                </Text>
              </Box>
            ) : error ? (
              <Alert status='error'>
                <AlertIcon />
                {error instanceof Error ? error.message : '공지사항을 불러오는데 실패했습니다.'}
              </Alert>
            ) : (
              <VStack align='stretch' spacing='4'>
                {announcementsData && announcementsData.length > 0 && (
                  <Box>
                    <Text fontSize='sm' color='gray.600' mb='4'>
                      총 {announcementsData.length}개의 공지사항
                    </Text>
                  </Box>
                )}
                <AnnouncementTable announcements={announcementsData || []} onEdit={handleEdit} />
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      <AnnouncementFormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onDelete={editingAnnouncement ? handleModalDelete : undefined}
        onToggleStatus={editingAnnouncement ? handleToggleStatus : undefined}
        editData={editingAnnouncement}
      />

      <Modal isOpen={isDeleteOpen} onClose={cancelDelete} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>공지사항 삭제</ModalHeader>
          <ModalBody>
            <Text>정말 삭제하시겠습니까?</Text>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant='outline' onClick={cancelDelete}>
                취소
              </Button>
              <Button colorScheme='red' onClick={confirmDelete}>
                삭제
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default AnnouncementsPage
