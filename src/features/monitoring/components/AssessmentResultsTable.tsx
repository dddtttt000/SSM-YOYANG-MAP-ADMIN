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
  Progress,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { AssessmentResult } from '../types'
import { useMemberInfo } from '../hooks/useMonitoring'
import { useMemo } from 'react'
import { Timestamp } from 'firebase/firestore'

interface AssessmentResultsTableProps {
  data: AssessmentResult[]
  isLoading: boolean
}

const AssessmentResultsTable = ({ data, isLoading }: AssessmentResultsTableProps) => {
  // 유니크한 user_id 추출
  const userIds = useMemo(() => [...new Set(data.map(item => item.user_id))], [data])

  // 회원 정보 조회 - user_id는 social_id이므로 isSocialId를 true로 설정
  const { data: memberMap } = useMemberInfo(userIds, true)

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

  // 등급 색상
  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      '1등급': 'red',
      '2등급': 'orange',
      '3등급': 'yellow',
      '4등급': 'green',
      '5등급': 'blue',
      인지지원등급: 'purple',
    }
    return colors[grade] || 'gray'
  }

  // 주요 카테고리 점수 추출
  const getMainCategoryScores = (summaryScores?: any) => {
    if (!summaryScores?.category_scores) return []

    const categoryScores = summaryScores.category_scores
    const mainCategories = ['신체기능', '인지기능', '행동변화', '간호처치', '재활영역']
    return mainCategories
      .filter(category => category in categoryScores)
      .map(category => ({
        name: category,
        score: Math.round(categoryScores[category]),
      }))
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
        <Text color='gray.500'>등급 평가 활동이 없습니다.</Text>
      </Box>
    )
  }

  return (
    <Box overflowX='auto'>
      <Table variant='simple' size='sm'>
        <Thead>
          <Tr>
            <Th>평가일시</Th>
            <Th>회원</Th>
            <Th>등급</Th>
            <Th>총점</Th>
            <Th>완성도</Th>
            <Th>카테고리별 점수</Th>
            <Th>추천사항</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map(result => {
            const member = memberMap?.get(result.user_id)
            const mainScores = getMainCategoryScores(result.summary_scores)

            return (
              <Tr key={result.id}>
                <Td>
                  <Text fontSize='sm'>{formatTimestamp(result.created_at)}</Text>
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight='medium'>{member?.nickname || member?.name || '-'}</Text>
                    <Text fontSize='xs' color='gray.500'>
                      {member?.email || result.user_id}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Badge colorScheme={getGradeColor(result.grade || '미평가')} variant='solid'>
                    {result.grade || '미평가'}
                  </Badge>
                </Td>
                <Td>
                  <VStack align='start' spacing={0}>
                    <Text fontWeight='bold' fontSize='sm'>
                      {result.total_score || 0}점
                    </Text>
                    <Text fontSize='xs' color='gray.500'>
                      {result.grade_range || '-'}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <VStack align='start' spacing={1}>
                    {result.answer_statistics ? (
                      <>
                        <HStack spacing={2}>
                          <Progress
                            value={result.answer_statistics.completion_rate || 0}
                            size='sm'
                            width='60px'
                            colorScheme='green'
                          />
                          <Text fontSize='xs'>{Math.round(result.answer_statistics.completion_rate || 0)}%</Text>
                        </HStack>
                        <Text fontSize='xs' color='gray.500'>
                          {result.answer_statistics.answered_questions || 0}/
                          {result.answer_statistics.total_questions || 0}문항
                        </Text>
                      </>
                    ) : (
                      <Text fontSize='xs' color='gray.500'>
                        -
                      </Text>
                    )}
                  </VStack>
                </Td>
                <Td>
                  <VStack align='start' spacing={1}>
                    {mainScores.slice(0, 3).map(category => (
                      <HStack key={category.name} spacing={2}>
                        <Text fontSize='xs' width='60px'>
                          {category.name}:
                        </Text>
                        <Text fontSize='xs' fontWeight='bold'>
                          {category.score}점
                        </Text>
                      </HStack>
                    ))}
                    {mainScores.length > 3 && (
                      <Tooltip
                        label={mainScores
                          .slice(3)
                          .map(c => `${c.name}: ${c.score}점`)
                          .join(', ')}
                      >
                        <Text fontSize='xs' color='gray.500' cursor='help'>
                          +{mainScores.length - 3}개 더보기
                        </Text>
                      </Tooltip>
                    )}
                  </VStack>
                </Td>
                <Td>
                  <VStack align='start' spacing={1}>
                    {result.recommendations && result.recommendations.length > 0 ? (
                      <>
                        {result.recommendations.slice(0, 2).map((rec, idx) => (
                          <Text key={idx} fontSize='xs' noOfLines={1}>
                            • {rec}
                          </Text>
                        ))}
                        {result.recommendations.length > 2 && (
                          <Tooltip label={result.recommendations.slice(2).join(', ')}>
                            <Text fontSize='xs' color='gray.500' cursor='help'>
                              +{result.recommendations.length - 2}개 더보기
                            </Text>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      <Text fontSize='xs' color='gray.500'>
                        -
                      </Text>
                    )}
                  </VStack>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </Box>
  )
}

export default AssessmentResultsTable
