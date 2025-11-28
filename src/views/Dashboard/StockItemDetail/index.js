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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Select,
  Alert,
  AlertIcon,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { useParams, useHistory } from 'react-router-dom';
import { stockService } from 'services/stockService';
import { invoiceService } from 'services/invoiceService';
import placeholder from 'assets/img/avatars/placeholder.png';

export default function StockItemDetail() {
  const { id } = useParams();
  const history = useHistory();
  const toast = useToast();
  const textColor = useColorModeValue('gray.700', 'white');
  const [loading, setLoading] = React.useState(true);
  const [item, setItem] = React.useState(null);
  const [invoiceQuery, setInvoiceQuery] = React.useState('');
  const [invoiceResult, setInvoiceResult] = React.useState(null);
  const [invoiceError, setInvoiceError] = React.useState('');
  const [historyRange, setHistoryRange] = React.useState('90');
  const [historyStart, setHistoryStart] = React.useState('');
  const [historyEnd, setHistoryEnd] = React.useState('');
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [historyError, setHistoryError] = React.useState('');
  const [priceHistoryEntries, setPriceHistoryEntries] = React.useState([]);
  const [priceSummary, setPriceSummary] = React.useState({
    avgPurchase: 0,
    avgSelling: 0,
    bestMargin: 0,
    lowestMargin: 0,
  });
  const [downloadingInvoiceNumbers, setDownloadingInvoiceNumbers] = React.useState(new Set());

  const loadPriceHistory = React.useCallback(
    async (params = {}) => {
      const query = { limit: 50, ...params };
      Object.keys(query).forEach((key) => {
        if (query[key] === '' || query[key] == null) delete query[key];
      });
      try {
        setHistoryLoading(true);
        setHistoryError('');
        const resp = await stockService.listPriceHistory(id, query);
        const payload = resp?.data?.data || resp?.data || resp || {};
        const stats =
          payload.stats ||
          resp?.data?.stats ||
          resp?.stats ||
          {};

        let entriesSource =
          payload.entries ??
          resp?.data?.entries ??
          payload.data ??
          [];
        if (entriesSource && typeof entriesSource === 'object' && Array.isArray(entriesSource.data)) {
          entriesSource = entriesSource.data;
        }
        if (!Array.isArray(entriesSource)) {
          entriesSource = [];
        }

        const normalized = entriesSource.map((entry, index) => {
          const purchase = Number(entry.purchase_price || entry.purchase || 0);
          const selling = Number(entry.selling_price || entry.selling || 0);
          const margin =
            entry.margin_amount != null
              ? Number(entry.margin_amount)
              : selling - purchase;
          const marginPct =
            entry.margin_percent != null
              ? Number(entry.margin_percent).toFixed(1)
              : selling
              ? ((margin / (selling || 1)) * 100).toFixed(1)
              : '0.0';
          const label = entry.invoice_number
            ? `Invoice ${entry.invoice_number}`
            : entry.note || 'Manual entry';
          return {
            id: entry.id || `${entry.invoice_number || 'manual'}-${index}`,
            date: entry.recorded_at || entry.created_at || entry.date || null,
            invoiceNumber: entry.invoice_number || entry.invoice_no || null,
            invoiceId: entry.invoice_id || null,
            purchase,
            selling,
            margin,
            marginPct,
            note: entry.note,
            label,
          };
        });

        setPriceHistoryEntries(normalized);
        setPriceSummary({
          avgPurchase: Number(stats.average_purchase || 0),
          avgSelling: Number(stats.average_selling || 0),
          bestMargin: Number(stats.best_margin || 0),
          lowestMargin: Number(stats.lowest_margin || 0),
        });
      } catch (error) {
        console.error('Failed to load price history', error);
        setHistoryError(error?.message || 'Failed to load price history.');
        setPriceHistoryEntries([]);
        setPriceSummary({
          avgPurchase: 0,
          avgSelling: 0,
          bestMargin: 0,
          lowestMargin: 0,
        });
      } finally {
        setHistoryLoading(false);
      }
    },
    [id]
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await stockService.showItem(id);
        const data = resp?.data || resp;
        if (mounted) setItem(data);
      } catch (e) {
        if (mounted) setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  React.useEffect(() => {
    setHistoryRange('90');
    setHistoryStart('');
    setHistoryEnd('');
    setInvoiceQuery('');
    setInvoiceResult(null);
    setInvoiceError('');
    loadPriceHistory({ range: '90' });
  }, [id, loadPriceHistory]);

  const handleApplyHistoryFilters = React.useCallback(() => {
    const params = {};
    if (historyRange && historyRange !== 'custom') {
      params.range = historyRange;
    }
    if (historyStart) params.start_date = historyStart;
    if (historyEnd) params.end_date = historyEnd;
    loadPriceHistory(params);
  }, [historyRange, historyStart, historyEnd, loadPriceHistory]);

  const handleResetHistoryFilters = React.useCallback(() => {
    setHistoryRange('90');
    setHistoryStart('');
    setHistoryEnd('');
    loadPriceHistory({ range: '90' });
  }, [loadPriceHistory]);

  const handleRangeChange = (value) => {
    setHistoryRange(value);
    if (value !== 'custom') {
      setHistoryStart('');
      setHistoryEnd('');
      loadPriceHistory({ range: value });
    }
  };

  const handleInvoiceSearch = async () => {
    const trimmed = invoiceQuery.trim();
    if (!trimmed) {
      setInvoiceError('Please enter an invoice number.');
      setInvoiceResult(null);
      return;
    }
    setInvoiceError('');
    try {
      const response = await stockService.lookupPriceHistoryInvoice(id, trimmed);
      const entry = response?.data || response || null;
      if (!entry) {
        setInvoiceResult(null);
        setInvoiceError('No matching invoice found for this item.');
        return;
      }
      const purchase = Number(entry.purchase_price || 0);
      const selling = Number(entry.selling_price || 0);
      const margin = Number(
        entry.margin_amount != null ? entry.margin_amount : selling - purchase
      );
      const marginPct =
        entry.margin_percent != null
          ? entry.margin_percent
          : selling
          ? ((margin / selling) * 100).toFixed(1)
          : '0.0';
      setInvoiceResult({
        id: entry.id || entry.invoice_number,
        invoiceId: entry.invoice_id || null,
        date: entry.recorded_at || entry.created_at,
        invoiceNumber: entry.invoice_number,
        purchase,
        selling,
        margin,
        marginPct,
        note: entry.note,
      });
      setInvoiceError('');
    } catch (error) {
      setInvoiceResult(null);
      setInvoiceError('No matching invoice found for this item.');
    }
  };

  const handleDownloadInvoice = React.useCallback(async (invoiceNumber, invoiceId = null) => {
    if (!invoiceNumber) return;
    if (downloadingInvoiceNumbers.has(invoiceNumber)) return;

    try {
      setDownloadingInvoiceNumbers(prev => new Set(prev).add(invoiceNumber));
      
      let invoiceIdToUse = invoiceId;
      
      // If no invoice ID provided, look it up by invoice number
      if (!invoiceIdToUse) {
        const invoices = await invoiceService.listInvoices({ search: invoiceNumber, per_page: 1 });
        const invoiceList = invoices?.data?.data || invoices?.data || [];
        const foundInvoice = invoiceList.find(inv => 
          inv.invoice_number === invoiceNumber || String(inv.invoice_number) === String(invoiceNumber)
        );
        if (!foundInvoice) {
          throw new Error('Invoice not found');
        }
        invoiceIdToUse = foundInvoice.id;
      }

      await invoiceService.downloadInvoice(invoiceIdToUse);
      toast({
        title: 'Download successful',
        description: 'Invoice downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download invoice',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloadingInvoiceNumbers(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoiceNumber);
        return newSet;
      });
    }
  }, [downloadingInvoiceNumbers, toast]);

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
  const profit = price - cost;
  const profitPct = cost > 0 ? Math.round((profit / cost) * 100) : 0;
  const status = item.status || 'In Stock';
  const primaryUnit = item.primaryUnit?.symbol || item.primaryUnit?.name || item.primary_unit?.symbol || item.primary_unit?.name || '';
  const secondaryUnit = item.secondaryUnit?.symbol || item.secondaryUnit?.name || item.secondary_unit?.symbol || item.secondary_unit?.name || '';
  const conversion = item.secondary_per_primary ? Number(item.secondary_per_primary) : null;
  const highestPrice = item.highest_purchase_price != null ? Number(item.highest_purchase_price) : null;
  const lowestPrice = item.lowest_purchase_price != null ? Number(item.lowest_purchase_price) : null;
  const supplier = item.supplier && typeof item.supplier === 'object' ? item.supplier : null;
  const quantity = Number(item.quantity || 0);
  const availableQty = Number(item.available_quantity || item.quantity || 0);
  
  // Calculate stock in both units
  const stockInPrimary = quantity;
  const stockInSecondary = conversion ? (quantity * conversion) : null;
  const totalStockValue = quantity * cost;
  
  // Get total sales revenue from API (automatically calculated field)
  const totalSalesRevenue = Number(item.total_sales_revenue || 0);

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

      <Tabs colorScheme='orange' variant='enclosed'>
        <TabList>
          <Tab fontWeight='semibold'>Overview</Tab>
          <Tab fontWeight='semibold'>Price History</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <VStack spacing='20px' align='stretch'>
              {/* Stock Information - Top Row */}
              <Card>
                <CardHeader pb='10px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                  <Text fontSize='sm' fontWeight='semibold' color={textColor}>Stock Information</Text>
                </CardHeader>
                <CardBody pt='12px' pb='16px' px='16px'>
                  <SimpleGrid columns={{ base: 2, md: secondaryUnit && stockInSecondary != null ? 4 : 3 }} spacing='12px'>
                    <Box p='12px' borderRadius='6px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                      <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>
                        Stock in {primaryUnit || 'Primary Unit'}
                      </Text>
                      <Text fontSize='lg' fontWeight='bold' color={textColor}>
                        {stockInPrimary.toLocaleString()} {primaryUnit || ''}
                      </Text>
                    </Box>
                    {secondaryUnit && stockInSecondary != null && (
                      <Box p='12px' borderRadius='6px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>
                          Stock in {secondaryUnit}
                        </Text>
                        <Text fontSize='lg' fontWeight='bold' color={textColor}>
                          {stockInSecondary.toLocaleString(undefined, { maximumFractionDigits: 2 })} {secondaryUnit}
                        </Text>
                      </Box>
                    )}
                    <Box p='12px' borderRadius='6px' bg={useColorModeValue('orange.50', 'orange.900')} border='1px solid' borderColor={useColorModeValue('orange.200', 'orange.700')}>
                      <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Total Stock Value</Text>
                      <Text fontSize='lg' fontWeight='bold' color={useColorModeValue('orange.600', 'orange.300')}>
                        PKR {totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </Box>
                    <Box p='12px' borderRadius='6px' bg={useColorModeValue('green.50', 'green.900')} border='1px solid' borderColor={useColorModeValue('green.200', 'green.700')}>
                      <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Total Sales Revenue</Text>
                      <Text fontSize='lg' fontWeight='bold' color={useColorModeValue('green.600', 'green.300')}>
                        PKR {totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Main Content Grid: Image + Pricing */}
              <SimpleGrid columns={{ base: 1, lg: 12 }} spacing='20px'>
                {/* Image - Compact */}
                <Card gridColumn={{ lg: '4 span' }}>
                  <CardBody p='16px'>
                    <Box 
                      w='100%' 
                      h='200px' 
                      borderRadius='8px' 
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

                {/* Pricing - Horizontal Layout */}
                <VStack align='stretch' spacing='20px' gridColumn={{ lg: '8 span' }}>
                  <Card>
                    <CardHeader pb='10px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                      <Text fontSize='sm' fontWeight='semibold' color={textColor}>Pricing</Text>
                    </CardHeader>
                    <CardBody pt='12px' pb='16px' px='16px'>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing='12px'>
                        <Box p='12px' borderRadius='6px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Last Purchase Price</Text>
                          <Text fontSize='lg' fontWeight='bold' color={textColor}>PKR {cost.toFixed(2)}</Text>
                        </Box>
                        <Box p='12px' borderRadius='6px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Selling Price</Text>
                          <Text fontSize='lg' fontWeight='bold' color={textColor}>PKR {price.toFixed(2)}</Text>
                        </Box>
                        <Box p='12px' borderRadius='6px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Profit Margin</Text>
                          <HStack justify='space-between' align='baseline' spacing='8px'>
                            <Text fontSize='lg' fontWeight='bold' color={textColor}>PKR {profit.toFixed(2)}</Text>
                            <Badge colorScheme='gray' fontSize='xs' px='6px' py='1px' variant='subtle'>{profitPct}%</Badge>
                          </HStack>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader pb='10px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                      <Text fontSize='sm' fontWeight='semibold' color={textColor}>Price Range Snapshot</Text>
                    </CardHeader>
                    <CardBody pt='12px' pb='16px' px='16px'>
                      <SimpleGrid columns={{ base: 1, md: highestPrice != null && lowestPrice != null ? 3 : 2 }} spacing='12px'>
                        <Box p='12px' borderRadius='6px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Highest Purchase Price</Text>
                          <Text fontSize='lg' fontWeight='bold' color={textColor}>{highestPrice != null ? `PKR ${highestPrice.toFixed(2)}` : 'N/A'}</Text>
                        </Box>
                        <Box p='12px' borderRadius='6px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Lowest Purchase Price</Text>
                          <Text fontSize='lg' fontWeight='bold' color={textColor}>{lowestPrice != null ? `PKR ${lowestPrice.toFixed(2)}` : 'N/A'}</Text>
                        </Box>
                        {highestPrice != null && lowestPrice != null && (
                          <Box p='12px' borderRadius='6px' bg={useColorModeValue('gray.50', 'gray.800')} border='1px solid' borderColor={useColorModeValue('gray.200', 'gray.700')}>
                            <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Price Range</Text>
                            <Text fontSize='md' fontWeight='bold' color={textColor} mb='2px'>
                              PKR {lowestPrice.toFixed(2)} - PKR {highestPrice.toFixed(2)}
                            </Text>
                            {highestPrice > lowestPrice && (
                              <Text fontSize='xs' color='gray.500'>
                                Variation: {((highestPrice - lowestPrice) / lowestPrice * 100).toFixed(1)}%
                              </Text>
                            )}
                          </Box>
                        )}
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </VStack>
              </SimpleGrid>

              {/* Bottom Row: Supplier, Units, Details - Horizontal */}
              <SimpleGrid columns={{ base: 1, md: supplier ? 3 : 2 }} spacing='20px'>
                {supplier && (
                  <Card>
                    <CardHeader pb='10px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                      <Text fontSize='sm' fontWeight='semibold' color={textColor}>Supplier</Text>
                    </CardHeader>
                    <CardBody pt='12px' pb='16px' px='16px'>
                      <VStack align='stretch' spacing='10px'>
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Name</Text>
                          <Text fontSize='sm' fontWeight='semibold' color={textColor}>{supplier.name}</Text>
                        </Box>
                        {supplier.phone && (
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Phone</Text>
                            <Text fontSize='sm' color={textColor}>{supplier.phone}</Text>
                          </Box>
                        )}
                        {supplier.address && (
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Address</Text>
                            <Text fontSize='sm' color={textColor} noOfLines={2}>{supplier.address}</Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                <Card>
                  <CardHeader pb='10px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                    <Text fontSize='sm' fontWeight='semibold' color={textColor}>Units</Text>
                  </CardHeader>
                  <CardBody pt='12px' pb='16px' px='16px'>
                    <VStack align='stretch' spacing='10px'>
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Primary Unit</Text>
                        <Text fontSize='sm' fontWeight='semibold' color={textColor}>{primaryUnit || '-'}</Text>
                      </Box>
                      {secondaryUnit && (
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Secondary Unit</Text>
                          <Text fontSize='sm' fontWeight='semibold' color={textColor}>{secondaryUnit}</Text>
                        </Box>
                      )}
                      {conversion && (
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Conversion</Text>
                          <Text fontSize='sm' fontWeight='semibold' color={textColor}>1 {primaryUnit} = {conversion} {secondaryUnit}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader pb='10px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                    <Text fontSize='sm' fontWeight='semibold' color={textColor}>Details</Text>
                  </CardHeader>
                  <CardBody pt='12px' pb='16px' px='16px'>
                    <VStack align='stretch' spacing='10px'>
                      {item.category && (
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Category</Text>
                          <Text fontSize='sm' fontWeight='semibold' color={textColor}>
                            {item.category?.name || item.category_name || 'N/A'}
                          </Text>
                        </Box>
                      )}
                      {item.description && (
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium' textTransform='uppercase' letterSpacing='0.5px'>Description</Text>
                          <Text fontSize='sm' color='gray.600' lineHeight='1.4' noOfLines={3}>{item.description}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </TabPanel>
          <TabPanel px={0}>
            <VStack spacing='24px' align='stretch'>
              <Card>
                <CardHeader borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                  <Flex direction={{ base: 'column', md: 'row' }} gap='16px' justify='space-between'>
                    <Box flex='1'>
                      <Text fontSize='md' fontWeight='semibold' color={textColor}>Price History</Text>
                      <Text fontSize='sm' color='gray.500'>Track how purchase and selling prices evolved for this SKU.</Text>
                    </Box>
                    <VStack flex='2' spacing='8px' align='stretch'>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing='12px' w='100%'>
                        <Input
                          type='date'
                          size='md'
                          value={historyStart}
                          onChange={(e) => setHistoryStart(e.target.value)}
                        />
                        <Input
                          type='date'
                          size='md'
                          value={historyEnd}
                          onChange={(e) => setHistoryEnd(e.target.value)}
                        />
                        <Select
                          size='md'
                          value={historyRange}
                          onChange={(e) => handleRangeChange(e.target.value)}
                        >
                          <option value='30'>Last 30 days</option>
                          <option value='60'>Last 60 days</option>
                          <option value='90'>Last 90 days</option>
                          <option value='180'>Last 6 months</option>
                          <option value='365'>Last 12 months</option>
                          <option value='all'>All time</option>
                          <option value='custom'>Custom (use dates)</option>
                        </Select>
                        <Flex gap='8px'>
                          <Input
                            placeholder='Search invoice number'
                            value={invoiceQuery}
                            onChange={(e) => setInvoiceQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleInvoiceSearch(); }}
                            size='md'
                            height='40px'
                            flex='1'
                          />
                          <Button
                            colorScheme='orange'
                            px='24px'
                            height='40px'
                            onClick={handleInvoiceSearch}
                          >
                            Find
                          </Button>
                        </Flex>
                      </SimpleGrid>
                      <HStack justify='flex-end' spacing='8px'>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={handleResetHistoryFilters}
                          isDisabled={historyLoading}
                        >
                          Reset
                        </Button>
                        <Button
                          size='sm'
                          colorScheme='orange'
                          onClick={handleApplyHistoryFilters}
                          isLoading={historyLoading}
                        >
                          Apply
                        </Button>
                      </HStack>
                    </VStack>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing='16px'>
                    <Box p='16px' borderRadius='12px' bg={useColorModeValue('orange.50', 'whiteAlpha.100')} border='1px solid' borderColor={useColorModeValue('orange.100', 'whiteAlpha.200')}>
                      <Text fontSize='xs' color='gray.500' textTransform='uppercase'>Avg. Purchase</Text>
                      <Text fontSize='xl' fontWeight='bold' color={textColor}>PKR {Number(priceSummary.avgPurchase || 0).toFixed(2)}</Text>
                    </Box>
                    <Box p='16px' borderRadius='12px' bg={useColorModeValue('orange.50', 'whiteAlpha.100')} border='1px solid' borderColor={useColorModeValue('orange.100', 'whiteAlpha.200')}>
                      <Text fontSize='xs' color='gray.500' textTransform='uppercase'>Avg. Selling</Text>
                      <Text fontSize='xl' fontWeight='bold' color={textColor}>PKR {Number(priceSummary.avgSelling || 0).toFixed(2)}</Text>
                    </Box>
                    <Box p='16px' borderRadius='12px' bg={useColorModeValue('green.50', 'whiteAlpha.100')} border='1px solid' borderColor={useColorModeValue('green.100', 'whiteAlpha.200')}>
                      <Text fontSize='xs' color='gray.500' textTransform='uppercase'>Best Margin</Text>
                      <Text fontSize='xl' fontWeight='bold' color='green.500'>PKR {Number(priceSummary.bestMargin || 0).toFixed(2)}</Text>
                    </Box>
                    <Box p='16px' borderRadius='12px' bg={useColorModeValue('red.50', 'whiteAlpha.100')} border='1px solid' borderColor={useColorModeValue('red.100', 'whiteAlpha.200')}>
                      <Text fontSize='xs' color='gray.500' textTransform='uppercase'>Lowest Margin</Text>
                      <Text fontSize='xl' fontWeight='bold' color='red.500'>PKR {Number(priceSummary.lowestMargin || 0).toFixed(2)}</Text>
                    </Box>
                  </SimpleGrid>
                  {historyError && (
                    <Alert status='error' variant='subtle' mt='4'>
                      <AlertIcon />
                      <Text fontSize='sm'>{historyError}</Text>
                    </Alert>
                  )}
                  {(invoiceError || invoiceResult) && (
                    <Box mt='6'>
                      {invoiceError && (
                        <Text color='red.500' fontSize='sm'>{invoiceError}</Text>
                      )}
                      {invoiceResult && (
                        <Box
                          mt='3'
                          border='1px solid'
                          borderColor={useColorModeValue('orange.200', 'whiteAlpha.300')}
                          borderRadius='12px'
                          p='16px'
                          bg={useColorModeValue('orange.50', 'whiteAlpha.100')}
                        >
                          <HStack justify='space-between' align='baseline' flexWrap='wrap' mb='12px'>
                            <HStack spacing='8px'>
                              <Text fontWeight='bold' color={textColor}>{invoiceResult.invoiceNumber || 'Invoice'}</Text>
                              {invoiceResult.invoiceNumber && (
                                <IconButton
                                  icon={<DownloadIcon />}
                                  size='sm'
                                  variant='outline'
                                  colorScheme='orange'
                                  onClick={() => handleDownloadInvoice(invoiceResult.invoiceNumber, invoiceResult.invoiceId)}
                                  isLoading={downloadingInvoiceNumbers.has(invoiceResult.invoiceNumber)}
                                  aria-label='Download invoice'
                                />
                              )}
                            </HStack>
                            <Text fontSize='sm' color='gray.500'>
                              {invoiceResult.date ? new Date(invoiceResult.date).toLocaleDateString() : 'Not recorded'}
                            </Text>
                          </HStack>
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing='12px' mt='10px'>
                            <Box>
                              <Text fontSize='xs' color='gray.500'>Purchase</Text>
                              <Text fontWeight='semibold' color={textColor}>PKR {invoiceResult.purchase.toFixed(2)}</Text>
                            </Box>
                            <Box>
                              <Text fontSize='xs' color='gray.500'>Selling</Text>
                              <Text fontWeight='semibold' color={textColor}>PKR {invoiceResult.selling.toFixed(2)}</Text>
                            </Box>
                            <Box>
                              <Text fontSize='xs' color='gray.500'>Margin</Text>
                              <Text fontWeight='semibold' color={invoiceResult.margin >= 0 ? 'green.500' : 'red.500'}>
                                PKR {invoiceResult.margin.toFixed(2)}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize='xs' color='gray.500'>Margin %</Text>
                              <Text fontWeight='semibold' color={invoiceResult.margin >= 0 ? 'green.500' : 'red.500'}>
                                {invoiceResult.marginPct}%
                              </Text>
                            </Box>
                          </SimpleGrid>
                          {invoiceResult.note && (
                            <Text fontSize='sm' color='gray.600' mt='3'>{invoiceResult.note}</Text>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader borderBottom='1px solid' borderColor={useColorModeValue('gray.200', 'gray.600')}>
                  <Text fontSize='md' fontWeight='semibold' color={textColor}>Timeline</Text>
                </CardHeader>
                <CardBody>
                  {historyLoading ? (
                    <Flex align='center' justify='center' minH='200px'>
                      <Spinner color='#FF8D28' />
                    </Flex>
                  ) : priceHistoryEntries.length ? (
                    <VStack spacing='20px' align='stretch'>
                      {priceHistoryEntries.map((entry) => (
                        <SimpleGrid
                          key={entry.id}
                          columns={{ base: 1, md: 5 }}
                          spacing='12px'
                          border='1px solid'
                          borderColor={useColorModeValue('gray.200', 'gray.700')}
                          borderRadius='14px'
                          p='20px'
                          alignItems='center'
                        >
                          <Box>
                            <HStack spacing='8px' align='center'>
                              <Text fontWeight='bold' color={textColor}>{entry.label}</Text>
                              {entry.invoiceNumber && (
                                <IconButton
                                  icon={<DownloadIcon />}
                                  size='xs'
                                  variant='outline'
                                  colorScheme='orange'
                                  onClick={() => handleDownloadInvoice(entry.invoiceNumber, entry.invoiceId)}
                                  isLoading={downloadingInvoiceNumbers.has(entry.invoiceNumber)}
                                  aria-label='Download invoice'
                                />
                              )}
                            </HStack>
                            {entry.invoiceNumber && (
                              <Text fontSize='xs' color='gray.500'>#{entry.invoiceNumber}</Text>
                            )}
                            <Text fontSize='sm' color='gray.500'>
                              {entry.date ? new Date(entry.date).toLocaleDateString() : 'Not recorded'}
                            </Text>
                            {entry.note && <Text fontSize='sm' color='gray.600' mt='4px'>{entry.note}</Text>}
                          </Box>
                          <Box>
                            <Text fontSize='xs' color='gray.500'>Purchase</Text>
                            <Text fontWeight='semibold' color={textColor}>PKR {entry.purchase.toFixed(2)}</Text>
                          </Box>
                          <Box>
                            <Text fontSize='xs' color='gray.500'>Selling</Text>
                            <Text fontWeight='semibold' color={textColor}>PKR {entry.selling.toFixed(2)}</Text>
                          </Box>
                          <Box>
                            <Text fontSize='xs' color='gray.500'>Margin</Text>
                            <Text fontWeight='semibold' color={entry.margin >= 0 ? 'green.500' : 'red.500'}>
                              PKR {entry.margin.toFixed(2)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize='xs' color='gray.500'>Margin %</Text>
                            <Text fontWeight='semibold' color={entry.margin >= 0 ? 'green.500' : 'red.500'}>
                              {entry.marginPct}%
                            </Text>
                          </Box>
                        </SimpleGrid>
                      ))}
                    </VStack>
                  ) : (
                    <Box textAlign='center' py='24px'>
                      <Text color='gray.500'>No price history entries yet.</Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}


