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
  SimpleGrid,
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
  InputGroup,
  InputLeftAddon,
  Select,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
  IconButton,
  Divider,
  Tooltip,
  Icon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { FaPlus, FaFileCsv, FaDownload, FaTrash, FaEllipsisV, FaEye, FaEdit, FaMoneyBillWave, FaStar } from "react-icons/fa";
import { EditIcon, DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import ResponsiveTable from "components/Tables/ResponsiveTable";
import logo from "assets/img/avatars/placeholder.png";
import { useSearch } from "contexts/SearchContext";

// Searchable Select Component
const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search and select..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);
  
  const filteredOptions = (options || []).filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = (options || []).find(opt => opt.itemId.toString() === value);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsTyping(true);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setIsTyping(true);
  };

  const handleInputBlur = (e) => {
    // Delay to allow click on dropdown items
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setIsTyping(false);
        setSearchTerm("");
      }
    }, 150);
  };

  const handleSelect = (option) => {
    onChange(option.itemId.toString());
    setIsOpen(false);
    setIsTyping(false);
    setSearchTerm("");
  };

  const displayValue = () => {
    if (isTyping) {
      return searchTerm;
    }
    if (selectedOption) {
      return `${selectedOption.name} (Avail: ${selectedOption.available} ${selectedOption.unitLabel})`;
    }
    return "";
  };

  return (
    <Box position="relative" ref={containerRef}>
      <Input
        value={displayValue()}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        size="sm"
        autoComplete="off"
      />
      
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          zIndex={1000}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="lg"
          maxH="200px"
          overflowY="auto"
          mt="1"
        >
          {filteredOptions.length === 0 ? (
            <Box p="8px" textAlign="center" color="gray.500">
              No items found
            </Box>
          ) : (
            filteredOptions.map((option) => (
              <Box
                key={option.itemId}
                p="8px 12px"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => handleSelect(option)}
                borderBottom="1px solid"
                borderColor="gray.100"
                _last={{ borderBottom: "none" }}
              >
                <Text fontSize="sm" fontWeight="medium">
                  {option.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Available: {option.available} {option.unitLabel}
                </Text>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

// Customer Table Row Component
const CustomerTableRow = ({ customer, onEdit, onDownload, onDelete, onViewProfile, onPayment }) => {
  const textColor = useColorModeValue("gray.700", "white");
  
  // Responsive values
  const fontSize = useBreakpointValue({ base: "xs", md: "sm" });
  const imageSize = useBreakpointValue({ base: "20px", md: "30px" });
  const buttonSize = useBreakpointValue({ base: "xs", md: "sm" });

  const getStatusColor = (status) => {
    return status === "Has Dues" ? "orange" : "green";
  };

  return (
    <Tr>
      <Td w="110px" pl="0px">
        <Flex align="center" py=".8rem">
          <Text
            fontSize={fontSize}
            color={customer.customerCode === '—' ? 'gray.400' : textColor}
            fontWeight={customer.customerCode === '—' ? 'normal' : 'bold'}
            fontFamily="monospace"
          >
            {customer.customerCode}
          </Text>
        </Flex>
      </Td>

      <Td w="150px">
        <Flex align="center" py=".8rem">
          <Text
            fontSize={fontSize}
            color={textColor}
            fontWeight="bold"
          >
            {customer.name}
          </Text>
        </Flex>
      </Td>

      <Td w="130px">
        <Text fontSize={fontSize} color="gray.600" fontWeight="medium">
          {customer.phone}
        </Text>
      </Td>

      <Td w="100px">
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textAlign="center">
          {customer.registeredDate}
        </Text>
      </Td>

      <Td w="90px">
        <Flex justify="center">
          <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full" fontWeight="bold">
            {customer.purchaseCount}
          </Badge>
        </Flex>
      </Td>

      <Td w="130px">
        <Text 
          fontSize={fontSize} 
          color={customer.totalDue > 0 ? "red.500" : "green.500"} 
          fontWeight="bold" 
          textAlign="right"
        >
          {customer.totalDueFormatted}
        </Text>
      </Td>

      <Td w="90px">
        <Flex justify="center" align="center">
          <Badge
            colorScheme={getStatusColor(customer.status)}
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="full"
          >
            {customer.status}
          </Badge>
        </Flex>
      </Td>

      <Td w="100px">
        <HStack spacing={0.5} justify="center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              as={FaStar}
              color={star <= (customer.rating || 0) ? "yellow.400" : "gray.300"}
              boxSize={3}
            />
          ))}
          {customer.rating > 0 && (
            <Text fontSize="xs" color="gray.600" ml={1}>
              ({customer.rating})
            </Text>
          )}
        </HStack>
      </Td>

      <Td w="80px">
        <Flex justify="flex-end" align="center">
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size={buttonSize}
              aria-label="Actions"
            />
            <MenuList>
              <MenuItem icon={<FaEye />} onClick={() => onViewProfile(customer)}>
                View Full Profile
              </MenuItem>
              {customer.totalDue > 0 && (
                <MenuItem 
                  icon={<FaMoneyBillWave />} 
                  onClick={() => onPayment(customer)}
                  color="green.500"
                >
                  Clear Due Payment
                </MenuItem>
              )}
              <MenuItem icon={<FaDownload />} onClick={() => onDownload && onDownload(customer)}>
                Download Invoice
              </MenuItem>
              <MenuItem icon={<FaTrash />} onClick={() => onDelete(customer)} color="red.500">
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Td>
    </Tr>
  );
};

function CustomerManagement() {
  const history = useHistory();
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isInvoicesOpen, onOpen: onInvoicesOpen, onClose: onInvoicesClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const toast = useToast();
  const { filterData, isSearchActive } = useSearch();
 
  const [customers, setCustomers] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);
  
  // Payment state
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    paidCash: "",
    paidOnline: "",
    notes: ""
  });

  useEffect(() => {
    fetchCustomers();
    fetchSaleableStock();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const res = await fetch(`${apiUrl}/core/customer`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Fetch purchase counts and ratings for all customers
        const mappedPromises = data.map(async (c) => {
          let purchaseCount = 1; // Initial purchase
          let totalDue = parseFloat(c.bill_due || 0);
          let rating = 0;
          let ratingNotes = '';
          
          try {
            // Fetch additional purchases for this customer
            const purchasesRes = await fetch(`${apiUrl}/core/customer/${c.id}/purchases`, {
              headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            
            if (purchasesRes.ok) {
              const purchasesData = await purchasesRes.json();
              if (purchasesData.success && purchasesData.data && purchasesData.data.purchases) {
                purchaseCount += purchasesData.data.purchases.length;
                // Add due amounts from all purchases
                purchasesData.data.purchases.forEach(p => {
                  totalDue += parseFloat(p.due_amount || 0);
                });
              }
            }
          } catch (e) {
            // If fetch fails, use default values
          }
          
          // Fetch rating if not included in customer data
          if (c.rating !== undefined) {
            rating = c.rating || 0;
            ratingNotes = c.rating_notes || '';
          } else {
            try {
              const ratingRes = await fetch(`${apiUrl}/core/customer/${c.id}/rating`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
              });
              
              if (ratingRes.ok) {
                const ratingData = await ratingRes.json();
                rating = ratingData.data?.rating || 0;
                ratingNotes = ratingData.data?.rating_notes || '';
              }
            } catch (e) {
              // If fetch fails, use default values
            }
          }
          
          return {
            id: c.id,
            customerCode: c.customer_code || '—',
            name: c.customer_name,
            phone: c.customer_phone_no || '—',
            email: c.customer_email || '—',
            address: c.customer_address || '—',
            avatar: logo,
            registeredDate: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
            purchaseCount: purchaseCount,
            totalDue: totalDue,
            totalDueFormatted: `PKR ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            status: totalDue > 0 ? 'Has Dues' : 'Clear',
            rating: rating,
            rating_notes: ratingNotes,
          };
        });
        
        const mapped = await Promise.all(mappedPromises);
        setCustomers(mapped);
      } else {
        setCustomers([]);
      }
    } catch (e) {
      console.error('Error fetching customers:', e);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // enrichment no longer needed; list includes purchased_items per docs

  const fetchSaleableStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock`, {
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
    discountAmount: "",
    paidCash: "",
    paidOnline: "",
    items: []
  });

  const addPurchaseItem = () => {
    if (stockOptions.length === 0) return;
    setNewCustomer(prev => ({
      ...prev,
      items: [...prev.items, { stockId: "", quantity: "" }]
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
      if (!stock) return;
      const overridePrice = it.unitPrice !== undefined && it.unitPrice !== "" ? parseFloat(it.unitPrice) : null;
      const price = (overridePrice != null && isFinite(overridePrice)) ? overridePrice : (stock.itemPrice ? stock.itemPrice : 0);
      const qty = parseFloat(it.quantity || 0);
      if (isFinite(price) && isFinite(qty) && qty > 0) total += price * qty;
    });
    const discount = parseFloat(newCustomer.discountAmount || 0) || 0;
    const netTotal = Math.max(0, total - discount);
    const paidCash = parseFloat(newCustomer.paidCash || 0) || 0;
    const paidOnline = parseFloat(newCustomer.paidOnline || 0) || 0;
    const paid = paidCash + paidOnline;
    const due = Math.max(0, netTotal - paid);
    return { total, discount, netTotal, paidCash, paidOnline, paid, due };
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
    if (!newCustomer.name || newCustomer.items.length === 0 || isSubmitting || submissionInProgress.current) {
      console.log('Submission blocked:', { 
        hasName: !!newCustomer.name, 
        hasItems: newCustomer.items.length > 0, 
        isSubmitting, 
        inProgress: submissionInProgress.current 
      });
      return;
    }
    
    // Mark submission as in progress immediately
    submissionInProgress.current = true;
    console.log('=== STARTING CUSTOMER SUBMISSION ===');
    
    // Optional front-end validation vs available
    for (const it of newCustomer.items) {
      const stock = stockOptions.find(s => s.itemId === parseInt(it.stockId));
      if (!stock) { continue; }
      if (stock && parseFloat(it.quantity || 0) > stock.available) {
        toast({ title: "Quantity exceeds available stock", description: `Item: ${stock.name}`, status: "error", duration: 5000, isClosable: true });
        submissionInProgress.current = false;
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Filter valid items and remove duplicates by stock_id
      const validItems = newCustomer.items
        .filter(it => it.stockId && parseFloat(it.quantity) > 0);
      
      // Remove duplicates - keep only the first occurrence of each stock_id
      const uniqueItems = [];
      const seenStockIds = new Set();
      
      for (const item of validItems) {
        const stockId = parseInt(item.stockId);
        if (!seenStockIds.has(stockId)) {
          seenStockIds.add(stockId);
          uniqueItems.push({
            stock_id: stockId,
            quantity: parseFloat(item.quantity),
            ...(item.unitPrice !== undefined && item.unitPrice !== "" ? { unit_price: parseFloat(item.unitPrice) } : {})
          });
        }
      }
      
      if (uniqueItems.length === 0) {
        toast({ title: "No Items", description: "Please add at least one item with quantity", status: "warning", duration: 3000, isClosable: true });
        setIsSubmitting(false);
        submissionInProgress.current = false;
        return;
      }
      
      const payload = {
        customer_name: newCustomer.name,
        customer_phone_no: newCustomer.phone || undefined,
        discount_amount: newCustomer.discountAmount ? parseFloat(newCustomer.discountAmount) : undefined,
        paid_cash: newCustomer.paidCash ? parseFloat(newCustomer.paidCash) : undefined,
        paid_online: newCustomer.paidOnline ? parseFloat(newCustomer.paidOnline) : undefined,
        items: uniqueItems
      };
      
      console.log('=== CUSTOMER CREATION DEBUG ===');
      console.log('Original items from form:', newCustomer.items);
      console.log('Valid items (filtered):', validItems);
      console.log('Unique items (deduplicated):', uniqueItems);
      console.log('Final payload being sent to API:', JSON.stringify(payload, null, 2));
      
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/customer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('API Response:', data);
      if (res.ok) {
        // Refresh customers and stock
        fetchCustomers();
        fetchSaleableStock();
        // Reset form
        setNewCustomer({ name: "", phone: "", discountAmount: "", paidCash: "", paidOnline: "", items: [] });
        onAddClose();
        toast({ title: "Customer Created", description: data.message || 'Purchase recorded', status: "success", duration: 4000, isClosable: true });
      } else {
        toast({ title: "Create Failed", description: data.message || 'Failed to create customer', status: "error", duration: 5000, isClosable: true });
      }
    } catch (e) {
      console.error('Error creating customer:', e);
      toast({ title: "Network Error", description: 'Unable to create customer', status: "error", duration: 5000, isClosable: true });
    } finally {
      setIsSubmitting(false);
      submissionInProgress.current = false;
      console.log('=== SUBMISSION COMPLETED/FAILED - RESET FLAG ===');
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/customer/${customer.id}/invoice`, {
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/customer/${customer.id}/invoices`, {
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

  const handleViewProfile = (customer) => {
    history.push(`/admin/customer-profile/${customer.id}`);
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Delete customer "${customer.name}" and their purchases?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/customer/${customer.id}`, {
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

  const handleOpenPayment = (customer) => {
    if (customer.totalDue <= 0) {
      toast({
        title: "No Dues",
        description: "This customer has no outstanding dues",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSelectedCustomer(customer);
    setPaymentForm({
      amount: customer.totalDue.toString(),
      paymentMethod: "cash",
      paidCash: customer.totalDue.toString(),
      paidOnline: "",
      notes: ""
    });
    onPaymentOpen();
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomer) return;

    const paidCash = parseFloat(paymentForm.paidCash || 0);
    const paidOnline = parseFloat(paymentForm.paidOnline || 0);
    const totalPayment = paidCash + paidOnline;

    if (totalPayment <= 0) {
      toast({
        title: "Invalid Payment",
        description: "Please enter a payment amount",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      // Payment-only transaction: omit items field entirely
      // As per PAYMENT_ONLY_TRANSACTIONS.md, items is optional
      const payload = {};

      // Add payment fields only if they have values
      if (paidCash > 0) {
        payload.paid_cash = paidCash;
      }
      if (paidOnline > 0) {
        payload.paid_online = paidOnline;
      }

      console.log('Recording payment for customer:', selectedCustomer.id);
      console.log('Payment payload:', payload);

      const response = await fetch(`${apiUrl}/core/customer/${selectedCustomer.id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Payment response:', responseData);

      if (response.ok) {
        toast({
          title: 'Payment Recorded',
          description: `PKR ${totalPayment.toFixed(2)} has been recorded successfully`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        onPaymentClose();
        setPaymentForm({
          amount: "",
          paymentMethod: "cash",
          paidCash: "",
          paidOnline: "",
          notes: ""
        });
        setSelectedCustomer(null);
        fetchCustomers();
        
        // Also refresh invoices panel if open
        try {
          const refreshEvent = new Event('refresh-invoices');
          window.dispatchEvent(refreshEvent);
        } catch (_) {}
      } else {
        toast({
          title: 'Payment Failed',
          description: responseData.message || 'Failed to record payment',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
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
            
            {/* Desktop: Show all buttons */}
            <Flex direction={{ base: "column", sm: "row" }} gap="12px" w="100%">
              <Button
                leftIcon={<FaPlus />}
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                onClick={onAddOpen}
                size='md'
                display={{ base: "none", md: "flex" }}>
                Add New Customer
              </Button>

              <HStack spacing='16px' display={{ base: "none", md: "flex" }}>
                <Button
                  leftIcon={<FaFileCsv />}
                  colorScheme='teal'
                  bg='#FF8D28'
                  color='white'
                  _hover={{ bg: '#E67E22' }}
                  size='md'>
                  Import CSV
                </Button>
              </HStack>

              {/* Mobile/Tablet: Dropdown menu */}
              <Box display={{ base: "block", md: "none" }}>
                <Menu>
                  <MenuButton as={Button} rightIcon={<HamburgerIcon />} size="md" colorScheme="teal" bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }}>
                    Actions
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<FaPlus />} onClick={onAddOpen}>
                      Add New Customer
                    </MenuItem>
                    <MenuItem icon={<FaFileCsv />}>
                      Import CSV
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Flex>
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
          <ResponsiveTable
            captions={["Customer Code", "Customer Name", "Phone Number", "Registered", "Purchases", "Total Due", "STATUS", "Rating", "Actions"]}
            data={filterData(customers, ['customerCode', 'name', 'phone', 'registeredDate', 'purchaseCount', 'totalDueFormatted', 'status', 'rating'])}
            isLoading={isLoading}
            renderMobileCard={(customer, index) => (
              <Box key={index} bg={useColorModeValue("white", "gray.800")} mb="16px" boxShadow="md" borderRadius="lg" p="20px">
                <VStack spacing="16px" align="stretch">
                  {/* Header with name and customer code */}
                  <Flex justify="space-between" align="flex-start">
                    <VStack align="start" spacing="4px" flex="1">
                      <Text fontSize="lg" color={textColor} fontWeight="bold">
                        {customer.name}
                      </Text>
                      {customer.customerCode !== '—' && (
                        <Text fontSize="sm" color="gray.400" fontFamily="monospace">
                          {customer.customerCode}
                        </Text>
                      )}
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        📞 {customer.phone}
                      </Text>
                    </VStack>
                    <Badge 
                      colorScheme={customer.status === "Has Dues" ? "orange" : "green"} 
                      fontSize="xs" 
                      p="4px 12px"
                      borderRadius="full"
                    >
                      {customer.status}
                    </Badge>
                  </Flex>

                  {/* Customer Info Grid */}
                  <SimpleGrid columns={1} spacing="12px">
                    <VStack align="start" spacing="4px">
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">REGISTERED</Text>
                      <Text fontSize="sm" color={textColor}>{customer.registeredDate}</Text>
                    </VStack>
                  </SimpleGrid>

                  {/* Purchase Info */}
                  <SimpleGrid columns={2} spacing="12px">
                    <VStack align="start" spacing="4px">
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">TOTAL PURCHASES</Text>
                      <Badge colorScheme="blue" fontSize="md" px={3} py={1} fontWeight="bold">
                        {customer.purchaseCount}
                      </Badge>
                    </VStack>
                    <VStack align="start" spacing="4px">
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">TOTAL DUE</Text>
                      <Text fontSize="md" color={customer.totalDue > 0 ? "red.500" : "green.500"} fontWeight="bold">
                        {customer.totalDueFormatted}
                      </Text>
                    </VStack>
                  </SimpleGrid>

                  {/* Action Buttons */}
                  <VStack spacing="8px" pt="8px">
                    <HStack spacing="8px" w="full">
                      <Button
                        size="sm"
                        leftIcon={<FaEye />}
                        colorScheme="purple"
                        variant="solid"
                        flex="1"
                        onClick={() => handleViewProfile(customer)}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<FaDownload />}
                        colorScheme="teal"
                        variant="outline"
                        flex="1"
                        onClick={() => handleDownloadInvoice(customer)}
                      >
                        Invoice
                      </Button>
                    </HStack>
                    <HStack spacing="8px" w="full">
                      <IconButton
                        size="sm"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteCustomer(customer)}
                        aria-label="Delete Customer"
                        flex="1"
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
            )}
            actionButtons={[
              {
                label: "View Full Profile",
                icon: <FaEye />,
                onClick: (customer) => handleViewProfile(customer),
              },
              {
                label: "Download Invoice", 
                icon: <FaDownload />,
                onClick: (customer) => handleDownloadInvoice(customer),
              },
              {
                label: "Delete",
                icon: <DeleteIcon />,
                onClick: (customer) => handleDeleteCustomer(customer),
                color: "red.500",
              },
            ]}
          >
            {filterData(customers, ['customerCode', 'name', 'phone', 'registeredDate', 'purchaseCount', 'totalDueFormatted', 'status']).map((customer) => (
              <CustomerTableRow 
                key={customer.id} 
                customer={customer} 
                onDownload={handleDownloadInvoice}
                onDelete={handleDeleteCustomer}
                onViewProfile={handleViewProfile}
                onPayment={handleOpenPayment}
              />
            ))}
          </ResponsiveTable>
          )}
        </CardBody>
      </Card>

      {/* Add New Customer Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='3xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Add New Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="24px" align="stretch">
              <Box>
                <Text fontWeight="bold" color={textColor} mb="8px">Customer Info</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: "12px", md: "16px" }}>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">Customer Name</FormLabel>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) => { const v = e.target.value; setNewCustomer(prev => ({ ...prev, name: v })); }}
                      placeholder="Enter customer name"
                      size="md"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">Phone Number</FormLabel>
                    <Input
                      value={newCustomer.phone}
                      onChange={(e) => { const v = e.target.value; setNewCustomer(prev => ({ ...prev, phone: v })); }}
                      placeholder="Enter phone number"
                      size="md"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" color={textColor} mb="8px">Purchased Items</Text>
                <VStack spacing="12px" align="stretch">
                  {newCustomer.items.map((it, idx) => {
                    const stock = stockOptions.find(s => s.itemId === parseInt(it.stockId));
                    const unitPrice = (it.unitPrice !== undefined && it.unitPrice !== "")
                      ? parseFloat(it.unitPrice)
                      : (stock && stock.itemPrice ? stock.itemPrice : null);
                    const qty = parseFloat(it.quantity || 0) || 0;
                    const lineTotal = stock ? (unitPrice || 0) * qty : 0;
                    return (
                      <Box key={idx} border="1px solid" borderColor="gray.200" borderRadius="14px" p="18px" mb="14px" bg={useColorModeValue("white", "gray.700")}> 
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={{ base: "14px", md: "18px", xl: "20px" }} alignItems="end">
                          <FormControl>
                            <FormLabel fontSize="xs" color="gray.500">Item</FormLabel>
                            <SearchableSelect
                              options={stockOptions}
                              value={it.stockId}
                              onChange={(value) => updatePurchaseItem(idx, { stockId: value })}
                              placeholder="Search products..."
                            />
                            {stock ? (
                              <Text mt="6px" fontSize="xs" color="gray.500">
                                {`Available: ${stock.available} ${stock.unitLabel}`}
                              </Text>
                            ) : (
                              <Text mt="6px" fontSize="xs" color="gray.400">Select an item to see availability</Text>
                            )}
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs" color="gray.500">Quantity</FormLabel>
                            <Input
                              type="number"
                              placeholder="Qty"
                              size="md"
                              value={it.quantity}
                              onChange={(e) => { const v = e.target.value; updatePurchaseItem(idx, { quantity: v }); }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs" color="gray.500">Unit Price</FormLabel>
                            <InputGroup size="md">
                              <InputLeftAddon children="PKR" />
                              <Input
                                value={it.unitPrice ?? (unitPrice != null ? unitPrice.toFixed(2) : "")}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  updatePurchaseItem(idx, { unitPrice: v });
                                }}
                                placeholder="—"
                              />
                            </InputGroup>
                          </FormControl>
                          <FormControl isReadOnly>
                            <FormLabel fontSize="xs" color="gray.500">Line Total</FormLabel>
                            <InputGroup size="md">
                              <InputLeftAddon children="PKR" />
                              <Input value={stock && qty > 0 ? lineTotal.toFixed(2) : ""} placeholder="—" readOnly />
                            </InputGroup>
                          </FormControl>
                        </SimpleGrid>
                        <HStack justify="flex-end" mt="16px">
                          <Button size="sm" variant="ghost" color="#E67E22" onClick={() => removePurchaseItem(idx)}>Remove</Button>
                        </HStack>
                      </Box>
                    );
                  })}
                  <Button size="md" onClick={addPurchaseItem} variant="outline">Add Item</Button>
                </VStack>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" color={textColor} mb="8px">Payments</Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="12px">
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">Discount</FormLabel>
                    <InputGroup>
                      <InputLeftAddon children="PKR" />
                      <Input
                        type="number"
                        value={newCustomer.discountAmount}
                        onChange={(e) => { const v = e.target.value; setNewCustomer(prev => ({ ...prev, discountAmount: v })); }}
                        size="md"
                        placeholder="0"
                      />
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">Paid by Cash</FormLabel>
                    <InputGroup>
                      <InputLeftAddon children="PKR" />
                      <Input
                        type="number"
                        value={newCustomer.paidCash}
                        onChange={(e) => { const v = e.target.value; setNewCustomer(prev => ({ ...prev, paidCash: v })); }}
                        size="md"
                        placeholder="0"
                      />
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">Paid Online</FormLabel>
                    <InputGroup>
                      <InputLeftAddon children="PKR" />
                      <Input
                        type="number"
                        value={newCustomer.paidOnline}
                        onChange={(e) => { const v = e.target.value; setNewCustomer(prev => ({ ...prev, paidOnline: v })); }}
                        size="md"
                        placeholder="0"
                      />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              <Box border="1px solid" borderColor="gray.200" borderRadius="8px" p="12px" bg={useColorModeValue("gray.50", "whiteAlpha.100")}>
                {(() => { const { total, discount, netTotal, paidCash, paidOnline, paid, due } = computeTotals(); return (
                  <VStack align="stretch" spacing="6px">
                    <HStack justify="space-between"><Text color="gray.600" fontSize="sm">Subtotal</Text><Text color={textColor} fontWeight="semibold">PKR.{total.toFixed(2)}</Text></HStack>
                    <HStack justify="space-between"><Text color="gray.600" fontSize="sm">Discount</Text><Text color={textColor} fontWeight="semibold">-PKR.{discount.toFixed(2)}</Text></HStack>
                    <Divider />
                    <HStack justify="space-between"><Text color="gray.600" fontSize="sm">Net Total</Text><Text color="#E67E22" fontWeight="bold">PKR.{netTotal.toFixed(2)}</Text></HStack>
                    <HStack justify="space-between"><Text color="gray.600" fontSize="sm">Paid (Cash)</Text><Text color={textColor} fontWeight="semibold">PKR.{paidCash.toFixed(2)}</Text></HStack>
                    <HStack justify="space-between"><Text color="gray.600" fontSize="sm">Paid (Online)</Text><Text color={textColor} fontWeight="semibold">PKR.{paidOnline.toFixed(2)}</Text></HStack>
                    <Divider />
                    <HStack justify="space-between"><Text color="gray.600" fontSize="sm">Paid Total</Text><Text color={textColor} fontWeight="bold">PKR.{paid.toFixed(2)}</Text></HStack>
                    <HStack justify="space-between"><Text color="gray.600" fontSize="sm">Bill Due</Text><Text color="red.500" fontWeight="extrabold">PKR.{due.toFixed(2)}</Text></HStack>
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
                isLoading={isSubmitting}
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

      {/* Clear Due Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>
            Clear Due Payment
            {selectedCustomer && (
              <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
                Customer: {selectedCustomer.name}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="20px" align="stretch">
              {/* Current Balance Info */}
              {selectedCustomer && (
                <Box bg={selectedCustomer.totalDue > 0 ? "red.50" : "green.50"} p={4} borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" color="gray.600">
                      Current Balance:
                    </Text>
                    <Text 
                      fontSize="lg" 
                      fontWeight="bold" 
                      color={selectedCustomer.totalDue > 0 ? "red.500" : "green.500"}
                    >
                      PKR {selectedCustomer.totalDue.toFixed(2)}
                    </Text>
                  </HStack>
                  {selectedCustomer.totalDue > 0 && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Amount due to be paid
                    </Text>
                  )}
                  {selectedCustomer.totalDue < 0 && (
                    <Text fontSize="xs" color="green.600" mt={1}>
                      Advance payment (credit balance)
                    </Text>
                  )}
                </Box>
              )}

              {/* Payment Method Selection */}
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">Payment Method</FormLabel>
                <RadioGroup 
                  value={paymentForm.paymentMethod} 
                  onChange={(value) => {
                    setPaymentForm(prev => ({
                      ...prev,
                      paymentMethod: value,
                      paidCash: value === "cash" ? prev.amount : "",
                      paidOnline: value === "online" ? prev.amount : "",
                    }));
                  }}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="cash" colorScheme="orange">Cash</Radio>
                    <Radio value="online" colorScheme="orange">Online/Card</Radio>
                    <Radio value="split" colorScheme="orange">Split Payment</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Single Payment Amount (Cash or Online) */}
              {paymentForm.paymentMethod !== "split" && (
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600">
                    Amount {paymentForm.paymentMethod === "cash" ? "(Cash)" : "(Online/Card)"}
                  </FormLabel>
                  <NumberInput
                    value={paymentForm.paymentMethod === "cash" ? paymentForm.paidCash : paymentForm.paidOnline}
                    onChange={(valueString) => {
                      if (paymentForm.paymentMethod === "cash") {
                        setPaymentForm(prev => ({ ...prev, paidCash: valueString, paidOnline: "" }));
                      } else {
                        setPaymentForm(prev => ({ ...prev, paidOnline: valueString, paidCash: "" }));
                      }
                    }}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField placeholder="Enter amount" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              )}

              {/* Split Payment Fields */}
              {paymentForm.paymentMethod === "split" && (
                <>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Cash Amount</FormLabel>
                    <NumberInput
                      value={paymentForm.paidCash}
                      onChange={(valueString) => setPaymentForm(prev => ({ ...prev, paidCash: valueString }))}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="Cash amount" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Online/Card Amount</FormLabel>
                    <NumberInput
                      value={paymentForm.paidOnline}
                      onChange={(valueString) => setPaymentForm(prev => ({ ...prev, paidOnline: valueString }))}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="Online amount" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  {/* Total Payment Display for Split */}
                  <Box bg="blue.50" p={3} borderRadius="md">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Total Payment:
                      </Text>
                      <Text fontSize="md" fontWeight="bold" color="blue.600">
                        PKR {(parseFloat(paymentForm.paidCash || 0) + parseFloat(paymentForm.paidOnline || 0)).toFixed(2)}
                      </Text>
                    </HStack>
                  </Box>
                </>
              )}

              {/* Notes (Optional) */}
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">Notes (Optional)</FormLabel>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this payment"
                />
              </FormControl>

              {/* New Balance Preview */}
              {selectedCustomer && (
                <Box bg="gray.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="orange.400">
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Current Due:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        PKR {selectedCustomer.totalDue.toFixed(2)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Payment:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="green.600">
                        - PKR {(parseFloat(paymentForm.paidCash || 0) + parseFloat(paymentForm.paidOnline || 0)).toFixed(2)}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="md" fontWeight="bold" color="gray.700">New Balance:</Text>
                      <Text 
                        fontSize="md" 
                        fontWeight="bold" 
                        color={(selectedCustomer.totalDue - (parseFloat(paymentForm.paidCash || 0) + parseFloat(paymentForm.paidOnline || 0))) > 0 ? "red.500" : "green.500"}
                      >
                        PKR {(selectedCustomer.totalDue - (parseFloat(paymentForm.paidCash || 0) + parseFloat(paymentForm.paidOnline || 0))).toFixed(2)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onPaymentClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                bg="#4CAF50"
                color="white"
                _hover={{ bg: "#45a049" }}
                onClick={handleRecordPayment}
                leftIcon={<FaMoneyBillWave />}
                isDisabled={
                  (parseFloat(paymentForm.paidCash || 0) + parseFloat(paymentForm.paidOnline || 0)) <= 0
                }
              >
                Clear Due Payment
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default CustomerManagement;
