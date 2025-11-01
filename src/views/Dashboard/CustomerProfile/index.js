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
        <Text fontSize='2xl' fontWeight='bold' color={textColor}>{name}</Text>
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
        <Card>
          <CardHeader><Text fontWeight='bold' color={textColor}>Invoices</Text></CardHeader>
          <CardBody>
            <VStack align='stretch' spacing='8px' maxH='260px' overflowY='auto'>
              {(data.invoices || []).map(inv => (
                <HStack key={inv.id} justify='space-between'>
                  <Text>{inv.invoice_number || `#${inv.id}`}</Text>
                  <HStack spacing='8px'>
                    <Text>PKR {Number(inv.total || 0).toFixed(2)}</Text>
                    <IconButton
                      icon={<DownloadIcon />}
                      size='sm'
                      variant='ghost'
                      onClick={() => handleDownload(inv.id)}
                      isLoading={downloadingIds.has(inv.id)}
                      aria-label='Download invoice'
                    />
                  </HStack>
                </HStack>
              ))}
              {(!data.invoices || data.invoices.length===0) && <Text color='gray.500'>No invoices</Text>}
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Text fontWeight='bold' color={textColor}>Recent Sales</Text></CardHeader>
          <CardBody>
            <VStack align='stretch' spacing='12px' maxH='320px' overflowY='auto'>
              {mergedSales.map((s) => (
                <Box key={s.id} borderWidth='1px' borderRadius='10px' p='10px'>
                  <HStack justify='space-between'>
                    <Text fontWeight='semibold'>
                      {s.invoice_number ? s.invoice_number : `#${s.id}`} {s.sale_date ? `• ${(s.sale_date || '').toString().slice(0,10)}` : ''}
                    </Text>
                    <Text>PKR {Number((s.total_amount ?? s.total) || 0).toFixed(2)}</Text>
                  </HStack>
                  {s.items && s.items.length > 0 && (
                    <VStack align='stretch' spacing='6px' mt='6px'>
                      {s.items.map((it) => (
                        <HStack key={it.id} justify='space-between'>
                          <Text color='gray.600'>
                            {(it.stock_item?.name) || it.name || `Item ${it.stock_item_id}`} • {Number(it.quantity || 0).toFixed(3)} x PKR {Number((it.unit_price || it.price) || 0).toFixed(2)}
                          </Text>
                          <Text color='gray.600'>PKR {Number((it.total_price || it.line_total) || (Number(it.quantity||0)*Number((it.unit_price||it.price)||0))).toFixed(2)}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                  {(s.hidden_costs && Number(s.hidden_costs) > 0) && (
                    <Box mt='6px' pt='6px' borderTopWidth='1px'>
                      <HStack justify='space-between'>
                        <Text color='orange.500' fontSize='sm' fontWeight='medium'>Hidden Costs:</Text>
                        <Text color='orange.500' fontSize='sm' fontWeight='medium'>PKR {Number(s.hidden_costs).toFixed(2)}</Text>
                      </HStack>
                    </Box>
                  )}
                </Box>
              ))}
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


