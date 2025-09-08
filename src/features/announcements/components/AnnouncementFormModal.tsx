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
import type {
  CreateAnnouncementData,
  AnnouncementFormData,
  AnnouncementCategory,
} from '../types'
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_CONSTANTS } from '../types'

interface AnnouncementFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAnnouncementData) => void
  editData?: Announcement | null
}

const AnnouncementFormModal = ({ isOpen, onClose, onSubmit, editData }: AnnouncementFormModalProps) => {
  const [formData, setFormData] = useState<AnnouncementFormData>({
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
        category: editData.category as AnnouncementCategory,
        isImportant: editData.is_important,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: ANNOUNCEMENT_CONSTANTS.DEFAULT_CATEGORY,
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
      category: ANNOUNCEMENT_CONSTANTS.DEFAULT_CATEGORY,
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
                  value={formData.category ?? ANNOUNCEMENT_CONSTANTS.DEFAULT_CATEGORY}
                  onChange={e => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
                >
                  {ANNOUNCEMENT_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
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
