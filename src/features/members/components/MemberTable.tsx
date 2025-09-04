import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Skeleton,
  Text,
  Select,
} from '@chakra-ui/react'
import { FiMoreVertical, FiEye } from 'react-icons/fi'
import { Member } from '@/types/database.types'
import { useUpdateMemberStatus } from '../hooks/useMembers'
import { usePermission } from '@/hooks/usePermission'

interface MemberTableProps {
  members: Member[]
  isLoading: boolean
  onViewDetails: (member: Member) => void
}

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

const getSocialTypeLabel = (socialType: string | null) => {
  if (!socialType) return '-'
  switch (socialType) {
    case 'kakao':
      return '카카오'
    case 'naver':
      return '네이버'
    case 'google':
      return '구글'
    case 'apple':
      return '애플'
    default:
      return socialType
  }
}

const getSocialTypeBadgeColor = (socialType: string | null) => {
  if (!socialType) return 'gray'
  switch (socialType) {
    case 'kakao':
      return 'yellow'
    case 'naver':
      return 'green'
    case 'google':
      return 'blue'
    case 'apple':
      return 'gray'
    default:
      return 'gray'
  }
}

const MemberTable = ({ members, isLoading, onViewDetails }: MemberTableProps) => {
  const { canUpdate } = usePermission()
  const updateMemberStatus = useUpdateMemberStatus()

  const handleStatusChange = async (memberId: number, newStatus: string) => {
    await updateMemberStatus.mutateAsync({ id: memberId, status: newStatus })
  }

  if (isLoading) {
    return (
      <TableContainer overflowX='auto'>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>소셜ID</Th>
              <Th>소셜타입</Th>
              <Th>닉네임</Th>
              <Th>이메일</Th>
              <Th>상태</Th>
              <Th>가입일</Th>
              <Th width='100px'>작업</Th>
            </Tr>
          </Thead>
          <Tbody>
            {[...Array(5)].map((_, index) => (
              <Tr key={index}>
                <Td>
                  <Skeleton height='20px' width='60px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='120px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='60px' />
                </Td>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='20px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='80px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='100px' />
                </Td>
                <Td>
                  <Skeleton height='20px' width='40px' />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    )
  }

  if (members.length === 0) {
    return (
      <TableContainer overflowX='auto'>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>소셜ID</Th>
              <Th>소셜타입</Th>
              <Th>닉네임</Th>
              <Th>이메일</Th>
              <Th>상태</Th>
              <Th>가입일</Th>
              <Th width='100px'>작업</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={8}>
                <Text textAlign='center' color='gray.500' py='8'>
                  등록된 회원이 없습니다.
                </Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <TableContainer overflowX='auto'>
      <Table variant='simple' size='sm'>
        <Thead>
          <Tr>
            <Th whiteSpace='nowrap'>ID</Th>
            <Th whiteSpace='nowrap'>소셜ID</Th>
            <Th whiteSpace='nowrap'>소셜타입</Th>
            <Th whiteSpace='nowrap'>닉네임</Th>
            <Th whiteSpace='nowrap'>이메일</Th>
            <Th whiteSpace='nowrap'>상태</Th>
            <Th whiteSpace='nowrap'>가입일</Th>
            <Th whiteSpace='nowrap' width='100px'>
              작업
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map(member => (
            <Tr key={member.id}>
              <Td whiteSpace='nowrap'>
                <Text fontSize='sm' fontFamily='mono'>
                  {member.id}
                </Text>
              </Td>
              <Td whiteSpace='nowrap'>
                <Text fontSize='sm'>{member.social_id}</Text>
              </Td>
              <Td whiteSpace='nowrap'>
                <Badge colorScheme={getSocialTypeBadgeColor(member.social_type)} variant='subtle'>
                  {getSocialTypeLabel(member.social_type)}
                </Badge>
              </Td>
              <Td whiteSpace='nowrap' fontWeight='medium'>
                {member.nickname || member.name || '-'}
              </Td>
              <Td whiteSpace='nowrap'>{member.email || '-'}</Td>
              <Td whiteSpace='nowrap'>
                {canUpdate('members') ? (
                  <Select
                    value={member.status}
                    onChange={e => handleStatusChange(member.id, e.target.value)}
                    size='sm'
                    width='120px'
                    isDisabled={updateMemberStatus.isPending}
                  >
                    <option value='active'>활성</option>
                    <option value='inactive'>비활성</option>
                    <option value='suspended'>정지</option>
                    <option value='pending'>대기</option>
                  </Select>
                ) : (
                  <Badge colorScheme={getStatusBadgeColor(member.status)}>{getStatusLabel(member.status)}</Badge>
                )}
              </Td>
              <Td whiteSpace='nowrap'>
                {member.created_at ? new Date(member.created_at).toLocaleDateString('ko-KR') : '-'}
              </Td>
              <Td whiteSpace='nowrap'>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant='ghost'
                    size='sm'
                    aria-label='작업 메뉴'
                  />
                  <MenuList>
                    <MenuItem icon={<FiEye />} onClick={() => onViewDetails(member)}>
                      상세 보기
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default MemberTable
