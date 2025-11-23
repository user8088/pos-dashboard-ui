import React from 'react';
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  IconButton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Avatar,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputLeftElement,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Textarea,
  Tooltip,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react';
import { DownloadIcon, PhoneIcon, EditIcon, ChevronDownIcon, SearchIcon, CheckIcon, WarningIcon, RepeatIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { useParams, useHistory } from 'react-router-dom';
import { customerService } from 'services/customerService';
import { invoiceService } from 'services/invoiceService';

export default function CustomerProfile() {
  const { id } = useParams();
  const history = useHistory();
  const textColor = useColorModeValue('gray.700','white');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const itemBg = useColorModeValue('white', 'gray.800');
  const itemBorder = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const refundItemBg = useColorModeValue('gray.50', 'gray.800');
  const refundSummaryBg = useColorModeValue('orange.50', 'whiteAlpha.100');
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  const [invoices, setInvoices] = React.useState([]);
  const [downloadingIds, setDownloadingIds] = React.useState(new Set());
  const [statementLoading, setStatementLoading] = React.useState(false);
  const [paymentPeriod, setPaymentPeriod] = React.useState('12');
  const [paymentOrder, setPaymentOrder] = React.useState('LIFO'); // FIFO or LIFO
  const [invoiceSearch, setInvoiceSearch] = React.useState('');
  const [paymentSearch, setPaymentSearch] = React.useState('');
  const toast = useToast();
  const mountedRef = React.useRef(true);
  const brandColor = '#FF8D28';
  const { isOpen: refundDrawerOpen, onOpen: onRefundOpen, onClose: onRefundClose } = useDisclosure();
  const [refundContext, setRefundContext] = React.useState(null);
  const [refundQuantities, setRefundQuantities] = React.useState({});
  const setRefundQuantityValue = React.useCallback((lineId, value) => {
    setRefundQuantities((prev) => ({
      ...prev,
      [lineId]: value,
    }));
  }, []);
  const [refundNote, setRefundNote] = React.useState('');
  const [refundDate, setRefundDate] = React.useState(() => new Date().toISOString().slice(0, 16));
  const [submittingRefund, setSubmittingRefund] = React.useState(false);
  const [refundError, setRefundError] = React.useState(null);
  const [refundLoadingInvoiceId, setRefundLoadingInvoiceId] = React.useState(null);

  const refreshProfile = React.useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const resp = await customerService.profile(id);
      const d = resp?.data || resp;
      if (mountedRef.current) setData(d);
      try {
        const inv = await invoiceService.listInvoices({ per_page: 100 });
        const list = inv?.data?.data || inv?.data || inv || [];
        if (mountedRef.current) {
          setInvoices(list.filter((x) => String(x.customer_id) === String(id)));
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load invoices', error);
        }
      }
    } finally {
      if (!silent && mountedRef.current) setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    mountedRef.current = true;
    refreshProfile();
    return () => {
      mountedRef.current = false;
    };
  }, [refreshProfile]);

  // Calculate total spent from all invoices
  const totalSpent = React.useMemo(() => {
    if (!data?.invoices && invoices.length === 0) return 0;
    const invoiceList = data?.invoices || invoices;
    return invoiceList.reduce((sum, inv) => {
      return sum + Number(inv.total || inv.total_amount || 0);
    }, 0);
  }, [data, invoices]);

  // Calculate payment breakdown by month
  const paymentHistory = React.useMemo(() => {
    const invoiceList = data?.invoices || invoices;
    const history = {};
    invoiceList.forEach(inv => {
      if (!inv.created_at) return;
      const date = new Date(inv.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!history[monthKey]) {
        history[monthKey] = { total: 0, count: 0, paid: 0 };
      }
      history[monthKey].total += Number(inv.total || inv.total_amount || 0);
      history[monthKey].paid += Number(inv.paid_amount || 0);
      history[monthKey].count += 1;
    });
    return history;
  }, [data, invoices]);

  // Get payment history for selected period
  const filteredPaymentHistory = React.useMemo(() => {
    const months = Object.keys(paymentHistory).sort().reverse();
    const period = parseInt(paymentPeriod);
    return months.slice(0, period).map(month => ({
      month,
      ...paymentHistory[month],
    }));
  }, [paymentHistory, paymentPeriod]);

  // Get filtered invoices for selected period with detailed breakdown
  const filteredInvoicesWithBreakdown = React.useMemo(() => {
    const invoiceList = data?.invoices || invoices;
    if (!invoiceList || invoiceList.length === 0) return [];
    
    const period = parseInt(paymentPeriod);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - period);
    
    const filtered = invoiceList
      .filter(inv => {
        if (!inv.created_at) return false;
        const invDate = new Date(inv.created_at);
        return invDate >= cutoffDate;
      });
    
    // Sort based on FIFO/LIFO selection
    const sorted = paymentOrder === 'FIFO'
      ? [...filtered].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)) // Oldest first
      : [...filtered].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); // Newest first
    
    return sorted
      .map(inv => {
        const total = Number(inv.total || inv.total_amount || 0);
        const paid = Number(inv.paid_amount || 0);
        const due = Number(inv.due_amount || 0);
        let advanceApplied = Number(inv.advance_amount || inv.advance_applied || 0);
        if (advanceApplied === 0 && inv.payment_as === 'advance' && paid > 0) {
          advanceApplied = paid;
        }
        
        // Determine payment method
        const paymentMethod = inv.payment_method || inv.payment_mode || 'N/A';
        const paymentBreakdown = inv.payment_breakdown || [];
        
        return {
          ...inv,
          total,
          paid,
          due,
          advanceApplied,
          paymentMethod,
          paymentBreakdown,
          date: inv.created_at,
        };
      });
  }, [data, invoices, paymentPeriod, paymentOrder]);

  const handleDownload = async (invoiceId) => {
    if (downloadingIds.has(invoiceId)) return;
    
    try {
      setDownloadingIds(prev => new Set(prev).add(invoiceId));
      await invoiceService.downloadInvoice(invoiceId);
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
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  };

  // Calculate invoice list (before early returns to use in hooks)
  const invoiceList = React.useMemo(() => {
    return data?.invoices || invoices || [];
  }, [data, invoices]);

  const buildItemsFromInvoice = React.useCallback((invoiceDetail = {}, { onlyRemaining = false } = {}) => {
    const rawItems = invoiceDetail.items || invoiceDetail.invoice_items || [];
    return rawItems
      .map((item) => {
        if (!item) return null;
        const stockInfo = item.stock_item || item.product || {};
        const soldQuantity = Number(item.quantity ?? item.qty ?? 0);
        if (soldQuantity <= 0) return null;
        const refundedQuantity = Number(item.refunded_quantity ?? item.refunded_qty ?? item.returned_quantity ?? 0);
        const invoiceItemId = item.invoice_item_id ?? item.id ?? item.sale_item_id ?? item.pivot?.id;
        if (!invoiceItemId) return null;
        const remaining = Math.max(0, soldQuantity - refundedQuantity);
        return {
          invoiceItemId,
          name: item.name || stockInfo.name || `Item #${invoiceItemId}`,
          quantity: soldQuantity,
          refunded: refundedQuantity,
          remaining,
          unitPrice: Number(item.unit_price ?? item.price ?? 0),
          sku: stockInfo.serial_id || stockInfo.sku || item.stock_item_id || '',
          unitLabel:
            stockInfo.primary_unit?.symbol ||
            stockInfo.primary_unit?.name ||
            item.unit ||
            '',
          unitType:
            item.unit_type ||
            item.unitType ||
            (item.unit && item.unit.toLowerCase().includes('secondary') ? 'secondary' : 'primary'),
        };
      })
      .filter((item) => item && (!onlyRemaining || item.remaining > 0));
  }, []);

  const invoiceItemsByInvoiceId = React.useMemo(() => {
    const map = {};
    (invoiceList || []).forEach((inv) => {
      if (!inv || !inv.id) return;
      const items = buildItemsFromInvoice(inv, { onlyRemaining: true });
      if (items.length > 0) {
        map[String(inv.id)] = items;
      }
    });
    return map;
  }, [invoiceList, buildItemsFromInvoice]);

  const fetchInvoiceDetail = React.useCallback(async (invoiceId) => {
    const resp = await invoiceService.getInvoice(invoiceId);
    return resp?.data || resp;
  }, []);

  const handleStartRefund = React.useCallback(async (invoice) => {
    setRefundLoadingInvoiceId(invoice?.id || null);
    try {
      const invoiceKey = invoice?.id ? String(invoice.id) : null;
      let items = invoiceKey ? invoiceItemsByInvoiceId[invoiceKey] || [] : [];

      if ((!items || items.length === 0) && invoice?.id) {
        try {
          const invoiceDetail = await fetchInvoiceDetail(invoice.id);
          items = buildItemsFromInvoice(invoiceDetail, { onlyRemaining: true });
          if (items.length === 0 && invoiceDetail) {
            const fallbackItems = buildItemsFromInvoice(invoiceDetail);
            if (fallbackItems.length === 0) {
              items = [];
            }
          }
        } catch (error) {
          console.warn('Failed to load invoice detail for refund', error);
        }
      }

      if (!items || items.length === 0) {
        toast({
          title: 'Nothing left to refund',
          description: 'Could not find refundable items on this invoice.',
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const initialQuantities = items.reduce((acc, item) => {
        acc[item.invoiceItemId] = '';
        return acc;
      }, {});
      setRefundContext({ invoice, items });
      setRefundQuantities(initialQuantities);
      setRefundNote('');
      setRefundDate(new Date().toISOString().slice(0, 16));
      setRefundError(null);
      onRefundOpen();
    } finally {
      setRefundLoadingInvoiceId(null);
    }
  }, [invoiceItemsByInvoiceId, fetchInvoiceDetail, buildItemsFromInvoice, onRefundOpen, toast]);

  const handleCloseRefundDrawer = React.useCallback(() => {
    onRefundClose();
    setRefundContext(null);
    setRefundQuantities({});
    setRefundNote('');
    setRefundDate(new Date().toISOString().slice(0, 16));
    setRefundError(null);
  }, [onRefundClose]);

  const selectedRefundItems = React.useMemo(() => {
    if (!refundContext) return [];
    return refundContext.items
      .map((item) => {
        const value = refundQuantities[item.invoiceItemId];
        if (value === '' || value === undefined || value === null) return null;
        const quantity = Number(value);
        if (!Number.isFinite(quantity) || quantity <= 0) return null;
        return {
          invoice_item_id: item.invoiceItemId,
          quantity: Math.min(quantity, item.remaining),
          unitPrice: item.unitPrice || 0,
          unitType: item.unitType || undefined,
        };
      })
      .filter(Boolean);
  }, [refundContext, refundQuantities]);

  const refundTotal = React.useMemo(() => {
    return selectedRefundItems.reduce((sum, line) => {
      return sum + Number(line.quantity || 0) * Number(line.unitPrice || 0);
    }, 0);
  }, [selectedRefundItems]);

  const handleSubmitRefund = React.useCallback(async () => {
    if (!refundContext) return;
    if (selectedRefundItems.length === 0) {
      toast({
        title: 'Select items to refund',
        description: 'Enter a quantity for at least one item before continuing.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    const invoiceId = refundContext.invoice?.id ?? refundContext.invoice?.invoice_id;
    if (!invoiceId) {
      setRefundError('Missing invoice reference for this refund.');
      return;
    }
    setSubmittingRefund(true);
    setRefundError(null);
    try {
      const parsedDate = refundDate ? new Date(refundDate) : null;
      const refundDateIso = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : undefined;
      const payload = {
        items: selectedRefundItems.map((item) => ({
          invoice_item_id: item.invoice_item_id,
          quantity: item.quantity,
          ...(item.unitType ? { unit_type: item.unitType } : {}),
        })),
        note: refundNote?.trim() ? refundNote.trim() : undefined,
        refund_date: refundDateIso,
      };
      await invoiceService.refundInvoice(invoiceId, payload);
      toast({
        title: 'Refund created',
        description: 'Stock and balances have been updated.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      handleCloseRefundDrawer();
      await refreshProfile({ silent: true });
    } catch (error) {
      const message = error?.message || 'Failed to process refund';
      setRefundError(message);
      toast({
        title: 'Refund failed',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmittingRefund(false);
    }
  }, [
    refundContext,
    refundDate,
    refundNote,
    selectedRefundItems,
    toast,
    handleCloseRefundDrawer,
    refreshProfile,
  ]);

  // Filter invoices based on search query
  const filteredInvoices = React.useMemo(() => {
    if (!invoiceSearch.trim()) return invoiceList;
    const searchLower = invoiceSearch.toLowerCase().trim();
    return invoiceList.filter(inv => {
      const invNumber = (inv.invoice_number || `#${inv.id}`).toLowerCase();
      const total = String(inv.total || inv.total_amount || 0);
      const date = inv.created_at ? new Date(inv.created_at).toLocaleDateString().toLowerCase() : '';
      return invNumber.includes(searchLower) || 
             total.includes(searchLower) || 
             date.includes(searchLower);
    });
  }, [invoiceList, invoiceSearch]);

  // Filter invoices for payments tab
  const filteredPayments = React.useMemo(() => {
    if (!paymentSearch.trim()) return invoiceList;
    const searchLower = paymentSearch.toLowerCase().trim();
    return invoiceList.filter(inv => {
      const invNumber = (inv.invoice_number || `#${inv.id}`).toLowerCase();
      const total = String(inv.total || inv.total_amount || 0);
      const paid = String(inv.paid_amount || 0);
      const due = String(inv.due_amount || 0);
      const date = inv.created_at ? new Date(inv.created_at).toLocaleDateString().toLowerCase() : '';
      return invNumber.includes(searchLower) || 
             total.includes(searchLower) || 
             paid.includes(searchLower) ||
             due.includes(searchLower) ||
             date.includes(searchLower);
    });
  }, [invoiceList, paymentSearch]);

  const generateEStatement = async (month = null) => {
    setStatementLoading(true);
    try {
      let filteredInvoices = invoiceList;
      
      if (month) {
        filteredInvoices = invoiceList.filter(inv => {
          if (!inv.created_at) return false;
          const date = new Date(inv.created_at);
          const invMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return invMonth === month;
        });
      }

      // Create HTML content for statement
      const statementHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>E-Statement - ${data.name || 'Customer'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .customer-info { margin-bottom: 20px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #f5f5f5; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            .total { font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-Statement</h1>
            <h2>${month ? `Month: ${month}` : 'All Time'}</h2>
          </div>
          <div class="customer-info">
            <p><strong>Customer:</strong> ${data.name || 'N/A'}</p>
            <p><strong>Customer ID:</strong> ${data.serial_id || id}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
            ${data.address ? `<p><strong>Address:</strong> ${data.address}</p>` : ''}
          </div>
          <div class="summary">
            <div><strong>Total Invoices:</strong> ${filteredInvoices.length}</div>
            <div><strong>Total Spent:</strong> PKR ${filteredInvoices.reduce((sum, inv) => sum + Number(inv.total || inv.total_amount || 0), 0).toFixed(2)}</div>
            <div><strong>Total Paid:</strong> PKR ${filteredInvoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0).toFixed(2)}</div>
            <div><strong>Total Due:</strong> PKR ${filteredInvoices.reduce((sum, inv) => sum + Number(inv.due_amount || 0), 0).toFixed(2)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInvoices.map(inv => {
                const total = Number(inv.total || inv.total_amount || 0);
                const paid = Number(inv.paid_amount || 0);
                const due = Number(inv.due_amount || 0);
                const status = due > 0 ? 'Due' : 'Paid';
                return `
                  <tr>
                    <td>${inv.invoice_number || `#${inv.id}`}</td>
                    <td>${inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>PKR ${total.toFixed(2)}</td>
                    <td>PKR ${paid.toFixed(2)}</td>
                    <td>PKR ${due.toFixed(2)}</td>
                    <td>${status}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([statementHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement-${data.name || 'customer'}-${month || 'all'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'E-Statement generated',
        description: 'Statement downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to generate statement',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatementLoading(false);
    }
  };

  if (loading) return (<Flex align='center' justify='center' minH='240px'><Spinner /></Flex>);
  if (!data) return (<Box pt={{ base: '120px', md: '75px' }}><Button onClick={()=> history.push('/admin/customer-management')}>Back</Button><Text color={textColor} mt='4'>Customer not found.</Text></Box>);

  const due = Number(data.due_balance || 0);
  const adv = Number(data.advance_balance || 0);
  const name = data.name || `#${id}`;

  return (
    <>
    <Box pt={{ base: '120px', md: '75px' }}>
      {/* Header Section */}
      <Card mb='24px' bg={cardBg}>
        <CardBody p='24px'>
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'start', md: 'center' }} justify='space-between' mb='20px'>
            <Flex align='center' gap='20px'>
              <Avatar size='xl' name={name} bg='#FF8D28' />
              <Box>
                <HStack align='center' mb='8px'>
                  <Text fontSize='2xl' fontWeight='bold' color={textColor}>{name}</Text>
                  <Badge colorScheme={due > 0 ? 'orange' : 'green'} fontSize='sm' px='12px' py='4px' borderRadius='full'>
                    {due > 0 ? 'Has Dues' : 'In Good Standing'}
                  </Badge>
                </HStack>
                {data.serial_id && (
                  <Text fontSize='sm' color='gray.500' mb='4px'>Customer ID: {data.serial_id}</Text>
                )}
                {data.phone && (
                  <HStack fontSize='sm' color='gray.600' mb='4px'>
                    <PhoneIcon />
                    <Text>{data.phone}</Text>
                  </HStack>
                )}
                {data.address && (
                  <Text fontSize='sm' color='gray.600'>{data.address}</Text>
                )}
              </Box>
            </Flex>
            <HStack spacing='12px' mt={{ base: '16px', md: '0' }}>
              <Button
                leftIcon={<EditIcon />}
                variant='outline'
                onClick={() => history.push(`/admin/customer-management?edit=${id}`)}
              >
                Edit
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  colorScheme='blue'
                  isLoading={statementLoading}
                  loadingText='Generating...'
                >
                  Download E-Statement
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => generateEStatement(null)}>All Time</MenuItem>
                  <MenuItem onClick={() => generateEStatement(filteredPaymentHistory[0]?.month)}>
                    This Month ({filteredPaymentHistory[0]?.month || 'N/A'})
                  </MenuItem>
                  {filteredPaymentHistory.slice(0, 6).map(({ month }) => (
                    <MenuItem key={month} onClick={() => generateEStatement(month)}>
                      {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <Button variant='outline' onClick={()=> history.goBack()}>Back</Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing='16px' mb='24px'>
        <Card bg={cardBg}>
          <CardBody p='20px'>
            <Stat>
              <StatLabel color='gray.600'>Total Spent</StatLabel>
              <StatNumber fontSize='xl' color={textColor}>PKR {totalSpent.toFixed(2)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody p='20px'>
            <Stat>
              <StatLabel color='gray.600'>Due Balance</StatLabel>
              <StatNumber fontSize='xl' color={due > 0 ? 'red.500' : 'green.500'}>PKR {due.toFixed(2)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody p='20px'>
            <Stat>
              <StatLabel color='gray.600'>Advance Balance</StatLabel>
              <StatNumber fontSize='xl' color='teal.500'>PKR {adv.toFixed(2)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody p='20px'>
            <Stat>
              <StatLabel color='gray.600'>Total Invoices</StatLabel>
              <StatNumber fontSize='xl' color={textColor}>{invoiceList.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tabs */}
      <Tabs colorScheme='blue' variant='enclosed'>
        <TabList>
          <Tab>Summary</Tab>
          <Tab>Details</Tab>
          <Tab>Payments</Tab>
          <Tab>Invoices</Tab>
        </TabList>

        <TabPanels>
          {/* Summary Tab */}
          <TabPanel px={0} pt={6}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='24px'>
              {/* Payment History Card */}
              <Card bg={cardBg} w='100%' h='100%'>
                <CardHeader pb='20px'>
                  <Flex justify='space-between' align='center' w='100%' flexWrap='wrap' gap='12px'>
                    <Text fontWeight='bold' color={textColor} fontSize='lg'>Payment History</Text>
                    <HStack spacing='12px'>
                      <Select
                        size='sm'
                        value={paymentOrder}
                        onChange={(e) => setPaymentOrder(e.target.value)}
                        w='120px'
                      >
                        <option value='LIFO'>LIFO (Newest)</option>
                        <option value='FIFO'>FIFO (Oldest)</option>
                      </Select>
                      <Select
                        size='sm'
                        value={paymentPeriod}
                        onChange={(e) => setPaymentPeriod(e.target.value)}
                        w='180px'
                      >
                        <option value='3'>Last 3 months</option>
                        <option value='6'>Last 6 months</option>
                        <option value='12'>Last 12 months</option>
                        <option value='24'>Last 24 months</option>
                      </Select>
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody pt={0} px='24px' pb='24px' w='100%'>
                  <VStack align='stretch' spacing='16px' w='100%' maxH='600px' overflowY='auto'>
                    {filteredInvoicesWithBreakdown.length > 0 ? (
                      <>
                        {filteredInvoicesWithBreakdown.map((inv) => {
                          const invDate = new Date(inv.date || inv.created_at);
                          const monthKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
                          const monthLabel = invDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                          
                          return (
                            <Box 
                              key={inv.id} 
                              p='20px' 
                              bg={sectionBg} 
                              borderRadius='12px' 
                              w='100%'
                              minW='0'
                              borderLeftWidth='4px'
                              borderLeftColor={inv.due > 0 ? 'orange.400' : 'green.400'}
                            >
                              {/* Header */}
                              <HStack justify='space-between' mb='16px' w='100%' spacing='16px' flexWrap='wrap'>
                                <Box flex='1' minW='200px'>
                                  <Text fontWeight='bold' fontSize='md' color={textColor} mb='4px'>
                                    {inv.invoice_number || `Invoice #${inv.id}`}
                                  </Text>
                                  <Text fontSize='sm' color='gray.500'>
                                    {invDate.toLocaleDateString('en-US', { 
                                      month: 'long', 
                                      day: 'numeric', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Text>
                                </Box>
                                <HStack spacing='8px'>
                                  <IconButton
                                    icon={<DownloadIcon />}
                                    size='sm'
                                    variant='outline'
                                    colorScheme='orange'
                                    onClick={() => handleDownload(inv.id)}
                                    isLoading={downloadingIds.has(inv.id)}
                                    aria-label='Download invoice'
                                  />
                                  <Badge 
                                    colorScheme={inv.due > 0 ? 'orange' : 'green'} 
                                    fontSize='sm' 
                                    px='12px' 
                                    py='4px'
                                    borderRadius='full'
                                  >
                                    {inv.due > 0 ? 'Due' : 'Paid'}
                                  </Badge>
                                </HStack>
                              </HStack>

                              {/* Payment Breakdown */}
                              <VStack align='stretch' spacing='12px' w='100%'>
                                <SimpleGrid columns={{ base: 2, md: 4 }} spacing='12px' w='100%'>
                                  <Box>
                                    <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium'>Total Amount</Text>
                                    <Text fontWeight='bold' fontSize='md' color={textColor}>
                                      PKR {inv.total.toFixed(2)}
                                    </Text>
                                    {inv.hidden_costs > 0 && (
                                      <Text fontSize='xs' color='orange.500' fontWeight='medium' mt='2px'>
                                        + PKR {Number(inv.hidden_costs || 0).toFixed(2)} hidden
                                      </Text>
                                    )}
                                  </Box>
                                  <Box>
                                    <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium'>Paid Amount</Text>
                                    <Text fontWeight='semibold' fontSize='md' color='green.500'>
                                      PKR {inv.paid.toFixed(2)}
                                    </Text>
                                  </Box>
                                  {inv.advanceApplied > 0 && (
                                    <Box>
                                      <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium'>Advance Applied</Text>
                                      <Text fontWeight='semibold' fontSize='md' color='teal.500'>
                                        PKR {inv.advanceApplied.toFixed(2)}
                                      </Text>
                                    </Box>
                                  )}
                                  <Box>
                                    <Text fontSize='xs' color='gray.500' mb='4px' fontWeight='medium'>Due Amount</Text>
                                    <Text fontWeight='semibold' fontSize='md' color={inv.due > 0 ? 'orange.500' : 'green.500'}>
                                      PKR {inv.due.toFixed(2)}
                                    </Text>
                                  </Box>
                                </SimpleGrid>

                                {/* Payment Method Details */}
                                <Box pt='12px' borderTopWidth='1px' borderColor={itemBorder}>
                                  <Text fontSize='xs' color='gray.500' mb='8px' fontWeight='medium'>Payment Method</Text>
                                  {inv.paymentBreakdown && inv.paymentBreakdown.length > 0 ? (
                                    <VStack align='stretch' spacing='6px'>
                                      {inv.paymentBreakdown.map((payment, idx) => (
                                        <HStack key={idx} justify='space-between' fontSize='sm'>
                                          <Text color={textColor} fontWeight='medium' textTransform='capitalize'>
                                            {payment.payment_method || 'N/A'}
                                          </Text>
                                          <Text color={textColor} fontWeight='semibold'>
                                            PKR {Number(payment.amount || 0).toFixed(2)}
                                          </Text>
                                        </HStack>
                                      ))}
                                    </VStack>
                                  ) : (
                                    <Text fontSize='sm' color={textColor} fontWeight='medium' textTransform='capitalize'>
                                      {inv.paymentMethod || 'N/A'}
                                    </Text>
                                  )}
                                </Box>

                                {/* Progress Bar */}
                                {inv.total > 0 && (
                                  <Box mt='8px'>
                                    <HStack justify='space-between' fontSize='xs' color='gray.600' mb='4px'>
                                      <Text>Payment Progress</Text>
                                      <Text>
                                        {(() => {
                                          const totalPaid = inv.paid + inv.advanceApplied;
                                          return ((totalPaid / inv.total) * 100).toFixed(1);
                                        })()}%
                                      </Text>
                                    </HStack>
                                    <Box h='8px' bg='gray.200' borderRadius='4px' overflow='hidden' w='100%'>
                                      <Box
                                        h='100%'
                                        bg={inv.due > 0 ? 'orange.400' : 'green.400'}
                                        w={`${Math.min(100, ((inv.paid + inv.advanceApplied) / inv.total) * 100)}%`}
                                        transition='width 0.3s'
                                        borderRadius='4px'
                                      />
                                    </Box>
                                  </Box>
                                )}
                              </VStack>
                            </Box>
                          );
                        })}
                      </>
                    ) : (
                      <Text color='gray.500' textAlign='center' py='40px' w='100%'>No payment history available</Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Quick Stats Cards */}
              <VStack spacing='16px' align='stretch' w='100%'>
                {/* In Good Standing Card */}
                <Card bg={cardBg} w='100%'>
                  <CardBody p='24px' w='100%'>
                    <HStack mb='16px' align='start'>
                      <Box
                        w='48px'
                        h='48px'
                        borderRadius='full'
                        bg={due > 0 ? 'orange.100' : 'green.100'}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        flexShrink={0}
                      >
                        {due > 0 ? (
                          <WarningIcon color='orange.500' boxSize='24px' />
                        ) : (
                          <CheckIcon color='green.500' boxSize='24px' />
                        )}
                      </Box>
                      <Box flex='1' minW='0'>
                        <Text fontWeight='bold' fontSize='lg' color={textColor} mb='4px'>
                          {due > 0 ? 'Has Outstanding Dues' : 'In Good Standing'}
                        </Text>
                        <Text fontSize='sm' color='gray.500'>
                          Last payment: {(() => {
                            if (!invoiceList || invoiceList.length === 0) return 'N/A';
                            const lastPaid = invoiceList
                              .filter(inv => {
                                const paid = Number(inv.paid_amount || 0);
                                const advance = Number(inv.advance_amount || inv.advance_applied || 0);
                                return paid > 0 || advance > 0;
                              })
                              .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
                            return lastPaid?.created_at
                              ? new Date(lastPaid.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })
                              : 'N/A';
                          })()}
                        </Text>
                      </Box>
                    </HStack>
                    {due > 0 && (
                      <Text fontSize='md' color='orange.600' fontWeight='semibold'>
                        Amount Due: PKR {due.toFixed(2)}
                      </Text>
                    )}
                  </CardBody>
                </Card>

                {/* Customer Details Card */}
                <Card bg={cardBg} w='100%'>
                  <CardHeader pb='16px'>
                    <Text fontWeight='bold' color={textColor} fontSize='lg'>Customer Information</Text>
                  </CardHeader>
                  <CardBody pt={0} px='24px' pb='24px' w='100%'>
                    <VStack align='stretch' spacing='16px' w='100%'>
                      {data.serial_id && (
                        <Box w='100%'>
                          <Text fontSize='sm' color='gray.500' mb='6px' fontWeight='medium'>Customer ID</Text>
                          <Text fontWeight='semibold' fontSize='md' color={textColor}>{data.serial_id}</Text>
                        </Box>
                      )}
                      {data.phone && (
                        <>
                          <Divider />
                          <Box w='100%'>
                            <Text fontSize='sm' color='gray.500' mb='6px' fontWeight='medium'>Phone Number</Text>
                            <Text fontWeight='semibold' fontSize='md' color={textColor}>{data.phone}</Text>
                          </Box>
                        </>
                      )}
                      {data.address && (
                        <>
                          <Divider />
                          <Box w='100%'>
                            <Text fontSize='sm' color='gray.500' mb='6px' fontWeight='medium'>Address</Text>
                            <Text fontWeight='semibold' fontSize='md' color={textColor}>{data.address}</Text>
                          </Box>
                        </>
                      )}
                      {(data.rating_average || data.rating_count) && (
                        <>
                          <Divider />
                          <Box w='100%'>
                            <Text fontSize='sm' color='gray.500' mb='6px' fontWeight='medium'>Rating</Text>
                            <Text fontWeight='semibold' fontSize='md' color={textColor}>
                              {(data.rating_average || 0).toFixed(1)} ⭐ ({data.rating_count || 0} reviews)
                            </Text>
                          </Box>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </SimpleGrid>
          </TabPanel>

          {/* Details Tab */}
          <TabPanel px={0} pt={6}>
            <Card bg={cardBg}>
              <CardHeader>
                <Text fontWeight='bold' color={textColor} fontSize='lg'>Customer Details</Text>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing='24px'>
                  <VStack align='stretch' spacing='16px'>
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb='4px'>Customer Name</Text>
                      <Text fontWeight='semibold' fontSize='md' color={textColor}>{name}</Text>
                    </Box>
                    {data.serial_id && (
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb='4px'>Customer ID</Text>
                        <Text fontWeight='medium' color={textColor}>{data.serial_id}</Text>
                      </Box>
                    )}
                    {data.phone && (
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb='4px'>Phone Number</Text>
                        <Text fontWeight='medium' color={textColor}>{data.phone}</Text>
                      </Box>
                    )}
                  </VStack>
                  <VStack align='stretch' spacing='16px'>
                    {data.address && (
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb='4px'>Address</Text>
                        <Text fontWeight='medium' color={textColor}>{data.address}</Text>
                      </Box>
                    )}
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb='4px'>Total Spent</Text>
                      <Text fontWeight='bold' fontSize='lg' color={textColor}>PKR {totalSpent.toFixed(2)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb='4px'>Total Invoices</Text>
                      <Text fontWeight='medium' color={textColor}>{invoiceList.length}</Text>
                    </Box>
                  </VStack>
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Payments Tab */}
          <TabPanel px={0} pt={6}>
            <Box mb='16px'>
              <InputGroup maxW='400px'>
                <InputLeftElement pointerEvents='none'>
                  <SearchIcon color='gray.400' />
                </InputLeftElement>
                <Input
                  placeholder='Search invoices...'
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  size='md'
                />
              </InputGroup>
            </Box>
            <Card bg={cardBg}>
              <CardHeader>
                <Text fontWeight='bold' color={textColor} fontSize='lg'>Payment Breakdown</Text>
              </CardHeader>
              <CardBody>
                <Table variant='simple'>
                  <Thead>
                    <Tr>
                      <Th>Invoice #</Th>
                      <Th>Date</Th>
                      <Th>Total Amount</Th>
                      <Th>Paid Amount</Th>
                      <Th>Advance Applied</Th>
                      <Th>Due Amount</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((inv) => {
                        const total = Number(inv.total || inv.total_amount || 0);
                        const paid = Number(inv.paid_amount || 0);
                        const due = Number(inv.due_amount || 0);
                        const hiddenCosts = Number(inv.hidden_costs || 0);
                        const status = due > 0 ? 'Due' : 'Paid';
                        let advanceApplied = Number(inv.advance_amount || inv.advance_applied || 0);
                        if (advanceApplied === 0 && inv.payment_as === 'advance' && paid > 0) {
                          advanceApplied = paid;
                        }
                        return (
                          <Tr key={inv.id}>
                            <Td fontWeight='medium'>{inv.invoice_number || `#${inv.id}`}</Td>
                            <Td>{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}</Td>
                            <Td>
                              <VStack align='flex-start' spacing='2px'>
                                <Text>PKR {total.toFixed(2)}</Text>
                                {hiddenCosts > 0 && (
                                  <Text fontSize='xs' color='orange.500' fontWeight='medium'>
                                    + PKR {hiddenCosts.toFixed(2)} hidden
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td>PKR {paid.toFixed(2)}</Td>
                            <Td>{advanceApplied > 0 ? `PKR ${advanceApplied.toFixed(2)}` : '-'}</Td>
                            <Td color={due > 0 ? 'orange.500' : 'green.500'} fontWeight={due > 0 ? 'semibold' : 'normal'}>
                              PKR {due.toFixed(2)}
                            </Td>
                            <Td>
                              <Badge colorScheme={status === 'Paid' ? 'green' : 'orange'}>
                                {status}
                              </Badge>
                            </Td>
                            <Td>
                              <IconButton
                                icon={<DownloadIcon />}
                                size='sm'
                                variant='outline'
                                colorScheme='orange'
                                onClick={() => handleDownload(inv.id)}
                                isLoading={downloadingIds.has(inv.id)}
                                aria-label='Download invoice'
                              />
                            </Td>
                          </Tr>
                        );
                      })
                    ) : (
                      <Tr>
                        <Td colSpan={8} textAlign='center' color='gray.500' py='40px'>
                          {paymentSearch ? 'No invoices match your search' : 'No invoices found'}
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Invoices Tab */}
          <TabPanel px={0} pt={6}>
            <Box mb='16px'>
              <InputGroup maxW='400px'>
                <InputLeftElement pointerEvents='none'>
                  <SearchIcon color='gray.400' />
                </InputLeftElement>
                <Input
                  placeholder='Search by invoice number, date, or amount...'
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  size='md'
                />
              </InputGroup>
            </Box>
            <VStack align='stretch' spacing='12px'>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const total = Number(inv.total || inv.total_amount || 0);
                  const due = Number(inv.due_amount || 0);
                  const hiddenCosts = Number(inv.hidden_costs || 0);
                  const status = due > 0 ? 'Due' : 'Paid';
                  const invDate = inv.created_at ? new Date(inv.created_at) : null;
                  
                  return (
                    <Card 
                      key={inv.id} 
                      bg={cardBg}
                      boxShadow='0 1px 3px rgba(0,0,0,0.1)'
                      w='100%'
                      borderRadius='8px'
                    >
                      <CardBody p='16px' w='100%'>
                        <Flex justify='space-between' align='center' w='100%' gap='12px' flexWrap='wrap'>
                          <Box flex='1' minW='200px'>
                            <Text fontWeight='600' fontSize='sm' color={textColor} mb='4px'>
                              {inv.invoice_number || `Invoice #${inv.id}`}
                            </Text>
                            <VStack align='flex-start' spacing='2px'>
                              <HStack spacing='12px' fontSize='xs' color='gray.500'>
                                {invDate && (
                                  <Text>
                                    {invDate.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </Text>
                                )}
                                <Text>•</Text>
                                <Text fontWeight='500' color={textColor}>PKR {total.toFixed(2)}</Text>
                                <Text>•</Text>
                                <Badge 
                                  colorScheme={status === 'Paid' ? 'green' : 'orange'} 
                                  fontSize='10px' 
                                  px='6px' 
                                  py='1px'
                                  borderRadius='full'
                                >
                                  {status}
                                </Badge>
                              </HStack>
                              {hiddenCosts > 0 && (
                                <Text fontSize='xs' color='orange.500' fontWeight='medium' ml='0'>
                                  + PKR {hiddenCosts.toFixed(2)} hidden charges
                                </Text>
                              )}
                            </VStack>
                          </Box>
                          <HStack spacing='8px'>
                            {(() => {
                              const key = inv?.id ? String(inv.id) : null;
                              const invoiceItems = key ? invoiceItemsByInvoiceId[key] : null;
                              const hasRemaining = invoiceItems ? invoiceItems.some((item) => item.remaining > 0) : null;
                              const disabled = invoiceItems ? !hasRemaining : false;
                              const tooltipLabel = invoiceItems
                                ? (hasRemaining ? null : 'All items already refunded')
                                : 'Click to load invoice items for refund';
                              const button = (
                                <Button
                                  size='sm'
                                  leftIcon={<RepeatIcon />}
                                  bg={brandColor}
                                  color='white'
                                  _hover={{ bg: '#e67815' }}
                                  _active={{ bg: '#cf6910' }}
                                  onClick={() => handleStartRefund(inv)}
                                  isLoading={refundLoadingInvoiceId === inv.id}
                                  isDisabled={disabled || refundLoadingInvoiceId === inv.id}
                                >
                                  Refund
                                </Button>
                              );
                              return tooltipLabel ? (
                                <Tooltip label={tooltipLabel}>
                                  <span style={{ display: 'inline-block' }}>
                                    {button}
                                  </span>
                                </Tooltip>
                              ) : (
                                button
                              );
                            })()}
                            <IconButton
                              icon={<DownloadIcon />}
                              size='sm'
                              variant='outline'
                              colorScheme='orange'
                              onClick={() => handleDownload(inv.id)}
                              isLoading={downloadingIds.has(inv.id)}
                              aria-label='Download invoice'
                            />
                          </HStack>
                        </Flex>
                      </CardBody>
                    </Card>
                  );
                })
              ) : (
                <Card bg={cardBg}>
                  <CardBody>
                    <Text color='gray.500' textAlign='center' py='40px'>
                      {invoiceSearch ? 'No invoices match your search' : 'No invoices found'}
                    </Text>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
      <Drawer
        isOpen={refundDrawerOpen}
        placement='right'
        size='lg'
        onClose={handleCloseRefundDrawer}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color='white' />
          <DrawerHeader bg={brandColor} color='white' borderBottomWidth='1px'>
            Refund Invoice
            {refundContext && (
              <Text fontSize='sm' color='whiteAlpha.800' mt='2'>
                {refundContext.invoice?.invoice_number || `Invoice #${refundContext.invoice?.id}`}
              </Text>
            )}
          </DrawerHeader>
          <DrawerBody>
            {refundError && (
              <Alert status='error' mb='4' borderRadius='md'>
                <AlertIcon />
                {refundError}
              </Alert>
            )}
            {refundContext ? (
              <VStack align='stretch' spacing='6'>
                <Box>
                  <Text fontWeight='semibold' color={textColor}>
                    Customer
                  </Text>
                  <Text color='gray.500'>
                    {data?.name || `#${id}`} • {refundContext.invoice?.invoice_number || `Invoice #${refundContext.invoice?.id}`}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight='semibold' color={textColor} mb='2'>
                    Items to refund
                  </Text>
                  <VStack align='stretch' spacing='4'>
                    {refundContext.items.map((item) => (
                      <Box
                        key={item.invoiceItemId}
                        p='4'
                        borderWidth='1px'
                        borderRadius='lg'
                        bg={refundItemBg}
                      >
                        <Flex align='flex-start' gap='16px' flexWrap='wrap'>
                          <Box flex='1' minW='200px'>
                            <Text fontWeight='semibold' color={textColor}>
                              {item.name}
                            </Text>
                            <Text fontSize='sm' color='gray.500'>
                              Purchased: {item.quantity}{item.unitLabel ? ` ${item.unitLabel}` : ''}
                            </Text>
                            {item.refunded > 0 && (
                              <Text fontSize='sm' color='gray.500'>
                                Refunded: {item.refunded}
                              </Text>
                            )}
                            <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                              Remaining refundable: {item.remaining}
                            </Text>
                            <Text fontSize='sm' color='gray.500'>
                              Unit price: PKR {Number(item.unitPrice || 0).toFixed(2)}
                            </Text>
                          </Box>
                          <FormControl maxW='160px'>
                            <FormLabel fontSize='xs' color='gray.500'>
                              Quantity to refund
                            </FormLabel>
                            <NumberInput
                              size='sm'
                              min={0}
                              max={item.remaining}
                              step={0.01}
                              precision={3}
                              value={refundQuantities[item.invoiceItemId] ?? ''}
                              onChange={(valueString, valueNumber) => {
                                if (valueString === '' || Number.isNaN(valueNumber)) {
                                  setRefundQuantityValue(item.invoiceItemId, '');
                                  return;
                                }
                                const safeValue = Math.min(valueNumber, item.remaining);
                                setRefundQuantityValue(item.invoiceItemId, safeValue);
                              }}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </FormControl>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing='4'>
                  <FormControl>
                    <FormLabel>Refund date</FormLabel>
                    <Input
                      type='datetime-local'
                      value={refundDate}
                      onChange={(e) => setRefundDate(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Note</FormLabel>
                    <Textarea
                      rows={3}
                      placeholder='Optional note for history'
                      value={refundNote}
                      onChange={(e) => setRefundNote(e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>
                <Box
                  borderWidth='1px'
                  borderRadius='lg'
                  p='4'
                  bg={refundSummaryBg}
                >
                  <Text fontSize='sm' color='gray.500'>
                    Refund total
                  </Text>
                  <Text fontSize='2xl' fontWeight='bold' color={brandColor}>
                    PKR {refundTotal.toFixed(2)}
                  </Text>
                  <Text fontSize='xs' color='gray.600'>
                    Stock will be returned, revenue debited, and the LOSS-001 account will record this refund automatically.
                  </Text>
                </Box>
              </VStack>
            ) : (
              <Flex align='center' justify='center' minH='200px'>
                <Text color='gray.500'>Select an invoice to begin a refund.</Text>
              </Flex>
            )}
          </DrawerBody>
          <DrawerFooter borderTopWidth='1px'>
            <Button variant='ghost' mr={3} onClick={handleCloseRefundDrawer}>
              Cancel
            </Button>
            <Button
              bg={brandColor}
              color='white'
              _hover={{ bg: '#e67815' }}
              _active={{ bg: '#cf6910' }}
              onClick={handleSubmitRefund}
              isLoading={submittingRefund}
              isDisabled={!refundContext || selectedRefundItems.length === 0 || submittingRefund}
            >
              Process Refund
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
