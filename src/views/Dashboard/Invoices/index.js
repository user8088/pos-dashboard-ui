import React from 'react';
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useColorModeValue,
  Button,
  IconButton,
  useToast,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Alert,
  AlertIcon,
  VStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Textarea,
  HStack,
  Input,
  Badge,
} from '@chakra-ui/react';
import { DownloadIcon, RepeatIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { invoiceService } from 'services/invoiceService';
import { stockService } from 'services/stockService';

export default function Invoices() {
  const textColor = useColorModeValue('gray.700','white');
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [downloadingIds, setDownloadingIds] = React.useState(new Set());
  const [refundLoadingId, setRefundLoadingId] = React.useState(null);
  const [refundContext, setRefundContext] = React.useState(null);
  const [refundItems, setRefundItems] = React.useState([]);
  const [refundQuantities, setRefundQuantities] = React.useState({});
  const [refundNote, setRefundNote] = React.useState('');
  const [refundDate, setRefundDate] = React.useState(() => new Date().toISOString().slice(0,16));
  const [refundSubmitting, setRefundSubmitting] = React.useState(false);
  const [refundError, setRefundError] = React.useState(null);
  const { isOpen: refundDrawerOpen, onOpen: onRefundOpen, onClose: onRefundClose } = useDisclosure();
  const toast = useToast();
  const brandColor = '#FF8D28';

  const loadInvoices = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await invoiceService.listInvoices({ per_page: 20 });
      const list = resp?.data?.data || resp?.data || resp || [];
      setRows(list.map(r => {
        const breakdownArray = Array.isArray(r.payment_breakdown) ? r.payment_breakdown : (
          Array.isArray(r.payments) ? r.payments : []
        );
        const formatLabel = (label) => {
          if (!label) return '-';
          const cleaned = String(label).replace(/_/g, ' ').trim();
          const lower = cleaned.toLowerCase();
          if (lower === 'bank') return 'Online';
          if (lower === 'cash') return 'Cash';
          return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        };
        const methodLabel = breakdownArray.length > 0
          ? breakdownArray
              .filter(item => item && (item.payment_method || item.method))
              .map(item => {
                const name = formatLabel(item.payment_method || item.method);
                const amount = Number(item.amount || item.paid_amount || 0);
                return amount > 0 ? `${name} PKR ${amount.toFixed(2)}` : name;
              })
              .join(' + ')
          : (r.payment_method === 'split'
              ? 'Cash + Online'
              : formatLabel(r.payment_method) || '-');
        const totalNumber = Number(r.total || 0);
        const refundedAmount = Number(r.refunded_amount || 0);
        const hiddenCosts = Number(r.hidden_costs || 0);
        const customerLabel = r.customer_name || r.customer?.name || (r.customer_id ? `#${r.customer_id}` : 'Guest');
        const displayCustomer =
          customerLabel && customerLabel.trim().toLowerCase() === 'guest'
            ? 'Walk-in Customer'
            : customerLabel || 'Walk-in Customer';
        return ({
          id: r.id,
          number: r.invoice_number || `#${r.id}`,
          customer: displayCustomer,
          method: methodLabel,
          total: totalNumber,
          refundedAmount,
          hiddenCosts,
          date: (r.created_at || '').toString().slice(0,10),
          customerId: r.customer_id || r.customer?.id || null,
          raw: r,
        });
      }));
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { loadInvoices(); }, [loadInvoices]);

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

  const buildInvoiceItems = React.useCallback((invoiceDetail = {}) => {
    const rawItems = invoiceDetail.items || invoiceDetail.invoice_items || [];
    return rawItems
      .map((item) => {
        if (!item) return null;
        const soldQuantity = Number(item.quantity ?? item.qty ?? item.sold_quantity ?? 0);
        if (soldQuantity <= 0) return null;
        const refundedQuantity = Number(
          item.returned_quantity ?? item.refunded_quantity ?? item.returned_sold_quantity ?? 0
        );
        const remaining = Math.max(0, soldQuantity - refundedQuantity);
        const invoiceItemId = item.invoice_item_id ?? item.id ?? item.sale_item_id ?? item.pivot?.id;
        if (!invoiceItemId || remaining <= 0) return null;
        const stockInfo = item.stock_item || item.product || {};
        const resolvedPrimaryUnit =
          item.primary_unit_label ||
          item.primary_unit_name ||
          item.primary_unit ||
          item.primaryUnit?.name ||
          item.primaryUnit?.symbol ||
          stockInfo.primary_unit?.name ||
          stockInfo.primary_unit?.symbol ||
          stockInfo.primaryUnit?.name ||
          stockInfo.primaryUnit?.symbol ||
          invoiceDetail?.primary_unit_label ||
          null;
        const resolvedSecondaryUnit =
          item.secondary_unit_label ||
          item.secondary_unit_name ||
          item.secondary_unit ||
          item.secondaryUnit?.name ||
          item.secondaryUnit?.symbol ||
          stockInfo.secondary_unit?.name ||
          stockInfo.secondary_unit?.symbol ||
          stockInfo.secondaryUnit?.name ||
          stockInfo.secondaryUnit?.symbol ||
          invoiceDetail?.secondary_unit_label ||
          null;
        const unitType = item.unit_type || item.unitType || (resolvedSecondaryUnit ? 'secondary' : 'primary');
        const fallbackPrimaryLabel = resolvedPrimaryUnit || 'primary unit';
        const fallbackSecondaryLabel = resolvedSecondaryUnit || 'secondary unit';
        const saleUnitLabel =
          unitType === 'secondary'
            ? (item.unit_label || item.unit_name || fallbackSecondaryLabel)
            : (item.unit_label || item.unit_name || fallbackPrimaryLabel);
        const soldDetail = `${soldQuantity} ${saleUnitLabel}`;
        const remainingDetail = `${remaining} ${saleUnitLabel}`;
        const primaryUnit = fallbackPrimaryLabel;
        const secondaryUnit = fallbackSecondaryLabel;
        const unitLabel = saleUnitLabel;
        return {
          invoiceItemId,
          name: item.name || stockInfo.name || `Item #${invoiceItemId}`,
          stockItemId: item.stock_item_id || stockInfo.id || null,
          sold: soldQuantity,
          refunded: refundedQuantity,
          remaining,
          unitPrice: Number(item.unit_price ?? item.price ?? 0),
          unitLabel,
          unitType,
          primaryUnit,
          secondaryUnit,
          soldDetail,
          remainingDetail,
        };
      })
      .filter(Boolean);
  }, []);

  const setRefundQuantityValue = React.useCallback((invoiceItemId, value) => {
    setRefundQuantities((prev) => ({
      ...prev,
      [invoiceItemId]: value,
    }));
  }, []);

  const enrichItemsWithStockUnits = React.useCallback(async (items) => {
    const needsLookup = items.filter((line) => {
      const soldLabel = (line.soldDetail || '').toLowerCase();
      return (!line.stockItemId)
        ? false
        : soldLabel.includes('unit');
    });
    if (!needsLookup.length) return items;
    await Promise.all(needsLookup.map(async (line) => {
      try {
        const resp = await stockService.showItem(line.stockItemId);
        const data = resp?.data || resp;
        if (!data) return;
        const primaryName =
          data.primary_unit?.name ||
          data.primaryUnit?.name ||
          data.primaryUnit?.symbol ||
          data.primaryUnit ||
          data.primary_unit_label ||
          null;
        const secondaryName =
          data.secondary_unit?.name ||
          data.secondaryUnit?.name ||
          data.secondaryUnit?.symbol ||
          data.secondaryUnit ||
          data.secondary_unit_label ||
          null;
        const selectedUnitName = line.unitType === 'secondary'
          ? (secondaryName || primaryName || 'unit')
          : (primaryName || secondaryName || 'unit');
        line.primaryUnit = primaryName || line.primaryUnit;
        line.secondaryUnit = secondaryName || line.secondaryUnit;
        line.soldDetail = `${line.sold} ${selectedUnitName}`;
        line.remainingDetail = `${line.remaining} ${selectedUnitName}`;
      } catch (_) {}
    }));
    return items;
  }, []);

  const handleStartRefund = React.useCallback(
    async (row) => {
      setRefundLoadingId(row.id);
      try {
        const detailResp = await invoiceService.getInvoice(row.id);
        const detail = detailResp?.data || detailResp;
        let items = buildInvoiceItems(detail);
        items = await enrichItemsWithStockUnits(items);
        if (!items.length) {
          toast({
            title: 'Nothing to refund',
            description: 'All items on this invoice have already been refunded.',
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
        setRefundContext({ invoice: row, detail });
        setRefundItems(items);
        setRefundQuantities(initialQuantities);
        setRefundNote('');
        setRefundDate(new Date().toISOString().slice(0, 16));
        setRefundError(null);
        onRefundOpen();
      } catch (error) {
        toast({
          title: 'Failed to load invoice',
          description: error?.message || 'Unable to fetch invoice details for refund.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setRefundLoadingId(null);
      }
    },
    [buildInvoiceItems, enrichItemsWithStockUnits, onRefundOpen, toast]
  );

  const selectedRefundItems = React.useMemo(() => {
    return refundItems
      .map((item) => {
        const value = refundQuantities[item.invoiceItemId];
        if (value === '' || value === undefined || value === null) return null;
        const quantity = Number(value);
        if (!Number.isFinite(quantity) || quantity <= 0) return null;
        return {
          invoice_item_id: item.invoiceItemId,
          quantity: Math.min(quantity, item.remaining),
          unitType: item.unitType,
          unitPrice: item.unitPrice || 0,
        };
      })
      .filter(Boolean);
  }, [refundItems, refundQuantities]);

  const refundTotal = React.useMemo(() => {
    return selectedRefundItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0);
  }, [selectedRefundItems]);

  const handleSubmitRefund = React.useCallback(async () => {
    if (!refundContext?.invoice) return;
    if (!selectedRefundItems.length) {
      toast({
        title: 'Select items to refund',
        description: 'Enter a quantity for at least one item before continuing.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setRefundSubmitting(true);
    setRefundError(null);
    try {
      const parsedDate = refundDate ? new Date(refundDate) : null;
      const refundDateIso =
        parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : undefined;
      const payload = {
        items: selectedRefundItems.map((item) => ({
          invoice_item_id: item.invoice_item_id,
          quantity: item.quantity,
          ...(item.unitType ? { unit_type: item.unitType } : {}),
        })),
        note: refundNote?.trim() ? refundNote.trim() : undefined,
        refund_date: refundDateIso,
      };
      await invoiceService.refundInvoice(refundContext.invoice.id, payload);
      toast({
        title: 'Refund processed',
        description: 'Invoice refund recorded and stock updated.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      onRefundClose();
      setRefundContext(null);
      setRefundItems([]);
      setRefundQuantities({});
      await loadInvoices();
    } catch (error) {
      const message = error?.message || 'Failed to process refund.';
      setRefundError(message);
      toast({
        title: 'Refund failed',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRefundSubmitting(false);
    }
  }, [
    refundContext,
    selectedRefundItems,
    refundDate,
    refundNote,
    loadInvoices,
    onRefundClose,
    toast,
  ]);

  const closeRefundDrawer = React.useCallback(() => {
    onRefundClose();
    setRefundContext(null);
    setRefundItems([]);
    setRefundQuantities({});
    setRefundNote('');
    setRefundDate(new Date().toISOString().slice(0, 16));
    setRefundError(null);
  }, [onRefundClose]);

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card>
        <CardHeader>
          <Flex justify='space-between' align='center' w='100%'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>Invoices</Text>
            <Button variant='outline' onClick={loadInvoices}>Refresh</Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th>Invoice #</Th>
                <Th>Customer</Th>
                <Th>Payment</Th>
                <Th isNumeric>Total</Th>
                <Th isNumeric>Refunded</Th>
                <Th>Date</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading && (
                <Tr><Td colSpan={6} py='48px' textAlign='center'><Spinner /></Td></Tr>
              )}
              {!loading && rows.length === 0 && (
                <Tr><Td colSpan={6} py='48px'><Box textAlign='center' color='gray.500'>No invoices found</Box></Td></Tr>
              )}
              {!loading && rows.map(r => (
                <Tr key={r.id}>
                  <Td>
                    <Text fontWeight='semibold'>{r.number}</Text>
                    {r.refundedAmount > 0 && (
                      <Badge
                        colorScheme={r.refundedAmount >= r.total ? 'green' : 'orange'}
                        mt='1'
                        borderRadius='full'
                        px='2.5'
                        py='0.5'
                      >
                        {r.refundedAmount >= r.total ? 'Fully Refunded' : `Refunded PKR ${r.refundedAmount.toFixed(2)}`}
                      </Badge>
                    )}
                  </Td>
                  <Td>{r.customer}</Td>
                  <Td>{r.method}</Td>
                  <Td isNumeric>
                    <VStack align='flex-end' spacing='2px'>
                      <Text>PKR {r.total.toFixed(2)}</Text>
                      {r.hiddenCosts > 0 && (
                        <Text fontSize='xs' color='orange.500' fontWeight='medium'>
                          + PKR {r.hiddenCosts.toFixed(2)} hidden
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td isNumeric>
                    {r.refundedAmount > 0 ? `PKR ${r.refundedAmount.toFixed(2)}` : '-'}
                  </Td>
                  <Td>{r.date}</Td>
                  <Td>
                    <HStack spacing='8px'>
                      <Button
                        size='sm'
                        leftIcon={<RepeatIcon />}
                        bg={brandColor}
                        color='white'
                        _hover={{ bg: '#e67815' }}
                        _active={{ bg: '#cf6910' }}
                        onClick={() => handleStartRefund(r)}
                        isDisabled={refundLoadingId === r.id}
                        isLoading={refundLoadingId === r.id}
                      >
                        Refund
                      </Button>
                      <IconButton
                        icon={<DownloadIcon />}
                        size='sm'
                        variant='outline'
                        onClick={() => handleDownload(r.id)}
                        isLoading={downloadingIds.has(r.id)}
                        aria-label='Download invoice'
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      <Drawer isOpen={refundDrawerOpen} placement='right' size='lg' onClose={closeRefundDrawer}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color='white' />
          <DrawerHeader bg={brandColor} color='white' borderBottomWidth='1px'>
            Refund Invoice
            {refundContext?.invoice && (
              <Text fontSize='sm' color='whiteAlpha.800' mt='2'>
                {refundContext.invoice.number}
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
                    {refundContext.invoice.customer}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight='semibold' color={textColor} mb='2'>
                    Items to refund
                  </Text>
                  <VStack align='stretch' spacing='4'>
                    {refundItems.map((item) => (
                      <Box
                        key={item.invoiceItemId}
                        p='4'
                        borderWidth='1px'
                        borderRadius='lg'
                        bg={useColorModeValue('gray.50', 'gray.800')}
                      >
                        <Flex align='flex-start' gap='16px' flexWrap='wrap'>
                          <Box flex='1' minW='200px'>
                            <Text fontWeight='semibold' color={textColor}>
                              {item.name}
                            </Text>
                            <Text fontSize='sm' color='gray.500'>
                              Sold: {item.soldDetail}
                            </Text>
                            {item.refunded > 0 && (
                              <Text fontSize='sm' color='gray.500'>
                                Refunded: {item.refunded}
                              </Text>
                            )}
                            <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                              Remaining refundable: {item.remainingDetail}
                            </Text>
                            <Text fontSize='sm' color='gray.500'>
                              Unit price: PKR {item.unitPrice.toFixed(2)}
                            </Text>
                            <Text fontSize='xs' color='gray.500'>
                              Unit type sold: {item.unitType === 'secondary' ? 'Secondary' : 'Primary'}
                              {item.unitType === 'secondary' && item.secondaryUnit
                                ? ` (${item.secondaryUnit}${item.primaryUnit ? ` per ${item.primaryUnit}` : ''})`
                                : item.primaryUnit
                                  ? ` (${item.primaryUnit})`
                                  : ''}
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
                <HStack spacing='4' align='start' flexWrap='wrap'>
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
                </HStack>
                <Box borderWidth='1px' borderRadius='lg' p='4' bg={useColorModeValue('orange.50', 'whiteAlpha.100')}>
                  <Text fontSize='sm' color='gray.500'>
                    Refund total
                  </Text>
                  <Text fontSize='2xl' fontWeight='bold' color={brandColor}>
                    PKR {refundTotal.toFixed(2)}
                  </Text>
                  <Text fontSize='xs' color='gray.600'>
                    Stock will be returned, revenue debited, and LOSS-001 will capture this refund.
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
            <Button variant='ghost' mr={3} onClick={closeRefundDrawer}>
              Cancel
            </Button>
            <Button
              bg={brandColor}
              color='white'
              _hover={{ bg: '#e67815' }}
              _active={{ bg: '#cf6910' }}
              onClick={handleSubmitRefund}
              isLoading={refundSubmitting}
              isDisabled={!refundContext || selectedRefundItems.length === 0 || refundSubmitting}
            >
              Process Refund
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}


