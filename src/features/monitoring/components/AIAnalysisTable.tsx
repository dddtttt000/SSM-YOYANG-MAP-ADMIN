import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Skeleton,
  Box,
  HStack,
  IconButton,
  Tooltip,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { FiExternalLink, FiMessageSquare } from 'react-icons/fi'
import { AIFacilityAnalysis } from '../types'
import { useMemberInfo, useFacilityInfo } from '../hooks/useMonitoring'
import { useMemo, useState } from 'react'
import { Timestamp } from 'firebase/firestore'

interface AIAnalysisTableProps {
  data: AIFacilityAnalysis[]
  isLoading: boolean
}

const AIAnalysisTable = ({ data, isLoading }: AIAnalysisTableProps) => {
  // 모달 상태 관리
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIFacilityAnalysis | null>(null)

  // 유니크한 memberId와 facilityId 추출
  const userIds = useMemo(() => [...new Set(data.map(item => item.memberId))], [data])

  const adminCodes = useMemo(() => [...new Set(data.map(item => item.facilityId))], [data])

  // 회원 및 시설 정보 조회
  const { data: memberMap } = useMemberInfo(userIds)
  const { data: facilityMap } = useFacilityInfo(adminCodes)

  // AI 답변 보기 핸들러
  const handleViewAIResponse = (analysis: AIFacilityAnalysis) => {
    setSelectedAnalysis(analysis)
    onOpen()
  }

  // Timestamp를 날짜 문자열로 변환
  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return '-'
    return timestamp.toDate().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 돌봄 유형 라벨
  const getCareTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      day_night: '주야간보호',
      visit: '방문요양',
      facility: '요양시설',
      short_term: '단기보호',
    }
    return labels[type] || type
  }

  // 돌봄 유형 색상
  const getCareTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      day_night: 'blue',
      visit: 'green',
      facility: 'purple',
      short_term: 'orange',
    }
    return colors[type] || 'gray'
  }

  if (isLoading) {
    return (
      <Box>
        <Skeleton height='300px' />
      </Box>
    )
  }

  if (data.length === 0) {
    return (
      <Box textAlign='center' py='8'>
        <Text color='gray.500'>AI 분석 활동이 없습니다.</Text>
      </Box>
    )
  }

  return (
    <>
      <Box overflowX='auto'>
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>분석일시</Th>
              <Th>회원</Th>
              <Th>시설명</Th>
              <Th>요양등급</Th>
              <Th>희망 돌봄</Th>
              <Th>AI 모델</Th>
              <Th width='60px'>동작</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map(analysis => {
              const member = memberMap?.get(analysis.memberId)
              const facility = facilityMap?.get(analysis.facilityId)

              return (
                <Tr key={analysis.id}>
                  <Td>
                    <Text fontSize='sm'>{formatTimestamp(analysis.createdAt)}</Text>
                  </Td>
                  <Td>
                    <Box>
                      <Text fontWeight='medium'>{member?.nickname || member?.name || '-'}</Text>
                      <Text fontSize='xs' color='gray.500'>
                        {member?.email || `ID: ${analysis.memberId}`}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <Box>
                      <Text fontWeight='medium'>{analysis.facilityName || facility?.admin_name || '-'}</Text>
                      <Text fontSize='xs' color='gray.500'>
                        {analysis.facilityId}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <Badge colorScheme='teal' variant='solid'>
                      {analysis.longTermCareGrade}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getCareTypeColor(analysis.preferredCareType)} variant='subtle'>
                      {getCareTypeLabel(analysis.preferredCareType)}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize='xs' color='gray.600'>
                      {analysis.aiModelUsed}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label='AI 답변 보기'>
                        <IconButton
                          aria-label='AI 답변 보기'
                          icon={<FiMessageSquare />}
                          size='sm'
                          variant='ghost'
                          onClick={() => handleViewAIResponse(analysis)}
                        />
                      </Tooltip>
                      <Tooltip label='시설 상세 보기'>
                        <Link href={`/facilities/${analysis.facilityId}`} isExternal>
                          <IconButton aria-label='시설 상세' icon={<FiExternalLink />} size='sm' variant='ghost' />
                        </Link>
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>

      {/* AI 답변 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>AI 분석 답변</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAnalysis && (
              <VStack align='stretch' spacing={4}>
                {/* 분석 정보 */}
                <Box borderWidth='1px' borderRadius='md' p={4} bg='gray.50'>
                  <VStack align='stretch' spacing={2}>
                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        시설명:
                      </Text>
                      <Text fontSize='sm' fontWeight='medium'>
                        {selectedAnalysis.facilityName}
                      </Text>
                    </HStack>
                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        요양등급:
                      </Text>
                      <Badge colorScheme='teal' variant='solid'>
                        {selectedAnalysis.longTermCareGrade}
                      </Badge>
                    </HStack>
                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        희망 돌봄:
                      </Text>
                      <Badge colorScheme={getCareTypeColor(selectedAnalysis.preferredCareType)} variant='subtle'>
                        {getCareTypeLabel(selectedAnalysis.preferredCareType)}
                      </Badge>
                    </HStack>
                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        AI 모델:
                      </Text>
                      <Text fontSize='sm'>{selectedAnalysis.aiModelUsed}</Text>
                    </HStack>
                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        분석일시:
                      </Text>
                      <Text fontSize='sm'>{formatTimestamp(selectedAnalysis.createdAt)}</Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* AI 답변 내용 */}
                <Box>
                  <Text fontSize='sm' fontWeight='semibold' mb={2}>
                    AI 분석 내용:
                  </Text>
                  <Box borderWidth='1px' borderRadius='md' p={4} bg='blue.50' borderColor='blue.200'>
                    <Text whiteSpace='pre-wrap' fontSize='sm'>
                      {selectedAnalysis.aiSummary}
                    </Text>
                  </Box>
                </Box>

                {/* 추가 정보 */}
                {selectedAnalysis.customerAge && (
                  <HStack spacing={4}>
                    <Text fontSize='sm' color='gray.600'>
                      고객 연령:
                    </Text>
                    <Text fontSize='sm'>{selectedAnalysis.customerAge}세</Text>
                    <Text fontSize='sm' color='gray.600'>
                      성별:
                    </Text>
                    <Text fontSize='sm'>{selectedAnalysis.customerGender}</Text>
                  </HStack>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>닫기</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AIAnalysisTable
