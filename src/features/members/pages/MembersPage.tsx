import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  useDisclosure,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useMembers, useMemberStats } from '../hooks/useMembers'
import MemberTable from '../components/MemberTable'
import MemberDetailModal from '../components/MemberDetailModal'
import MemberFilters from '../components/MemberFilters'
import Pagination from '@/components/common/Pagination'
import { MemberFilters as Filters } from '../services/memberService'
import { Member } from '@/types/database.types'

const MembersPage = () => {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
  })

  const { data: membersData, isLoading } = useMembers(filters)
  const { data: stats } = useMemberStats()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handlePageSizeChange = (limit: number) => {
    setFilters({ ...filters, page: 1, limit })
  }

  const handleViewDetails = (member: Member) => {
    setSelectedMemberId(member.id)
    onOpen()
  }

  return (
    <Box>
      <VStack align='stretch' spacing='8'>
        <Box>
          <Heading size='lg' mb='2'>
            회원 관리
          </Heading>
          <Text color='gray.600'>가입한 회원들의 정보를 조회하고 관리할 수 있습니다.</Text>
        </Box>

        {/* 통계 카드 */}
        <Grid templateColumns='repeat(auto-fit, minmax(220px, 1fr))' gap='4'>
          <GridItem>
            <Card h='100%'>
              <CardBody minH='120px'>
                <Stat>
                  <StatLabel>전체 회원</StatLabel>
                  <StatNumber>{stats?.total.toLocaleString() || 0}</StatNumber>
                  <StatHelpText>총 가입자 수</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card h='100%'>
              <CardBody minH='120px'>
                <Stat>
                  <StatLabel>활성 회원</StatLabel>
                  <StatNumber>{stats?.active.toLocaleString() || 0}</StatNumber>
                  <StatHelpText>현재 활동 중</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card h='100%'>
              <CardBody minH='120px'>
                <Stat>
                  <StatLabel>신규 가입</StatLabel>
                  <StatNumber>{stats?.recent.toLocaleString() || 0}</StatNumber>
                  <StatHelpText>최근 7일</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* 회원 목록 */}
        <Card>
          <CardBody>
            <VStack align='stretch' spacing='4'>
              <MemberFilters filters={filters} onFiltersChange={setFilters} />

              <MemberTable members={membersData?.data || []} isLoading={isLoading} onViewDetails={handleViewDetails} />

              {membersData && (
                <Pagination
                  currentPage={membersData.page}
                  totalPages={membersData.totalPages}
                  onPageChange={handlePageChange}
                  pageSize={filters.limit || 10}
                  onPageSizeChange={handlePageSizeChange}
                  totalItems={membersData.count}
                />
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <MemberDetailModal isOpen={isOpen} onClose={onClose} memberId={selectedMemberId} />
    </Box>
  )
}

export default MembersPage
