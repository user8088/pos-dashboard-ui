import React from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Select,
  Button,
  Image,
  Grid,
  GridItem,
  VStack,
  HStack,
  useColorModeValue,
  useToast,
  Spinner,
  IconButton,
  Badge,
  Checkbox,
} from '@chakra-ui/react';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { stockService } from 'services/stockService';
import { customerService } from 'services/customerService';
import { invoiceService } from 'services/invoiceService';
import { accountService } from 'services/accountService';
import { useAuth } from 'contexts/AuthContext';
import placeholder from 'assets/img/avatars/placeholder.png';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

export default function POS() {
  const textColor = useColorModeValue('gray.700','white');
  const toast = useToast();
  const { user } = useAuth();
  const [catalogSearch, setCatalogSearch] = React.useState('');
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState([]);
  const [customerId, setCustomerId] = React.useState('');
  const [paymentMode, setPaymentMode] = React.useState('cash');
  const [discountPercent, setDiscountPercent] = React.useState('');
  const [discountAmount, setDiscountAmount] = React.useState('');
  const [cart, setCart] = React.useState([]); // {id, name, price, basePrice, hiddenCost, qty}
  const [categories, setCategories] = React.useState([]);
  const [categoryId, setCategoryId] = React.useState('');
  const [splitPayments, setSplitPayments] = React.useState({
    cash: { amount: '', accountId: '' },
    online: { amount: '', accountId: '' },
  });
  const [paidAmount, setPaidAmount] = React.useState('');
  const [paymentAs, setPaymentAs] = React.useState('payment');
  const [dueDate, setDueDate] = React.useState('');
  const [applyAdvance, setApplyAdvance] = React.useState(true);
  const [customerProfile, setCustomerProfile] = React.useState(null);
  const [accounts, setAccounts] = React.useState([]);
  const [depositAccountId, setDepositAccountId] = React.useState('');

  const cashAccounts = React.useMemo(
    () => accounts.filter(acc => (acc?.type || '').toLowerCase() === 'cash'),
    [accounts]
  );
  const onlineAccounts = React.useMemo(
    () => accounts.filter(acc => (acc?.type || '').toLowerCase() !== 'cash'),
    [accounts]
  );

  const handleSplitPaymentChange = React.useCallback((key, field, value) => {
    setSplitPayments(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  }, []);

  const handlePaymentModeChange = React.useCallback((nextMode) => {
    setPaymentMode(nextMode);
    if (nextMode === 'split') {
      setPaymentAs('payment');
      setPaidAmount('');
    }
  }, []);

  const normalizePaymentMethod = React.useCallback((method, accountId) => {
    const value = (method || '').toLowerCase();
    if (value === 'online') {
      const account = accounts.find(acc => String(acc.id) === String(accountId));
      const accountType = (account?.type || '').toLowerCase();
      return accountType || 'bank';
    }
    return value || 'cash';
  }, [accounts]);

  const getBasePrice = React.useCallback((line) => {
    if (!line) return 0;
    if (typeof line.basePrice === 'number' && !Number.isNaN(line.basePrice)) {
      return Number(line.basePrice);
    }
    const catalogItem = items.find(it => it.id === line.id);
    if (catalogItem) {
      return Number(catalogItem.price || 0);
    }
    return Number(line.price || 0);
  }, [items]);

  const loadCatalog = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await stockService.listItems({ search: catalogSearch || undefined, product_category_id: categoryId || undefined });
      const raw = resp?.data?.data || resp?.data || resp || [];
      setItems(raw.map(it => ({
        id: it.id,
        name: it.name,
        serial_id: it.serial_id || it.serial_number || '',
        price: Number(it.selling_price || 0),
        cost: Number(it.last_purchase_price || 0),
        image: it.image_url || placeholder,
        stock: it.quantity ?? it.stock_quantity ?? it.inventory_quantity ?? it.qty ?? undefined,
      })));
    } finally { setLoading(false); }
  }, [catalogSearch, categoryId]);

  const loadCustomers = React.useCallback(async () => {
    try {
      const resp = await customerService.list({ per_page: 50 });
      const list = resp?.data?.data || resp?.data || resp || [];
      setCustomers(list);
    } catch (_) {}
  }, []);

  const loadCategories = React.useCallback(async () => {
    try {
      const resp = await stockService.listCategories({});
      const list = resp?.data?.data || resp?.data || resp || [];
      setCategories(list);
    } catch (_) {}
  }, []);

  const loadAccounts = React.useCallback(async () => {
    try {
      const resp = await accountService.listAccounts();
      const data = resp?.data || resp || {};
      const accountsList = Array.isArray(data) ? data : (data.accounts || []);
      setAccounts(accountsList);
      // Auto-select cash account if available
      const normalizeType = (acc) => (acc?.type || '').toLowerCase();
      const cashAccount = accountsList.find(acc => normalizeType(acc) === 'cash');
      if (cashAccount) {
        setDepositAccountId(String(cashAccount.id));
      } else if (accountsList.length > 0) {
        setDepositAccountId(String(accountsList[0].id));
      }
      const onlineAccount = accountsList.find(acc => normalizeType(acc) !== 'cash');
      setSplitPayments(prev => ({
        cash: {
          ...prev.cash,
          accountId: prev.cash.accountId || (cashAccount ? String(cashAccount.id) : (accountsList[0] ? String(accountsList[0].id) : '')),
        },
        online: {
          ...prev.online,
          accountId: prev.online.accountId || (onlineAccount ? String(onlineAccount.id) : (accountsList[0] ? String(accountsList[0].id) : '')),
        },
      }));
    } catch (_) {}
  }, []);

  React.useEffect(() => { loadCatalog(); }, [loadCatalog]);
  const loadCustomerProfile = React.useCallback(async (id) => {
    if (!id) { setCustomerProfile(null); return null; }
    try {
      const resp = await customerService.profile(id);
      setCustomerProfile(resp?.data || resp);
      return resp?.data || resp || null;
    } catch (_) { setCustomerProfile(null); return null; }
  }, []);

  React.useEffect(() => { loadCustomers(); loadCategories(); loadAccounts(); }, [loadCustomers, loadCategories, loadAccounts]);
  React.useEffect(() => { loadCustomerProfile(customerId); }, [customerId, loadCustomerProfile]);

  const addToCart = (p) => {
    setCart(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        const existing = copy[idx];
        copy[idx] = {
          ...existing,
          basePrice: getBasePrice(existing) || Number(p.price || 0),
          qty: existing.qty + 1,
        };
        return copy;
      }
      return [...prev, { id: p.id, name: p.name, serial_id: p.serial_id || '', price: p.price, basePrice: p.price, cost: p.cost, qty: 1, hiddenCost: 0 }];
    });
  };
  const changeQty = (id, delta) => {
    setCart(prev => prev.map(x => x.id === id
      ? { ...x, basePrice: getBasePrice(x), qty: Math.max(1, x.qty + delta) }
      : x));
  };
  const removeLine = (id) => setCart(prev => prev.filter(x => x.id !== id));

  const baseSubtotal = cart.reduce((s, l) => s + l.qty * getBasePrice(l), 0);
  const manualDiscount = cart.reduce((s, l) => {
    const base = getBasePrice(l);
    const diff = base - l.price;
    return diff > 0 ? s + diff * l.qty : s;
  }, 0);
  const subtotal = cart.reduce((s, l) => s + l.qty * l.price, 0);
  const discountFromPercent = discountPercent ? subtotal * (Number(discountPercent) / 100) : 0;
  const discountFixed = Number(discountAmount || 0);
  const hiddenCostsAmount = cart.reduce((s, l) => s + Number(l.hiddenCost || 0), 0);
  const total = Math.max(0, subtotal - discountFromPercent - discountFixed + hiddenCostsAmount);
  const totalDiscount = manualDiscount + discountFromPercent + discountFixed;

  const totalQty = cart.reduce((s, l) => s + l.qty, 0);
  const originalUnitPrice = totalQty ? baseSubtotal / totalQty : 0;

  // Advance math preview
  const existingAdvance = Number(customerProfile?.advance_balance || 0);
  const applyAdvanceEffective = paymentAs === 'advance' ? false : applyAdvance;
  const applyFromAdvance = applyAdvanceEffective ? Math.min(existingAdvance, total) : 0;
  const remainingAfterAdvance = Math.max(0, total - applyFromAdvance);
  const splitPaidTotal = Number(splitPayments.cash.amount || 0) + Number(splitPayments.online.amount || 0);
  const payNow = paymentMode === 'split'
    ? splitPaidTotal
    : Number(paidAmount || 0);
  const remainingAfterPay = paymentAs === 'payment' ? Math.max(0, remainingAfterAdvance - payNow) : remainingAfterAdvance;
  const newAdvance = paymentAs === 'payment'
    ? Math.max(0, payNow - remainingAfterAdvance) // overflow becomes advance
    : existingAdvance + payNow; // entire paid becomes advance
  const estimatedDue = paymentAs === 'advance' ? remainingAfterAdvance : remainingAfterPay;
  const estimatedNewAdvance = paymentAs === 'advance' ? existingAdvance + payNow : newAdvance;

  const generateInvoice = async () => {
    if (cart.length === 0) return;
    if (paymentMode !== 'split' && !depositAccountId) {
      toast({
        title: 'Missing deposit account',
        description: 'Please select a deposit account before checkout.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const payload = {
        customer_id: customerId ? Number(customerId) : undefined,
        payment_mode: paymentMode,
        paymentMode: paymentMode,
        discount_percent: discountPercent ? Number(discountPercent) : undefined,
        discount_amount: discountAmount ? Number(discountAmount) : undefined,
        due_date: dueDate || undefined,
        salesperson_user_id: user?.id ? Number(user.id) : undefined,
        apply_advance: applyAdvanceEffective,
        items: cart.map(l => ({
          stock_item_id: l.id,
          quantity: l.qty,
          unit_price: l.price,
          hidden_cost: l.hiddenCost !== undefined ? Number(l.hiddenCost || 0) : undefined,
        })),
      };
      const payAmountValue = payNow > 0 ? payNow : undefined;

      if (paymentMode === 'split') {
        const cashAmount = Number(splitPayments.cash.amount || 0);
        const onlineAmount = Number(splitPayments.online.amount || 0);
        const breakdown = [];
        if (cashAmount > 0) {
          const cashAccountId = splitPayments.cash.accountId || (cashAccounts[0] ? String(cashAccounts[0].id) : '');
          if (!cashAccountId) {
            toast({
              title: 'Missing cash account',
              description: 'Select an account for the cash portion.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
            return;
          }
          breakdown.push({
            payment_method: normalizePaymentMethod('cash', cashAccountId),
            amount: cashAmount,
            deposit_account_id: Number(cashAccountId),
          });
        }
        if (onlineAmount > 0) {
          const onlineAccountId = splitPayments.online.accountId || (onlineAccounts[0] ? String(onlineAccounts[0].id) : '');
          if (!onlineAccountId) {
            toast({
              title: 'Missing online account',
              description: 'Select an account for the online portion.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
            return;
          }
          breakdown.push({
            payment_method: normalizePaymentMethod('online', onlineAccountId),
            amount: onlineAmount,
            deposit_account_id: Number(onlineAccountId),
          });
        }
        if (!breakdown.length) {
          toast({
            title: 'Missing payment amounts',
            description: 'Enter at least one payment amount for split checkout.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          return;
        }
        payload.payment_method = breakdown[0]?.payment_method || 'cash';
        payload.payment_breakdown = breakdown;
        if (breakdown[0]?.deposit_account_id) {
          payload.deposit_account_id = Number(breakdown[0].deposit_account_id);
        }
        payload.payment_as = 'payment';
        if (payAmountValue) {
          payload.paid_amount = payAmountValue;
        }
      } else {
        const normalizedPaymentMethod = normalizePaymentMethod(paymentMode, depositAccountId);
        payload.deposit_account_id = Number(depositAccountId);
        payload.payment_method = normalizedPaymentMethod;
        if (payAmountValue) {
          payload.paid_amount = payAmountValue;
          payload.payment_as = paymentAs === 'advance' ? 'advance' : paymentAs;
        } else if (paymentAs === 'advance') {
          payload.payment_as = 'advance';
        }
      }
      const response = await invoiceService.createInvoice(payload);
      // clear cart
      setCart([]);
      setDiscountAmount(''); setDiscountPercent('');
      if (customerId) {
        setCustomerProfile(prev => ({
          ...(prev || {}),
          id: prev?.id || Number(customerId),
          due_balance: Number(estimatedDue.toFixed(2)),
          advance_balance: Number(estimatedNewAdvance.toFixed(2)),
        }));
      }
      // Notify stock table to refresh
      window.dispatchEvent(new CustomEvent('invoice-created'));
      window.dispatchEvent(new CustomEvent('stock-updated'));
      if (customerId) {
        const updatedProfile = await loadCustomerProfile(customerId);
        if (!updatedProfile || typeof updatedProfile !== 'object') {
          const due = response?.data?.customer_due_balance ?? response?.customer_due_balance;
          const advance = response?.data?.customer_advance_balance ?? response?.customer_advance_balance;
          if (typeof due !== 'undefined' || typeof advance !== 'undefined') {
            setCustomerProfile(prev => ({
              ...(prev || {}),
              due_balance: typeof due !== 'undefined' ? Number(due) : prev?.due_balance ?? 0,
              advance_balance: typeof advance !== 'undefined' ? Number(advance) : prev?.advance_balance ?? 0,
              id: prev?.id || Number(customerId),
            }));
          }
        }
      }
      toast({
        title: 'Invoice created',
        description: 'The invoice has been recorded successfully.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (e) {
      const errorMessages = e?.errors
        ? Object.values(e.errors).flat().join('\n')
        : '';
      const message = e?.message || 'Failed to create invoice';
      toast({
        title: 'Validation errors',
        description: errorMessages || message,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='3'>Point of Sale</Text>

     

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap='16px'>
        {/* Left: Catalog */}
        <GridItem>
          <Card>
            <CardHeader>
              <HStack spacing='12px' wrap='wrap'>
                <Input placeholder='Search products...' value={catalogSearch} onChange={(e)=> setCatalogSearch(e.target.value)} width='260px' onKeyDown={(e)=> { if (e.key==='Enter') loadCatalog(); }} />
                <Select placeholder='All Categories' value={categoryId} onChange={(e)=> setCategoryId(e.target.value)} width='200px'>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Button onClick={loadCatalog} variant='outline' borderColor='#FF8D28' color='#FF8D28'>Search</Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Flex align='center' justify='center' py='24px'><Spinner /></Flex>
              ) : (
                <Grid templateColumns={{ base: 'repeat(1,1fr)', md: 'repeat(2,1fr)', xl: 'repeat(3,1fr)' }} gap='12px'>
                  {items.map(p => {
                    const stock = typeof p.stock !== 'undefined' && p.stock !== null ? Number(p.stock) : null;
                    const isLowStock = stock !== null && stock < 10 && stock > 0;
                    const isOutOfStock = stock !== null && stock === 0;
                    const hasStock = stock !== null;
                    return (
                      <Box 
                        key={p.id} 
                        borderWidth={isLowStock || isOutOfStock ? '2px' : '1px'}
                        borderRadius='12px' 
                        p='12px'
                        borderColor={isLowStock ? 'orange.400' : isOutOfStock ? 'red.300' : 'gray.200'}
                        bg={isLowStock ? 'orange.50' : isOutOfStock ? 'red.50' : undefined}
                        position='relative'
                      >
                        <Image src={p.image} alt={p.name} borderRadius='8px' w='100%' h='120px' objectFit='cover' mb='8px' />
                        <Text fontWeight='semibold' mb='1' noOfLines={1}>{p.name}</Text>
                        {p.serial_id && (
                          <Text fontSize='xs' color='gray.500' mb='1'>Serial: {p.serial_id}</Text>
                        )}
                        <VStack align='stretch' spacing='8px' mb='2'>
                          <HStack justify='space-between'>
                            <Text color='gray.600' fontSize='md' fontWeight='semibold'>PKR {p.price.toFixed(2)}</Text>
                          </HStack>
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb='1'>Stock Quantity:</Text>
                            {hasStock ? (
                              <Badge 
                                colorScheme={isOutOfStock ? 'red' : isLowStock ? 'orange' : 'green'}
                                fontSize='sm'
                                px='3'
                                py='1'
                                borderRadius='full'
                                fontWeight='bold'
                              >
                                {isOutOfStock ? 'OUT OF STOCK (0)' : isLowStock ? `LOW STOCK: ${stock}` : `IN STOCK: ${stock}`}
                              </Badge>
                            ) : (
                              <Badge 
                                colorScheme='gray'
                                fontSize='sm'
                                px='3'
                                py='1'
                                borderRadius='full'
                              >
                                Stock: N/A
                              </Badge>
                            )}
                          </Box>
                        </VStack>
                        <Button 
                          size='sm' 
                          variant='outline' 
                          borderColor='#FF8D28' 
                          color='#FF8D28' 
                          onClick={()=> addToCart(p)} 
                          w='100%'
                          isDisabled={isOutOfStock}
                        >
                          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </Box>
                    );
                  })}
                  {items.length === 0 && (
                    <Box textAlign='center' color='gray.500' gridColumn='1/-1'>No products</Box>
                  )}
                </Grid>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Right: Cart */}
        <GridItem>
          <Card>
            <CardHeader>
              <HStack justify='space-between'>
                <Text color={textColor} fontWeight='bold'>Cart ({cart.length} items)</Text>
                {cart.length>0 && <Button size='sm' variant='ghost' color='red.400' onClick={()=> setCart([])}>Clear</Button>}
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align='stretch' spacing='10px'>
                {/* Checkout controls (duplicated for convenience) */}
                <VStack align='stretch' spacing='8px'>
                  <HStack align='stretch' spacing='10px'>
                    <Select placeholder='Select customer' value={customerId} onChange={(e)=> setCustomerId(e.target.value)} width='100%'>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                    </Select>
                    <Select value={paymentMode} onChange={(e)=> handlePaymentModeChange(e.target.value)} width='220px'>
                      <option value='cash'>Cash</option>
                      <option value='online'>Online</option>
                      <option value='split'>Split (Cash + Online)</option>
                    </Select>
                  </HStack>
                  {paymentMode === 'split' ? (
                    <Box borderWidth='1px' borderRadius='8px' p='12px'>
                      <Text fontWeight='semibold' fontSize='sm' mb='2'>Split payment (cash + online)</Text>
                      <VStack align='stretch' spacing='8px'>
                        <Box>
                          <Text fontSize='sm' color='gray.600' mb='1'>Cash amount</Text>
                          <HStack align='flex-start' spacing='10px'>
                            <Input
                              width='160px'
                              type='number'
                              min='0'
                              value={splitPayments.cash.amount}
                              onChange={(e)=> handleSplitPaymentChange('cash', 'amount', e.target.value)}
                              placeholder='0.00'
                            />
                            <Select
                              flex='1'
                              placeholder={cashAccounts.length ? 'Select cash account *' : 'Select account *'}
                              value={splitPayments.cash.accountId}
                              onChange={(e)=> handleSplitPaymentChange('cash', 'accountId', e.target.value)}
                              borderColor={!splitPayments.cash.accountId && Number(splitPayments.cash.amount || 0) > 0 ? 'red.300' : undefined}
                            >
                              {(cashAccounts.length ? cashAccounts : accounts).map(acc => (
                                <option key={`cash-${acc.id}`} value={acc.id}>
                                  {acc.name} {acc.code ? `(${acc.code})` : ''} - PKR {Number(acc.balance || 0).toFixed(2)}
                                </option>
                              ))}
                            </Select>
                          </HStack>
                        </Box>
                        <Box>
                          <Text fontSize='sm' color='gray.600' mb='1'>Online amount</Text>
                          <HStack align='flex-start' spacing='10px'>
                            <Input
                              width='160px'
                              type='number'
                              min='0'
                              value={splitPayments.online.amount}
                              onChange={(e)=> handleSplitPaymentChange('online', 'amount', e.target.value)}
                              placeholder='0.00'
                            />
                            <Select
                              flex='1'
                              placeholder={onlineAccounts.length ? 'Select online account *' : 'Select account *'}
                              value={splitPayments.online.accountId}
                              onChange={(e)=> handleSplitPaymentChange('online', 'accountId', e.target.value)}
                              borderColor={!splitPayments.online.accountId && Number(splitPayments.online.amount || 0) > 0 ? 'red.300' : undefined}
                            >
                              {(onlineAccounts.length ? onlineAccounts : accounts).map(acc => (
                                <option key={`online-${acc.id}`} value={acc.id}>
                                  {acc.name} {acc.code ? `(${acc.code})` : ''} - PKR {Number(acc.balance || 0).toFixed(2)}
                                </option>
                              ))}
                            </Select>
                          </HStack>
                        </Box>
                        <Text fontSize='sm' color='gray.600'>Total paid now: PKR {splitPaidTotal.toFixed(2)}</Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Select 
                      placeholder='Select deposit account *' 
                      value={depositAccountId} 
                      onChange={(e)=> setDepositAccountId(e.target.value)} 
                      isRequired
                      borderColor={!depositAccountId ? 'red.300' : undefined}>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} {acc.code ? `(${acc.code})` : ''} - PKR {Number(acc.balance || 0).toFixed(2)}
                        </option>
                      ))}
                    </Select>
                  )}
                  <HStack>
                    <Input placeholder='Discount %' type='number' value={discountPercent} onChange={(e)=> setDiscountPercent(e.target.value)} />
                    <Input placeholder='Discount amount' type='number' value={discountAmount} onChange={(e)=> setDiscountAmount(e.target.value)} />
                  </HStack>
                </VStack>
                {cart.map(line => (
                  <Box key={line.id} borderWidth='1px' borderRadius='10px' p='10px'>
                    <HStack justify='space-between'>
                      <VStack align='flex-start' spacing='0'>
                        <Text fontWeight='semibold'>{line.name}</Text>
                        {line.serial_id && (
                          <Text fontSize='xs' color='gray.500'>Serial: {line.serial_id}</Text>
                        )}
                      </VStack>
                      <IconButton size='sm' aria-label='remove' icon={<FaTrash />} variant='ghost' color='red.400' onClick={()=> removeLine(line.id)} />
                    </HStack>
                    <HStack justify='space-between' mt='2'>
                      <HStack>
                        <IconButton size='sm' icon={<FaMinus />} onClick={()=> changeQty(line.id, -1)} />
                        <Text minW='24px' textAlign='center'>{line.qty}</Text>
                        <IconButton size='sm' icon={<FaPlus />} onClick={()=> changeQty(line.id, 1)} />
                      </HStack>
                      <HStack>
                        <Text color='gray.500'>Custom Price:</Text>
                        <Input width='140px' type='number' step='any' value={line.price} onChange={(e)=> {
                          const val = Number(e.target.value || 0);
                          setCart(prev => prev.map(x => x.id===line.id
                            ? { ...x, basePrice: getBasePrice(x), price: val }
                            : x));
                        }} placeholder='Enter custom price' />
                        <Text>PKR {(line.qty * line.price).toFixed(2)}</Text>
                      </HStack>
                    </HStack>
                    <HStack justify='space-between' mt='3'>
                      <Text color='gray.500'>Hidden cost for this item:</Text>
                      <Input
                        width='140px'
                        type='number'
                        step='any'
                        value={line.hiddenCost ?? ''}
                        onChange={(e)=> {
                          const val = Number(e.target.value || 0);
                          setCart(prev => prev.map(x => x.id===line.id
                            ? { ...x, hiddenCost: val }
                            : x));
                        }}
                        placeholder='0'
                      />
                      <Text color='orange.500'>+ PKR {Number(line.hiddenCost || 0).toFixed(2)}</Text>
                    </HStack>
                  </Box>
                ))}
                {cart.length === 0 && <Text color='gray.500'>Cart is empty</Text>}
                <Box borderTopWidth='1px' pt='10px'>
                  {totalQty > 0 && (
                    <Box mb='3'>
                      <Text fontWeight='semibold' mb='1'>Per Unit Summary</Text>
                      <Text color='gray.600'>Original unit price: PKR {originalUnitPrice.toFixed(2)}</Text>
                      <Text color='gray.600'>Total price (selling price × quantity): PKR {baseSubtotal.toFixed(2)}</Text>
                    </Box>
                  )}
                  <Text>Discount: PKR {totalDiscount.toFixed(2)}</Text>
                  {manualDiscount > 0 && (
                    <Text fontSize='sm' color='gray.500'>Includes PKR {manualDiscount.toFixed(2)} from price adjustments</Text>
                  )}
                  {hiddenCostsAmount > 0 && <Text color='orange.500' fontSize='sm'>Hidden Costs: PKR {hiddenCostsAmount.toFixed(2)}</Text>}
                  <Text fontWeight='bold'>Total: PKR {total.toFixed(2)}</Text>
                </Box>
                {/* Payment at checkout */}
                <VStack align='stretch' spacing='8px'>
                  {paymentMode === 'split' ? (
                    <Box fontSize='sm' color='gray.600'>
                      <Text>Split payment total for this invoice: PKR {splitPaidTotal.toFixed(2)}</Text>
                      <Text fontSize='xs' color='gray.500'>Split payments are applied immediately to this invoice.</Text>
                      {splitPaidTotal < remainingAfterAdvance && (
                        <Text color='orange.500'>Remaining balance will stay as due until settled.</Text>
                      )}
                    </Box>
                  ) : (
                    <HStack>
                      <Input placeholder='Paid amount (optional)' type='number' value={paidAmount} onChange={(e)=> setPaidAmount(e.target.value)} />
                      <Select value={paymentAs} onChange={(e)=> setPaymentAs(e.target.value)} width='220px'>
                        <option value='payment'>Apply to this invoice</option>
                        <option value='advance'>Store as customer advance</option>
                      </Select>
                    </HStack>
                  )}
                  <Input
                    type='date'
                    placeholder='Due date'
                    value={dueDate}
                    onChange={(e)=> setDueDate(e.target.value)}
                  />
                  {customerId && existingAdvance > 0 && (
                    <Checkbox
                      isChecked={applyAdvanceEffective}
                      isDisabled={paymentAs === 'advance' && paymentMode !== 'split'}
                      onChange={(e)=> setApplyAdvance(e.target.checked)}
                      fontSize='sm'
                    >
                      Apply customer advance (PKR {existingAdvance.toFixed(2)})
                    </Checkbox>
                  )}
                  {customerId && (
                    <Box fontSize='sm' color='gray.600'>
                      {existingAdvance > 0 && <Text>Customer advance: PKR {existingAdvance.toFixed(2)}</Text>}
                      <Text>Will apply from advance: PKR {applyFromAdvance.toFixed(2)}</Text>
                      {paymentMode === 'split' ? (
                        <Text>Split applied now: Cash PKR {Number(splitPayments.cash.amount || 0).toFixed(2)} + Online PKR {Number(splitPayments.online.amount || 0).toFixed(2)}</Text>
                      ) : paymentAs === 'payment' ? (
                        <Text>Paid now applied to invoice: PKR {Math.min(payNow, remainingAfterAdvance).toFixed(2)} • Excess to advance: PKR {Math.max(0, payNow - remainingAfterAdvance).toFixed(2)}</Text>
                      ) : (
                        <Text>Paid now stored as advance: PKR {payNow.toFixed(2)}</Text>
                      )}
                      {paymentAs === 'advance' && paymentMode !== 'split' && (
                        <Text fontSize='sm' color='gray.500'>Invoice remains due until the stored advance is applied later.</Text>
                      )}
                      <Text fontWeight='semibold'>Estimated due: PKR {estimatedDue.toFixed(2)} • Estimated new advance: PKR {estimatedNewAdvance.toFixed(2)}</Text>
                    </Box>
                  )}
                </VStack>
                <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={generateInvoice} isDisabled={cart.length===0}>Checkout - PKR {total.toFixed(0)}</Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Flex>
  );
}


