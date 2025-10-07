import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Spinner,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaPlus, FaFileInvoice, FaMoneyBillWave } from 'react-icons/fa';
import BillingRow from 'components/Tables/BillingRow';
import payablesService from 'services/payablesService';

const BillsAndRentsCard = () => {
  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('#F8F9FA', 'gray.800');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const [payables, setPayables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPayable, setEditingPayable] = useState(null);
  const [newPayable, setNewPayable] = useState({
    type: 'bill',
    name: '',
    description: '',
    amount: '',
    due_date: '',
  });

  // Load payables on component mount
  useEffect(() => {
    fetchPayables();
  }, []);

  const fetchPayables = async () => {
    setIsLoading(true);
    try {
      const result = await payablesService.getAllPayables();
      if (result.success) {
        setPayables(result.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch bills and rents',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching payables:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bills and rents',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayable = async () => {
    if (!newPayable.name || !newPayable.amount) {
      toast({
        title: 'Validation Error',
        description: 'Name and amount are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const payableData = {
        ...newPayable,
        amount: parseFloat(newPayable.amount),
        due_date: newPayable.due_date || null,
      };

      const result = await payablesService.addPayable(payableData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `${newPayable.type === 'bill' ? 'Bill' : 'Rent'} added successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setNewPayable({
          type: 'bill',
          name: '',
          description: '',
          amount: '',
          due_date: '',
        });
        onClose();
        fetchPayables();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add payable',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error adding payable:', error);
      toast({
        title: 'Error',
        description: 'Failed to add payable',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditPayable = (payable) => {
    setEditingPayable(payable);
    onEditOpen();
  };

  const handleUpdatePayable = async () => {
    if (!editingPayable.name || !editingPayable.amount) {
      toast({
        title: 'Validation Error',
        description: 'Name and amount are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const updateData = {
        ...editingPayable,
        amount: parseFloat(editingPayable.amount),
        due_date: editingPayable.due_date || null,
      };

      const result = await payablesService.updatePayable(editingPayable.id, updateData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Payable updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setEditingPayable(null);
        onEditClose();
        fetchPayables();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update payable',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating payable:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payable',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMarkAsPaid = async (payable) => {
    try {
      const result = await payablesService.markAsPaid(payable.id);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `${payable.type === 'bill' ? 'Bill' : 'Rent'} marked as paid`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchPayables();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to mark as paid',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark as paid',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeletePayable = async (payable) => {
    if (!window.confirm(`Are you sure you want to delete "${payable.name}"?`)) {
      return;
    }

    try {
      const result = await payablesService.deletePayable(payable.id);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `${payable.type === 'bill' ? 'Bill' : 'Rent'} deleted successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchPayables();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete payable',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting payable:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payable',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculate statistics
  const totalAmount = payablesService.getTotalAmount(payables);
  const pendingAmount = payablesService.getTotalPendingAmount(payables);
  const overduePayables = payablesService.getOverduePayables(payables);
  const pendingCount = payablesService.getPendingPayables(payables).length;
  const paidCount = payablesService.getPaidPayables(payables).length;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <VStack spacing="16px">
          <Spinner size="xl" color="#FF8D28" />
          <Text color={textColor}>Loading bills and rents...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box>
      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing="20px" mb="24px">
        <Box bg={bgColor} p="20px" borderRadius="12px">
          <Stat>
            <StatLabel color={textColor}>Total Bills & Rents</StatLabel>
            <StatNumber color={textColor}>{payables.length}</StatNumber>
            <StatHelpText color="gray.500">
              {pendingCount} pending, {paidCount} paid
            </StatHelpText>
          </Stat>
        </Box>
        
        <Box bg={bgColor} p="20px" borderRadius="12px">
          <Stat>
            <StatLabel color={textColor}>Total Amount</StatLabel>
            <StatNumber color={textColor}>PKR.{totalAmount.toLocaleString()}</StatNumber>
            <StatHelpText color="gray.500">All bills and rents</StatHelpText>
          </Stat>
        </Box>
        
        <Box bg={bgColor} p="20px" borderRadius="12px">
          <Stat>
            <StatLabel color={textColor}>Pending Amount</StatLabel>
            <StatNumber color={textColor}>PKR.{pendingAmount.toLocaleString()}</StatNumber>
            <StatHelpText color="gray.500">Unpaid bills and rents</StatHelpText>
          </Stat>
        </Box>
        
        <Box bg={bgColor} p="20px" borderRadius="12px">
          <Stat>
            <StatLabel color={textColor}>Overdue</StatLabel>
            <StatNumber color="red.500">{overduePayables.length}</StatNumber>
            <StatHelpText color="gray.500">Past due date</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Header */}
      <Flex justify="space-between" align="center" mb="24px">
        <Text fontSize="xl" color={textColor} fontWeight="bold">
          Bills & Rents Management
        </Text>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="teal"
          bg="#FF8D28"
          color="white"
          _hover={{ bg: '#E67E22' }}
          onClick={onOpen}
        >
          Add Bill/Rent
        </Button>
      </Flex>

      {/* Payables List */}
      {payables.length === 0 ? (
        <Box
          bg={bgColor}
          p="40px"
          borderRadius="12px"
          textAlign="center"
        >
          <VStack spacing="16px">
            <FaFileInvoice size="48px" color="#FF8D28" />
            <Text fontSize="lg" color={textColor} fontWeight="bold">
              No Bills or Rents
            </Text>
            <Text color="gray.500">
              Start by adding your first bill or rent to track your payables.
            </Text>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="teal"
              bg="#FF8D28"
              color="white"
              _hover={{ bg: '#E67E22' }}
              onClick={onOpen}
            >
              ADD FIRST BILL/RENT
            </Button>
          </VStack>
        </Box>
      ) : (
        <VStack spacing="16px">
          {payables.map((payable) => (
            <BillingRow
              key={payable.id}
              id={payable.id}
              type={payable.type}
              name={payable.name}
              description={payable.description}
              amount={payable.amount}
              status={payable.status}
              due_date={payable.due_date}
              created_at={payable.created_at}
              paid_at={payable.paid_at}
              onEdit={() => handleEditPayable(payable)}
              onDelete={() => handleDeletePayable(payable)}
              onMarkPaid={() => handleMarkAsPaid(payable)}
            />
          ))}
        </VStack>
      )}

      {/* Add New Payable Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Add New Bill/Rent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="24px">
            <VStack spacing="16px">
              <FormControl isRequired>
                <FormLabel color={textColor}>Type</FormLabel>
                <Select
                  value={newPayable.type}
                  onChange={(e) => setNewPayable({...newPayable, type: e.target.value})}
                >
                  <option value="bill">Bill</option>
                  <option value="rent">Rent</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Name</FormLabel>
                <Input
                  placeholder={`Enter ${newPayable.type} name`}
                  value={newPayable.name}
                  onChange={(e) => setNewPayable({...newPayable, name: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Description</FormLabel>
                <Input
                  placeholder="Enter description (optional)"
                  value={newPayable.description}
                  onChange={(e) => setNewPayable({...newPayable, description: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Amount (PKR)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={newPayable.amount}
                  onChange={(e) => setNewPayable({...newPayable, amount: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Due Date</FormLabel>
                <Input
                  type="date"
                  value={newPayable.due_date}
                  onChange={(e) => setNewPayable({...newPayable, due_date: e.target.value})}
                />
              </FormControl>

              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: '#E67E22' }}
                w="100%"
                onClick={handleAddPayable}
              >
                ADD {newPayable.type.toUpperCase()}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Payable Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Edit {editingPayable?.type}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="24px">
            {editingPayable && (
              <VStack spacing="16px">
                <FormControl>
                  <FormLabel color={textColor}>Type</FormLabel>
                  <Select
                    value={editingPayable.type}
                    onChange={(e) => setEditingPayable({...editingPayable, type: e.target.value})}
                  >
                    <option value="bill">Bill</option>
                    <option value="rent">Rent</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Name</FormLabel>
                  <Input
                    placeholder={`Enter ${editingPayable.type} name`}
                    value={editingPayable.name}
                    onChange={(e) => setEditingPayable({...editingPayable, name: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Description</FormLabel>
                  <Input
                    placeholder="Enter description (optional)"
                    value={editingPayable.description || ''}
                    onChange={(e) => setEditingPayable({...editingPayable, description: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Amount (PKR)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={editingPayable.amount}
                    onChange={(e) => setEditingPayable({...editingPayable, amount: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Status</FormLabel>
                  <Select
                    value={editingPayable.status}
                    onChange={(e) => setEditingPayable({...editingPayable, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Due Date</FormLabel>
                  <Input
                    type="date"
                    value={editingPayable.due_date || ''}
                    onChange={(e) => setEditingPayable({...editingPayable, due_date: e.target.value})}
                  />
                </FormControl>

                <Button
                  colorScheme="teal"
                  bg="#FF8D28"
                  color="white"
                  _hover={{ bg: '#E67E22' }}
                  w="100%"
                  onClick={handleUpdatePayable}
                >
                  UPDATE {editingPayable.type.toUpperCase()}
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BillsAndRentsCard;
