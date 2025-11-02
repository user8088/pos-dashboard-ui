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
  const { user } = useAuth();
  const [catalogSearch, setCatalogSearch] = React.useState('');
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState([]);
  const [customerId, setCustomerId] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('cash');
  const [discountPercent, setDiscountPercent] = React.useState('');
  const [discountAmount, setDiscountAmount] = React.useState('');
  const [cart, setCart] = React.useState([]); // {id, name, price, qty}
  const [categories, setCategories] = React.useState([]);
  const [categoryId, setCategoryId] = React.useState('');
  const [paidAmount, setPaidAmount] = React.useState('');
  const [paymentAs, setPaymentAs] = React.useState('payment');
  const [dueDate, setDueDate] = React.useState('');
  const [hiddenCosts, setHiddenCosts] = React.useState('');
  const [applyAdvance, setApplyAdvance] = React.useState(true);
  const [customerProfile, setCustomerProfile] = React.useState(null);
  const [accounts, setAccounts] = React.useState([]);
  const [depositAccountId, setDepositAccountId] = React.useState('');

  const loadCatalog = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await stockService.listItems({ search: catalogSearch || undefined, product_category_id: categoryId || undefined });
      const raw = resp?.data?.data || resp?.data || resp || [];
      setItems(raw.map(it => ({
        id: it.id,
        name: it.name,
        price: Number(it.selling_price || 0),
        cost: Number(it.last_purchase_price || 0),
        image: it.image_url || placeholder,
        stock: it.qty ?? undefined,
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
      const cashAccount = accountsList.find(acc => acc.type === 'cash');
      if (cashAccount) {
        setDepositAccountId(String(cashAccount.id));
      }
    } catch (_) {}
  }, []);

  React.useEffect(() => { loadCatalog(); }, [loadCatalog]);
  React.useEffect(() => { loadCustomers(); loadCategories(); loadAccounts(); }, [loadCustomers, loadCategories, loadAccounts]);
  React.useEffect(() => { // load selected customer balances
    (async () => {
      if (!customerId) { setCustomerProfile(null); return; }
      try {
        const resp = await customerService.profile(customerId);
        setCustomerProfile(resp?.data || resp);
      } catch (_) { setCustomerProfile(null); }
    })();
  }, [customerId]);

  const addToCart = (p) => {
    setCart(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, cost: p.cost, qty: 1 }];
    });
  };
  const changeQty = (id, delta) => {
    setCart(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x));
  };
  const removeLine = (id) => setCart(prev => prev.filter(x => x.id !== id));

  const subtotal = cart.reduce((s, l) => s + l.qty * l.price, 0);
  const discountFromPercent = discountPercent ? subtotal * (Number(discountPercent) / 100) : 0;
  const discountFixed = Number(discountAmount || 0);
  const hiddenCostsAmount = Number(hiddenCosts || 0);
  const total = Math.max(0, subtotal - discountFromPercent - discountFixed + hiddenCostsAmount);

  // Calculate total cost, profit/loss after discounts (including hidden costs)
  const totalCost = cart.reduce((s, l) => s + l.qty * (l.cost || 0), 0);
  const finalRevenue = total; // This is after all discounts and hidden costs
  const profitLoss = finalRevenue - totalCost;

  // Advance math preview
  const existingAdvance = Number(customerProfile?.advance_balance || 0);
  const applyFromAdvance = applyAdvance ? Math.min(existingAdvance, total) : 0;
  const remainingAfterAdvance = Math.max(0, total - applyFromAdvance);
  const payNow = Number(paidAmount || 0);
  const remainingAfterPay = paymentAs === 'payment' ? Math.max(0, remainingAfterAdvance - payNow) : remainingAfterAdvance;
  const newAdvance = paymentAs === 'payment'
    ? Math.max(0, payNow - remainingAfterAdvance) // overflow becomes advance
    : existingAdvance + payNow; // entire paid becomes advance

  const generateInvoice = async () => {
    if (cart.length === 0) return;
    if (!depositAccountId) {
      alert('Please select a deposit account');
      return;
    }
    try {
      const payload = {
        customer_id: customerId ? Number(customerId) : undefined,
        deposit_account_id: Number(depositAccountId),
        payment_method: paymentMethod,
        discount_percent: discountPercent ? Number(discountPercent) : undefined,
        discount_amount: discountAmount ? Number(discountAmount) : undefined,
        hidden_costs: hiddenCosts ? Number(hiddenCosts) : undefined,
        paid_amount: paidAmount ? Number(paidAmount) : undefined,
        payment_as: paidAmount ? paymentAs : undefined,
        due_date: dueDate || undefined,
        salesperson_user_id: user?.id ? Number(user.id) : undefined,
        apply_advance: applyAdvance,
        items: cart.map(l => ({ stock_item_id: l.id, quantity: l.qty, unit_price: l.price })),
      };
      await invoiceService.createInvoice(payload);
      // clear cart
      setCart([]);
      setDiscountAmount(''); setDiscountPercent(''); setHiddenCosts('');
      // Notify stock table to refresh
      window.dispatchEvent(new CustomEvent('invoice-created'));
      window.dispatchEvent(new CustomEvent('stock-updated'));
      alert('Invoice created');
    } catch (e) { alert(e?.message || 'Failed to create invoice'); }
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
                  {items.map(p => (
                    <Box key={p.id} borderWidth='1px' borderRadius='12px' p='12px'>
                      <Image src={p.image} alt={p.name} borderRadius='8px' w='100%' h='120px' objectFit='cover' mb='8px' />
                      <Text fontWeight='semibold' mb='1' noOfLines={1}>{p.name}</Text>
                      <HStack justify='space-between' mb='2'>
                        <Text color='gray.600'>PKR {p.price.toFixed(2)}</Text>
                        {typeof p.stock !== 'undefined' && <Badge colorScheme={p.stock>0?'green':'red'}>{p.stock} In Stock</Badge>}
                      </HStack>
                      <Button size='sm' variant='outline' borderColor='#FF8D28' color='#FF8D28' onClick={()=> addToCart(p)} w='100%'>Add to Cart</Button>
                    </Box>
                  ))}
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
                  <HStack>
                    <Select placeholder='Select customer' value={customerId} onChange={(e)=> setCustomerId(e.target.value)} width='100%'>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                    </Select>
                    <Select value={paymentMethod} onChange={(e)=> setPaymentMethod(e.target.value)} width='180px'>
                      <option value='cash'>Cash</option>
                      <option value='card'>Card</option>
                      <option value='bank'>Bank</option>
                    </Select>
                  </HStack>
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
                  <HStack>
                    <Input placeholder='Discount %' type='number' value={discountPercent} onChange={(e)=> setDiscountPercent(e.target.value)} />
                    <Input placeholder='Discount amount' type='number' value={discountAmount} onChange={(e)=> setDiscountAmount(e.target.value)} />
                  </HStack>
                  <Input placeholder='Hidden costs (Delivery, etc.)' type='number' value={hiddenCosts} onChange={(e)=> setHiddenCosts(e.target.value)} />
                </VStack>
                {cart.map(line => (
                  <Box key={line.id} borderWidth='1px' borderRadius='10px' p='10px'>
                    <HStack justify='space-between'>
                      <Text fontWeight='semibold'>{line.name}</Text>
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
                          setCart(prev => prev.map(x => x.id===line.id ? { ...x, price: val } : x));
                        }} placeholder='Enter custom price' />
                        <Text>PKR {(line.qty * line.price).toFixed(2)}</Text>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
                {cart.length === 0 && <Text color='gray.500'>Cart is empty</Text>}
                <Box borderTopWidth='1px' pt='10px'>
                  <Text>Subtotal: PKR {subtotal.toFixed(2)}</Text>
                  <Text>Discount: PKR {(discountFromPercent + discountFixed).toFixed(2)}</Text>
                  {hiddenCostsAmount > 0 && <Text color='orange.500' fontSize='sm'>Hidden Costs: PKR {hiddenCostsAmount.toFixed(2)}</Text>}
                  <Text fontWeight='bold'>Total: PKR {total.toFixed(2)}</Text>
                  <Box mt='2' pt='2' borderTopWidth='1px'>
                    <Text fontSize='sm' color='gray.600'>Total Cost: PKR {totalCost.toFixed(2)}</Text>
                    <Text fontSize='md' fontWeight='semibold' color={profitLoss >= 0 ? 'green.500' : 'red.500'}>
                      {profitLoss >= 0 ? 'Profit' : 'Loss'}: PKR {Math.abs(profitLoss).toFixed(2)}
                    </Text>
                  </Box>
                </Box>
                {/* Payment at checkout */}
                <VStack align='stretch' spacing='8px'>
                  <HStack>
                    <Input placeholder='Paid amount (optional)' type='number' value={paidAmount} onChange={(e)=> setPaidAmount(e.target.value)} />
                    <Select value={paymentAs} onChange={(e)=> setPaymentAs(e.target.value)} width='220px'>
                      <option value='payment'>Apply to this invoice</option>
                      <option value='advance'>Store as customer advance</option>
                    </Select>
                  </HStack>
                  <HStack>
                    <Input type='date' placeholder='Due date' value={dueDate} onChange={(e)=> setDueDate(e.target.value)} />
                  </HStack>
                  {customerId && existingAdvance > 0 && (
                    <Checkbox isChecked={applyAdvance} onChange={(e)=> setApplyAdvance(e.target.checked)} fontSize='sm'>
                      Apply customer advance (PKR {existingAdvance.toFixed(2)})
                    </Checkbox>
                  )}
                  {customerId && (
                    <Box fontSize='sm' color='gray.600'>
                      {existingAdvance > 0 && <Text>Customer advance: PKR {existingAdvance.toFixed(2)}</Text>}
                      <Text>Will apply from advance: PKR {applyFromAdvance.toFixed(2)}</Text>
                      {paymentAs === 'payment' ? (
                        <Text>Paid now applied to invoice: PKR {Math.min(payNow, remainingAfterAdvance).toFixed(2)} • Excess to advance: PKR {Math.max(0, payNow - remainingAfterAdvance).toFixed(2)}</Text>
                      ) : (
                        <Text>Paid now stored as advance: PKR {payNow.toFixed(2)}</Text>
                      )}
                      <Text fontWeight='semibold'>Estimated due: PKR {remainingAfterPay.toFixed(2)} • Estimated new advance: PKR {newAdvance.toFixed(2)}</Text>
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


