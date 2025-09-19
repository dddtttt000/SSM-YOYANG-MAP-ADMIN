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
  Box,
  Text,
  Badge,
  HStack,
  Divider,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FiCalendar, FiUser, FiFlag, FiMessageSquare, FiExternalLink } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { postService } from '../../services'
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS } from '../../types'
import { formatDate } from '@/utils/date'

interface PostReportDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postTitle?: string
}

// 컴포넌트 내에서 사용할 신고 내역 타입은 API 응답과 맞춤

const PostReportDetailsModal = ({
  isOpen,
  onClose,
  postId,
  postTitle
}: PostReportDetailsModalProps) => {
  const navigate = useNavigate()
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const descriptionBg = useColorModeValue('gray.50', 'gray.600')

  const {
    data: reports,
    isLoading,
    error
  } = useQuery({
    queryKey: ['postReportDetails', postId],
    queryFn: () => postService.getPostReportDetails(postId),
    enabled: isOpen && !!postId,
  })

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'spam': return 'red'
      case 'inappropriate': return 'orange'
      case 'harassment': return 'purple'
      case 'false_info': return 'yellow'
      case 'copyright': return 'blue'
      case 'other': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow'
      case 'reviewed': return 'blue'
      case 'resolved': return 'green'
      default: return 'gray'
    }
  }

  const handleGoToReportManagement = () => {
    onClose()
    navigate('/community/reports/posts', {
      state: {
        filters: { postId },
        highlightPostId: postId
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="stretch" spacing={2}>
            <HStack>
              <Icon as={FiFlag} color="red.500" />
              <Text fontSize="lg" fontWeight="bold">
                게시글 신고 내역
              </Text>
            </HStack>
            {postTitle && (
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                📝 {postTitle}
              </Text>
            )}
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {isLoading ? (
            <Center py={8}>
              <Spinner size="lg" color="blue.500" />
            </Center>
          ) : error ? (
            <Alert status="error" rounded="md">
              <AlertIcon />
              신고 내역을 불러오는데 실패했습니다.
            </Alert>
          ) : !reports || reports.length === 0 ? (
            <Center py={8}>
              <VStack spacing={4}>
                <Text color="gray.500" fontSize="lg">
                  신고 내역이 없습니다.
                </Text>
                <Text color="gray.400" fontSize="sm">
                  이 게시글에 대한 신고가 없습니다.
                </Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              <Box p={3} bg={cardBg} border="1px" borderColor={borderColor} rounded="md">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    총 신고 건수
                  </Text>
                  <Badge colorScheme="red" size="lg" px={3} py={1}>
                    {reports.length}건
                  </Badge>
                </HStack>
              </Box>

              <Divider />

              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                신고 목록 (최신순)
              </Text>

              {reports.map((report, index) => (
                <Card key={report.id} bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {/* 헤더 정보 */}
                      <HStack justify="space-between" wrap="wrap">
                        <HStack spacing={2}>
                          <Text fontSize="xs" color="gray.500" fontWeight="medium">
                            신고 #{index + 1}
                          </Text>
                          <Badge
                            colorScheme={getStatusColor(report.status)}
                            size="sm"
                            variant="subtle"
                          >
                            {REPORT_STATUS_LABELS[report.status as keyof typeof REPORT_STATUS_LABELS] || report.status}
                          </Badge>
                        </HStack>
                        <HStack spacing={2} fontSize="xs" color="gray.500">
                          <Icon as={FiCalendar} />
                          <Text>{formatDate(report.created_at)}</Text>
                        </HStack>
                      </HStack>

                      {/* 신고자 정보 */}
                      <HStack spacing={2}>
                        <Icon as={FiUser} color="gray.500" />
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="medium">신고자:</Text>{' '}
                          {(report.members as any)?.nickname || `사용자 ${report.reporter_id}`}
                        </Text>
                      </HStack>

                      {/* 신고 사유 */}
                      <HStack spacing={2}>
                        <Icon as={FiFlag} color="gray.500" />
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="medium">사유:</Text>{' '}
                        </Text>
                        <Badge
                          colorScheme={getReasonColor(report.reason)}
                          size="sm"
                          variant="outline"
                        >
                          {REPORT_REASON_LABELS[report.reason as keyof typeof REPORT_REASON_LABELS] || report.reason}
                        </Badge>
                      </HStack>

                      {/* 상세 설명 */}
                      {report.description && (
                        <Box>
                          <HStack spacing={2} mb={2}>
                            <Icon as={FiMessageSquare} color="gray.500" />
                            <Text fontSize="sm" fontWeight="medium">상세 내용:</Text>
                          </HStack>
                          <Box
                            pl={6}
                            p={3}
                            bg={descriptionBg}
                            rounded="md"
                            border="1px"
                            borderColor={borderColor}
                          >
                            <Text fontSize="sm" color="gray.700" lineHeight="1.5">
                              {report.description}
                            </Text>
                          </Box>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiExternalLink />}
              colorScheme="blue"
              variant="outline"
              onClick={handleGoToReportManagement}
              isDisabled={!reports || reports.length === 0}
            >
              신고 관리로 이동
            </Button>
            <Button onClick={onClose}>
              닫기
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PostReportDetailsModal