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
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { invoiceService } from 'services/invoiceService';

export default function Invoices() {
  const textColor = useColorModeValue('gray.700','white');
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [downloadingIds, setDownloadingIds] = React.useState(new Set());
  const toast = useToast();

  const loadInvoices = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await invoiceService.listInvoices({ per_page: 20 });
      const list = resp?.data?.data || resp?.data || resp || [];
      setRows(list.map(r => ({
        id: r.id,
        number: r.invoice_number || `#${r.id}`,
        customer: r.customer_name || (r.customer?.name) || (r.customer_id ? `#${r.customer_id}` : 'Guest'),
        method: r.payment_method || '-',
        total: `PKR ${Number(r.total || 0).toFixed(2)}`,
        date: (r.created_at || '').toString().slice(0,10),
      })));
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
                  <Td>{r.number}</Td>
                  <Td>{r.customer}</Td>
                  <Td>{r.method}</Td>
                  <Td isNumeric>{r.total}</Td>
                  <Td>{r.date}</Td>
                  <Td>
                    <IconButton
                      icon={<DownloadIcon />}
                      size='sm'
                      variant='outline'
                      onClick={() => handleDownload(r.id)}
                      isLoading={downloadingIds.has(r.id)}
                      aria-label='Download invoice'
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
}


