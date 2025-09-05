import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  HStack,
  Button,
  Box,
  VStack,
} from '@chakra-ui/react'
import type { Question } from '../types'

interface QuestionTableProps {
  questions: Question[]
  onEdit: (question: Question) => void
  onDelete: (id: number) => void
}

const QuestionTable = ({ questions, onEdit, onDelete }: QuestionTableProps) => {
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
      '회원': 'blue',
      '서비스': 'green',
      'AI추천': 'purple',
      '시설정보': 'orange',
      '기타': 'gray',
    }
    return colorMap[category] || 'gray'
  }

  if (questions.length === 0) {
    return (
      <Box textAlign="center" py="12">
        <Text color="gray.500">등록된 FAQ가 없습니다.</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th width="120px">카테고리</Th>
            <Th>질문</Th>
            <Th>답변</Th>
            <Th width="150px">등록일시</Th>
            <Th width="150px">수정일시</Th>
            <Th width="120px">관리</Th>
          </Tr>
        </Thead>
        <Tbody>
          {questions.map(question => (
            <Tr key={question.id}>
              <Td>
                <Badge colorScheme={getCategoryColor(question.category)} variant="subtle">
                  {question.category}
                </Badge>
              </Td>
              <Td>
                <VStack align="start" spacing="1">
                  <Text fontWeight="medium" fontSize="sm">
                    {question.title}
                  </Text>
                </VStack>
              </Td>
              <Td>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  noOfLines={2}
                  maxWidth="300px"
                >
                  {question.content}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(question.created_at)}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.500">
                  {question.updated_at && question.updated_at !== question.created_at
                    ? formatDate(question.updated_at)
                    : '-'
                  }
                </Text>
              </Td>
              <Td>
                <HStack spacing="2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(question)}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => onDelete(question.id)}
                  >
                    삭제
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default QuestionTable