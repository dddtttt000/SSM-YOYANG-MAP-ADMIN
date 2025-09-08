import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Box,
  VStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiEyeOff } from 'react-icons/fi'
import type { Announcement } from '@/types/database.types'

interface AnnouncementTableProps {
  announcements: Announcement[]
  onEdit: (announcement: Announcement) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
}

const AnnouncementTable = ({ 
  announcements, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: AnnouncementTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString)
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
      .replace(', ', ' ')
  }

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      '일반': 'gray',
      '중요': 'red',
      '긴급': 'orange',
      '시스템': 'blue',
      '공지': 'green',
    }
    return colorMap[category] || 'gray'
  }

  if (announcements.length === 0) {
    return (
      <Box textAlign="center" py="12">
        <Text color="gray.500">등록된 공지사항이 없습니다.</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th width="120px">카테고리</Th>
            <Th>제목</Th>
            <Th>내용</Th>
            <Th width="100px">상태</Th>
            <Th width="150px">등록일시</Th>
            <Th width="150px">수정일시</Th>
            <Th width="100px">작업</Th>
          </Tr>
        </Thead>
        <Tbody>
          {announcements.map(announcement => (
            <Tr key={announcement.id}>
              <Td>
                <VStack spacing="1">
                  <Badge colorScheme={getCategoryColor(announcement.category)} variant="subtle">
                    {announcement.category}
                  </Badge>
                  {announcement.is_important && (
                    <Badge colorScheme="red" variant="solid" fontSize="xs">
                      중요
                    </Badge>
                  )}
                </VStack>
              </Td>
              <Td>
                <Text fontWeight="medium" fontSize="sm">
                  {announcement.title}
                </Text>
              </Td>
              <Td>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  noOfLines={2}
                  maxWidth="300px"
                  whiteSpace="pre-line"
                >
                  {announcement.content}
                </Text>
              </Td>
              <Td>
                <Badge 
                  colorScheme={announcement.is_active ? 'green' : 'gray'} 
                  variant="subtle"
                >
                  {announcement.is_active ? '게시중' : '비활성'}
                </Badge>
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(announcement.created_at)}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.500">
                  {announcement.updated_at && announcement.updated_at !== announcement.created_at
                    ? formatDate(announcement.updated_at)
                    : '-'
                  }
                </Text>
              </Td>
              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                    aria-label="작업 메뉴"
                  />
                  <MenuList>
                    <MenuItem icon={<FiEdit2 />} onClick={() => onEdit(announcement)}>
                      수정
                    </MenuItem>
                    <MenuItem 
                      icon={announcement.is_active ? <FiEyeOff /> : <FiEye />} 
                      onClick={() => onToggleStatus(announcement.id)}
                    >
                      {announcement.is_active ? '비활성화' : '활성화'}
                    </MenuItem>
                    <MenuItem 
                      icon={<FiTrash2 />} 
                      onClick={() => onDelete(announcement.id)}
                      color="red.500"
                    >
                      삭제
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default AnnouncementTable