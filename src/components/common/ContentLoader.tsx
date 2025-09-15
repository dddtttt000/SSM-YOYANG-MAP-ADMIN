import { Center, Spinner } from '@chakra-ui/react'

const ContentLoader = () => (
  <Center h='200px'>
    <Spinner size='lg' color='brand.500' thickness='3px' />
  </Center>
)

export default ContentLoader