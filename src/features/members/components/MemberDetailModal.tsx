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
  Text,
  Box,
  Divider,
  Badge,
  Skeleton,
  SkeletonText,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { useMember } from '../hooks/useMembers'

interface MemberDetailModalProps {
  isOpen: boolean
  onClose: () => void
  memberId: number | null
}

const InfoItem = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <Box>
    <Text fontSize='sm' color='gray.500' mb='1'>
      {label}
    </Text>
    <Text fontWeight='medium'>{value}</Text>
  </Box>
)

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'gray'
    case 'suspended':
      return 'red'
    case 'pending':
      return 'yellow'
    default:
      return 'gray'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return '활성'
    case 'inactive':
      return '비활성'
    case 'suspended':
      return '정지'
    case 'pending':
      return '대기'
    default:
      return status
  }
}

const MemberDetailModal = ({ isOpen, onClose, memberId }: MemberDetailModalProps) => {
  const { data: member, isLoading } = useMember(memberId || 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>회원 상세 정보</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {isLoading ? (
            <VStack spacing='4' align='stretch'>
              <Skeleton height='20px' width='60%' />
              <SkeletonText mt='4' noOfLines={4} spacing='4' />
              <Skeleton height='20px' width='40%' />
              <SkeletonText mt='4' noOfLines={3} spacing='4' />
            </VStack>
          ) : member ? (
            <VStack spacing='6' align='stretch'>
              {/* 기본 정보 */}
              <Box>
                <Text fontSize='lg' fontWeight='semibold' mb='4'>
                  기본 정보
                </Text>
                <Grid templateColumns='repeat(2, 1fr)' gap='4'>
                  <GridItem>
                    <InfoItem label='회원 ID' value={member.id.toString()} />
                  </GridItem>
                  <GridItem>
                    <InfoItem label='소셜 ID' value={member.social_id} />
                  </GridItem>
                  <GridItem>
                    <InfoItem label='이름' value={member.name || '-'} />
                  </GridItem>
                  <GridItem>
                    <InfoItem label='닉네임' value={member.nickname || '-'} />
                  </GridItem>
                  <GridItem>
                    <InfoItem label='소셜 타입' value={member.social_type} />
                  </GridItem>
                  <GridItem>
                    <InfoItem
                      label='상태'
                      value={
                        <Badge colorScheme={getStatusBadgeColor(member.status)}>{getStatusLabel(member.status)}</Badge>
                      }
                    />
                  </GridItem>
                  <GridItem colSpan={2}>
                    <InfoItem label='이메일' value={member.email || '-'} />
                  </GridItem>
                  <GridItem>
                    <InfoItem label='전화번호' value={member.phone || '-'} />
                  </GridItem>
                  <GridItem>
                    <InfoItem label='성별' value={member.gender || '-'} />
                  </GridItem>
                </Grid>
              </Box>

              <Divider />

              {/* 가입 정보 */}
              <Box>
                <Text fontSize='lg' fontWeight='semibold' mb='4'>
                  가입 정보
                </Text>
                <Grid templateColumns='repeat(2, 1fr)' gap='4'>
                  <GridItem>
                    <InfoItem
                      label='가입일'
                      value={
                        member.created_at
                          ? new Date(member.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '-'
                      }
                    />
                  </GridItem>
                  <GridItem>
                    <InfoItem
                      label='최종 수정일'
                      value={
                        member.updated_at
                          ? new Date(member.updated_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '-'
                      }
                    />
                  </GridItem>
                </Grid>
              </Box>

              {/* 추가 정보가 있다면 여기에 표시 */}
            </VStack>
          ) : (
            <Text color='gray.500'>회원 정보를 불러올 수 없습니다.</Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>닫기</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MemberDetailModal
