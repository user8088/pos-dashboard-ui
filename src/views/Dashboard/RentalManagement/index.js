import React from 'react';
import {
  Box, Button, Flex, Grid, Heading, Text, useColorModeValue, Input, InputGroup, InputLeftElement,
  Select, VStack, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, Spinner, Badge, useToast, Checkbox
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { rentalService } from 'services/rentalService';
import { accountService } from 'services/accountService';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';

const statusColor = (status) => status === 'Rented' ? 'red' : 'green';

const RentalManagement = () => {
  const textColor = useColorModeValue('gray.700', 'white');
  const bgSoft = useColorModeValue('#F8F9FA', 'gray.800');
  const toast = useToast();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('');

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isRentOpen, onOpen: onRentOpen, onClose: onRentClose } = useDisclosure();
  const { isOpen: isReturnOpen, onOpen: onReturnOpen, onClose: onReturnClose } = useDisclosure();

  const [selectedItem, setSelectedItem] = React.useState(null);
  const [newItem, setNewItem] = React.useState({ unique_code: '', name: '', base_rent_amount: '', rent_type: 'month' });
  const [rentForm, setRentForm] = React.useState({ rent_type: 'week', rent_date: new Date().toISOString().slice(0,10), note: '', billing_mode: 'charge_now', account_id: '' });
  const [returnForm, setReturnForm] = React.useState({ return_date: new Date().toISOString().slice(0,10), note: '', collect_on_return: true, account_id: '', rent_type: 'week' });
  const [accounts, setAccounts] = React.useState([]);

  const loadItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await rentalService.listItems({ status: status || undefined, unique_code: query || undefined });
      let list = [];
      if (Array.isArray(resp)) list = resp; else if (Array.isArray(resp?.data)) list = resp.data; else if (Array.isArray(resp?.data?.data)) list = resp.data.data;
      setItems(list);
    } catch (e) {
      console.error('Failed to load rental items:', e);
      toast({ title: 'Error loading items', description: e.message, status: 'error', duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  }, [status, query, toast]);

  React.useEffect(() => { loadItems(); }, [loadItems]);

  // Load accounts for revenue posting
  React.useEffect(() => {
    (async () => {
      try {
        const resp = await accountService.listAccounts();
        const data = resp?.data || resp || {};
        const list = Array.isArray(data) ? data : (data.accounts || []);
        setAccounts(list);
      } catch (_) { /* ignore */ }
    })();
  }, []);

  const onSubmitNew = async () => {
    if (!newItem.unique_code || !newItem.name || !newItem.base_rent_amount) {
      toast({ title: 'Validation', description: 'Code, name and base amount are required', status: 'error' });
      return;
    }
    try {
      await rentalService.createItem({
        unique_code: newItem.unique_code,
        name: newItem.name,
        base_rent_amount: Number(newItem.base_rent_amount),
        rent_type: newItem.rent_type,
      });
      toast({ title: 'Item created', status: 'success' });
      onAddClose();
      setNewItem({ unique_code: '', name: '', base_rent_amount: '', rent_type: 'month' });
      loadItems();
    } catch (e) { toast({ title: 'Failed to create', description: e.message, status: 'error' }); }
  };

  const openRent = (item) => { setSelectedItem(item); setRentForm({ rent_type: 'week', rent_date: new Date().toISOString().slice(0,10), note: '', billing_mode: 'charge_now', account_id: '' }); onRentOpen(); };
  const openReturn = (item) => { setSelectedItem(item); setReturnForm({ return_date: new Date().toISOString().slice(0,10), note: '', collect_on_return: true, account_id: '', rent_type: 'week' }); onReturnOpen(); };

  const onSubmitRent = async () => {
    if (!selectedItem) return;
    try {
      await rentalService.rentItem(selectedItem.id, rentForm);
      toast({ title: 'Item rented', status: 'success' });
      if (rentForm.billing_mode === 'charge_now') {
        try {
          const rates = getRates(selectedItem.base_rent_amount);
          const amount = rates[rentForm.rent_type] || 0;
          if (amount > 0) {
            await accountService.addTransaction({
              account_id: Number(rentForm.account_id || 0) || undefined,
              transaction_type: 'inflow',
              amount: Number(amount.toFixed(2)),
              description: `Rental income — ${selectedItem.unique_code} (${rentForm.rent_type}) from ${rentForm.rent_date}`,
              transaction_date: rentForm.rent_date,
            });
          }
        } catch (e) {
          console.error('Failed to add revenue on rent:', e);
          toast({ title: 'Revenue not recorded', description: e.message, status: 'warning' });
        }
      }
      onRentClose();
      loadItems();
    } catch (e) { toast({ title: 'Failed to rent', description: e.message, status: 'error' }); }
  };

  const onSubmitReturn = async () => {
    if (!selectedItem) return;
    try {
      await rentalService.returnItem(selectedItem.id, returnForm);
      toast({ title: 'Item returned', status: 'success' });
      if (returnForm.collect_on_return) {
        try {
          const rentType = returnForm.rent_type || 'week';
          const amount = calcDueForRange(
            selectedItem.base_rent_amount,
            rentType,
            selectedItem.rent_date,
            returnForm.return_date
          );
          if (amount > 0) {
            await accountService.addTransaction({
              account_id: Number(returnForm.account_id || 0) || undefined,
              transaction_type: 'inflow',
              amount: Number(amount.toFixed(2)),
              description: `Rental income — ${selectedItem.unique_code} (${rentType}) ${selectedItem.rent_date} to ${returnForm.return_date}`,
              transaction_date: returnForm.return_date,
            });
          }
        } catch (e) {
          console.error('Failed to add revenue on return:', e);
          toast({ title: 'Revenue not recorded', description: e.message, status: 'warning' });
        }
      }
      onReturnClose();
      loadItems();
    } catch (e) { toast({ title: 'Failed to return', description: e.message, status: 'error' }); }
  };

  const formatCurrency = (val) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : Number(val);
    const safe = isNaN(num) ? 0 : num;
    return `PKR ${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Rates helper: base is treated as monthly-equivalent
  const getRates = React.useCallback((baseMonthlyAmount) => {
    const base = Number(baseMonthlyAmount) || 0;
    return {
      month: base,
      week: base / 4, // see Rental_managment.mdc
      day: base / 30,
    };
  }, []);

  const calcDueForRange = React.useCallback((baseMonthlyAmount, rentType, rentDateStr, returnDateStr) => {
    const rates = getRates(baseMonthlyAmount);
    const rentDate = rentDateStr ? new Date(rentDateStr) : null;
    const returnDate = returnDateStr ? new Date(returnDateStr) : null;
    if (!rentDate || !returnDate || isNaN(rentDate.getTime()) || isNaN(returnDate.getTime())) return 0;
    const start = new Date(rentDate.getFullYear(), rentDate.getMonth(), rentDate.getDate());
    const end = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffMs / (24*60*60*1000)));
    if (rentType === 'day') return days * (rates.day || 0);
    if (rentType === 'week') return Math.ceil(days / 7) * (rates.week || 0);
    return Math.ceil(days / 30) * (rates.month || 0);
  }, [getRates]);

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Flex justify='space-between' align='center' mb={6}>
        <Box>
          <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='2px'>
            Rental Management
          </Text>
          <Text fontSize='sm' color='gray.500'>Track rental items, availability and history</Text>
        </Box>
        <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={onAddOpen}>Add Item</Button>
      </Flex>

      <Box mb={6} p={4} bg='white' borderRadius='md' boxShadow='sm' border='1px' borderColor='gray.200'>
        <Flex gap={4} align='center' wrap='wrap'>
          <FormControl maxW='300px'>
            <FormLabel fontSize='sm'>Search</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <FiSearch color={useColorModeValue('#718096', '#A0AEC0')} />
              </InputLeftElement>
              <Input placeholder='Search by unique code or name' value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputGroup>
          </FormControl>
          <FormControl maxW='200px'>
            <FormLabel fontSize='sm'>Status</FormLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value=''>All</option>
              <option value='Available'>Available</option>
              <option value='Rented'>Rented</option>
            </Select>
          </FormControl>
          <Button onClick={loadItems}>Refresh</Button>
        </Flex>
      </Box>

      {loading ? (
        <Flex justify='center' align='center' h='300px'><Spinner size='lg' /></Flex>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap='20px'>
          {items.length === 0 ? (
            <Text color='gray.500' p='12px'>No rental items found.</Text>
          ) : items.map((item) => (
            <Box key={item.id} p='20px' bg={bgSoft} borderRadius='12px' border='1px' borderColor='gray.100'>
              <Flex justify='space-between' align='center' mb='8px'>
                <Text fontWeight='bold' color={textColor}>{item.unique_code} — {item.name}</Text>
                <Badge colorScheme={statusColor(item.status)}>{item.status}</Badge>
              </Flex>
              <VStack align='start' spacing='4px' mb='12px'>
                <Text color='gray.500' fontSize='sm'>Base Rent (per month): <Text as='span' color='gray.700' fontWeight='bold'>{formatCurrency(item.base_rent_amount)}</Text></Text>
                {/* Breakdown */}
                {(() => { const r = getRates(item.base_rent_amount); return (
                  <Text color='gray.500' fontSize='sm'>
                    ≈ {formatCurrency(r.day)} / day • {formatCurrency(r.week)} / week • {formatCurrency(r.month)} / month
                  </Text>
                ); })()}
                {item.rent_date && <Text color='gray.500' fontSize='sm'>Rented On: <Text as='span' color='gray.700'>{item.rent_date}</Text></Text>}
              </VStack>
              <HStack>
                {item.status === 'Available' ? (
                  <Button size='sm' bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={() => openRent(item)}>Rent</Button>
                ) : (
                  <Button size='sm' variant='outline' borderColor='#FF8D28' color='#FF8D28' onClick={() => openReturn(item)}>Return</Button>
                )}
              </HStack>
            </Box>
          ))}
        </Grid>
      )}

      {/* Add Item Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Rental Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px'>
              <FormControl isRequired>
                <FormLabel>Unique Code</FormLabel>
                <Input value={newItem.unique_code} onChange={(e) => setNewItem({ ...newItem, unique_code: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Base Rent Amount (month)</FormLabel>
                <Input type='number' step='0.01' value={newItem.base_rent_amount} onChange={(e) => setNewItem({ ...newItem, base_rent_amount: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Default Rent Type</FormLabel>
                <Select value={newItem.rent_type} onChange={(e) => setNewItem({ ...newItem, rent_type: e.target.value })}>
                  <option value='day'>day</option>
                  <option value='week'>week</option>
                  <option value='month'>month</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onAddClose}>Cancel</Button>
            <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={onSubmitNew}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rent Modal */}
      <Modal isOpen={isRentOpen} onClose={onRentClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rent Item — {selectedItem?.unique_code}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px'>
              <FormControl>
                <FormLabel>Rent Type</FormLabel>
                <Select value={rentForm.rent_type} onChange={(e) => setRentForm({ ...rentForm, rent_type: e.target.value })}>
                  <option value='day'>day</option>
                  <option value='week'>week</option>
                  <option value='month'>month</option>
                </Select>
              </FormControl>
              {selectedItem && (
                (() => { const r = getRates(selectedItem.base_rent_amount); const chosen = r[rentForm.rent_type] || 0; return (
                  <Box w='100%' bg={useColorModeValue('gray.50','gray.700')} border='1px' borderColor={useColorModeValue('gray.200','gray.600')} p='10px' borderRadius='8px'>
                    <Text fontSize='sm' color='gray.600'>Charge for this rental</Text>
                    <Text fontWeight='bold'>{formatCurrency(chosen)} <Text as='span' fontWeight='normal' color='gray.500'>/ {rentForm.rent_type}</Text></Text>
                    <Text mt='6px' fontSize='xs' color='gray.500'>Breakdown: {formatCurrency(r.day)} / day • {formatCurrency(r.week)} / week • {formatCurrency(r.month)} / month</Text>
                  </Box>
                ); })()
              )}
              <FormControl>
                <FormLabel>Rent Date</FormLabel>
                <Input type='date' value={rentForm.rent_date} onChange={(e) => setRentForm({ ...rentForm, rent_date: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Billing</FormLabel>
                <Select value={rentForm.billing_mode} onChange={(e) => setRentForm({ ...rentForm, billing_mode: e.target.value })}>
                  <option value='charge_now'>Charge now (1 {rentForm.rent_type})</option>
                  <option value='charge_on_return'>Charge on return (prorated)</option>
                </Select>
              </FormControl>
              {rentForm.billing_mode === 'charge_now' && (
                <FormControl>
                  <FormLabel>Revenue Account</FormLabel>
                  <Select placeholder='Select account' value={rentForm.account_id} onChange={(e) => setRentForm({ ...rentForm, account_id: e.target.value })}>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}{acc.code ? ` (${acc.code})` : ''}</option>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl>
                <FormLabel>Note (optional)</FormLabel>
                <Input value={rentForm.note} onChange={(e) => setRentForm({ ...rentForm, note: e.target.value })} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onRentClose}>Cancel</Button>
            <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={onSubmitRent}>Confirm Rent</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={isReturnOpen} onClose={onReturnClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Return Item — {selectedItem?.unique_code}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px'>
              <FormControl>
                <FormLabel>Return Date</FormLabel>
                <Input type='date' value={returnForm.return_date} onChange={(e) => setReturnForm({ ...returnForm, return_date: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Charge Type Used</FormLabel>
                <Select value={returnForm.rent_type} onChange={(e) => setReturnForm({ ...returnForm, rent_type: e.target.value })}>
                  <option value='day'>day</option>
                  <option value='week'>week</option>
                  <option value='month'>month</option>
                </Select>
              </FormControl>
              {selectedItem && returnForm.return_date && (
                (() => { const due = calcDueForRange(selectedItem.base_rent_amount, returnForm.rent_type, selectedItem.rent_date, returnForm.return_date); return (
                  <Box w='100%' bg={useColorModeValue('gray.50','gray.700')} border='1px' borderColor={useColorModeValue('gray.200','gray.600')} p='10px' borderRadius='8px'>
                    <Text fontSize='sm' color='gray.600'>Amount due for this rental</Text>
                    <Text fontWeight='bold'>{formatCurrency(due)}</Text>
                  </Box>
                ); })()
              )}
              <Checkbox isChecked={returnForm.collect_on_return} onChange={(e) => setReturnForm({ ...returnForm, collect_on_return: e.target.target ? e.target.checked : e.target.checked })}>Collect payment on return</Checkbox>
              {returnForm.collect_on_return && (
                <FormControl>
                  <FormLabel>Revenue Account</FormLabel>
                  <Select placeholder='Select account' value={returnForm.account_id} onChange={(e) => setReturnForm({ ...returnForm, account_id: e.target.value })}>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}{acc.code ? ` (${acc.code})` : ''}</option>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl>
                <FormLabel>Note (optional)</FormLabel>
                <Input value={returnForm.note} onChange={(e) => setReturnForm({ ...returnForm, note: e.target.value })} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onReturnClose}>Cancel</Button>
            <Button variant='outline' borderColor='#FF8D28' color='#FF8D28' onClick={onSubmitReturn}>Confirm Return</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default RentalManagement;


