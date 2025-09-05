import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  HStack,
  Text,
  Select,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import type { Announcement } from '@/types/database.types'
import type { CreateAnnouncementData } from '../services/announcementService'

interface AnnouncementFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAnnouncementData) => void
  editData?: Announcement | null
}

const AnnouncementFormModal = ({ isOpen, onClose, onSubmit, editData }: AnnouncementFormModalProps) => {
  const [formData, setFormData] = useState<CreateAnnouncementData>({
    title: '',
    content: '',
    category: '일반',
    isImportant: false,
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        content: editData.content,
        category: editData.category,
        isImportant: editData.is_important,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: '일반',
        isImportant: false,
      })
    }
  }, [editData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    // handleClose()는 제거 - Page의 onSuccess에서 처리됨
  }

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      category: '일반',
      isImportant: false,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='lg'>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{editData ? '공지사항 수정' : '공지사항 작성'}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing='4' align='stretch'>
              <FormControl isRequired>
                <FormLabel>제목</FormLabel>
                <Input
                  value={formData.title ?? ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder='공지사항 제목을 입력하세요'
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>카테고리</FormLabel>
                <Select
                  value={formData.category ?? '일반'}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value='일반'>일반</option>
                  <option value='중요'>중요</option>
                  <option value='긴급'>긴급</option>
                  <option value='시스템'>시스템</option>
                  <option value='공지'>공지</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>내용</FormLabel>
                <Textarea
                  value={formData.content ?? ''}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder='공지사항 내용을 입력하세요'
                  rows={6}
                  resize='vertical'
                />
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={formData.isImportant ?? false}
                    onChange={e => setFormData({ ...formData, isImportant: e.target.checked })}
                  />
                  <Text>중요 공지사항</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr='3' onClick={handleClose}>
              취소
            </Button>
            <Button type='submit' colorScheme='blue' isDisabled={!formData.title.trim() || !formData.content.trim() || !formData.category.trim()}>
              {editData ? '수정' : '등록'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AnnouncementFormModal
