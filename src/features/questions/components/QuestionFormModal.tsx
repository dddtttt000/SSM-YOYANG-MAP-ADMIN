import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Select,
  HStack,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FAQ_CATEGORIES } from '../constants'
import type { Question, CreateQuestionData, FAQCategory } from '../types'

interface QuestionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateQuestionData) => void
  onDelete?: () => void
  editData?: Question | null
  isSubmitting?: boolean
}

const QuestionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editData,
  isSubmitting = false,
}: QuestionFormModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '회원' as FAQCategory,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 수정 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        content: editData.content,
        category: editData.category,
      })
    } else {
      // 새로 생성할 때는 폼 초기화
      setFormData({
        title: '',
        content: '',
        category: '회원',
      })
    }
    setErrors({})
  }, [editData, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '질문을 입력해주세요.'
    } else if (formData.title.length > 200) {
      newErrors.title = '질문은 200자 이내로 입력해주세요.'
    }

    if (!formData.content.trim()) {
      newErrors.content = '답변을 입력해주세요.'
    } else if (formData.content.length > 2000) {
      newErrors.content = '답변은 2000자 이내로 입력해주세요.'
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    onSubmit({
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
    })
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }))
    // 입력 시 해당 필드 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editData ? 'FAQ 수정' : 'FAQ 등록'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="4" align="stretch">
            <FormControl isInvalid={!!errors.category}>
              <FormLabel>카테고리</FormLabel>
              <Select
                value={formData.category}
                onChange={handleInputChange('category')}
                placeholder="카테고리를 선택하세요"
              >
                {FAQ_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.category}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.title}>
              <FormLabel>질문</FormLabel>
              <Input
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="자주 묻는 질문을 입력하세요 (최대 200자)"
                maxLength={200}
              />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.content}>
              <FormLabel>답변</FormLabel>
              <Textarea
                value={formData.content}
                onChange={handleInputChange('content')}
                placeholder="질문에 대한 답변을 입력하세요 (최대 2000자)"
                rows={8}
                maxLength={2000}
                resize="vertical"
              />
              <FormErrorMessage>{errors.content}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent={editData ? 'space-between' : 'flex-end'}>
          {editData && onDelete && (
            <Button
              colorScheme="red"
              variant="outline"
              onClick={onDelete}
            >
              삭제
            </Button>
          )}
          <HStack spacing="3">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText={editData ? '수정 중...' : '등록 중...'}
            >
              {editData ? '수정' : '등록'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default QuestionFormModal