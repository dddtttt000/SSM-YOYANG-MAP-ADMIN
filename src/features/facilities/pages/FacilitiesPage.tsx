import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { useState, useRef } from 'react'
import { useFacilities, useFacilityStats, useDeleteFacility } from '../hooks/useFacilities'
import { usePermission } from '@/hooks/usePermission'
import FacilityList from '../components/FacilityList'
import FacilityDetailModal from '../components/FacilityDetailModal'
import FacilityFormModal from '../components/FacilityFormModal'
import FacilityFilters from '../components/FacilityFilters'
import Pagination from '@/components/common/Pagination'
import { FacilityWithRelations } from '../services/facilityService'
import { FacilityFilters as Filters } from '../services/facilityService'

const FacilitiesPage = () => {
  const { canCreate } = usePermission()
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 12,
  })
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table')
  
  const { data: facilitiesData, isLoading } = useFacilities(filters)
  const { data: stats } = useFacilityStats()
  const deleteFacility = useDeleteFacility()
  
  const {
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen,
    onClose: onDetailModalClose,
  } = useDisclosure()
  
  const {
    isOpen: isFormModalOpen,
    onOpen: onFormModalOpen,
    onClose: onFormModalClose,
  } = useDisclosure()
  
  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onDeleteAlertOpen,
    onClose: onDeleteAlertClose,
  } = useDisclosure()

  const [selectedFacility, setSelectedFacility] = useState<FacilityWithRelations | null>(null)
  const [selectedFacilityAdminCode, setSelectedFacilityAdminCode] = useState<string | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handlePageSizeChange = (limit: number) => {
    setFilters({ ...filters, page: 1, limit })
  }

  const handleViewDetails = (facility: any) => {
    setSelectedFacilityAdminCode(facility.admin_code)
    onDetailModalOpen()
  }

  const handleAddFacility = () => {
    setSelectedFacility(null)
    onFormModalOpen()
  }

  const handleEditFacility = (facility: FacilityWithRelations) => {
    setSelectedFacility(facility)
    onFormModalOpen()
    onDetailModalClose()
  }

  const handleDeleteFacility = (facility: any) => {
    setSelectedFacility(facility)
    onDeleteAlertOpen()
  }

  const confirmDelete = async () => {
    if (selectedFacility) {
      await deleteFacility.mutateAsync(selectedFacility.admin_code)
      onDeleteAlertClose()
    }
  }

  return (
    <Box>
      <VStack align="stretch" spacing="6">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb="2">
              시설 관리
            </Heading>
            <Text color="gray.600">
              등록된 시설 정보를 조회하고 관리할 수 있습니다.
            </Text>
          </Box>
          {canCreate('facilities') && (
            <Button
              colorScheme="brand"
              leftIcon={<FiPlus />}
              onClick={handleAddFacility}
            >
              시설 등록
            </Button>
          )}
        </HStack>

        {/* 통계 카드 */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="4">
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>전체 시설</StatLabel>
                  <StatNumber>{stats?.total.toLocaleString() || 0}</StatNumber>
                  <StatHelpText>총 등록 시설</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>총 정원</StatLabel>
                  <StatNumber>{stats?.totalCapacity.toLocaleString() || 0}</StatNumber>
                  <StatHelpText>명</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>현원</StatLabel>
                  <StatNumber>{stats?.currentOccupancy.toLocaleString() || 0}</StatNumber>
                  <StatHelpText>명</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>평균 정원</StatLabel>
                  <StatNumber>{stats?.averageCapacity || 0}</StatNumber>
                  <StatHelpText>명/시설</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* 시설 목록 */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing="4">
              <FacilityFilters
                filters={filters}
                onFiltersChange={setFilters}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              
              <FacilityList
                facilities={facilitiesData?.data || []}
                isLoading={isLoading}
                viewMode={viewMode}
                onView={handleViewDetails}
                onEdit={handleEditFacility}
                onDelete={handleDeleteFacility}
              />

              {facilitiesData && (
                <Pagination
                  currentPage={facilitiesData.page}
                  totalPages={facilitiesData.totalPages}
                  onPageChange={handlePageChange}
                  pageSize={filters.limit || 12}
                  onPageSizeChange={handlePageSizeChange}
                  totalItems={facilitiesData.count}
                />
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <FacilityDetailModal
        isOpen={isDetailModalOpen}
        onClose={onDetailModalClose}
        facilityId={selectedFacilityAdminCode}
        onEdit={handleEditFacility}
      />

      <FacilityFormModal
        isOpen={isFormModalOpen}
        onClose={onFormModalClose}
        facility={selectedFacility}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              시설 삭제
            </AlertDialogHeader>

            <AlertDialogBody>
              정말로 <strong>{selectedFacility?.admin_name}</strong> 시설을 삭제하시겠습니까?
              삭제된 시설은 복구할 수 없습니다.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                취소
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteFacility.isPending}
              >
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default FacilitiesPage