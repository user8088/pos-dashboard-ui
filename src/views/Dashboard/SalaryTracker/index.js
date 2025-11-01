import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useToast,
  Spinner,
  Select,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { staffService } from '../../../services/staffService';

const SalaryTracker = () => {
  const [loading, setLoading] = useState(false);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substr(0, 7));
  const [stats, setStats] = useState({});
  
  // Modal states
  const { isOpen: isStructureOpen, onOpen: onStructureOpen, onClose: onStructureClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const { isOpen: isMarkPaidOpen, onOpen: onMarkPaidOpen, onClose: onMarkPaidClose } = useDisclosure();
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStructure, setEditingStructure] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [markPaidPayment, setMarkPaidPayment] = useState(null);
  const [markPaidDate, setMarkPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const { isOpen: isTxnOpen, onOpen: onTxnOpen, onClose: onTxnClose } = useDisclosure();
  const [txnPayment, setTxnPayment] = useState(null);
  const [txnForm, setTxnForm] = useState({ amount: '', paid_on: new Date().toISOString().split('T')[0], method: '', notes: '' });
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);
  const [transactionsByPayment, setTransactionsByPayment] = useState({});
  const [txnsLoadingId, setTxnsLoadingId] = useState(null);

  // Quick Pay (single-step UX)
  const { isOpen: isQuickPayOpen, onOpen: onQuickPayOpen, onClose: onQuickPayClose } = useDisclosure();
  const [quickPayForm, setQuickPayForm] = useState({
    user_id: '',
    month: new Date().toISOString().substr(0, 7),
    amount: '',
    paid_on: new Date().toISOString().split('T')[0],
    method: '',
    notes: '',
  });

  const toggleExcessView = async (payment) => {
    const id = payment.id;
    if (expandedPaymentId === id) {
      setExpandedPaymentId(null);
      return;
    }
    try {
      setTxnsLoadingId(id);
      // fetch if not loaded yet
      if (!transactionsByPayment[id]) {
        const resp = await staffService.listPaymentTransactions(id);
        if (resp && resp.success) {
          setTransactionsByPayment(prev => ({ ...prev, [id]: resp.data || resp.transactions || resp }));
        }
      }
      setExpandedPaymentId(id);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load transactions', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setTxnsLoadingId(null);
    }
  };

  const computeExcessItems = (payment, txns = []) => {
    let cumulative = 0;
    const items = [];
    for (const t of txns) {
      const amountNum = parseFloat(t.amount || 0);
      const over = Math.max(0, (cumulative + amountNum) - (payment.amount || 0));
      if (over > 0) {
        items.push({
          id: t.id,
          paid_on: t.paid_on,
          amount: amountNum,
          over_this_transaction: Math.min(over, amountNum),
          method: t.method,
          notes: t.notes,
        });
      }
      cumulative += amountNum;
    }
    return items;
  };
  
  // Form states
  const [structureForm, setStructureForm] = useState({
    user_id: '',
    type: 'fixed',
    base_salary: '',
    commission_rate: '',
    notes: '',
  });
  
  const [paymentForm, setPaymentForm] = useState({
    user_id: '',
    salary_structure_id: '',
    month: '',
    amount: '',
    status: 'pending',
    notes: '',
  });

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    await Promise.all([
      loadStaff(),
      loadSalaryStructures(),
      loadSalaryPayments(),
      loadStats(),
    ]);
  };

  const loadStaff = async () => {
    try {
      const response = await staffService.getStaff();
      if (response && response.success) {
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setStaff(list);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  };

  const loadSalaryStructures = async () => {
    try {
      const response = await staffService.getSalaryStructures();
      if (response && response.success) {
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setSalaryStructures(list);
      } else {
        setSalaryStructures([]);
      }
    } catch (error) {
      console.error('Failed to load salary structures:', error);
    }
  };

  const loadSalaryPayments = async () => {
    try {
      const response = await staffService.getSalaryPayments({
        month: `${selectedMonth}-01`,
      });
      if (response && response.success) {
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setSalaryPayments(list);
      } else {
        setSalaryPayments([]);
      }
    } catch (error) {
      console.error('Failed to load salary payments:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from current data
      const totalPayments = salaryPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
      const pendingPayments = salaryPayments.filter(payment => payment.status === 'pending').length;
      const paidPayments = salaryPayments.filter(payment => payment.status === 'paid').length;
      
      setStats({
        totalPayments,
        pendingPayments,
        paidPayments,
        totalStaff: staff.length,
      });
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    }
  };

  const handleCreateStructure = async () => {
    try {
      setLoading(true);
      const response = await staffService.createSalaryStructure(structureForm);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Salary structure created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadSalaryStructures();
        resetStructureForm();
        onStructureClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create salary structure',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      const resolvedStructureId = paymentForm.salary_structure_id ||
        salaryStructures.find(s => String(s.user_id) === String(paymentForm.user_id))?.id;

      if (!paymentForm.user_id) {
        toast({ title: 'Validation', description: 'Please select a staff member.', status: 'warning', duration: 3000, isClosable: true });
        return;
      }
      if (!resolvedStructureId) {
        toast({ title: 'Validation', description: 'No salary structure found for this staff member. Create a salary structure first.', status: 'warning', duration: 4000, isClosable: true });
        return;
      }

      // Always use the base salary from the selected staff member's salary structure
      const structureForUser = salaryStructures.find(s => String(s.user_id) === String(paymentForm.user_id));
      const baseSalaryAmount = structureForUser ? Number(structureForUser.base_salary || 0) : 0;
      if (!baseSalaryAmount || Number.isNaN(baseSalaryAmount)) {
        toast({ title: 'Validation', description: 'Invalid base salary for selected staff member.', status: 'warning', duration: 4000, isClosable: true });
        return;
      }

      const payload = {
        user_id: Number(paymentForm.user_id),
        salary_structure_id: resolvedStructureId,
        month: `${(paymentForm.month || selectedMonth)}-01`,
        amount: baseSalaryAmount,
        status: paymentForm.status,
        notes: paymentForm.notes || '',
      };

      const response = await staffService.createSalaryPayment(payload);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Salary payment created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadSalaryPayments();
        resetPaymentForm();
        onPaymentClose();
      }
    } catch (error) {
      const message = error?.message || 'Failed to create salary payment';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlyPayments = async () => {
    try {
      setLoading(true);
      const response = await staffService.generateMonthlyPayments({
        month: `${selectedMonth}-01`,
        notes: `${selectedMonth} salaries`,
      });
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Monthly payments generated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadSalaryPayments();
        loadStats();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate monthly payments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (paymentId) => {
    setMarkPaidPayment(paymentId);
    setMarkPaidDate(new Date().toISOString().split('T')[0]);
    onMarkPaidOpen();
  };

  const confirmMarkAsPaid = async () => {
    if (!markPaidPayment) return;
    try {
      const response = await staffService.markPaymentPaid(markPaidPayment, markPaidDate);
      if (response.success) {
        toast({ title: 'Success', description: 'Payment marked as paid', status: 'success', duration: 3000, isClosable: true });
        onMarkPaidClose();
        setMarkPaidPayment(null);
        loadSalaryPayments();
        loadStats();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark payment as paid', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const resetStructureForm = () => {
    setStructureForm({
      user_id: '',
      type: 'fixed',
      base_salary: '',
      commission_rate: '',
      notes: '',
    });
    setEditingStructure(null);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      user_id: '',
      salary_structure_id: '',
      month: selectedMonth, // YYYY-MM
      amount: '',
      status: 'pending',
      notes: '',
    });
    setEditingPayment(null);
  };

  const getStaffName = (userId) => {
    const member = staff.find(s => s.id === userId);
    return member ? member.name : `User ${userId}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'fixed': return 'blue';
      case 'commission': return 'purple';
      default: return 'gray';
    }
  };

  // Always display currency in PKR across the app
  const formatPKR = (value) => {
    const amountNumber = Number(value || 0);
    try {
      return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 2,
      }).format(amountNumber);
    } catch {
      return `PKR ${amountNumber.toFixed(2)}`;
    }
  };

  // Human readable date like: 12 October 2025
  const formatHumanDate = (dateLike) => {
    if (!dateLike) return '-';
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return String(dateLike);
    try {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-GB', { month: 'long' });
      return `${day} ${month} ${d.getFullYear()}`;
    }
  };

  if (loading && salaryStructures.length === 0) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="brand.500">
          Salary Tracker
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Manage salary structures and track payments
        </Text>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>Total Staff</StatLabel>
              <StatNumber>{stats.totalStaff || 0}</StatNumber>
            </Stat>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
              <Stat>
                <StatLabel>Total Payments</StatLabel>
                <StatNumber color="green.500">{formatPKR(stats.totalPayments || 0)}</StatNumber>
              </Stat>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>Pending Payments</StatLabel>
              <StatNumber color="orange.500">{stats.pendingPayments || 0}</StatNumber>
            </Stat>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>Paid Payments</StatLabel>
              <StatNumber color="green.500">{stats.paidPayments || 0}</StatNumber>
            </Stat>
          </Box>
        </GridItem>
      </Grid>

      {/* Controls */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
        <Flex gap={4} align="center" wrap="wrap" justify="space-between">
          <HStack>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              maxW="200px"
            >
              <option value="2025-01">January 2025</option>
              <option value="2025-02">February 2025</option>
              <option value="2025-03">March 2025</option>
              <option value="2025-04">April 2025</option>
              <option value="2025-05">May 2025</option>
              <option value="2025-06">June 2025</option>
              <option value="2025-07">July 2025</option>
              <option value="2025-08">August 2025</option>
              <option value="2025-09">September 2025</option>
              <option value="2025-10">October 2025</option>
              <option value="2025-11">November 2025</option>
              <option value="2025-12">December 2025</option>
            </Select>
            <Button onClick={loadSalaryPayments} colorScheme="blue">
              Refresh
            </Button>
          </HStack>

          <HStack>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="green"
              onClick={() => {
                resetStructureForm();
                onStructureOpen();
              }}
            >
              Add Salary Structure
            </Button>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => {
              setQuickPayForm({
                user_id: '',
                month: selectedMonth,
                amount: '',
                paid_on: new Date().toISOString().split('T')[0],
                method: '',
                notes: '',
              });
              onQuickPayOpen();
            }}>Quick Pay</Button>
            <Button
              colorScheme="purple"
              onClick={handleGenerateMonthlyPayments}
              isLoading={loading}
            >
              Generate Monthly Payments
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Tabs */}
      <Tabs>
        <TabList>
          <Tab>Salary Structures</Tab>
          <Tab>Salary Payments</Tab>
        </TabList>

        <TabPanels>
          {/* Salary Structures Tab */}
          <TabPanel>
            <Box bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
              <Box p={4} borderBottom="1px" borderColor="gray.200">
                <Heading size="md">Salary Structures</Heading>
              </Box>
              <Box p={4}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Staff Member</Th>
                      <Th>Type</Th>
                      <Th>Base Salary</Th>
                      <Th>Commission Rate</Th>
                      <Th>Notes</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {salaryStructures.map((structure) => (
                      <Tr key={structure.id}>
                        <Td fontWeight="bold">{getStaffName(structure.user_id)}</Td>
                        <Td>
                          <Badge colorScheme={getTypeColor(structure.type)}>
                            {structure.type}
                          </Badge>
                        </Td>
                        <Td>{formatPKR(structure.base_salary)}</Td>
                        <Td>
                          {structure.commission_rate ? `${structure.commission_rate}%` : '-'}
                        </Td>
                        <Td maxW="200px" isTruncated>
                          {structure.notes || '-'}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<EditIcon />}
                              onClick={() => {
                                setEditingStructure(structure);
                                setStructureForm({
                                  user_id: structure.user_id,
                                  type: structure.type,
                                  base_salary: structure.base_salary,
                                  commission_rate: structure.commission_rate || '',
                                  notes: structure.notes || '',
                                });
                                onStructureOpen();
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              leftIcon={<DeleteIcon />}
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this salary structure?')) {
                                  try {
                                    await staffService.deleteSalaryStructure(structure.id);
                                    toast({
                                      title: 'Success',
                                      description: 'Salary structure deleted',
                                      status: 'success',
                                      duration: 3000,
                                      isClosable: true,
                                    });
                                    loadSalaryStructures();
                                  } catch (error) {
                                    toast({
                                      title: 'Error',
                                      description: 'Failed to delete salary structure',
                                      status: 'error',
                                      duration: 3000,
                                      isClosable: true,
                                    });
                                  }
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </TabPanel>

          {/* Salary Payments Tab */}
          <TabPanel>
            <Box bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
              <Box p={4} borderBottom="1px" borderColor="gray.200">
                <Heading size="md">Salary Payments - {selectedMonth}</Heading>
              </Box>
              <Box p={4}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Staff Member</Th>
                      <Th>Amount</Th>
                      <Th>Paid</Th>
                      <Th>Remaining</Th>
                      <Th>Status</Th>
                      <Th>Salary Month</Th>
                      <Th>Paid On</Th>
                      <Th>Excess</Th>
                      <Th>Notes</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {salaryPayments.map((payment) => (
                      <React.Fragment key={payment.id}>
                      <Tr>
                        <Td fontWeight="bold">{getStaffName(payment.user_id)}</Td>
                        {(() => {
                          const amountNum = Number(payment.amount || 0);
                          const paidNum = Number(payment.paid_amount || payment.paid || 0);
                          const remainingNum = Math.max(0, amountNum - paidNum);
                          const statusDerived = paidNum <= 0
                            ? 'pending'
                            : paidNum < amountNum
                            ? 'partial'
                            : 'paid';
                          const excessNum = Math.max(0, paidNum - amountNum);
                          return (
                            <>
                              <Td fontWeight="bold">{formatPKR(amountNum)}</Td>
                              <Td>{formatPKR(paidNum)}</Td>
                              <Td>{formatPKR(remainingNum)}</Td>
                              <Td>
                                <Badge colorScheme={getStatusColor(statusDerived)}>
                                  {statusDerived}
                                </Badge>
                              </Td>
                              {/* Replace following cells that reference payment.excess to prefer derived */}
                            </>
                          );
                        })()}
                        <Td>{formatHumanDate(payment.month)}</Td>
                        <Td>{payment.last_paid_on ? formatHumanDate(payment.last_paid_on) : (payment.payment_date ? formatHumanDate(payment.payment_date) : '-')}</Td>
                        <Td>{formatPKR(Math.max(0, (Number(payment.paid_amount || payment.paid || 0)) - Number(payment.amount || 0)))}</Td>
                        <Td maxW="200px" isTruncated>
                          {payment.notes || '-'}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              onClick={() => { setTxnPayment(payment); setTxnForm({ amount: '', paid_on: new Date().toISOString().split('T')[0], method: '', notes: '' }); onTxnOpen(); }}
                            >
                              Add Payment
                            </Button>
                            <Button size="sm" variant="outline" isLoading={txnsLoadingId===payment.id} onClick={() => toggleExcessView(payment)}>
                              {expandedPaymentId===payment.id ? 'Hide Excess' : 'View Excess'}
                            </Button>
                            <Button
                              size="sm"
                              leftIcon={<EditIcon />}
                              onClick={() => {
                                setEditingPayment(payment);
                                setPaymentForm({
                                  user_id: payment.user_id,
                                  salary_structure_id: payment.salary_structure_id,
                                  month: payment.month,
                                  amount: payment.amount,
                                  status: payment.status,
                                  notes: payment.notes || '',
                                });
                                onPaymentOpen();
                              }}
                            >
                              Edit
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                      {expandedPaymentId === payment.id && (
                        <Tr>
                          <Td colSpan={10}>
                            <Box p={3} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                              {(() => {
                                const txns = transactionsByPayment[payment.id] || [];
                                const excessItems = computeExcessItems(payment, txns);
                                if (excessItems.length === 0) {
                                  return <Text fontSize="sm" color="gray.600">No excess payments recorded for this month.</Text>;
                                }
                                return (
                                  <VStack align="stretch" spacing={2}>
                                    {excessItems.map(item => (
                                      <Flex key={item.id} justify="space-between" align="center" p={2} bg="white" borderRadius="md" border="1px" borderColor="gray.200">
                                        <Text fontWeight="semibold" color="red.500">Excess: {formatPKR(item.over_this_transaction)}</Text>
                                        <Text fontSize="sm">Paid On: {formatHumanDate(item.paid_on)}</Text>
                                        <Text fontSize="sm" color="gray.600">Method: {item.method || '-'}</Text>
                                        <Text fontSize="sm" color="gray.600">Notes: {item.notes || '-'}</Text>
                                      </Flex>
                                    ))}
                                  </VStack>
                                );
                              })()}
                            </Box>
                          </Td>
                        </Tr>
                      )}
                      </React.Fragment>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Salary Structure Modal */}
      <Modal isOpen={isStructureOpen} onClose={onStructureClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingStructure ? 'Edit Salary Structure' : 'Create Salary Structure'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Staff Member</FormLabel>
                <Select
                  value={structureForm.user_id}
                  onChange={(e) => setStructureForm({ ...structureForm, user_id: e.target.value })}
                >
                  <option value="">Select Staff Member</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Salary Type</FormLabel>
                <Select
                  value={structureForm.type}
                  onChange={(e) => setStructureForm({ ...structureForm, type: e.target.value })}
                >
                  <option value="fixed">Fixed Salary</option>
                  <option value="commission">Commission Based</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Base Salary</FormLabel>
                <NumberInput
                  value={structureForm.base_salary}
                  onChange={(value) => setStructureForm({ ...structureForm, base_salary: value })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              {structureForm.type === 'commission' && (
                <FormControl>
                  <FormLabel>Commission Rate (%)</FormLabel>
                  <NumberInput
                    value={structureForm.commission_rate}
                    onChange={(value) => setStructureForm({ ...structureForm, commission_rate: value })}
                    min={0}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  placeholder="Additional notes..."
                  value={structureForm.notes}
                  onChange={(e) => setStructureForm({ ...structureForm, notes: e.target.value })}
                />
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={handleCreateStructure}
                isLoading={loading}
                w="full"
              >
                {editingStructure ? 'Update Structure' : 'Create Structure'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Quick Pay Modal */}
      <Modal isOpen={isQuickPayOpen} onClose={onQuickPayClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Quick Pay</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Staff Member</FormLabel>
                <Select value={quickPayForm.user_id} onChange={(e) => setQuickPayForm({ ...quickPayForm, user_id: e.target.value })}>
                  <option value="">Select Staff Member</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Salary Month</FormLabel>
                <Input type="month" value={quickPayForm.month} onChange={(e) => setQuickPayForm({ ...quickPayForm, month: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Amount (to pay now)</FormLabel>
                <NumberInput value={quickPayForm.amount} onChange={(v) => setQuickPayForm({ ...quickPayForm, amount: v })} precision={2} min={0}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Paid On</FormLabel>
                <Input type="date" value={quickPayForm.paid_on} onChange={(e) => setQuickPayForm({ ...quickPayForm, paid_on: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Method</FormLabel>
                <Input value={quickPayForm.method} onChange={(e) => setQuickPayForm({ ...quickPayForm, method: e.target.value })} placeholder="cash/bank/etc" />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea value={quickPayForm.notes} onChange={(e) => setQuickPayForm({ ...quickPayForm, notes: e.target.value })} />
              </FormControl>
              <Button colorScheme="blue" w="full" onClick={async () => {
                try {
                  const userId = quickPayForm.user_id;
                  const amountNum = parseFloat(quickPayForm.amount || '0');
                  if (!userId) { toast({ title: 'Validation', description: 'Select a staff member.', status: 'warning', duration: 3000, isClosable: true }); return; }
                  if (!amountNum || isNaN(amountNum) || amountNum <= 0) { toast({ title: 'Validation', description: 'Enter a valid amount.', status: 'warning', duration: 3000, isClosable: true }); return; }
                  setLoading(true);
                  const structure = salaryStructures.find(s => String(s.user_id) === String(userId));
                  if (!structure) { toast({ title: 'Validation', description: 'No salary structure for this staff member.', status: 'warning', duration: 3000, isClosable: true }); setLoading(false); return; }
                  const monthDate = `${(quickPayForm.month || selectedMonth)}-01`;
                  // find existing payment for this user and month
                  let payment = salaryPayments.find(p => String(p.user_id) === String(userId));
                  if (!payment) {
                    const created = await staffService.createSalaryPayment({
                      user_id: Number(userId),
                      salary_structure_id: structure.id,
                      month: monthDate,
                      amount: Number(structure.base_salary || 0),
                      status: 'pending',
                      notes: quickPayForm.notes || '',
                    });
                    if (created && created.success) {
                      payment = created.data || created.payment || created;
                    }
                  }
                  if (!payment || !payment.id) {
                    toast({ title: 'Error', description: 'Failed to create salary payment.', status: 'error', duration: 3000, isClosable: true });
                    setLoading(false);
                    return;
                  }
                  await staffService.createPaymentTransaction(payment.id, {
                    amount: amountNum,
                    paid_on: quickPayForm.paid_on,
                    method: quickPayForm.method || '',
                    notes: quickPayForm.notes || '',
                  });
                  toast({ title: 'Success', description: 'Payment recorded.', status: 'success', duration: 3000, isClosable: true });
                  onQuickPayClose();
                  await loadSalaryPayments();
                  await loadStats();
                } catch (e) {
                  toast({ title: 'Error', description: e?.message || 'Quick pay failed.', status: 'error', duration: 3000, isClosable: true });
                } finally {
                  setLoading(false);
                }
              }}>Record Payment</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Salary Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingPayment ? 'Edit Salary Payment' : 'Create Salary Payment'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Salary Month</FormLabel>
                <Input
                  type="month"
                  value={(paymentForm.month || selectedMonth)}
                  onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Staff Member</FormLabel>
                <Select
                  value={paymentForm.user_id}
                  onChange={(e) => {
                    const userId = e.target.value;
                    const structure = salaryStructures.find(s => String(s.user_id) === String(userId));
                    const base = structure ? Number(structure.base_salary || 0) : '';
                    setPaymentForm({ ...paymentForm, user_id: userId, amount: base });
                  }}
                >
                  <option value="">Select Staff Member</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Amount (base salary)</FormLabel>
                <NumberInput value={paymentForm.amount} isReadOnly isDisabled precision={2} min={0}>
                  <NumberInputField />
                </NumberInput>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Amount comes from the staff member's salary structure. To pay 6,000 now, create the payment, then use "Record Payment".
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  value={paymentForm.status}
                  onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  placeholder="Payment notes..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={handleCreatePayment}
                isLoading={loading}
                w="full"
              >
                {editingPayment ? 'Update Payment' : 'Create Payment'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Removed Mark as Paid modal - using transactions instead */}

      {/* Payment Transactions Modal */}
      <Modal isOpen={isTxnOpen} onClose={onTxnClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment Transactions</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Amount (PKR)</FormLabel>
                <NumberInput value={txnForm.amount} onChange={(v) => setTxnForm({ ...txnForm, amount: v })} min={0} precision={2}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Paid On</FormLabel>
                <Input type="date" value={txnForm.paid_on} onChange={(e) => setTxnForm({ ...txnForm, paid_on: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Method</FormLabel>
                <Input value={txnForm.method} onChange={(e) => setTxnForm({ ...txnForm, method: e.target.value })} placeholder="cash/bank/etc" />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea value={txnForm.notes} onChange={(e) => setTxnForm({ ...txnForm, notes: e.target.value })} />
              </FormControl>
              <Button colorScheme="blue" onClick={async () => {
                if (!txnPayment) return;
                const amountNum = parseFloat(txnForm.amount || '0');
                if (isNaN(amountNum) || amountNum <= 0) {
                  toast({ title: 'Validation', description: 'Enter an amount greater than 0.', status: 'warning', duration: 3000, isClosable: true });
                  return;
                }
                try {
                  await staffService.createPaymentTransaction(txnPayment.id, {
                    amount: amountNum,
                    paid_on: txnForm.paid_on,
                    method: txnForm.method || '',
                    notes: txnForm.notes || '',
                  });
                  toast({ title: 'Success', description: 'Payment recorded.', status: 'success', duration: 3000, isClosable: true });
                  onTxnClose();
                  loadSalaryPayments();
                  loadStats();
                } catch (e) {
                  toast({ title: 'Error', description: e?.message || 'Failed to record payment.', status: 'error', duration: 3000, isClosable: true });
                }
              }}>
                Add Payment
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SalaryTracker;
