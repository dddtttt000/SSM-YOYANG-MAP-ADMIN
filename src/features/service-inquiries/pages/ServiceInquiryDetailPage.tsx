import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  IconButton,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowBackIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { inquiryService } from '../services/inquiryService'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { formatDate } from '@/utils/date'

interface ResponseFormData {
  title: string
  content: string
}

const ServiceInquiryDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const [editingResponseId, setEditingResponseId] = useState<number | null>(null)
  const [deletingResponseId, setDeletingResponseId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ResponseFormData>()

  // 서비스 문의 상세 조회
  const {
    data: inquiry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['service-inquiry', id],
    queryFn: () => inquiryService.getInquiryDetail(Number(id)),
    enabled: !!id,
  })

  // 공통 Mutation 에러 핸들러
  const handleMutationError = (err: unknown) => {
    toast({
      title: '오류가 발생했습니다.',
      description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  // 답변 생성/수정 Mutation
  const responseUpsertMutation = useMutation({
    mutationFn: (data: ResponseFormData) => {
      if (editingResponseId) {
        return inquiryService.updateResponse(editingResponseId, data)
      }
      return inquiryService.createResponse(Number(id), data, user!.id)
    },
    onSuccess: () => {
      toast({
        title: `답변이 ${editingResponseId ? '수정' : '등록'}되었습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: ['service-inquiry', id] })
      queryClient.invalidateQueries({ queryKey: ['service-inquiries'] })
      queryClient.invalidateQueries({ queryKey: ['service-inquiries-stats'] })
      handleCloseModal()
    },
    onError: handleMutationError,
  })

  // 답변 삭제 Mutation
  const responseDeleteMutation = useMutation({
    mutationFn: (responseId: number) => inquiryService.deleteResponse(responseId, Number(id)),
    onSuccess: () => {
      toast({
        title: '답변이 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      queryClient.invalidateQueries({ queryKey: ['service-inquiry', id] })
      queryClient.invalidateQueries({ queryKey: ['service-inquiries'] })
      queryClient.invalidateQueries({ queryKey: ['service-inquiries-stats'] })
    },
    onError: handleMutationError,
  })

  const handleBack = () => {
    navigate('/service-inquiries')
  }

  const handleCreateResponse = () => {
    setEditingResponseId(null)
    reset()
    onOpen()
  }

  const handleEditResponse = (response: any) => {
    setEditingResponseId(response.id)
    setValue('title', response.title)
    setValue('content', response.content)
    onOpen()
  }

  const handleDeleteResponse = (responseId: number) => {
    setDeletingResponseId(responseId)
    onDeleteOpen()
  }

  const confirmDeleteResponse = () => {
    if (deletingResponseId) {
      responseDeleteMutation.mutate(deletingResponseId)
    }
    onDeleteClose()
    setDeletingResponseId(null)
  }

  const handleCloseModal = () => {
    reset()
    setEditingResponseId(null)
    onClose()
  }

  const onSubmit = (data: ResponseFormData) => {
    responseUpsertMutation.mutate(data)
  }


  const getStatusBadge = (status: string) => {
    return status === 'answered' ? (
      <Badge colorScheme='green' variant='solid'>
        답변 완료
      </Badge>
    ) : (
      <Badge colorScheme='yellow' variant='solid'>
        답변 대기
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Container maxW='container.xl' py='8'>
        <Box textAlign='center' py='12'>
          <Spinner size='lg' />
          <Text mt='4' color='gray.500'>
            문의 내용을 불러오는 중...
          </Text>
        </Box>
      </Container>
    )
  }

  if (error || !inquiry) {
    return (
      <Container maxW='container.xl' py='8'>
        <Alert status='error'>
          <AlertIcon />
          {error instanceof Error ? error.message : '문의를 불러오는데 실패했습니다.'}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW='container.xl' py='8'>
      <VStack align='stretch' spacing='8'>
        {/* 헤더 */}
        <HStack>
          <Button leftIcon={<ArrowBackIcon />} variant='ghost' onClick={handleBack}>
            목록으로
          </Button>
        </HStack>

        {/* 문의 정보 */}
        <Card>
          <CardBody>
            <VStack align='stretch' spacing='4'>
              <HStack justify='space-between'>
                <Heading size='lg'>{inquiry.title}</Heading>
                {getStatusBadge(inquiry.status)}
              </HStack>

              <HStack spacing='8'>
                <VStack align='start' spacing='1'>
                  <Text fontSize='sm' color='gray.500'>
                    이메일
                  </Text>
                  <Text fontWeight='semibold'>{inquiry.email}</Text>
                </VStack>
                <VStack align='start' spacing='1'>
                  <Text fontSize='sm' color='gray.500'>
                    휴대폰
                  </Text>
                  <Text fontWeight='semibold'>{inquiry.phone}</Text>
                </VStack>
                <VStack align='start' spacing='1'>
                  <Text fontSize='sm' color='gray.500'>
                    문의일시
                  </Text>
                  <Text fontWeight='semibold'>{formatDate(inquiry.created_at)}</Text>
                </VStack>
              </HStack>

              <Divider />

              <Box>
                <Text fontSize='sm' color='gray.500' mb='2'>
                  문의 내용
                </Text>
                <Text whiteSpace='pre-line' lineHeight='1.7'>
                  {inquiry.content}
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* 답변 목록 */}
        <Box>
          <HStack justify='space-between' mb='4'>
            <Heading size='md'>답변 목록 ({inquiry.inquiry_responses?.length || 0}개)</Heading>
            {user && (
              <Button colorScheme='blue' onClick={handleCreateResponse}>
                답변 작성
              </Button>
            )}
          </HStack>

          {inquiry.inquiry_responses?.length === 0 ? (
            <Card>
              <CardBody>
                <Box textAlign='center' py='8'>
                  <Text color='gray.500'>등록된 답변이 없습니다.</Text>
                </Box>
              </CardBody>
            </Card>
          ) : (
            <VStack align='stretch' spacing='4'>
              {inquiry.inquiry_responses?.map(response => (
                <Card key={response.id} variant='outline'>
                  <CardBody>
                    <VStack align='stretch' spacing='3'>
                      <HStack justify='space-between'>
                        <HStack>
                          <Heading size='sm'>{response.title}</Heading>
                          <Text fontSize='sm' color='gray.500'>
                            by {response.admin_user.name}
                          </Text>
                        </HStack>
                        {user && (
                          <HStack>
                            <IconButton
                              aria-label='수정'
                              icon={<EditIcon />}
                              size='sm'
                              variant='ghost'
                              onClick={() => handleEditResponse(response)}
                            />
                            <IconButton
                              aria-label='삭제'
                              icon={<DeleteIcon />}
                              size='sm'
                              variant='ghost'
                              colorScheme='red'
                              onClick={() => handleDeleteResponse(response.id)}
                            />
                          </HStack>
                        )}
                      </HStack>

                      <Text whiteSpace='pre-line' color='gray.700' lineHeight='1.7'>
                        {response.content}
                      </Text>

                      <Text fontSize='sm' color='gray.500'>
                        {formatDate(response.created_at)}
                        {response.updated_at && response.updated_at !== response.created_at && (
                          <> (수정됨: {formatDate(response.updated_at)})</>
                        )}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>

      {/* 답변 작성/수정 모달 */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>{editingResponseId ? '답변 수정' : '답변 작성'}</ModalHeader>
            <ModalBody>
              <VStack spacing='4'>
                <FormControl isInvalid={!!errors.title}>
                  <FormLabel>제목</FormLabel>
                  <Input
                    {...register('title', {
                      required: '제목을 입력해주세요.',
                      minLength: { value: 2, message: '제목은 2글자 이상이어야 합니다.' },
                    })}
                    placeholder='답변 제목을 입력하세요'
                  />
                  <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.content}>
                  <FormLabel>내용</FormLabel>
                  <Textarea
                    {...register('content', {
                      required: '내용을 입력해주세요.',
                    })}
                    placeholder='답변 내용을 입력하세요'
                    rows={8}
                  />
                  <FormErrorMessage>{errors.content?.message}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing='3'>
                <Button variant='outline' onClick={handleCloseModal}>
                  취소
                </Button>
                <Button type='submit' colorScheme='blue' isLoading={isSubmitting}>
                  {editingResponseId ? '수정' : '등록'}
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* 답변 삭제 확인 모달 */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>답변 삭제</ModalHeader>
          <ModalBody>
            <Text>정말 삭제하시겠습니까?</Text>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant='outline' onClick={onDeleteClose}>
                취소
              </Button>
              <Button colorScheme='red' onClick={confirmDeleteResponse} isLoading={responseDeleteMutation.isPending}>
                삭제
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default ServiceInquiryDetailPage
