import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  Button,
  useDisclosure,
  HStack,
  Badge,
  Flex,
  Spacer,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AddIcon } from '@chakra-ui/icons'
import AnnouncementFormModal from '../components/AnnouncementFormModal'
import { useState } from 'react'
import { announcementService, type CreateAnnouncementData, type UpdateAnnouncementData } from '../services/announcementService'
import type { Announcement } from '@/types/database.types'
import { useAuth } from '@/features/auth/contexts/AuthContext'

const AnnouncementsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // 공지사항 목록 조회 (useQuery 사용)
  const {
    data: announcementsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(),
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
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      deleteMutation.mutate(announcementId)
    }
  }

  return (
    <Container maxW='container.xl' py='8'>
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
                {announcementsData?.length === 0 ? (
                  <Box textAlign='center' py='12'>
                    <Text color='gray.500'>등록된 공지사항이 없습니다.</Text>
                  </Box>
                ) : (
                  announcementsData?.map(announcement => (
                    <Card key={announcement.id} variant='outline'>
                      <CardBody>
                        <VStack align='stretch' spacing='3'>
                          <HStack>
                            <Heading size='md'>{announcement.title}</Heading>
                            {announcement.is_important && (
                              <Badge colorScheme='red' variant='solid'>
                                중요
                              </Badge>
                            )}
                            <Badge colorScheme={announcement.is_active ? 'green' : 'gray'} variant='subtle'>
                              {announcement.is_active ? '게시중' : '비활성'}
                            </Badge>
                            <Spacer />
                            <VStack align='flex-end' spacing='1'>
                              <Text fontSize='sm' color='gray.500'>
                                작성일시:{' '}
                                {new Date(announcement.created_at)
                                  .toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  })
                                  .replace(/\. /g, '-')
                                  .replace('.', '')
                                  .replace(', ', ' ')}
                              </Text>
                              {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
                                <Text fontSize='sm' color='gray.500'>
                                  수정일시:{' '}
                                  {new Date(announcement.updated_at)
                                    .toLocaleString('ko-KR', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false,
                                    })
                                    .replace(/\. /g, '-')
                                    .replace('.', '')
                                    .replace(', ', ' ')}
                                </Text>
                              )}
                            </VStack>
                          </HStack>

                          <Text color='gray.700'>{announcement.content}</Text>

                          {user && (
                            <Flex justify='flex-end'>
                              <HStack spacing='2'>
                                <Button size='sm' variant='outline' onClick={() => handleEdit(announcement)}>
                                  수정
                                </Button>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  colorScheme='red'
                                  onClick={() => handleDelete(announcement.id)}
                                >
                                  삭제
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => toggleStatusMutation.mutate(announcement.id)}
                                >
                                  {announcement.is_active ? '비활성화' : '활성화'}
                                </Button>
                              </HStack>
                            </Flex>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))
                )}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      <AnnouncementFormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        editData={editingAnnouncement}
      />
    </Container>
  )
}

export default AnnouncementsPage
