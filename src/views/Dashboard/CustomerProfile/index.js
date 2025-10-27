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
  Badge,
  Image,
  Avatar,
  Divider,
  useToast,
  Spinner,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  Textarea,
  Checkbox,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { FaArrowLeft, FaDownload, FaPhone, FaCalendar, FaMoneyBillWave, FaShoppingCart, FaPlus, FaTrash, FaChevronDown, FaChevronRight, FaStar, FaEdit } from "react-icons/fa";
import { MdReceipt } from "react-icons/md";

function CustomerProfile() {
  const { customerId } = useParams();
  const history = useHistory();
  const toast = useToast();

  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgCard = useColorModeValue("white", "gray.800");
  const bgStats = useColorModeValue("gray.50", "gray.700");

  // State
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stockItems, setStockItems] = useState([]);
  const [expandedPurchases, setExpandedPurchases] = useState(new Set());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isRatingOpen, onOpen: onRatingOpen, onClose: onRatingClose } = useDisclosure();
  
  // Purchase form state
  const [purchaseItems, setPurchaseItems] = useState([{ stock_id: '', quantity: 1, unit_price: '', use_secondary_unit: false }]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidCash, setPaidCash] = useState(0);
  const [paidOnline, setPaidOnline] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Rating state
  const [rating, setRating] = useState(0);
  const [ratingNotes, setRatingNotes] = useState('');
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  // Fetch customer details
  const fetchCustomerDetails = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      // Fetch all customers and find the specific one
      const customersResponse = await fetch(`${apiUrl}/core/customer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!customersResponse.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const customersData = await customersResponse.json();
      const customerData = customersData.find(c => c.id === parseInt(customerId));

      if (!customerData) {
        throw new Error('Customer not found');
      }

      setCustomer(customerData);
      
      // Fetch rating separately if not included in customer data
      console.log('Customer data received:', { 
        id: customerData.id, 
        name: customerData.customer_name,
        rating: customerData.rating, 
        rating_notes: customerData.rating_notes 
      });
      
      if (customerData.rating !== undefined) {
        setRating(customerData.rating || 0);
        setRatingNotes(customerData.rating_notes || '');
        console.log('Rating from customer data:', customerData.rating);
      } else {
        // Fetch rating separately using dedicated endpoint
        try {
          const ratingRes = await fetch(`${apiUrl}/core/customer/${customerId}/rating`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
          
          if (ratingRes.ok) {
            const ratingData = await ratingRes.json();
            console.log('Rating fetched separately:', ratingData);
            setRating(ratingData.data?.rating || 0);
            setRatingNotes(ratingData.data?.rating_notes || '');
          }
        } catch (error) {
          console.error('Error fetching rating:', error);
        }
      }
      console.log('Rating state set to:', rating);

      // Try multiple possible structures for purchases
      let purchasesData = [];
      if (customerData.purchases && Array.isArray(customerData.purchases)) {
        purchasesData = customerData.purchases;
      } else if (customerData.customer_purchases && Array.isArray(customerData.customer_purchases)) {
        purchasesData = customerData.customer_purchases;
      } else if (customerData.purchase_history && Array.isArray(customerData.purchase_history)) {
        purchasesData = customerData.purchase_history;
      }
      
      console.log('Customer data structure:', customerData);
      console.log('Extracted purchases:', purchasesData);
      setPurchases(purchasesData);

      // Fetch customer invoices
      const invoicesResponse = await fetch(`${apiUrl}/core/customer/${customerId}/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        console.log('Fetched invoices:', invoicesData);
        setInvoices(invoicesData);
      } else {
        setInvoices([]);
      }
      
      // Fetch purchases from dedicated endpoint (Endpoint 19.1)
      try {
        const purchasesResponse = await fetch(`${apiUrl}/core/customer/${customerId}/purchases`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (purchasesResponse.ok) {
          const purchasesApiData = await purchasesResponse.json();
          console.log('Fetched purchases from API:', purchasesApiData);
          
          // API returns: { success: true, data: { customer: {...}, purchases: [...] } }
          if (purchasesApiData.success && purchasesApiData.data && purchasesApiData.data.purchases) {
            setPurchases(purchasesApiData.data.purchases);
            console.log('Set purchases:', purchasesApiData.data.purchases);
          } else if (Array.isArray(purchasesApiData)) {
            // Fallback if API returns array directly
            setPurchases(purchasesApiData);
          }
        }
      } catch (purchaseError) {
        console.error('Error fetching purchases:', purchaseError);
      }

    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load customer details",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
      fetchStockItems();
    }
  }, [customerId]);

  // Fetch stock items for purchase form
  const fetchStockItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/core/stock`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
      }
    } catch (error) {
      console.error('Error fetching stock items:', error);
    }
  };

  // Handle adding new purchase
  const handleAddPurchase = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      // Prepare items data
      const items = purchaseItems.map(item => ({
        stock_id: parseInt(item.stock_id),
        quantity: parseFloat(item.quantity),
        unit_price: item.unit_price ? parseFloat(item.unit_price) : undefined,
        ...(item.use_secondary_unit ? { use_secondary_unit: true } : {})
      }));

      const requestBody = {
        items: items,
        discount_amount: parseFloat(discountAmount) || 0,
        paid_cash: parseFloat(paidCash) || 0,
        paid_online: parseFloat(paidOnline) || 0,
      };

      const response = await fetch(`${apiUrl}/core/customer/${customerId}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record purchase');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: `Purchase recorded successfully! Purchase Code: ${data.data?.purchase?.purchase_code || 'N/A'}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form and close modal
      handleResetForm();
      onClose();
      
      // Refresh customer details to show updated totals and new purchase
      await fetchCustomerDetails();

    } catch (error) {
      console.error('Error adding purchase:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record purchase",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new item row
  const handleAddItemRow = () => {
    setPurchaseItems([...purchaseItems, { stock_id: '', quantity: 1, unit_price: '', use_secondary_unit: false }]);
  };

  // Remove item row
  const handleRemoveItemRow = (index) => {
    if (purchaseItems.length > 1) {
      const newItems = purchaseItems.filter((_, i) => i !== index);
      setPurchaseItems(newItems);
    }
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    const newItems = [...purchaseItems];
    newItems[index][field] = value;
    
    // Auto-fill unit price if stock item is selected
    if (field === 'stock_id' && value) {
      const selectedStock = stockItems.find(s => s.item_id === parseInt(value));
      if (selectedStock && selectedStock.item_price) {
        newItems[index].unit_price = selectedStock.item_price;
      }
    }
    
    setPurchaseItems(newItems);
  };

  // Reset form
  const handleResetForm = () => {
    setPurchaseItems([{ stock_id: '', quantity: 1, unit_price: '', use_secondary_unit: false }]);
    setDiscountAmount(0);
    setPaidCash(0);
    setPaidOnline(0);
  };

  // Handle rating submission
  const handleSubmitRating = async () => {
    try {
      setIsRatingSubmitting(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      console.log('Submitting rating:', { customerId, rating, ratingNotes });

      const response = await fetch(`${apiUrl}/core/customer/${customerId}/rating`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating,
          rating_notes: ratingNotes,
        }),
      });

      const responseData = await response.json();
      console.log('Rating API response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update rating');
      }

      // Close modal first
      onRatingClose();

      // Show success message
      toast({
        title: "Success",
        description: `Rating updated to ${rating} stars!`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      
      // Refresh customer details to show updated rating
      await fetchCustomerDetails();
      
      console.log('Rating state after refresh:', { rating, ratingNotes });

    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update rating",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  // Toggle purchase items expansion
  const togglePurchaseExpansion = (purchaseId) => {
    const newExpanded = new Set(expandedPurchases);
    if (newExpanded.has(purchaseId)) {
      newExpanded.delete(purchaseId);
    } else {
      newExpanded.add(purchaseId);
    }
    setExpandedPurchases(newExpanded);
  };

  // Download invoice
  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/core/customer/${customerId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${customer?.customer_code || customerId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: "Failed to download invoice",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Download purchase invoice (specific purchase)
  const handleDownloadPurchaseInvoice = async (purchaseId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const purchase = purchases.find(p => p.id === purchaseId);
      
      // If purchase has an attached invoice, download that specific invoice
      let invoiceUrl = `${apiUrl}/core/customer/${customerId}/invoice`;
      if (purchase?.invoice_id) {
        invoiceUrl = `${apiUrl}/core/invoices/${purchase.invoice_id}/download`;
      }
      
      const response = await fetch(invoiceUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download purchase invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchase-${purchase?.purchase_code || purchaseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Purchase invoice downloaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading purchase invoice:', error);
      toast({
        title: "Error",
        description: "Failed to download purchase invoice",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Calculate accurate totals from ALL purchases
  const calculateTotals = () => {
    let totalBill = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let totalDiscount = 0;
    let totalCash = 0;
    let totalOnline = 0;

    // Add from original customer data (initial purchase)
    totalBill += parseFloat(customer.total_bill || 0);
    totalPaid += parseFloat(customer.bill_paid || 0);
    totalDue += parseFloat(customer.bill_due || 0);
    totalDiscount += parseFloat(customer.discount_amount || 0);
    totalCash += parseFloat(customer.paid_cash || 0);
    totalOnline += parseFloat(customer.paid_online || 0);

    // Add from all subsequent purchases
    purchases.forEach(purchase => {
      totalBill += parseFloat(purchase.total_amount || 0);
      totalPaid += parseFloat(purchase.paid_total || 0);
      totalDue += parseFloat(purchase.due_amount || 0);
      totalDiscount += parseFloat(purchase.discount_amount || 0);
      totalCash += parseFloat(purchase.paid_cash || 0);
      totalOnline += parseFloat(purchase.paid_online || 0);
    });

    return {
      totalBill,
      totalPaid,
      totalDue,
      totalDiscount,
      totalCash,
      totalOnline,
      totalPurchases: 1 + (purchases?.length || 0), // Initial + subsequent
      totalItems: (customer.purchased_items?.length || 0) + purchases.reduce((sum, p) => sum + (p.items?.length || 0), 0)
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `PKR ${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Flex direction="column" pt={{ base: "120px", md: "75px" }} align="center" justify="center" minH="70vh">
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text mt={4} fontSize="lg" color={textColor}>Loading customer profile...</Text>
      </Flex>
    );
  }

  if (!customer) {
    return (
      <Flex direction="column" pt={{ base: "120px", md: "75px" }} align="center" justify="center" minH="70vh">
        <Text fontSize="xl" color={textColor}>Customer not found</Text>
        <Button mt={4} colorScheme="teal" onClick={() => history.push('/admin/customer-management')}>
          Back to Customer Management
        </Button>
      </Flex>
    );
  }

  const paymentStatus = customer.bill_due > 0 ? 'Pending' : 'Paid';
  const paymentStatusColor = customer.bill_due > 0 ? 'orange' : 'green';

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }} w="full" maxW="full">
      {/* Back Button */}
      <Box mb={3} w="full">
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          colorScheme="teal"
          onClick={() => history.push('/admin/customer-management')}
          size="sm"
        >
          Back to Customers
        </Button>
      </Box>

      {/* Customer Header Card */}
      <Card mb={3} w="full">
        <CardBody p={4}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            gap={4}
          >
            {/* Customer Info */}
            <Flex align="center" gap={3}>
              <Avatar
                size="lg"
                name={customer.customer_name}
                bg="teal.500"
                color="white"
              />
              <VStack align="start" spacing={0.5}>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  {customer.customer_name}
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  <HStack spacing={1}>
                    <Icon as={FaPhone} color="gray.500" boxSize={3} />
                    <Text fontSize="xs" color="gray.500">
                      {customer.customer_phone_no || '—'}
                    </Text>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5} borderRadius="md">
                    {customer.customer_code}
                  </Badge>
                  <Badge colorScheme={paymentStatusColor} fontSize="xs" px={2} py={0.5}>
                    {paymentStatus}
                  </Badge>
                </HStack>
                <HStack spacing={1}>
                  <Icon as={FaCalendar} color="gray.500" boxSize={3} />
                  <Text fontSize="xs" color="gray.500">
                    Member since {formatDate(customer.created_at)}
                  </Text>
                </HStack>
                {/* Rating Display */}
                <HStack spacing={1} mt={1}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      as={FaStar}
                      color={star <= rating ? "yellow.400" : "gray.300"}
                      boxSize={3}
                    />
                  ))}
                  {rating > 0 && (
                    <Text fontSize="xs" color="gray.600" ml={1}>
                      ({rating}/5)
                    </Text>
                  )}
                  <Tooltip label="Rate this customer" placement="top">
                    <IconButton
                      icon={<FaEdit />}
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={onRatingOpen}
                      ml={1}
                    />
                  </Tooltip>
                </HStack>
              </VStack>
            </Flex>

            {/* Action Buttons */}
            <HStack spacing={2}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                size="sm"
                onClick={onOpen}
              >
                New Purchase
              </Button>
              <Button
                leftIcon={<FaDownload />}
                colorScheme="teal"
                size="sm"
                onClick={handleDownloadInvoice}
              >
                Download Invoice
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={3} mb={3} w="full">
        {/* Total Bill */}
        <Card>
          <CardBody p={3}>
            <VStack align="start" spacing={1}>
              <HStack spacing={2} w="full" justify="space-between">
                <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">
                Total Bill
              </Text>
                <Icon as={FaMoneyBillWave} boxSize={4} color="teal.400" />
              </HStack>
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                {formatCurrency(calculateTotals().totalBill)}
              </Text>
                <Text fontSize="xs" color="gray.400">From {calculateTotals().totalPurchases} purchase(s)</Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Bill Paid */}
        <Card>
          <CardBody p={3}>
            <VStack align="start" spacing={1}>
              <HStack spacing={2} w="full" justify="space-between">
                <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">
                Bill Paid
              </Text>
                <Icon as={FaMoneyBillWave} boxSize={4} color="green.400" />
              </HStack>
              <Text fontSize="xl" color="green.500" fontWeight="bold">
                {formatCurrency(calculateTotals().totalPaid)}
              </Text>
                <Text fontSize="xs" color="gray.400">
                  {calculateTotals().totalDue === 0 ? 'Fully Paid' : 'Amount paid'}
                </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Bill Due */}
        <Card>
          <CardBody p={3}>
            <VStack align="start" spacing={1}>
              <HStack spacing={2} w="full" justify="space-between">
                <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">
                Bill Due
              </Text>
                <Icon as={FaMoneyBillWave} boxSize={4} color="red.400" />
              </HStack>
              <Text fontSize="xl" color={calculateTotals().totalDue > 0 ? "red.500" : "green.500"} fontWeight="bold">
                {formatCurrency(calculateTotals().totalDue)}
              </Text>
                <Text fontSize="xs" color="gray.400">
                  {calculateTotals().totalDue === 0 ? 'No dues' : 'Outstanding'}
                </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Total Items */}
        <Card>
          <CardBody p={3}>
            <VStack align="start" spacing={1}>
              <HStack spacing={2} w="full" justify="space-between">
                <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase">
                  Total Items
              </Text>
                <Icon as={FaShoppingCart} boxSize={4} color="blue.400" />
              </HStack>
              <Text fontSize="xl" color="blue.500" fontWeight="bold">
                {calculateTotals().totalItems}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {calculateTotals().totalDiscount > 0 
                  ? `Saved ${formatCurrency(calculateTotals().totalDiscount)}`
                  : 'Items purchased'}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Payment Details */}
      <Card mb={3} w="full">
        <CardHeader p={3} pb={2}>
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            Payment Breakdown
          </Text>
        </CardHeader>
        <CardBody pt={0} p={3}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3} w="full">
            <Box p={3} bg={bgStats} borderRadius="lg">
              <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">Paid by Cash</Text>
              <Text fontSize="lg" fontWeight="bold" color="green.500">
                {formatCurrency(calculateTotals().totalCash)}
              </Text>
            </Box>
            <Box p={3} bg={bgStats} borderRadius="lg">
              <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">Paid Online/Card</Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.500">
                {formatCurrency(calculateTotals().totalOnline)}
              </Text>
            </Box>
            <Box p={3} bg={bgStats} borderRadius="lg">
              <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">Payment Method</Text>
              <HStack mt={1}>
                {(calculateTotals().totalCash > 0 && calculateTotals().totalOnline > 0) && (
                  <Badge colorScheme="purple" fontSize="xs">Cash + Online</Badge>
                )}
                {(calculateTotals().totalCash > 0 && calculateTotals().totalOnline === 0) && (
                  <Badge colorScheme="green" fontSize="xs">Cash Only</Badge>
                )}
                {(calculateTotals().totalCash === 0 && calculateTotals().totalOnline > 0) && (
                  <Badge colorScheme="blue" fontSize="xs">Online Only</Badge>
                )}
                {(calculateTotals().totalCash === 0 && calculateTotals().totalOnline === 0) && (
                  <Badge colorScheme="gray" fontSize="xs">No Payment</Badge>
                )}
              </HStack>
            </Box>
          </Grid>
        </CardBody>
      </Card>

      {/* Purchased Items */}
      <Card mb={3} w="full">
        <CardHeader p={3} pb={2}>
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" fontWeight="bold" color={textColor}>
              All Purchased Items
            </Text>
            <Badge colorScheme="teal" fontSize="xs" px={2} py={0.5}>
              {(() => {
                let totalItems = 0;
                // Count items from original purchased_items
                totalItems += customer.purchased_items?.length || 0;
                // Count items from all purchases
                purchases.forEach(purchase => {
                  totalItems += purchase.items?.length || 0;
                });
                return totalItems;
              })()} Items
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody pt={0} p={3}>
          <Box overflowX="auto">
            <Table variant="simple" size="sm" w="full" sx={{ tableLayout: 'fixed' }}>
              <Thead>
                <Tr>
                  <Th fontSize="xs" py={1.5} px={4} w="45%">ITEM NAME</Th>
                  <Th fontSize="xs" py={1.5} px={4} w="15%">PURCHASE</Th>
                  <Th fontSize="xs" py={1.5} px={4} isNumeric w="15%">QTY & UNIT</Th>
                  <Th fontSize="xs" py={1.5} px={4} isNumeric w="15%">UNIT PRICE</Th>
                  <Th fontSize="xs" py={1.5} px={4} isNumeric w="10%">TOTAL</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Display items from original purchased_items (first purchase) */}
                {customer.purchased_items && customer.purchased_items.length > 0 && (
                  customer.purchased_items.map((item, index) => {
                    // The backend already sends the correct unit_name based on use_secondary_unit flag
                    // Just use it directly!
                    const unitName = item.unit_name || 'Units';
                    return (
                      <Tr key={`original-${index}`}>
                        <Td py={2} px={4}>
                          <Text fontSize="sm" fontWeight="medium" color={textColor}>
                            {item.item_name}
                          </Text>
                        </Td>
                        <Td py={2} px={4}>
                          <Badge colorScheme="gray" fontSize="2xs">Initial</Badge>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" color={textColor}>{item.quantity} {unitName}</Text>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" color={textColor}>{formatCurrency(item.unit_price)}</Text>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" fontWeight="bold" color="teal.500">
                            {formatCurrency(item.line_total)}
                          </Text>
                        </Td>
                      </Tr>
                    );
                  })
                )}
                
                {/* Display items from all purchases */}
                {purchases && purchases.length > 0 && purchases.map((purchase) => (
                  purchase.items && purchase.items.length > 0 && purchase.items.map((item, itemIndex) => {
                    // The backend already sends the correct unit_name based on use_secondary_unit flag
                    // Just use it directly!
                    const unitName = item.unit_name || 'Units';
                    return (
                      <Tr key={`purchase-${purchase.id}-item-${itemIndex}`}>
                        <Td py={2} px={4}>
                          <Text fontSize="sm" fontWeight="medium" color={textColor}>
                            {item.item_name}
                          </Text>
                        </Td>
                        <Td py={2} px={4}>
                          <Tooltip label={`From ${purchase.purchase_code}`}>
                            <Badge colorScheme="blue" fontSize="2xs">
                              {purchase.purchase_code.split('-')[0]}
                            </Badge>
                          </Tooltip>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" color={textColor}>{item.quantity} {unitName}</Text>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" color={textColor}>{formatCurrency(item.unit_price)}</Text>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" fontWeight="bold" color="teal.500">
                            {formatCurrency(item.line_total)}
                          </Text>
                        </Td>
                      </Tr>
                    );
                  })
                ))}
                
                {/* Show empty state only if no items at all */}
                {(!customer.purchased_items || customer.purchased_items.length === 0) && 
                 (!purchases || purchases.length === 0 || !purchases.some(p => p.items && p.items.length > 0)) && (
                  <Tr>
                    <Td colSpan={5} py={3}>
                      <Text textAlign="center" fontSize="sm" color="gray.500">
                        No items purchased yet
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>

        
          {/* {customer.purchased_items && customer.purchased_items.length > 0 && (
            <Box mt={3} pt={3} borderTop="1px" borderColor={borderColor}>
              <Flex direction="column" align="flex-end" maxW="400px" ml="auto" gap={1.5}>
                <Flex justify="space-between" w="full" minW="300px">
                  <Text fontSize="sm" color="gray.600">Subtotal:</Text>
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
                    {formatCurrency(
                      customer.purchased_items.reduce((sum, item) => sum + parseFloat(item.line_total || 0), 0)
                    )}
                  </Text>
                </Flex>
                {customer.discount_amount > 0 && (
                  <Flex justify="space-between" w="full" minW="300px">
                    <Text fontSize="sm" color="gray.600">Discount:</Text>
                    <Text fontSize="sm" fontWeight="medium" color="orange.500">
                      - {formatCurrency(customer.discount_amount)}
                    </Text>
                  </Flex>
                )}
                <Divider />
                <Flex justify="space-between" align="center" w="full" minW="300px">
                  <Text fontSize="md" fontWeight="bold" color={textColor}>Net Total:</Text>
                  <Text fontSize="md" fontWeight="bold" color="orange.500">
                    {formatCurrency(customer.total_bill)}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          )} */}
        </CardBody>
      </Card>

      {/* Transaction History (Purchases & Invoices) */}
      {((purchases && purchases.length > 0) || (invoices && invoices.length > 0)) && (
        <Card w="full">
          <CardHeader p={3} pb={2}>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                Transaction History
              </Text>
              <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5}>
                {(purchases?.length || 0) + (invoices?.length || 0)} Records
              </Badge>
            </Flex>
          </CardHeader>
          <CardBody pt={0} p={3}>
            <Box overflowX="auto">
              <Table variant="simple" size="sm" w="full" sx={{ tableLayout: 'fixed' }}>
                <Thead>
                  <Tr>
                    <Th fontSize="xs" py={1.5} px={4} w="25%">TRANSACTION #</Th>
                    <Th fontSize="xs" py={1.5} px={4} w="15%">DATE</Th>
                    <Th fontSize="xs" py={1.5} px={4} w="10%">TYPE</Th>
                    <Th fontSize="xs" py={1.5} px={4} isNumeric w="13%">TOTAL</Th>
                    <Th fontSize="xs" py={1.5} px={4} isNumeric w="13%">PAID</Th>
                    <Th fontSize="xs" py={1.5} px={4} isNumeric w="13%">DUE</Th>
                    <Th fontSize="xs" py={1.5} px={4} w="11%">ACTIONS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {/* Display Purchases */}
                  {purchases && purchases.map((purchase) => (
                    <React.Fragment key={`purchase-${purchase.id}`}>
                      <Tr _hover={{ bg: bgStats, cursor: purchase.items?.length > 0 ? 'pointer' : 'default' }} onClick={() => purchase.items?.length > 0 && togglePurchaseExpansion(purchase.id)}>
                        <Td py={2} px={4}>
                          <HStack spacing={1.5}>
                            {purchase.items && purchase.items.length > 0 && (
                              <Icon 
                                as={expandedPurchases.has(purchase.id) ? FaChevronDown : FaChevronRight} 
                                boxSize={3} 
                                color="gray.500"
                              />
                            )}
                            <Icon as={MdReceipt} color="blue.500" boxSize={3} />
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              {purchase.purchase_code}
                            </Text>
                            {purchase.invoice && (
                              <Tooltip label={`Linked to ${purchase.invoice.invoice_number}`}>
                                <Badge colorScheme="teal" fontSize="2xs" px={1}>
                                  INV
                                </Badge>
                              </Tooltip>
                            )}
                            {purchase.items && purchase.items.length > 0 && (
                              <Badge colorScheme="blue" fontSize="2xs" px={1} py={0}>
                                {purchase.items.length} item{purchase.items.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </HStack>
                        </Td>
                        <Td py={2} px={4}>
                          <Text fontSize="sm" color={textColor}>{formatDate(purchase.purchased_at)}</Text>
                        </Td>
                        <Td py={2} px={4}>
                          <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5}>
                            Purchase
                          </Badge>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" color={textColor}>{formatCurrency(purchase.total_amount)}</Text>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" color="green.500">{formatCurrency(purchase.paid_total)}</Text>
                        </Td>
                        <Td py={2} px={4} isNumeric>
                          <Text fontSize="sm" color={purchase.due_amount > 0 ? "red.500" : "gray.400"}>
                            {formatCurrency(purchase.due_amount)}
                          </Text>
                        </Td>
                        <Td py={2} px={4} onClick={(e) => e.stopPropagation()}>
                          <Tooltip label="Download Invoice">
                            <IconButton
                              icon={<FaDownload />}
                              size="xs"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleDownloadPurchaseInvoice(purchase.id)}
                            />
                          </Tooltip>
                        </Td>
                      </Tr>
                      
                      {/* Expanded Items Row */}
                      {expandedPurchases.has(purchase.id) && purchase.items && purchase.items.length > 0 && (
                        <Tr bg={bgStats}>
                          <Td colSpan={7} py={3} px={6}>
                            <Box>
                              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>PURCHASED ITEMS:</Text>
                              <Table size="sm" variant="simple">
                                <Thead>
                                  <Tr>
                                    <Th fontSize="2xs" py={1} px={2}>ITEM NAME</Th>
                                    <Th fontSize="2xs" py={1} px={2} isNumeric>QTY</Th>
                                    <Th fontSize="2xs" py={1} px={2} isNumeric>UNIT PRICE</Th>
                                    <Th fontSize="2xs" py={1} px={2} isNumeric>TOTAL</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {purchase.items.map((item, idx) => (
                                    <Tr key={idx}>
                                      <Td fontSize="xs" py={1} px={2}>
                                        <Text fontWeight="medium" color={textColor}>{item.item_name}</Text>
                                      </Td>
                                      <Td fontSize="xs" py={1} px={2} isNumeric>
                                        {item.quantity}
                                      </Td>
                                      <Td fontSize="xs" py={1} px={2} isNumeric>
                                        {formatCurrency(item.unit_price)}
                                      </Td>
                                      <Td fontSize="xs" py={1} px={2} isNumeric fontWeight="semibold">
                                        {formatCurrency(item.line_total)}
                                      </Td>
                                    </Tr>
                                  ))}
                                  <Tr borderTop="2px" borderColor={borderColor}>
                                    <Td colSpan={3} fontSize="xs" py={1.5} px={2} fontWeight="bold" textAlign="right">
                                      Subtotal:
                                    </Td>
                                    <Td fontSize="xs" py={1.5} px={2} isNumeric fontWeight="bold" color="blue.500">
                                      {formatCurrency(purchase.total_amount + (purchase.discount_amount || 0))}
                                    </Td>
                                  </Tr>
                                  {purchase.discount_amount > 0 && (
                                    <Tr>
                                      <Td colSpan={3} fontSize="xs" py={1} px={2} fontWeight="semibold" textAlign="right" color="orange.500">
                                        Discount:
                                      </Td>
                                      <Td fontSize="xs" py={1} px={2} isNumeric fontWeight="semibold" color="orange.500">
                                        - {formatCurrency(purchase.discount_amount)}
                                      </Td>
                                    </Tr>
                                  )}
                                  <Tr>
                                    <Td colSpan={3} fontSize="xs" py={1} px={2} fontWeight="bold" textAlign="right">
                                      Total:
                                    </Td>
                                    <Td fontSize="xs" py={1} px={2} isNumeric fontWeight="bold" color="teal.500">
                                      {formatCurrency(purchase.total_amount)}
                                    </Td>
                                  </Tr>
                                </Tbody>
                              </Table>
                            </Box>
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {/* Display Invoices */}
                  {invoices && invoices.map((invoice) => (
                    <Tr key={`invoice-${invoice.id}`}>
                      <Td py={2} px={4}>
                        <HStack spacing={1.5}>
                          <Icon as={MdReceipt} color="teal.500" boxSize={3} />
                          <Text fontSize="sm" fontWeight="medium" color={textColor}>
                            {invoice.invoice_number}
                          </Text>
                        </HStack>
                      </Td>
                      <Td py={2} px={4}>
                        <Text fontSize="sm" color={textColor}>{formatDate(invoice.issued_at)}</Text>
                      </Td>
                      <Td py={2} px={4}>
                        <Badge colorScheme="teal" fontSize="xs" px={2} py={0.5}>
                          Invoice
                        </Badge>
                      </Td>
                      <Td py={2} px={4} isNumeric>
                        <Text fontSize="sm" color={textColor}>{formatCurrency(invoice.total_amount)}</Text>
                      </Td>
                      <Td py={2} px={4} isNumeric>
                        <Text fontSize="sm" color="green.500">{formatCurrency(invoice.paid_amount)}</Text>
                      </Td>
                      <Td py={2} px={4} isNumeric>
                        <Text fontSize="sm" color={invoice.due_amount > 0 ? "red.500" : "gray.400"}>
                          {formatCurrency(invoice.due_amount)}
                        </Text>
                      </Td>
                      <Td py={2} px={4}>
                        <Tooltip label="Download Invoice">
                          <IconButton
                            icon={<FaDownload />}
                            size="xs"
                            colorScheme="teal"
                            variant="ghost"
                            onClick={handleDownloadInvoice}
                          />
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                  
                  {(!purchases || purchases.length === 0) && (!invoices || invoices.length === 0) && (
                    <Tr>
                      <Td colSpan={7} py={3}>
                        <Text textAlign="center" fontSize="sm" color="gray.500">
                          No transaction history available
                        </Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}

      {/* New Purchase Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record New Purchase for {customer?.customer_name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Purchase Items */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  Purchase Items
                </Text>
                {purchaseItems.map((item, index) => {
                  const stock = stockItems.find(s => s.item_id === parseInt(item.stock_id));
                  return (
                    <VStack key={index} spacing={2} mb={2} align="stretch">
                      <HStack spacing={2} align="flex-end">
                        <FormControl flex={2}>
                          <FormLabel fontSize="xs">Item</FormLabel>
                          <Select
                            size="sm"
                            placeholder="Select item"
                            value={item.stock_id}
                            onChange={(e) => handleItemChange(index, 'stock_id', e.target.value)}
                          >
                            {stockItems.map((stock) => (
                              <option key={stock.item_id} value={stock.item_id}>
                                {stock.item_name} - Available: {stock.quantity_per_unit} {stock.unit?.unit_name}
                              </option>
                            ))}
                          </Select>
                          {stock && (
                            <Text fontSize="xs" color="gray.600" mt="4px">
                              {stock.allow_secondary_sales && stock.secondaryUnit 
                                ? `${stock.quantity_per_unit} ${stock.unit?.unit_name} / ${stock.available_secondary_quantity} ${stock.secondaryUnit?.unit_name}`
                                : `${stock.quantity_per_unit} ${stock.unit?.unit_name}`
                              }
                            </Text>
                          )}
                        </FormControl>
                        <FormControl flex={1}>
                          <FormLabel fontSize="xs">
                            Quantity {item.use_secondary_unit && stock?.secondaryUnit && (
                              <Badge ml="2px" colorScheme="orange" fontSize="xs">
                                {stock.secondaryUnit.unit_name}
                              </Badge>
                            )}
                          </FormLabel>
                          <NumberInput
                            size="sm"
                            min={0.01}
                            value={item.quantity}
                            onChange={(valueString) => handleItemChange(index, 'quantity', valueString)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl flex={1}>
                          <FormLabel fontSize="xs">Unit Price</FormLabel>
                          <NumberInput
                            size="sm"
                            min={0}
                            value={item.unit_price}
                            onChange={(valueString) => handleItemChange(index, 'unit_price', valueString)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <IconButton
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveItemRow(index)}
                          isDisabled={purchaseItems.length === 1}
                        />
                      </HStack>
                      {stock && stock.allow_secondary_sales && stock.secondaryUnit && (
                        <HStack spacing="12px">
                          <Text fontSize="xs" color="gray.600">
                            Selling in: {item.use_secondary_unit ? stock.secondaryUnit?.unit_name : stock.unit?.unit_name}
                          </Text>
                          <Checkbox
                            size="sm"
                            isChecked={item.use_secondary_unit || false}
                            onChange={(e) => handleItemChange(index, 'use_secondary_unit', e.target.checked)}
                          >
                            <Text fontSize="xs" color="gray.600">
                              Use {stock.secondaryUnit?.unit_name}
                            </Text>
                          </Checkbox>
                        </HStack>
                      )}
                    </VStack>
                  );
                })}
                <Button
                  leftIcon={<FaPlus />}
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={handleAddItemRow}
                  mt={2}
                >
                  Add Item
                </Button>
              </Box>

              {/* Payment Details */}
              <SimpleGrid columns={2} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Discount Amount</FormLabel>
                  <NumberInput
                    size="sm"
                    min={0}
                    value={discountAmount}
                    onChange={(valueString) => setDiscountAmount(valueString)}
                  >
                    <NumberInputField placeholder="0.00" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <Box />
                <FormControl>
                  <FormLabel fontSize="sm">Paid by Cash</FormLabel>
                  <NumberInput
                    size="sm"
                    min={0}
                    value={paidCash}
                    onChange={(valueString) => setPaidCash(valueString)}
                  >
                    <NumberInputField placeholder="0.00" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Paid Online/Card</FormLabel>
                  <NumberInput
                    size="sm"
                    min={0}
                    value={paidOnline}
                    onChange={(valueString) => setPaidOnline(valueString)}
                  >
                    <NumberInputField placeholder="0.00" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              {/* Total Calculation */}
              <Box p={3} bg={bgStats} borderRadius="md">
                <Text fontSize="sm" fontWeight="bold">
                  Total: PKR{' '}
                  {purchaseItems
                    .reduce((sum, item) => {
                      const price = parseFloat(item.unit_price) || 0;
                      const qty = parseFloat(item.quantity) || 0;
                      return sum + price * qty;
                    }, 0)
                    .toFixed(2)}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  After Discount: PKR{' '}
                  {(
                    purchaseItems.reduce((sum, item) => {
                      const price = parseFloat(item.unit_price) || 0;
                      const qty = parseFloat(item.quantity) || 0;
                      return sum + price * qty;
                    }, 0) - (parseFloat(discountAmount) || 0)
                  ).toFixed(2)}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Total Paid: PKR{' '}
                  {((parseFloat(paidCash) || 0) + (parseFloat(paidOnline) || 0)).toFixed(2)}
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { handleResetForm(); onClose(); }} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAddPurchase}
              isLoading={isSubmitting}
              isDisabled={!purchaseItems.some(item => item.stock_id)}
            >
              Record Purchase
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rate Customer Modal */}
      <Modal isOpen={isRatingOpen} onClose={onRatingClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rate Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Customer Name Display */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" color={textColor}>
                  {customer?.customer_name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {customer?.customer_code}
                </Text>
              </Box>

              <Divider />

              {/* Star Rating Selector */}
              <FormControl>
                <FormLabel fontSize="sm">Select Rating (0-5 stars)</FormLabel>
                <HStack spacing={2} justify="center" py={2}>
                  {[0, 1, 2, 3, 4, 5].map((star) => (
                    <Tooltip 
                      key={star} 
                      label={star === 0 ? 'No Rating' : `${star} Star${star > 1 ? 's' : ''}`}
                      placement="top"
                    >
                      <Box
                        as="button"
                        onClick={() => setRating(star)}
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.2)' }}
                      >
                        <Icon
                          as={FaStar}
                          boxSize={8}
                          color={star <= rating && star > 0 ? "yellow.400" : "gray.300"}
                          cursor="pointer"
                        />
                      </Box>
                    </Tooltip>
                  ))}
                </HStack>
                <Text fontSize="sm" textAlign="center" color={textColor} fontWeight="bold" mt={2}>
                  {rating === 0 ? 'No Rating' : `${rating} Star${rating > 1 ? 's' : ''}`}
                </Text>
              </FormControl>

              {/* Rating Notes */}
              <FormControl>
                <FormLabel fontSize="sm">Rating Notes (Optional)</FormLabel>
                <Textarea
                  value={ratingNotes}
                  onChange={(e) => setRatingNotes(e.target.value)}
                  placeholder="Add notes about this customer's rating..."
                  size="sm"
                  rows={4}
                  maxLength={1000}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {ratingNotes.length}/1000 characters
                </Text>
              </FormControl>

              {/* Rating Guidelines */}
              <Box bg={bgStats} p={3} borderRadius="md">
                <Text fontSize="xs" fontWeight="semibold" mb={2} color={textColor}>
                  Rating Guidelines:
                </Text>
                <VStack align="stretch" spacing={1} fontSize="xs" color="gray.600">
                  <Text>⭐⭐⭐⭐⭐ Excellent - Always pays on time</Text>
                  <Text>⭐⭐⭐⭐ Good - Reliable customer</Text>
                  <Text>⭐⭐⭐ Average - Standard behavior</Text>
                  <Text>⭐⭐ Poor - Often late payments</Text>
                  <Text>⭐ Very Poor - Problematic customer</Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRatingClose} isDisabled={isRatingSubmitting}>
              Cancel
            </Button>
            <Button
              colorScheme="yellow"
              bg="yellow.400"
              color="white"
              _hover={{ bg: "yellow.500" }}
              onClick={handleSubmitRating}
              isLoading={isRatingSubmitting}
              leftIcon={<FaStar />}
            >
              Save Rating
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default CustomerProfile;

