// Chakra imports
import {
  Box,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  Button,
  HStack,
  VStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState } from "react";
import { FaPlus, FaFileCsv, FaDownload } from "react-icons/fa";
import logo from "assets/img/avatars/placeholder.png";
import { customerService } from "services/customerService";
import { invoiceService } from "services/invoiceService";
import { DownloadIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";
import { FaEllipsisV } from "react-icons/fa";

// Customer Table Row Component
const CustomerTableRow = ({ customer, onEdit, onDelete, onViewProfile, onRecordPayment, onCreateSale, onRate }) => {
  const textColor = useColorModeValue("gray.700", "white");

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "Paid":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Tr>
      <Td minWidth={{ sm: "250px" }} pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={customer.avatar} w="30px" h="30px" me="18px" objectFit="cover" />
          <Flex direction="column">
            <Text
              fontSize="md"
              color={textColor}
              fontWeight="bold"
              minWidth="100%"
            >
              {customer.name}
            </Text>
            <Text fontSize="sm" color="gray.400" fontWeight="medium">
              {customer.email}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{customer.phone || '-'}</Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{customer.due}</Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{customer.advance}</Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{customer.rating}</Text>
      </Td>

      <Td isNumeric>
        <Menu placement="bottom-end">
          <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" size="sm" aria-label="Actions" />
          <MenuList>
            <MenuItem onClick={() => onViewProfile(customer)}>View Profile</MenuItem>
            <MenuItem onClick={() => onEdit(customer)}>Edit</MenuItem>
            <MenuItem onClick={() => onRecordPayment(customer)}>Record Payment/Advance</MenuItem>
            <MenuItem onClick={() => onCreateSale(customer)}>Create Sale</MenuItem>
            <MenuItem onClick={() => onRate(customer)}>Rate</MenuItem>
            <MenuItem color="red.500" onClick={() => onDelete(customer)}>Delete</MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};

function CustomerManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const toast = useToast();
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const { isOpen: isSaleOpen, onOpen: onSaleOpen, onClose: onSaleClose } = useDisclosure();
  const { isOpen: isRateOpen, onOpen: onRateOpen, onClose: onRateClose } = useDisclosure();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [profileData, setProfileData] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ type: 'payment', amount: '', description: '', advance_start_date: '', advance_end_date: '' });
  const [saleForm, setSaleForm] = useState({ items: [], paid_amount: '', reference: '', sale_date: '' });
  const [ratingForm, setRatingForm] = useState({ stars: 5, note: '' });

  const loadCustomers = async () => {
    try { setLoading(true); const resp = await customerService.list({}); const list = resp?.data?.data || resp?.data || resp || []; setCustomers(list); }
    catch (e) { /* silent */ } finally { setLoading(false); }
  };

  React.useEffect(() => { loadCustomers(); }, []);

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    onEditOpen();
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    try {
      const phoneSanitized = (editingCustomer.phone || '').toString().replace(/[^0-9]/g, '');
      await customerService.update(editingCustomer.id, { name: editingCustomer.name, phone: phoneSanitized, address: editingCustomer.address || '' });
      onEditClose();
      setEditingCustomer(null);
      await loadCustomers();
    } catch (e) { alert(e?.message || 'Failed to update'); }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;
    try {
      const phoneSanitized = (newCustomer.phone || '').toString().replace(/[^0-9]/g, '');
      await customerService.create({ name: newCustomer.name, phone: phoneSanitized, address: newCustomer.address || '' });
      onAddClose();
      setNewCustomer({ name: "", email: "", totalDue: "", status: "Pending", amountPending: "", phone: '', address: '' });
      await loadCustomers();
    } catch (e) { alert(e?.message || 'Failed to create customer'); }
  };

  const handleImportCSV = () => {
    // CSV import functionality would go here
    alert("CSV import functionality would be implemented here");
  };

  const handleExportCSV = () => {
    // CSV export functionality would go here
    alert("CSV export functionality would be implemented here");
  };

  const handleDownloadInvoice = async (invoiceId) => {
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
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Header Section */}
      <Box mb='24px'>
        <Flex direction='column' w='100%'>
          <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='8px'>
            Customer Management
          </Text>
          
          {/* Action Buttons */}
          <Flex
            direction={{ sm: "column", lg: "row" }}
            justify='space-between'
            align={{ sm: "start", lg: "center" }}
            w='100%'
            gap='16px'>
            
            {/* Left Side - Add New Customer */}
            <Button
              leftIcon={<FaPlus />}
              colorScheme='teal'
              bg='#FF8D28'
              color='white'
              _hover={{ bg: '#E67E22' }}
              onClick={onAddOpen}
              size='md'>
              Add New Customer
            </Button>

            {/* Right Side - Import/Export */}
            <HStack spacing='16px'>
              <Button
                leftIcon={<FaFileCsv />}
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                size='md'>
                Import CSV
              </Button>
              <Button
                leftIcon={<FaDownload />}
                variant='outline'
                colorScheme='teal'
                borderColor='gray.300'
                color='gray.600'
                _hover={{ bg: 'gray.50' }}
                size='md'>
                Export as CSV
              </Button>
            </HStack>
          </Flex>
        </Flex>
      </Box>

      {/* Customer Profiles Table */}
      <Card bg={cardBg} boxShadow={cardShadow}>

        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Customer</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Phone</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Due Balance</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Advance Balance</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Rating</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading && (
                <Tr>
                  <Td colSpan={6} py='48px' textAlign='center'>
                    <Spinner thickness='3px' speed='0.65s' emptyColor='gray.200' color='#FF8D28' size='lg' />
                  </Td>
                </Tr>
              )}
              {!loading && customers.length === 0 && (
                <Tr>
                  <Td colSpan={6} py='48px'>
                    <Box textAlign='center' color='gray.500'>
                      <Text fontWeight='bold' mb='2'>No customers found</Text>
                      <Text fontSize='sm'>Use the Add New Customer button to create one.</Text>
                    </Box>
                  </Td>
                </Tr>
              )}
              {!loading && customers.map((c) => (
                <CustomerTableRow 
                  key={c.id} 
                  customer={{
                    id: c.id,
                    name: c.name,
                    phone: c.phone || '',
                    avatar: logo,
                    due: `PKR.${Number(c.due_balance || 0).toFixed(2)}`,
                    advance: `PKR.${Number(c.advance_balance || 0).toFixed(2)}`,
                    rating: c.rating_count ? `${Number(c.rating_average || 0).toFixed(1)} (${c.rating_count})` : '-'
                  }}
                  onEdit={handleEditCustomer}
                  onDelete={async (row) => { if (!window.confirm('Delete customer?')) return; try { await customerService.delete(row.id); await loadCustomers(); } catch (e) { alert(e?.message || 'Delete failed'); } }}
                  onViewProfile={(row) => { window.location.href = `#/admin/customers/${row.id}`; }}
                  onRecordPayment={(row) => { setSelectedCustomer(row); onPaymentOpen(); }}
                  onCreateSale={(row) => { setSelectedCustomer(row); onSaleOpen(); }}
                  onRate={(row) => { setSelectedCustomer(row); onRateOpen(); }}
                />
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Profile Modal */}
      <Modal isOpen={isProfileOpen} onClose={onProfileClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Customer Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!profileData ? (
              <Flex align='center' justify='center' py='24px'><Spinner /></Flex>
            ) : (
              <VStack align='stretch' spacing='12px'>
                <Text fontWeight='bold'>{profileData.name}</Text>
                <Text color='gray.500'>Due: PKR {Number(profileData.due_balance || 0).toFixed(2)} • Advance: PKR {Number(profileData.advance_balance || 0).toFixed(2)}</Text>
                <Text fontWeight='semibold'>Recent Sales</Text>
                <Box maxH='160px' overflowY='auto'>
                  {(profileData.sales || []).slice(0,5).map((s)=> (
                    <Text key={s.id} color='gray.600'>#{s.id} • PKR {Number(s.total_amount||0).toFixed(2)} • Paid {Number(s.paid_amount||0).toFixed(2)} • Due {Number(s.due_amount||0).toFixed(2)}</Text>
                  ))}
                </Box>
                <Text fontWeight='semibold' mt='2'>Recent Invoices</Text>
                <Box maxH='160px' overflowY='auto'>
                  {(profileData.invoices || []).slice(0,5).map((inv)=> (
                    <HStack key={inv.id} justify='space-between'>
                      <Text color='gray.600'>
                        {inv.invoice_number || `#${inv.id}`} • PKR {Number(inv.total||0).toFixed(2)}
                      </Text>
                      <IconButton
                        icon={<DownloadIcon />}
                        size='xs'
                        variant='ghost'
                        onClick={() => handleDownloadInvoice(inv.id)}
                        isLoading={downloadingIds.has(inv.id)}
                        aria-label='Download invoice'
                      />
                    </HStack>
                  ))}
                  {(!profileData.invoices || profileData.invoices.length===0) && (
                    <Text color='gray.500'>No invoices</Text>
                  )}
                </Box>
                <Text fontWeight='semibold'>Recent Transactions</Text>
                <Box maxH='160px' overflowY='auto'>
                  {(profileData.transactions || []).slice(0,5).map((t,i)=> (
                    <Text key={i} color='gray.600'>{t.type} • {t.direction} • PKR {Number(t.amount||0).toFixed(2)}</Text>
                  ))}
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Record Payment / Advance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px'>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select value={paymentForm.type} onChange={(e)=> setPaymentForm({...paymentForm, type: e.target.value})}>
                  <option value='payment'>payment</option>
                  <option value='advance'>advance</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input type='number' value={paymentForm.amount} onChange={(e)=> setPaymentForm({...paymentForm, amount: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input value={paymentForm.description} onChange={(e)=> setPaymentForm({...paymentForm, description: e.target.value})} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onPaymentClose} mr='3'>Cancel</Button>
            <Button bg='#FF8D28' color='white' _hover={{bg:'#E67E22'}} onClick={async ()=> { try { await customerService.recordPayment(selectedCustomer.id, { ...paymentForm, amount: Number(paymentForm.amount||0) }); onPaymentClose(); await loadCustomers(); } catch(e){ alert(e?.message||'Failed'); } }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rate Modal */}
      <Modal isOpen={isRateOpen} onClose={onRateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Rate Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px'>
              <FormControl>
                <FormLabel>Stars (1-5)</FormLabel>
                <Input type='number' min='1' max='5' value={ratingForm.stars} onChange={(e)=> setRatingForm({...ratingForm, stars: Number(e.target.value)})} />
              </FormControl>
              <FormControl>
                <FormLabel>Note</FormLabel>
                <Input value={ratingForm.note} onChange={(e)=> setRatingForm({...ratingForm, note: e.target.value})} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onRateClose} mr='3'>Cancel</Button>
            <Button bg='#FF8D28' color='white' _hover={{bg:'#E67E22'}} onClick={async ()=> { try { await customerService.rate(selectedCustomer.id, ratingForm); onRateClose(); await loadCustomers(); } catch(e){ alert(e?.message||'Failed'); } }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sale Modal (minimal: one item) */}
      <Modal isOpen={isSaleOpen} onClose={onSaleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Create Sale</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px'>
              <FormControl>
                <FormLabel>Stock Item ID</FormLabel>
                <Input value={saleForm.stock_item_id || ''} onChange={(e)=> setSaleForm({...saleForm, stock_item_id: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Quantity</FormLabel>
                <Input type='number' step='any' value={saleForm.quantity || ''} onChange={(e)=> setSaleForm({...saleForm, quantity: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Unit Price</FormLabel>
                <Input type='number' step='any' value={saleForm.unit_price || ''} onChange={(e)=> setSaleForm({...saleForm, unit_price: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Paid Amount</FormLabel>
                <Input type='number' step='any' value={saleForm.paid_amount || ''} onChange={(e)=> setSaleForm({...saleForm, paid_amount: e.target.value})} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSaleClose} mr='3'>Cancel</Button>
            <Button bg='#FF8D28' color='white' _hover={{bg:'#E67E22'}} onClick={async ()=> { try { const payload = { items: [{ stock_item_id: Number(saleForm.stock_item_id), quantity: Number(saleForm.quantity), unit_price: Number(saleForm.unit_price)}], paid_amount: Number(saleForm.paid_amount||0) }; await customerService.createSale(selectedCustomer.id, payload); onSaleClose(); await loadCustomers(); } catch(e){ alert(e?.message||'Failed'); } }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Add New Customer Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Add New Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="16px" align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">
                  Customer Name
                </FormLabel>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Enter customer name"
                  size="md"
                />
              </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">Phone</FormLabel>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e)=> { const val = e.target.value; setNewCustomer(prev=> ({...prev, phone: val})); }}
                    placeholder="e.g., +92..."
                    size="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">Address</FormLabel>
                  <Input
                    value={newCustomer.address}
                    onChange={(e)=> { const val = e.target.value; setNewCustomer(prev=> ({...prev, address: val})); }}
                    placeholder="Address"
                    size="md"
                  />
                </FormControl>
              
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onAddClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: "#E67E22" }}
                onClick={handleAddCustomer}
                isDisabled={!newCustomer.name}
              >
                Add Customer
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Edit Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingCustomer && (
              <VStack spacing="16px" align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">
                    Customer Name
                  </FormLabel>
                  <Input
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    size="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">Phone</FormLabel>
                  <Input
                    value={editingCustomer.phone || ''}
                    onChange={(e)=> { const val = e.target.value; setEditingCustomer(prev=> (prev ? {...prev, phone: val} : { phone: val })); }}
                    size="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">Address</FormLabel>
                  <Input
                    value={editingCustomer.address || ''}
                    onChange={(e)=> { const val = e.target.value; setEditingCustomer(prev=> (prev ? {...prev, address: val} : { address: val })); }}
                    size="md"
                  />
                </FormControl>
                
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onEditClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: "#E67E22" }}
                onClick={handleUpdateCustomer}
              >
                Update Customer
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default CustomerManagement;
