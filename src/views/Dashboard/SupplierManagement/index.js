import React from 'react';
import {
  Box, Button, Flex, Grid, Text, useColorModeValue, Input, InputGroup, InputLeftElement,
  Select, VStack, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, Spinner, Badge, useToast, IconButton
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { AddIcon, RepeatIcon } from '@chakra-ui/icons';
import { supplierService } from 'services/supplierService';
import { stockService } from 'services/stockService';
import { useHistory } from 'react-router-dom';

const SupplierManagement = () => {
  const textColor = useColorModeValue('gray.700', 'white');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();
  const history = useHistory();

  const [suppliers, setSuppliers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [selectedSupplier, setSelectedSupplier] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [units, setUnits] = React.useState([]);

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isPurchaseOpen, onOpen: onPurchaseOpen, onClose: onPurchaseClose } = useDisclosure();

  const [newSupplier, setNewSupplier] = React.useState({ name: '', phone: '', address: '' });
  const [editSupplier, setEditSupplier] = React.useState(null);
  const today = new Date().toISOString().slice(0,10);
  const [purchaseForm, setPurchaseForm] = React.useState({ serial: '', transaction_date: today, note: '', items: [{ mode: 'existing', stock_item_id: '', quantity: '', purchase_price: '', new_item: { name: '', product_category_id: '', primary_unit_id: '', secondary_unit_id: '', secondary_per_primary: '', qty_per_primary_unit: '', qty_per_secondary_unit: '', selling_price: '', image_url: '' } }] });

  const loadSuppliers = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await supplierService.listSuppliers({ q: q || undefined, per_page: 50 });
      const data = resp?.data || resp || {};
      const list = Array.isArray(data) ? data : (data.data || data.suppliers || []);
      setSuppliers(list);
    } catch (e) {
      toast({ title: 'Error loading suppliers', description: e.message, status: 'error' });
    } finally { setLoading(false); }
  }, [q, toast]);

  React.useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  // Load category and unit options for new item creation
  React.useEffect(() => {
    (async () => {
      try {
        const [catResp, unitResp] = await Promise.all([
          stockService.listCategories({ per_page: 100 }),
          stockService.listUnits({ per_page: 100 }),
        ]);
        const catData = catResp?.data || catResp || {};
        const unitData = unitResp?.data || unitResp || {};
        const catList = Array.isArray(catData) ? catData : (catData.data || catData.categories || []);
        const unitList = Array.isArray(unitData) ? unitData : (unitData.data || unitData.units || []);
        setCategories(catList);
        setUnits(unitList);
      } catch (_) { /* ignore */ }
    })();
  }, []);

  const handleCreateSupplier = async () => {
    if (!newSupplier.name) return toast({ title: 'Name is required', status: 'error' });
    try {
      await supplierService.createSupplier(newSupplier);
      toast({ title: 'Supplier created', status: 'success' });
      setNewSupplier({ name: '', phone: '', address: '' });
      onAddClose();
      loadSuppliers();
    } catch (e) { toast({ title: 'Create failed', description: e.message, status: 'error' }); }
  };

  const handleOpenEdit = (s) => { setEditSupplier({ ...s }); onEditOpen(); };
  const handleUpdateSupplier = async () => {
    if (!editSupplier) return;
    try {
      await supplierService.updateSupplier(editSupplier.id, { name: editSupplier.name, phone: editSupplier.phone, address: editSupplier.address });
      toast({ title: 'Supplier updated', status: 'success' });
      onEditClose(); setEditSupplier(null); loadSuppliers();
    } catch (e) { toast({ title: 'Update failed', description: e.message, status: 'error' }); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm('Delete supplier?')) return;
    try { await supplierService.deleteSupplier(s.id); toast({ title: 'Deleted', status: 'success' }); loadSuppliers(); }
    catch (e) { toast({ title: 'Delete failed', description: e.message, status: 'error' }); }
  };

  const handleOpenPurchase = (s) => { setSelectedSupplier(s); setPurchaseForm({ serial: '', transaction_date: today, note: '', items: [{ stock_item_id: '', quantity: '', purchase_price: '' }] }); onPurchaseOpen(); };
  const addPurchaseRow = () => setPurchaseForm((p) => ({ ...p, items: [...p.items, { mode: 'existing', stock_item_id: '', quantity: '', purchase_price: '', new_item: { name: '', product_category_id: '', primary_unit_id: '', secondary_unit_id: '', secondary_per_primary: '', qty_per_primary_unit: '', qty_per_secondary_unit: '', selling_price: '', image_url: '' } }] }));
  const removePurchaseRow = (idx) => setPurchaseForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const ensureNewItemShape = () => ({ name: '', product_category_id: '', primary_unit_id: '', secondary_unit_id: '', secondary_per_primary: '', qty_per_primary_unit: '', qty_per_secondary_unit: '', selling_price: '', image_url: '' });
  const updatePurchaseRow = (idx, field, value) => setPurchaseForm((p) => ({
    ...p,
    items: p.items.map((it,i)=> {
      if (i !== idx) return it;
      if (field === 'mode') {
        if (value === 'new') {
          return { ...it, mode: 'new', new_item: it.new_item || ensureNewItemShape(), stock_item_id: '' };
        } else {
          return { ...it, mode: 'existing', stock_item_id: it.stock_item_id || '', new_item: it.new_item || ensureNewItemShape() };
        }
      }
      return { ...it, [field]: value };
    })
  }));
  const updatePurchaseRowNewItem = (idx, field, value) => setPurchaseForm((p) => ({
    ...p,
    items: p.items.map((it,i)=> {
      if (i !== idx) return it;
      const ni = it.new_item || ensureNewItemShape();
      return { ...it, new_item: { ...ni, [field]: value } };
    })
  }));
  const handleCreatePurchase = async () => {
    if (!selectedSupplier) return;
    const payload = {
      serial: purchaseForm.serial || undefined,
      transaction_date: purchaseForm.transaction_date,
      note: purchaseForm.note || undefined,
      items: purchaseForm.items.map(it => {
        const common = { quantity: Number(it.quantity), purchase_price: Number(it.purchase_price) };
        if (it.mode === 'new') {
          const ni = it.new_item || {};
          const newItemPayload = {
            name: ni.name,
            product_category_id: ni.product_category_id ? Number(ni.product_category_id) : undefined,
            primary_unit_id: ni.primary_unit_id ? Number(ni.primary_unit_id) : undefined,
            secondary_unit_id: ni.secondary_unit_id ? Number(ni.secondary_unit_id) : undefined,
            secondary_per_primary: ni.secondary_per_primary ? Number(ni.secondary_per_primary) : undefined,
            qty_per_primary_unit: ni.qty_per_primary_unit ? Number(ni.qty_per_primary_unit) : undefined,
            qty_per_secondary_unit: ni.qty_per_secondary_unit ? Number(ni.qty_per_secondary_unit) : undefined,
            selling_price: ni.selling_price ? Number(ni.selling_price) : undefined,
            image_url: ni.image_url || undefined,
          };
          return { ...common, new_item: newItemPayload };
        }
        return { ...common, stock_item_id: Number(it.stock_item_id) };
      }).filter(it => (it.new_item?.name || it.stock_item_id) && it.quantity && it.purchase_price)
    };
    if (!payload.items.length) return toast({ title: 'Add at least one item', status: 'error' });
    try {
      await supplierService.createPurchase(selectedSupplier.id, payload);
      toast({ title: 'Purchase created and stock updated', status: 'success' });
      onPurchaseClose(); setSelectedSupplier(null);
    } catch (e) { toast({ title: 'Purchase failed', description: e.message, status: 'error' }); }
  };

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Flex justify='space-between' align='center' mb={6}>
        <Box>
          <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='2px'>
            Supplier Management
          </Text>
          <Text fontSize='sm' color='gray.500'>Manage suppliers and create purchases that update stock</Text>
        </Box>
        <Button leftIcon={<AddIcon />} bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={onAddOpen}>Add Supplier</Button>
      </Flex>

      <Box mb={6} p={4} bg={cardBg} borderRadius='md' boxShadow='sm' border='1px' borderColor={borderColor}>
        <Flex gap={4} align='center' wrap='wrap'>
          <FormControl maxW='320px'>
            <FormLabel fontSize='sm'>Search</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <FiSearch color={useColorModeValue('#718096', '#A0AEC0')} />
              </InputLeftElement>
              <Input placeholder='Search by name or phone' value={q} onChange={(e) => setQ(e.target.value)} />
            </InputGroup>
          </FormControl>
          <Button onClick={loadSuppliers}>Refresh</Button>
        </Flex>
      </Box>

      {loading ? (
        <Flex justify='center' align='center' h='300px'><Spinner size='lg' /></Flex>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap='20px'>
          {suppliers.length === 0 ? (
            <Text color='gray.500' p='12px'>No suppliers found.</Text>
          ) : suppliers.map((s) => (
            <Box key={s.id} p='16px' bg={cardBg} border='1px' borderColor={borderColor} borderRadius='12px'>
              <Flex justify='space-between' align='start'>
                <Box>
                  <Text fontWeight='bold' color={textColor}>{s.name}</Text>
                  <Text color='gray.500' fontSize='sm'>{s.phone || '-'} {s.address ? `• ${s.address}` : ''}</Text>
                  <Text color='gray.500' fontSize='sm'>Transactions: {s.transactions_count || 0}</Text>
                </Box>
                <HStack>
                  <Button size='sm' variant='outline' onClick={() => handleOpenEdit(s)}>Edit</Button>
                  <Button size='sm' variant='outline' colorScheme='red' onClick={() => handleDelete(s)}>Delete</Button>
                </HStack>
              </Flex>
              <HStack mt='12px'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => history.push(`/admin/supplier-management/${s.id}`)}
                >
                  View Profile
                </Button>
                <Button size='sm' bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={() => handleOpenPurchase(s)}>Create Purchase</Button>
              </HStack>
            </Box>
          ))}
        </Grid>
      )}

      {/* Add Supplier */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px'>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onAddClose}>Cancel</Button>
            <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={handleCreateSupplier}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Supplier */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editSupplier && (
              <VStack spacing='12px'>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input value={editSupplier.name} onChange={(e) => setEditSupplier({ ...editSupplier, name: e.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input value={editSupplier.phone || ''} onChange={(e) => setEditSupplier({ ...editSupplier, phone: e.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input value={editSupplier.address || ''} onChange={(e) => setEditSupplier({ ...editSupplier, address: e.target.value })} />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onEditClose}>Cancel</Button>
            <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={handleUpdateSupplier}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Purchase */}
      <Modal isOpen={isPurchaseOpen} onClose={onPurchaseClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Purchase — {selectedSupplier?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px' align='stretch'>
              <FormControl>
                <FormLabel>Serial (optional)</FormLabel>
                <Input value={purchaseForm.serial} onChange={(e) => setPurchaseForm({ ...purchaseForm, serial: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input type='date' value={purchaseForm.transaction_date} onChange={(e) => setPurchaseForm({ ...purchaseForm, transaction_date: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Note</FormLabel>
                <Input value={purchaseForm.note} onChange={(e) => setPurchaseForm({ ...purchaseForm, note: e.target.value })} />
              </FormControl>
              <Box border='1px' borderColor={borderColor} borderRadius='8px' p='10px'>
                <Text fontWeight='semibold' mb='8px'>Items</Text>
                <VStack spacing='10px' align='stretch'>
                  {purchaseForm.items.map((it, idx) => (
                    <Box key={idx} border='1px' borderColor={borderColor} borderRadius='8px' p='10px'>
                      <HStack align='end' mb='10px'>
                        <FormControl maxW='200px'>
                          <FormLabel fontSize='sm'>Item Mode</FormLabel>
                          <Select value={it.mode} onChange={(e) => updatePurchaseRow(idx, 'mode', e.target.value)}>
                            <option value='existing'>Use Existing</option>
                            <option value='new'>Create New</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize='sm'>Quantity</FormLabel>
                          <Input type='number' step='any' value={it.quantity} onChange={(e) => updatePurchaseRow(idx, 'quantity', e.target.value)} />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize='sm'>Purchase Price</FormLabel>
                          <Input type='number' step='any' value={it.purchase_price} onChange={(e) => updatePurchaseRow(idx, 'purchase_price', e.target.value)} />
                        </FormControl>
                        <IconButton aria-label='Remove' size='sm' onClick={() => removePurchaseRow(idx)} icon={<span>&times;</span>} />
                      </HStack>

                      {it.mode === 'existing' ? (
                        <FormControl>
                          <FormLabel fontSize='sm'>Stock Item ID</FormLabel>
                          <Input value={it.stock_item_id} onChange={(e) => updatePurchaseRow(idx, 'stock_item_id', e.target.value)} />
                        </FormControl>
                      ) : (
                        <VStack align='stretch' spacing='8px'>
                          <FormControl isRequired>
                            <FormLabel fontSize='sm'>New Item Name</FormLabel>
                            <Input value={it.new_item?.name || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'name', e.target.value)} />
                          </FormControl>
                          <HStack>
                            <FormControl>
                              <FormLabel fontSize='sm'>Category</FormLabel>
                              <Select placeholder='Select category' value={it.new_item?.product_category_id || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'product_category_id', e.target.value)}>
                                {categories.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize='sm'>Primary Unit</FormLabel>
                              <Select placeholder='Primary unit' value={it.new_item?.primary_unit_id || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'primary_unit_id', e.target.value)}>
                                {units.map(u => (
                                  <option key={u.id} value={u.id}>{u.name || u.code || u.symbol || `Unit ${u.id}`}</option>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize='sm'>Secondary Unit</FormLabel>
                              <Select placeholder='Secondary unit (optional)' value={it.new_item?.secondary_unit_id || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'secondary_unit_id', e.target.value)}>
                                {units.map(u => (
                                  <option key={u.id} value={u.id}>{u.name || u.code || u.symbol || `Unit ${u.id}`}</option>
                                ))}
                              </Select>
                            </FormControl>
                          </HStack>
                          <HStack>
                            <FormControl>
                              <FormLabel fontSize='sm'>Secondary per Primary</FormLabel>
                              <Input value={it.new_item?.secondary_per_primary || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'secondary_per_primary', e.target.value)} />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize='sm'>Qty per Primary</FormLabel>
                              <Input value={it.new_item?.qty_per_primary_unit || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'qty_per_primary_unit', e.target.value)} />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize='sm'>Qty per Secondary</FormLabel>
                              <Input value={it.new_item?.qty_per_secondary_unit || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'qty_per_secondary_unit', e.target.value)} />
                            </FormControl>
                          </HStack>
                          <HStack>
                            <FormControl>
                              <FormLabel fontSize='sm'>Selling Price</FormLabel>
                              <Input type='number' step='any' value={it.new_item?.selling_price || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'selling_price', e.target.value)} />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize='sm'>Image URL</FormLabel>
                              <Input value={it.new_item?.image_url || ''} onChange={(e) => updatePurchaseRowNewItem(idx, 'image_url', e.target.value)} />
                            </FormControl>
                          </HStack>
                        </VStack>
                      )}
                    </Box>
                  ))}
                  <Button size='sm' onClick={addPurchaseRow}>Add Item</Button>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onPurchaseClose}>Cancel</Button>
            <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={handleCreatePurchase}>Create Purchase</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default SupplierManagement;


