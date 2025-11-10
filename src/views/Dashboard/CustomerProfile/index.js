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
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
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
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  const [invoices, setInvoices] = React.useState([]);
  const [mergedSales, setMergedSales] = React.useState([]);
  const [downloadingIds, setDownloadingIds] = React.useState(new Set());
  const toast = useToast();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await customerService.profile(id);
        const d = resp?.data || resp;
        if (mounted) setData(d);
        // Load invoices as fallback for recent sales display
        try {
          const inv = await invoiceService.listInvoices({ per_page: 50 });
          const list = inv?.data?.data || inv?.data || inv || [];
          if (mounted) setInvoices(list.filter((x) => String(x.customer_id) === String(id)));
        } catch (_) {}
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  // Build a sales list with items: prefer API sales; else fetch invoice details for up to 5 invoices
  React.useEffect(() => {
    let mounted = true;
    const build = async () => {
      const salesArr = Array.isArray(data?.sales) && data.sales.length > 0 ? data.sales : [];
      if (salesArr.length > 0) {
        if (mounted) setMergedSales(salesArr);
        return;
      }
      if (invoices.length === 0) { if (mounted) setMergedSales([]); return; }
      try {
        const first = invoices.slice(0, 5);
        const detailed = await Promise.all(first.map(async (inv) => {
          try {
            const det = await invoiceService.getInvoice(inv.id);
            const payload = det?.data || det || {};
            return { ...inv, ...(payload || {}) };
          } catch { return inv; }
        }));
        if (mounted) setMergedSales(detailed);
      } catch { if (mounted) setMergedSales([]); }
    };
    build();
    return () => { mounted = false; };
  }, [data, invoices]);

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

  if (loading) return (<Flex align='center' justify='center' minH='240px'><Spinner /></Flex>);
  if (!data) return (<Box pt={{ base: '120px', md: '75px' }}><Button onClick={()=> history.push('/admin/customer-management')}>Back</Button><Text color={textColor} mt='4'>Customer not found.</Text></Box>);

  const due = Number(data.due_balance || 0);
  const adv = Number(data.advance_balance || 0);
  const name = data.name || `#${id}`;

  return (
    <Box pt={{ base: '120px', md: '75px' }}>
      <HStack justify='space-between' mb='16px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold' color={textColor}>{name}</Text>
          {data.serial_id && (
            <Text fontSize='sm' color='gray.500' mt='4px'>Serial ID: {data.serial_id}</Text>
          )}
        </Box>
        <Button variant='outline' onClick={()=> history.goBack()}>Back</Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing='16px' mb='16px'>
        <Stat p='16px' borderWidth='1px' borderRadius='12px'>
          <StatLabel>Due Balance</StatLabel>
          <StatNumber>PKR {due.toFixed(2)}</StatNumber>
        </Stat>
        <Stat p='16px' borderWidth='1px' borderRadius='12px'>
          <StatLabel>Advance Balance</StatLabel>
          <StatNumber>PKR {adv.toFixed(2)}</StatNumber>
        </Stat>
        <Stat p='16px' borderWidth='1px' borderRadius='12px'>
          <StatLabel>Rating</StatLabel>
          <StatNumber>{(data.rating_average || 0).toFixed(1)} ({data.rating_count || 0})</StatNumber>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='16px'>
        <Card h='100%'>
          <CardHeader><Text fontWeight='bold' color={textColor}>Invoices</Text></CardHeader>
          <CardBody display='flex' flexDirection='column' gap='12px' p={{ base: '16px', md: '20px' }}>
            <VStack align='stretch' spacing='12px' flex='1' overflowY='auto' maxH='320px'>
              {(data.invoices || []).map(inv => {
                const total = Number(inv.total || 0);
                const paid = Number(inv.paid_amount || 0);
                const dueAmount = Number(inv.due_amount || 0);
                const status = dueAmount > 0 ? 'Due' : 'Paid';
                // Check for advance stored: first try direct field, then check payment_as, then transactions
                let advanceStored = Number(inv.advance_amount || inv.advance || inv.advance_stored || 0);
                // If payment_as is "advance", the paid_amount was stored as advance
                if (advanceStored === 0 && inv.payment_as === 'advance' && paid > 0) {
                  advanceStored = paid;
                }
                // Fallback: check transactions for advance payments on the same date
                if (advanceStored === 0 && data.transactions && inv.created_at) {
                  const invDate = new Date(inv.created_at).toISOString().split('T')[0];
                  const advanceTx = data.transactions.find(t => 
                    t.type === 'advance' && 
                    t.direction === 'credit' &&
                    new Date(t.created_at || t.date || '').toISOString().split('T')[0] === invDate
                  );
                  if (advanceTx) {
                    advanceStored = Number(advanceTx.amount || 0);
                  }
                }
                return (
                  <Box
                    key={inv.id}
                    borderWidth='1px'
                    borderRadius='14px'
                    p='14px'
                    bg={sectionBg}
                  >
                    <HStack justify='space-between' align='start' mb='8px'>
                      <Box>
                        <Text fontWeight='semibold' fontSize='sm'>{inv.invoice_number || `#${inv.id}`}</Text>
                        {inv.created_at && (
                          <Text fontSize='xs' color='gray.500'>
                            {new Date(inv.created_at).toLocaleString()}
                          </Text>
                        )}
                      </Box>
                      <Text fontSize='sm' fontWeight='medium' color={dueAmount > 0 ? 'orange.500' : 'green.500'}>{status}</Text>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 3, xl: 4 }} spacing='10px' mb={(inv.items && inv.items.length > 0) || advanceStored > 0 ? '10px' : 0}>
                      <Box>
                        <Text fontSize='xs' color='gray.500'>Total</Text>
                        <Text fontWeight='bold'>PKR {total.toFixed(2)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize='xs' color='gray.500'>Paid</Text>
                        <Text fontWeight='medium'>PKR {paid.toFixed(2)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize='xs' color='gray.500'>Due</Text>
                        <Text fontWeight='medium' color={dueAmount > 0 ? 'orange.500' : 'green.500'}>PKR {dueAmount.toFixed(2)}</Text>
                      </Box>
                      {Number(inv.hidden_costs || 0) > 0 && (
                        <Box>
                          <Text fontSize='xs' color='gray.500'>Hidden</Text>
                          <Text fontWeight='medium' color='orange.500'>PKR {Number(inv.hidden_costs || 0).toFixed(2)}</Text>
                        </Box>
                      )}
                      {advanceStored > 0 && (
                        <Box>
                          <Text fontSize='xs' color='gray.500'>Advance Stored</Text>
                          <Text fontWeight='medium' color='teal.500'>PKR {advanceStored.toFixed(2)}</Text>
                        </Box>
                      )}
                    </SimpleGrid>
                    {inv.items && inv.items.length > 0 && (
                      <Box>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing='8px'>
                          {inv.items.slice(0,3).map(item => (
                            <Box key={item.id} borderRadius='10px' borderWidth='1px' borderColor={itemBorder} p='8px' bg={itemBg}>
                              <Text fontSize='sm' fontWeight='semibold' color={textColor}>
                                {(item.name || item.stock_item?.name || `Item ${item.stock_item_id}`)}
                              </Text>
                              {(item.stock_item?.serial_id || item.serial_id) && (
                                <Text fontSize='xs' color='gray.500' mt='2px'>
                                  Serial: {item.stock_item?.serial_id || item.serial_id}
                                </Text>
                              )}
                              <Text fontSize='xs' color='gray.500'>
                                {Number(item.quantity || 0).toFixed(3)} × PKR {Number(item.unit_price || item.price || 0).toFixed(2)}
                              </Text>
                              <Text fontSize='sm' fontWeight='medium' color='gray.600'>
                                PKR {Number(item.line_total || item.total_price || (Number(item.quantity||0)*Number((item.unit_price||item.price)||0))).toFixed(2)}
                              </Text>
                            </Box>
                          ))}
                          {inv.items.length > 3 && (
                            <Text fontSize='xs' color='gray.400' gridColumn='1/-1'>+ {inv.items.length - 3} more items</Text>
                          )}
                        </SimpleGrid>
                      </Box>
                    )}
                    <HStack justify='flex-end' mt='12px'>
                      <IconButton
                        icon={<DownloadIcon />}
                        size='sm'
                        variant='outline'
                        onClick={() => handleDownload(inv.id)}
                        isLoading={downloadingIds.has(inv.id)}
                        aria-label='Download invoice'
                      />
                    </HStack>
                  </Box>
                );
              })}
              {(!data.invoices || data.invoices.length===0) && <Text color='gray.500'>No invoices</Text>}
            </VStack>
          </CardBody>
        </Card>
        <Card h='100%'>
          <CardHeader><Text fontWeight='bold' color={textColor}>Recent Sales</Text></CardHeader>
          <CardBody display='flex' flexDirection='column' gap='12px' p={{ base: '16px', md: '20px' }}>
            <VStack align='stretch' spacing='10px' flex='1' overflowY='auto' maxH='320px'>
              {mergedSales.map((s) => {
                const saleTotalNumber = Number((s.total_amount ?? s.total) || 0);
                const saleTotal = saleTotalNumber.toFixed(2);
                // Check for advance stored: first try direct field, then check payment_as, then transactions
                let saleAdvance = Number(s.advance_amount || s.advance || s.advance_stored || 0);
                const timestamp = s.sale_date || s.created_at || null;
                const salePaid = Number(s.paid_amount || 0);
                // If payment_as is "advance", the paid_amount was stored as advance
                if (saleAdvance === 0 && s.payment_as === 'advance' && salePaid > 0) {
                  saleAdvance = salePaid;
                }
                // Fallback: check transactions for advance payments on the same date
                if (saleAdvance === 0 && data.transactions && timestamp) {
                  const saleDate = new Date(timestamp).toISOString().split('T')[0];
                  const advanceTx = data.transactions.find(t => 
                    t.type === 'advance' && 
                    t.direction === 'credit' &&
                    new Date(t.created_at || t.date || '').toISOString().split('T')[0] === saleDate
                  );
                  if (advanceTx) {
                    saleAdvance = Number(advanceTx.amount || 0);
                  }
                }
                return (
                  <Box
                    key={s.id}
                    borderWidth='1px'
                    borderRadius='12px'
                    p='14px'
                    bg={sectionBg}
                  >
                    <VStack align='stretch' spacing='4px'>
                      {timestamp && (
                        <Text fontSize='xs' color='gray.500'>
                          {new Date(timestamp).toLocaleString()}
                        </Text>
                      )}
                      <HStack justify='space-between'>
                        <Text fontSize='sm' fontWeight='semibold' color={textColor}>
                          {s.invoice_number ? s.invoice_number : `Sale #${s.id}`}
                        </Text>
                        <Text fontWeight='bold'>PKR {saleTotal}</Text>
                      </HStack>
                    </VStack>
                    {saleAdvance > 0 && (
                      <Text fontSize='xs' color='teal.500' fontWeight='semibold' mt='6px'>
                        Advance Stored: PKR {saleAdvance.toFixed(2)}
                      </Text>
                    )}
                    {s.items && s.items.length > 0 && (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing='8px' mt='10px'>
                        {s.items.map((it) => (
                          <Box key={it.id} borderRadius='10px' borderWidth='1px' borderColor={itemBorder} p='10px' bg={itemBg}>
                            <Text fontSize='sm' color='gray.700' fontWeight='medium'>
                              {(it.stock_item?.name) || it.name || `Item ${it.stock_item_id}`}
                            </Text>
                            {(it.stock_item?.serial_id || it.serial_id) && (
                              <Text fontSize='xs' color='gray.500' mt='2px'>
                                Serial: {it.stock_item?.serial_id || it.serial_id}
                              </Text>
                            )}
                            <Text fontSize='xs' color='gray.500'>
                              Qty {Number(it.quantity || 0).toFixed(3)} @ PKR {Number((it.unit_price || it.price) || 0).toFixed(2)}
                              {Number(it.hidden_cost || 0) > 0 && ` • Hidden PKR ${Number(it.hidden_cost || 0).toFixed(2)}`}
                            </Text>
                            <Text fontSize='sm' fontWeight='medium' color='gray.600'>
                              PKR {Number((it.total_price || it.line_total) || (Number(it.quantity||0)*Number((it.unit_price||it.price)||0))).toFixed(2)}
                            </Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}
                  </Box>
                );
              })}
              {mergedSales.length===0 && <Text color='gray.500'>No sales</Text>}
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Text fontWeight='bold' color={textColor}>Transactions</Text></CardHeader>
          <CardBody>
            <VStack align='stretch' spacing='8px' maxH='260px' overflowY='auto'>
              {(data.transactions || []).map((t,i) => (
                <Text key={i} color='gray.600'>{t.type} • {t.direction} • PKR {Number(t.amount||0).toFixed(2)}</Text>
              ))}
              {(!data.transactions || data.transactions.length===0) && <Text color='gray.500'>No transactions</Text>}
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Text fontWeight='bold' color={textColor}>Ratings</Text></CardHeader>
          <CardBody>
            <VStack align='stretch' spacing='8px' maxH='260px' overflowY='auto'>
              {(data.ratings || []).map((r,i) => (
                <Text key={i} color='gray.600'>{r.stars}★ • {r.note || ''}</Text>
              ))}
              {(!data.ratings || data.ratings.length===0) && <Text color='gray.500'>No ratings</Text>}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}


