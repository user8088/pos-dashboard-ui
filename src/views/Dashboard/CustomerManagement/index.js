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
  useToast,
  Spinner,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect } from "react";
import { FaPlus, FaFileCsv, FaDownload, FaTrash } from "react-icons/fa";
import logo from "assets/img/avatars/placeholder.png";

// Customer Table Row Component
const CustomerTableRow = ({ customer, onEdit, onDownload, onDelete }) => {
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
              {customer.phone}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {customer.totalBill}
        </Text>
      </Td>

      <Td>
        <VStack align="start" spacing="4px">
          <Text fontSize="md" color={textColor} fontWeight="bold">
            {customer.billPaid}
          </Text>
          <Text
            fontSize="sm"
            color="gray.400"
            fontWeight="medium"
            cursor="pointer"
            _hover={{ color: "brand.500" }}
            onClick={() => onDownload && onDownload(customer)}
          >
            Download Invoice
          </Text>
        </VStack>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {customer.billDue}
        </Text>
      </Td>

      <Td>
        <Text fontSize="sm" color={textColor} fontWeight="medium">
          {customer.itemsSummary}
        </Text>
      </Td>

      <Td>
        <Badge
          colorScheme={getStatusColor(customer.status)}
          fontSize="14px"
          p="3px 10px"
          borderRadius="20px"
        >
          {customer.status}
        </Badge>
      </Td>

      <Td>
        <HStack spacing="12px">
          <Button p="0px" bg="transparent" variant="no-hover" onClick={() => onEdit(customer)}>
            <Text
              fontSize="md"
              color="gray.400"
              fontWeight="bold"
              cursor="pointer"
              _hover={{ color: "brand.500" }}
            >
              Edit
            </Text>
          </Button>
          <Button p="0px" bg="transparent" variant="no-hover" onClick={() => onDelete(customer)}>
            <FaTrash color="#FF8D28" size="16px" style={{ cursor: "pointer" }} />
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
};

function CustomerManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isInvoicesOpen, onOpen: onInvoicesOpen, onClose: onInvoicesClose } = useDisclosure();
  const toast = useToast();
 
  const [customers, setCustomers] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchSaleableStock();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/customer`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(c => ({
          id: c.id,
          name: c.customer_name,
          phone: c.customer_phone_no || '—',
          avatar: logo,
          billPaid: c.bill_paid !== undefined ? `PKR.${c.bill_paid}` : 'PKR.0',
          billDue: c.bill_due !== undefined ? `PKR.${c.bill_due}` : 'PKR.0',
          totalBill: c.total_bill !== undefined ? `PKR.${c.total_bill}` : (() => { const total = (parseFloat(c.bill_total ?? 0) || 0) || ((parseFloat(c.bill_paid || 0) || 0) + (parseFloat(c.bill_due || 0) || 0)); return `PKR.${total}`; })(),
          itemsCount: Array.isArray(c.purchased_items) ? String(c.purchased_items.length) : (Array.isArray(c.items) ? String(c.items.length) : '0'),
          itemsSummary: Array.isArray(c.purchased_items)
            ? c.purchased_items.map(it => `${it.item_name || 'Item'} × ${it.quantity}`).join(', ')
            : (Array.isArray(c.items) ? c.items.map(it => `${it.item_name || it.stock_name || 'Item'} × ${it.quantity}`).join(', ') : '—'),
          status: (parseFloat(c.bill_due || 0) > 0) ? 'Pending' : 'Paid',
          amountPending: c.bill_due !== undefined ? `PKR.${c.bill_due}` : 'None'
        }));
        setCustomers(mapped);
      } else {
        setCustomers([]);
      }
    } catch (e) {
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // enrichment no longer needed; list includes purchased_items per docs

  const fetchSaleableStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        const items = await res.json();
        setStockOptions(items.map(s => ({
          itemId: s.item_id,
          name: s.item_name,
          available: parseFloat(s.quantity_per_unit || 0),
          itemPrice: s.item_price ? parseFloat(s.item_price) : null,
          unitLabel: s.unit?.unit_name || 'Units'
        })));
      } else {
        setStockOptions([]);
      }
    } catch(e) {
      setStockOptions([]);
    }
  };

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    billPaid: "",
    items: []
  });

  const addPurchaseItem = () => {
    if (stockOptions.length === 0) return;
    const first = stockOptions[0];
    setNewCustomer(prev => ({
      ...prev,
      items: [...prev.items, { stockId: first.itemId, quantity: "1" }]
    }));
  };

  const updatePurchaseItem = (index, changes) => {
    setNewCustomer(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === index ? { ...it, ...changes } : it)
    }));
  };

  const removePurchaseItem = (index) => {
    setNewCustomer(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const computeTotals = () => {
    let total = 0;
    newCustomer.items.forEach(it => {
      const stock = stockOptions.find(s => s.itemId === parseInt(it.stockId));
      const price = stock && stock.itemPrice ? stock.itemPrice : 0;
      const qty = parseFloat(it.quantity || 0);
      if (isFinite(price) && isFinite(qty)) total += price * qty;
    });
    const paid = parseFloat(newCustomer.billPaid || 0) || 0;
    const due = Math.max(0, total - paid);
    return { total, due };
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    onEditOpen();
  };

  const handleUpdateCustomer = () => {
    if (editingCustomer) {
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === editingCustomer.id ? editingCustomer : customer
        )
      );
      toast({ title: "Customer Updated", description: `Updated ${editingCustomer.name}`, status: "success", duration: 3000, isClosable: true });
      onEditClose();
      setEditingCustomer(null);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || newCustomer.items.length === 0) return;
    // Optional front-end validation vs available
    for (const it of newCustomer.items) {
      const stock = stockOptions.find(s => s.itemId === parseInt(it.stockId));
      if (stock && parseFloat(it.quantity || 0) > stock.available) {
        toast({ title: "Quantity exceeds available stock", description: `Item: ${stock.name}`, status: "error", duration: 5000, isClosable: true });
        return;
      }
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        customer_name: newCustomer.name,
        customer_phone_no: newCustomer.phone || undefined,
        bill_paid: newCustomer.billPaid ? parseFloat(newCustomer.billPaid) : undefined,
        items: newCustomer.items.map(it => ({
          stock_id: parseInt(it.stockId),
          quantity: parseFloat(it.quantity)
        }))
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/customer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh customers and stock
        fetchCustomers();
        fetchSaleableStock();
        // Reset form
        setNewCustomer({ name: "", phone: "", billPaid: "", items: [] });
        onAddClose();
        toast({ title: "Customer Created", description: data.message || 'Purchase recorded', status: "success", duration: 4000, isClosable: true });
      } else {
        toast({ title: "Create Failed", description: data.message || 'Failed to create customer', status: "error", duration: 5000, isClosable: true });
      }
    } catch (e) {
      toast({ title: "Network Error", description: 'Unable to create customer', status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleImportCSV = () => {
    // CSV import functionality would go here
    alert("CSV import functionality would be implemented here");
  };

  const handleExportCSV = () => {
    // CSV export functionality would go here
    alert("CSV export functionality would be implemented here");
  };

  const handleDownloadInvoice = async (customer) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/customer/${customer.id}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { toast({ title: "Download Failed", description: 'Unable to download invoice', status: "error", duration: 4000, isClosable: true }); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${customer.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Invoice Downloaded", status: "success", duration: 2000, isClosable: true });
    } catch (e) { 
      toast({ title: "Network Error", description: 'Unable to download invoice', status: "error", duration: 5000, isClosable: true });
    }
  };

  const openCustomerInvoices = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerInvoices([]);
    setIsInvoicesLoading(true);
    onInvoicesOpen();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/customer/${customer.id}/invoices`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        const invoices = await res.json();
        setCustomerInvoices(Array.isArray(invoices) ? invoices : []);
      } else {
        setCustomerInvoices([]);
      }
    } catch (e) {
      setCustomerInvoices([]);
    } finally {
      setIsInvoicesLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Delete customer "${customer.name}" and their purchases?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/customer/${customer.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast({ title: "Customer Deleted", description: data.message || 'Customer deleted successfully', status: "success", duration: 3000, isClosable: true });
        fetchCustomers();
        // Also refresh invoices panel if open
        try {
          const invPanel = document.createEvent('Event'); invPanel.initEvent('refresh-invoices', true, true); window.dispatchEvent(invPanel);
        } catch(_){}
      } else {
        toast({ title: "Delete Failed", description: data.message || 'Unable to delete customer', status: "error", duration: 5000, isClosable: true });
      }
    } catch (e) {
      toast({ title: "Network Error", description: 'Unable to delete customer', status: "error", duration: 5000, isClosable: true });
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
          {isLoading ? (
            <Flex 
              justify="center" 
              align="center" 
              h="200px" 
              w="100%"
            >
              <VStack spacing="16px" textAlign="center">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="#FF8D28"
                  size="xl"
                />
              </VStack>
            </Flex>
          ) : customers.length === 0 ? (
            <Flex 
              direction="column" 
              justify="center" 
              align="center" 
              h="400px" 
              p="40px"
              w="100%"
            >
              <VStack spacing="24px" maxW="400px" textAlign="center">
                <Text fontSize="2xl" color={textColor} fontWeight="bold">
                  No Customers Yet
                </Text>
                <Text color="gray.500" fontSize="md" lineHeight="1.6">
                  Add your first customer to record purchases and generate invoices.
                </Text>
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme='teal'
                  bg='#FF8D28'
                  color='white'
                  _hover={{ bg: '#E67E22' }}
                  size="lg"
                  px="32px"
                  py="12px"
                  onClick={onAddOpen}>
                  ADD FIRST CUSTOMER
                </Button>
              </VStack>
            </Flex>
          ) : (
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Customer / Phone</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>TOTAL BILL</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>BILL PAID</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>BILL DUE</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>PURCHASED ITEMS</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>STATUS</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Edit</Th>
              </Tr>
            </Thead>
            <Tbody>
              {customers.map((customer) => (
                <CustomerTableRow 
                  key={customer.id} 
                  customer={customer} 
                  onEdit={handleEditCustomer}
                  onDownload={handleDownloadInvoice}
                  onDelete={handleDeleteCustomer}
                  onViewInvoices={() => openCustomerInvoices(customer)}
                />
              ))}
            </Tbody>
          </Table>
          )}
        </CardBody>
      </Card>

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
                  onChange={(e) => { const v = e.target.value; setNewCustomer(prev => ({ ...prev, name: v })); }}
                  placeholder="Enter customer name"
                  size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">
                  Phone Number
                </FormLabel>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => { const v = e.target.value; setNewCustomer(prev => ({ ...prev, phone: v })); }}
                  placeholder="Enter phone number"
                  size="md"
                />
              </FormControl>

              {/* Purchase Items */}
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">Purchased Items</FormLabel>
                <VStack spacing="12px" align="stretch">
                  {newCustomer.items.map((it, idx) => (
                    <HStack key={idx} spacing="8px" align="start">
                      <FormControl flex="2">
                        <FormLabel fontSize="xs" color="gray.500">Item</FormLabel>
                        <Select
                          value={it.stockId}
                          onChange={(e) => { const v = e.target.value; updatePurchaseItem(idx, { stockId: v }); }}
                          size="sm"
                        >
                          {stockOptions.map(s => (
                            <option key={s.itemId} value={s.itemId}>{`${s.name} (Avail: ${s.available} ${s.unitLabel})`}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl flex="1">
                        <FormLabel fontSize="xs" color="gray.500">Quantity</FormLabel>
                        <Input
                          type="number"
                          placeholder="Qty"
                          size="sm"
                          value={it.quantity}
                          onChange={(e) => { const v = e.target.value; updatePurchaseItem(idx, { quantity: v }); }}
                        />
                      </FormControl>
                      <Button mt="22px" size="sm" variant="outline" onClick={() => removePurchaseItem(idx)}>Remove</Button>
                    </HStack>
                  ))}
                  <Button size="sm" onClick={addPurchaseItem} variant="outline">Add Item</Button>
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">Bill Paid (PKR)</FormLabel>
                <Input
                  type="number"
                  value={newCustomer.billPaid}
                  onChange={(e) => { const v = e.target.value; setNewCustomer(prev => ({ ...prev, billPaid: v })); }}
                  size="md"
                />
              </FormControl>

              {/* Totals Preview */}
              <Box>
                {(() => { const { total, due } = computeTotals(); return (
                  <VStack align="start" spacing="4px">
                    <Text color="gray.600" fontSize="sm">Total Bill: PKR.{total.toFixed(2)}</Text>
                    <Text color="gray.600" fontSize="sm">Bill Due: PKR.{due.toFixed(2)}</Text>
                  </VStack>
                ); })()}
              </Box>
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
                isDisabled={!newCustomer.name || newCustomer.items.length === 0}
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
                    onChange={(e) => { const v = e.target.value; setEditingCustomer(prev => ({ ...prev, name: v })); }}
                    size="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => { const v = e.target.value; setEditingCustomer(prev => ({ ...prev, email: v })); }}
                    size="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">
                    Total Due Amount
                  </FormLabel>
                  <Input
                    value={editingCustomer.totalDue}
                    onChange={(e) => { const v = e.target.value; setEditingCustomer(prev => ({ ...prev, totalDue: v })); }}
                    size="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">
                    Status
                  </FormLabel>
                  <Select
                    value={editingCustomer.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setEditingCustomer(prev => ({
                        ...prev,
                        status: newStatus,
                        amountPending: newStatus === "Paid" ? "None" : prev.amountPending
                      }));
                    }}
                    size="md"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </Select>
                </FormControl>
                {editingCustomer.status === "Pending" && (
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">
                      Amount Pending
                    </FormLabel>
                    <Input
                      value={editingCustomer.amountPending}
                      onChange={(e) => { const v = e.target.value; setEditingCustomer(prev => ({ ...prev, amountPending: v })); }}
                      size="md"
                    />
                  </FormControl>
                )}
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

      {/* Customer Invoices Modal */}
      <Modal isOpen={isInvoicesOpen} onClose={onInvoicesClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent>
          <ModalHeader color={textColor}>{selectedCustomer ? `${selectedCustomer.name} — Invoices` : 'Invoices'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            {isInvoicesLoading ? (
              <Flex justify="center" align="center" h="150px"><Spinner color="#FF8D28" /></Flex>
            ) : customerInvoices.length === 0 ? (
              <Text color='gray.500' fontSize='sm'>No invoices attached to this customer.</Text>
            ) : (
              <VStack spacing='12px' align='stretch'>
                {customerInvoices.map((inv, idx) => (
                  <Flex key={idx} justify='space-between' align='center' border='1px solid' borderColor='gray.200' borderRadius='8px' p='12px'>
                    <VStack spacing='2px' align='start'>
                      <Text fontWeight='bold' color={textColor}>{inv.invoice_number || `Invoice #${inv.id}`}</Text>
                      <Text color='gray.500' fontSize='sm'>{new Date(inv.issued_at || Date.now()).toLocaleString()}</Text>
                    </VStack>
                    <HStack spacing='12px'>
                      <Text fontWeight='bold' color={textColor}>PKR. {inv.total_amount ?? inv.due_amount ?? 0}</Text>
                      <Button size='sm' variant='outline' onClick={() => handleDownloadInvoice(selectedCustomer)}>PDF</Button>
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default CustomerManagement;
