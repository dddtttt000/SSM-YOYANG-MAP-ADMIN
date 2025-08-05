import { Box, Grid, GridItem, Skeleton } from '@chakra-ui/react'
import { Facility } from '@/types/database.types'
import FacilityCard from './FacilityCard'
import FacilityTable from './FacilityTable'

interface FacilityListProps {
  facilities: Facility[]
  isLoading: boolean
  viewMode: 'card' | 'table'
  onView: (facility: Facility) => void
  onEdit: (facility: Facility) => void
  onDelete: (facility: Facility) => void
}

const FacilityList = ({ 
  facilities, 
  isLoading, 
  viewMode,
  onView, 
  onEdit, 
  onDelete 
}: FacilityListProps) => {
  if (viewMode === 'table') {
    return (
      <FacilityTable
        facilities={facilities}
        isLoading={isLoading}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
  }

  if (isLoading) {
    return (
      <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap="6">
        {[...Array(6)].map((_, index) => (
          <GridItem key={index}>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p="6"
              h="300px"
            >
              <Skeleton height="30px" mb="4" />
              <Skeleton height="20px" mb="2" />
              <Skeleton height="20px" mb="2" />
              <Skeleton height="20px" width="60%" />
            </Box>
          </GridItem>
        ))}
      </Grid>
    )
  }

  if (facilities.length === 0) {
    return (
      <Box textAlign="center" py="12" color="gray.500">
        등록된 시설이 없습니다.
      </Box>
    )
  }

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap="6">
      {facilities.map((facility) => (
        <GridItem key={facility.admin_code}>
          <FacilityCard
            facility={facility}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </GridItem>
      ))}
    </Grid>
  )
}

export default FacilityList