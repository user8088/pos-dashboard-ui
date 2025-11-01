import React from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Spinner,
  Button,
  HStack,
  VStack,
  Divider,
} from '@chakra-ui/react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { useParams, useHistory } from 'react-router-dom';
import { stockService } from 'services/stockService';
import placeholder from 'assets/img/avatars/placeholder.png';

export default function StockItemDetail() {
  const { id } = useParams();
  const history = useHistory();
  const textColor = useColorModeValue('gray.700', 'white');
  const [loading, setLoading] = React.useState(true);
  const [item, setItem] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await stockService.showItem(id);
        const data = resp?.data || resp;
        if (mounted) setItem(data);
      } catch (e) {
        // fallback if not found
        if (mounted) setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Flex align='center' justify='center' minH='240px'>
        <Spinner color='#FF8D28' />
      </Flex>
    );
  }

  if (!item) {
    return (
      <Box>
        <Text color={textColor} mb='4'>Item not found.</Text>
        <Button variant='outline' onClick={() => history.push('/admin/stock-management')}>Back to stock</Button>
      </Box>
    );
  }

  const cost = Number(item.last_purchase_price || 0);
  const price = Number(item.selling_price || 0);
  const profit = Math.max(0, price - cost);
  const profitPct = price > 0 ? Math.round((profit / price) * 100) : 0;
  const status = item.status || 'In Stock';
  const primaryUnit = item.primaryUnit?.symbol || item.primaryUnit?.name || item.primary_unit?.symbol || item.primary_unit?.name || '';
  const secondaryUnit = item.secondaryUnit?.symbol || item.secondaryUnit?.name || item.secondary_unit?.symbol || item.secondary_unit?.name || '';
  const conversion = item.secondary_per_primary ? Number(item.secondary_per_primary) : null;

  return (
    <Box pt={{ base: '120px', md: '75px' }}>
      <Flex justify='space-between' align='center' mb='16px'>
        <Box>
          <HStack spacing='12px' align='center'>
            <Text fontSize='2xl' fontWeight='bold' color={textColor}>{item.name}</Text>
            <Badge colorScheme={status === 'In Stock' ? 'green' : status === 'Low Stock' ? 'yellow' : 'red'}>{status}</Badge>
          </HStack>
          <Text color='gray.500' fontSize='sm'>ID: {item.id}</Text>
        </Box>
        <Button variant='outline' onClick={() => history.push('/admin/stock-management')}>Back</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 5 }} spacing='24px'>
        {/* Left: Image & status */}
        <Card gridColumn={{ lg: '2 span' }}>
          <CardBody>
            <Image src={item.image_url || placeholder} alt={item.name} borderRadius='12px' w='100%' maxH='420px' objectFit='contain' />
            {/* status badge moved to header */}
          </CardBody>
        </Card>

        {/* Right: Pricing, Units, Description */}
        <VStack align='stretch' spacing='24px' gridColumn={{ lg: '3 span' }}>
          <Card>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing='16px'>
                <Stat p='16px' borderRadius='12px' bg={useColorModeValue('red.50','whiteAlpha.100')}>
                  <StatLabel>Cost Price</StatLabel>
                  <StatNumber>PKR {cost.toFixed(2)}</StatNumber>
                </Stat>
                <Stat p='16px' borderRadius='12px' bg={useColorModeValue('green.50','whiteAlpha.100')}>
                  <StatLabel>Selling Price</StatLabel>
                  <StatNumber>PKR {price.toFixed(2)}</StatNumber>
                </Stat>
                <Stat p='16px' borderRadius='12px' bg={useColorModeValue('blue.50','whiteAlpha.100')}>
                  <StatLabel>Profit</StatLabel>
                  <StatNumber>PKR {profit.toFixed(2)}</StatNumber>
                  <StatHelpText>{profitPct}%</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontWeight='bold' color={textColor}>Units & Conversion</Text>
            </CardHeader>
            <CardBody>
              <HStack spacing='24px' flexWrap='wrap'>
                <Box>
                  <Text fontSize='sm' color='gray.500'>Selling Unit</Text>
                  <Text fontWeight='semibold'>{primaryUnit || '-'}</Text>
                </Box>
                <Divider orientation='vertical' h='28px' />
                <Box>
                  <Text fontSize='sm' color='gray.500'>Stocking Unit</Text>
                  <Text fontWeight='semibold'>{secondaryUnit || '-'}</Text>
                </Box>
                {conversion ? (
                  <>
                    <Divider orientation='vertical' h='28px' />
                    <Box>
                      <Text fontSize='sm' color='gray.500'>Conversion</Text>
                      <Text fontWeight='semibold'>1 Selling = {conversion} Stocking</Text>
                    </Box>
                  </>
                ) : null}
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontWeight='bold' color={textColor}>Description</Text>
            </CardHeader>
            <CardBody>
              <Text color='gray.600'>{item.description || 'No description provided.'}</Text>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}


