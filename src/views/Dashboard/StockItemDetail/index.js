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
  const highestPrice = item.highest_purchase_price != null ? Number(item.highest_purchase_price) : null;
  const lowestPrice = item.lowest_purchase_price != null ? Number(item.lowest_purchase_price) : null;
  const supplier = item.supplier && typeof item.supplier === 'object' ? item.supplier : null;
  const quantity = Number(item.quantity || 0);
  const availableQty = Number(item.available_quantity || item.quantity || 0);

  return (
    <Box pt={{ base: '120px', md: '75px' }} px={{ base: '16px', md: '24px' }}>
      <Flex justify='space-between' align='center' mb='32px'>
        <Box>
          <HStack spacing='16px' align='center' mb='12px'>
            <Text fontSize='3xl' fontWeight='bold' color={textColor}>{item.name}</Text>
            <Badge colorScheme={status === 'In Stock' ? 'green' : status === 'Low Stock' ? 'yellow' : 'red'} fontSize='sm' px='12px' py='4px'>{status}</Badge>
          </HStack>
          <HStack spacing='20px' fontSize='sm' color='gray.500'>
            <Text>ID: {item.id}</Text>
            {item.serial_id && <Text>• Serial: {item.serial_id}</Text>}
            {supplier && <Text>• Supplier: {supplier.name}</Text>}
          </HStack>
        </Box>
        <Button variant='outline' onClick={() => history.push('/admin/stock-management')}>Back</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing='24px'>
        {/* Left: Image */}
        <Card gridColumn={{ lg: '3 span' }}>
          <CardBody p='20px'>
            <Box 
              w='100%' 
              h='300px' 
              borderRadius='12px' 
              overflow='hidden'
              bg={useColorModeValue('gray.50', 'gray.800')}
              display='flex'
              alignItems='center'
              justifyContent='center'
            >
              <Image 
                src={item.image_url || placeholder} 
                alt={item.name} 
                maxH='100%'
                maxW='100%'
                objectFit='contain'
              />
            </Box>
          </CardBody>
        </Card>

        {/* Right: Main Content */}
        <VStack align='stretch' spacing='24px' gridColumn={{ lg: '9 span' }}>
          {/* Stock Information - Full Width */}
          <Card>
            <CardHeader pb='12px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
              <Text fontSize='md' fontWeight='semibold' color={textColor}>Stock Information</Text>
            </CardHeader>
            <CardBody pt='16px' pb='20px' px='20px'>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing='16px'>
                <Box p='16px' borderRadius='8px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Current Stock</Text>
                  <Text fontSize='xl' fontWeight='bold' color={textColor} mb='4px'>
                    {quantity.toLocaleString()} {primaryUnit}
                  </Text>
                  {conversion && secondaryUnit && (
                    <Text fontSize='sm' color='gray.500'>
                      ({((quantity * conversion).toLocaleString())} {secondaryUnit})
                    </Text>
                  )}
                </Box>
                <Box p='16px' borderRadius='8px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Available Stock</Text>
                  <Text fontSize='xl' fontWeight='bold' color={textColor} mb='4px'>
                    {availableQty.toLocaleString()} {primaryUnit}
                  </Text>
                  {conversion && secondaryUnit && (
                    <Text fontSize='sm' color='gray.500'>
                      ({((availableQty * conversion).toLocaleString())} {secondaryUnit})
                    </Text>
                  )}
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Pricing Information - Split Layout */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='24px'>
            {/* Left: Main Pricing Cards */}
            <Card>
              <CardHeader pb='12px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                <Text fontSize='md' fontWeight='semibold' color={textColor}>Pricing</Text>
              </CardHeader>
              <CardBody pt='16px' pb='20px' px='20px'>
                <VStack spacing='12px' align='stretch'>
                  <Box p='16px' borderRadius='8px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                    <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Last Purchase Price</Text>
                    <Text fontSize='xl' fontWeight='bold' color={textColor}>PKR {cost.toFixed(2)}</Text>
                  </Box>
                  <Box p='16px' borderRadius='8px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                    <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Selling Price</Text>
                    <Text fontSize='xl' fontWeight='bold' color={textColor}>PKR {price.toFixed(2)}</Text>
                  </Box>
                  <Box p='16px' borderRadius='8px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                    <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Profit Margin</Text>
                    <HStack justify='space-between' align='baseline'>
                      <Text fontSize='xl' fontWeight='bold' color={textColor}>PKR {profit.toFixed(2)}</Text>
                      <Badge colorScheme='gray' fontSize='sm' px='8px' py='2px' variant='subtle'>{profitPct}%</Badge>
                    </HStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Right: Price History */}
            {(highestPrice != null || lowestPrice != null) && (
              <Card>
                <CardHeader pb='12px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                  <Text fontSize='md' fontWeight='semibold' color={textColor}>Price History</Text>
                </CardHeader>
                <CardBody pt='16px' pb='20px' px='20px'>
                  <VStack spacing='12px' align='stretch'>
                    {highestPrice != null && (
                      <Box p='16px' borderRadius='8px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Highest Purchase Price</Text>
                        <Text fontSize='xl' fontWeight='bold' color={textColor}>PKR {highestPrice.toFixed(2)}</Text>
                      </Box>
                    )}
                    {lowestPrice != null && (
                      <Box p='16px' borderRadius='8px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Lowest Purchase Price</Text>
                        <Text fontSize='xl' fontWeight='bold' color={textColor}>PKR {lowestPrice.toFixed(2)}</Text>
                      </Box>
                    )}
                    {highestPrice != null && lowestPrice != null && (
                      <Box p='16px' borderRadius='8px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Price Range</Text>
                        <Text fontSize='lg' fontWeight='bold' color={textColor} mb='4px'>
                          PKR {lowestPrice.toFixed(2)} - PKR {highestPrice.toFixed(2)}
                        </Text>
                        {highestPrice > lowestPrice && (
                          <Text fontSize='xs' color='gray.500'>
                            Variation: {((highestPrice - lowestPrice) / lowestPrice * 100).toFixed(1)}%
                          </Text>
                        )}
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}
          </SimpleGrid>

          {/* Bottom Row: Supplier, Units, Additional Info */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing='24px'>
            {/* Supplier Information */}
            {supplier && (
              <Card>
                <CardHeader pb='12px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                  <Text fontSize='md' fontWeight='semibold' color={textColor}>Supplier</Text>
                </CardHeader>
                <CardBody pt='16px' pb='20px' px='20px'>
                  <VStack align='stretch' spacing='12px'>
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb='6px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Name</Text>
                      <Text fontSize='md' fontWeight='semibold' color={textColor}>{supplier.name}</Text>
                    </Box>
                    {supplier.phone && (
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb='6px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Phone</Text>
                        <Text fontSize='sm' color={textColor}>{supplier.phone}</Text>
                      </Box>
                    )}
                    {supplier.address && (
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb='6px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Address</Text>
                        <Text fontSize='sm' color={textColor}>{supplier.address}</Text>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Units & Conversion */}
            <Card>
              <CardHeader pb='12px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                <Text fontSize='md' fontWeight='semibold' color={textColor}>Units</Text>
              </CardHeader>
              <CardBody pt='16px' pb='20px' px='20px'>
                <VStack align='stretch' spacing='12px'>
                  <Box>
                    <Text fontSize='xs' color='gray.500' mb='6px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Primary Unit</Text>
                    <Text fontSize='md' fontWeight='semibold' color={textColor}>{primaryUnit || '-'}</Text>
                  </Box>
                  {secondaryUnit && (
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb='6px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Secondary Unit</Text>
                      <Text fontSize='md' fontWeight='semibold' color={textColor}>{secondaryUnit}</Text>
                    </Box>
                  )}
                  {conversion && (
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb='6px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Conversion</Text>
                      <Text fontSize='sm' fontWeight='semibold' color={textColor}>1 {primaryUnit} = {conversion} {secondaryUnit}</Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader pb='12px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                <Text fontSize='md' fontWeight='semibold' color={textColor}>Details</Text>
              </CardHeader>
              <CardBody pt='16px' pb='20px' px='20px'>
                <VStack align='stretch' spacing='12px'>
                  {item.category && (
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb='6px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Category</Text>
                      <Text fontSize='md' fontWeight='semibold' color={textColor}>
                        {item.category?.name || item.category_name || 'N/A'}
                      </Text>
                    </Box>
                  )}
                  {item.description && (
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb='6px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Description</Text>
                      <Text fontSize='sm' color='gray.600' lineHeight='1.5' noOfLines={3}>{item.description}</Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}


