import { Table, Thead, Tbody, Tr, Th, Td, Text, Badge, Box, VStack } from '@chakra-ui/react'
import { formatDate } from '@/utils/date'
import type { Question } from '../types'

interface QuestionTableProps {
  questions: Question[]
  onEdit: (question: Question) => void
}

const QuestionTable = ({ questions, onEdit }: QuestionTableProps) => {

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      회원: 'blue',
      서비스: 'green',
      AI추천: 'purple',
      시설정보: 'orange',
      기타: 'gray',
    }
    return colorMap[category] || 'gray'
  }

  if (questions.length === 0) {
    return (
      <Box textAlign='center' py='12'>
        <Text color='gray.500'>등록된 FAQ가 없습니다.</Text>
      </Box>
    )
  }

  return (
    <Box overflowX='auto'>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th width='120px'>카테고리</Th>
            <Th>질문</Th>
            <Th width='150px'>등록일시</Th>
            <Th width='150px'>수정일시</Th>
          </Tr>
        </Thead>
        <Tbody>
          {questions.map(question => (
            <Tr key={question.id} cursor='pointer' _hover={{ bg: 'gray.50' }} onClick={() => onEdit(question)}>
              <Td>
                <Badge colorScheme={getCategoryColor(question.category)} variant='subtle'>
                  {question.category}
                </Badge>
              </Td>
              <Td>
                <VStack align='start' spacing='1'>
                  <Text fontWeight='medium' fontSize='sm'>
                    {question.title}
                  </Text>
                </VStack>
              </Td>
              <Td>
                <Text fontSize='sm' color='gray.500'>
                  {formatDate(question.created_at)}
                </Text>
              </Td>
              <Td>
                <Text fontSize='sm' color='gray.500'>
                  {question.updated_at && question.updated_at !== question.created_at
                    ? formatDate(question.updated_at)
                    : '-'}
                </Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default QuestionTable
