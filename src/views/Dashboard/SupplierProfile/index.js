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
  useToast,
  Divider,
} from '@chakra-ui/react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { useParams, useHistory } from 'react-router-dom';
import { supplierService } from 'services/supplierService';

const parseListResponse = (resp) => {
  const payload = resp?.data ?? resp ?? {};
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.purchases)) return payload.purchases;
  return [];
};

const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function SupplierProfile() {
  const { id } = useParams();
  const history = useHistory();
  const toast = useToast();
  const textColor = useColorModeValue('gray.700', 'white');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const itemBg = useColorModeValue('white', 'gray.800');
  const itemBorder = useColorModeValue('gray.200', 'gray.600');

  const [loadingSupplier, setLoadingSupplier] = React.useState(true);
  const [loadingTransactions, setLoadingTransactions] = React.useState(true);
  const [supplier, setSupplier] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    setLoadingSupplier(true);
    (async () => {
      try {
        const resp = await supplierService.getSupplier(id);
        const data = resp?.data ?? resp ?? null;
        if (mounted) {
          setSupplier(data);
          if (data?.transactions && Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
          }
        }
      } catch (e) {
        if (mounted) {
          toast({
            title: 'Failed to load supplier',
            description: e.message,
            status: 'error',
          });
        }
      } finally {
        if (mounted) setLoadingSupplier(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, toast]);

  React.useEffect(() => {
    let mounted = true;
    setLoadingTransactions(true);
    (async () => {
      try {
        const resp = await supplierService.listPurchases(id, { per_page: 100 });
        const list = parseListResponse(resp);
        if (mounted && list.length > 0) {
          setTransactions(list);
        }
      } catch (e) {
        // If supplier payload already included transactions we can continue silently
        if (mounted && (!supplier || !supplier.transactions)) {
          toast({
            title: 'Failed to load transactions',
            description: e.message,
            status: 'error',
          });
        }
      } finally {
        if (mounted) setLoadingTransactions(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, supplier, toast]);

  const loading = loadingSupplier || loadingTransactions;

  const totalTransactions = transactions.length || Number(supplier?.transactions_count || 0);
  const totalSpent = React.useMemo(() => {
    if (Number(supplier?.transactions_total_spent)) {
      return Number(supplier.transactions_total_spent);
    }
    return transactions.reduce((sum, tx) => sum + Number(tx.total_amount ?? tx.total ?? 0), 0);
  }, [supplier, transactions]);

  const latestTransactionDate = React.useMemo(() => {
    const all = transactions.length > 0 ? transactions : (supplier?.transactions || []);
    if (all.length === 0) return null;
    const latest = all
      .map((tx) => tx.transaction_date || tx.created_at)
      .filter(Boolean)
      .map((value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
      })
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    return latest ? latest.toLocaleString() : null;
  }, [supplier, transactions]);

  if (loading) {
    return (
      <Flex align='center' justify='center' minH='320px'>
        <Spinner size='lg' />
      </Flex>
    );
  }

  if (!supplier) {
    return (
      <Box pt={{ base: '120px', md: '75px' }}>
        <Button variant='outline' onClick={() => history.push('/admin/supplier-management')}>
          Back to suppliers
        </Button>
        <Text color={textColor} mt='4'>
          Supplier not found.
        </Text>
      </Box>
    );
  }

  const name = supplier.name || `Supplier #${id}`;
  const phone = supplier.phone || '—';
  const address = supplier.address || '—';
  const balanceDue = Number(supplier.balance_due ?? supplier.due_balance ?? supplier.balance ?? 0);
  const advanceBalance = Number(supplier.advance_balance ?? 0);

  return (
    <Box pt={{ base: '120px', md: '75px' }}>
      <HStack justify='space-between' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold' color={textColor}>
            {name}
          </Text>
          <Text color='gray.500' fontSize='sm' mt='6px'>
            Phone: {phone} • Address: {address}
          </Text>
        </Box>
        <Button variant='outline' onClick={() => history.goBack()}>
          Back
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing='16px' mb='20px'>
        <Stat p='16px' borderWidth='1px' borderRadius='12px'>
          <StatLabel>Total Transactions</StatLabel>
          <StatNumber>{totalTransactions}</StatNumber>
        </Stat>
        <Stat p='16px' borderWidth='1px' borderRadius='12px'>
          <StatLabel>Total Spent</StatLabel>
          <StatNumber>PKR {totalSpent.toFixed(2)}</StatNumber>
        </Stat>
        <Stat p='16px' borderWidth='1px' borderRadius='12px'>
          <StatLabel>Outstanding Balance</StatLabel>
          <StatNumber>PKR {balanceDue.toFixed(2)}</StatNumber>
        </Stat>
        <Stat p='16px' borderWidth='1px' borderRadius='12px'>
          <StatLabel>Advance Balance</StatLabel>
          <StatNumber>PKR {advanceBalance.toFixed(2)}</StatNumber>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='20px'>
        <Card>
          <CardHeader>
            <Text fontWeight='bold' color={textColor}>
              Supplier Notes
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align='stretch' spacing='8px'>
              {supplier.note && <Text color='gray.600'>{supplier.note}</Text>}
              {!supplier.note && <Text color='gray.500'>No notes stored for this supplier.</Text>}
              {latestTransactionDate && (
                <>
                  <Divider />
                  <Text color='gray.500' fontSize='sm'>
                    Last transaction: {latestTransactionDate}
                  </Text>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Text fontWeight='bold' color={textColor}>
              Contact Details
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align='stretch' spacing='10px'>
              <Box>
                <Text fontSize='xs' color='gray.500'>
                  Phone
                </Text>
                <Text fontWeight='medium'>{phone}</Text>
              </Box>
              <Box>
                <Text fontSize='xs' color='gray.500'>
                  Address
                </Text>
                <Text fontWeight='medium'>{address}</Text>
              </Box>
              {supplier.email && (
                <Box>
                  <Text fontSize='xs' color='gray.500'>
                    Email
                  </Text>
                  <Text fontWeight='medium'>{supplier.email}</Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card mt='24px'>
        <CardHeader>
          <Text fontWeight='bold' color={textColor}>
            Transaction History
          </Text>
        </CardHeader>
        <CardBody>
          <VStack align='stretch' spacing='16px'>
            {transactions.map((tx) => {
              const total = Number(tx.total_amount ?? tx.total ?? 0);
              const items = Array.isArray(tx.items) ? tx.items : [];
              return (
                <Box
                  key={tx.id ?? tx.serial ?? `${tx.transaction_date}-${total}`}
                  borderWidth='1px'
                  borderRadius='14px'
                  p='16px'
                  bg={sectionBg}
                >
                  <HStack justify='space-between' align='start' mb='8px'>
                    <Box>
                      <Text fontWeight='semibold' fontSize='sm'>
                        {tx.serial || `Transaction #${tx.id}`}
                      </Text>
                      {(tx.transaction_date || tx.created_at) && (
                        <Text fontSize='xs' color='gray.500'>
                          {formatDateTime(tx.transaction_date || tx.created_at)}
                        </Text>
                      )}
                      {tx.note && (
                        <Text fontSize='xs' color='gray.500' mt='6px'>
                          {tx.note}
                        </Text>
                      )}
                    </Box>
                    <Text fontWeight='bold' color={textColor}>
                      PKR {total.toFixed(2)}
                    </Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing='12px'>
                    <Box>
                      <Text fontSize='xs' color='gray.500'>
                        Items Count
                      </Text>
                      <Text fontWeight='medium'>{items.length}</Text>
                    </Box>
                    <Box>
                      <Text fontSize='xs' color='gray.500'>
                        Created At
                      </Text>
                      <Text fontWeight='medium'>
                        {formatDateTime(tx.created_at || tx.transaction_date) || '—'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                  {items.length > 0 && (
                    <Box mt='12px'>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing='10px'>
                        {items.map((item, idx) => {
                          const qty = Number(item.quantity ?? item.qty ?? 0);
                          const price = Number(
                            item.purchase_price ?? item.unit_price ?? item.price ?? 0,
                          );
                          const lineTotal = Number(
                            item.total_price ??
                              item.line_total ??
                              (qty && price ? qty * price : 0),
                          );
                          return (
                            <Box
                              key={item.id ?? `${idx}-${item.stock_item_id ?? 'new'}`}
                              borderWidth='1px'
                              borderRadius='10px'
                              borderColor={itemBorder}
                              p='10px'
                              bg={itemBg}
                            >
                              <Text fontSize='sm' fontWeight='semibold' color={textColor}>
                                {item.stock_item?.name ||
                                  item.name ||
                                  `Item ${item.stock_item_id ?? idx + 1}`}
                              </Text>
                              {(item.stock_item?.serial_id || item.serial_id) && (
                                <Text fontSize='xs' color='gray.500' mt='2px'>
                                  Serial: {item.stock_item?.serial_id || item.serial_id}
                                </Text>
                              )}
                              <Text fontSize='xs' color='gray.500'>
                                Qty {qty} × PKR {price.toFixed(2)}
                              </Text>
                              <Text fontSize='sm' fontWeight='medium' color='gray.600'>
                                PKR {lineTotal.toFixed(2)}
                              </Text>
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                    </Box>
                  )}
                </Box>
              );
            })}
            {transactions.length === 0 && (
              <Text color='gray.500'>No purchase transactions found for this supplier.</Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}


