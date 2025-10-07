// Chakra imports
import {
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
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Grid,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import BillingRow from "components/Tables/BillingRow";
import React from "react";
import { FiSearch } from "react-icons/fi";
import payablesService from "services/payablesService";
import { useToast } from "@chakra-ui/react";

const BillingInformation = ({ title, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [query, setQuery] = React.useState("");
  const [payables, setPayables] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newBill, setNewBill] = React.useState({
    type: "bill",
    name: "",
    description: "",
    amount: "",
    due_date: "",
  });
  const [editingPayable, setEditingPayable] = React.useState({
    id: null,
    type: "bill",
    name: "",
    description: "",
    amount: "",
    due_date: "",
  });

  // Handler functions for BillingRow actions
  const handleMarkAsPaid = async (payable) => {
    console.log('🎯 Mark as paid clicked for:', payable);
    try {
      const result = await payablesService.markAsPaid(payable.id);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Bill marked as paid',
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
    console.log('🎯 Delete clicked for:', payable);
    if (!window.confirm(`Are you sure you want to delete "${payable.name}"?`)) {
      return;
    }
    
    try {
      const result = await payablesService.deletePayable(payable.id);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Bill deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchPayables();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete bill',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bill',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditPayable = (payable) => {
    console.log('🎯 Edit clicked for:', payable);
    setEditingPayable({
      id: payable.id,
      type: payable.type,
      name: payable.name,
      description: payable.description || '',
      amount: payable.amount.toString(),
      due_date: payable.due_date ? payable.due_date.split('T')[0] : '',
    });
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
      const payableData = {
        type: editingPayable.type,
        name: editingPayable.name,
        description: editingPayable.description,
        amount: parseFloat(editingPayable.amount),
        due_date: editingPayable.due_date || null,
      };

      const result = await payablesService.updatePayable(editingPayable.id, payableData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `${editingPayable.type === 'bill' ? 'Bill' : 'Rent'} updated successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setEditingPayable({
          id: null,
          type: 'bill',
          name: '',
          description: '',
          amount: '',
          due_date: '',
        });
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

  const navbarGlassBg = useColorModeValue(
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );
  const navbarGlassBorder = useColorModeValue(
    "1.5px solid #FFFFFF",
    "1.5px solid rgba(255, 255, 255, 0.31)"
  );

  // Load payables from API
  React.useEffect(() => {
    fetchPayables();
  }, []);

  const fetchPayables = async () => {
    setIsLoading(true);
    try {
      const result = await payablesService.getAllPayables();
      if (result.success) {
        setPayables(result.data);
      } else {
        console.error('Failed to fetch payables:', result.error);
        setPayables([]);
      }
    } catch (error) {
      console.error('Error fetching payables:', error);
      setPayables([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = React.useMemo(() => {
    const q = query.toLowerCase();
    return payables.filter(
      (row) =>
        row.name?.toLowerCase().includes(q) ||
        row.description?.toLowerCase().includes(q) ||
        row.type?.toLowerCase().includes(q) ||
        row.amount?.toString().includes(q)
    );
  }, [payables, query]);

  const handleAddBill = async () => {
    if (!newBill.name || !newBill.amount) {
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
        ...newBill,
        amount: parseFloat(newBill.amount),
        due_date: newBill.due_date || null,
      };

      const result = await payablesService.addPayable(payableData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `${newBill.type === 'bill' ? 'Bill' : 'Rent'} added successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setNewBill({
          type: 'bill',
          name: '',
          description: '',
          amount: '',
          due_date: '',
        });
        onAddClose();
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

  return (
    <Card my={{ lg: "24px" }} me={{ lg: "24px" }}>
      <Flex direction='column'>
        <CardHeader py='12px'>
          <Flex justify='space-between' align='center' w='100%'>
            <Text color={textColor} fontSize='lg' fontWeight='bold'>
              {title}
            </Text>
            <HStack spacing='12px'>
              <Button
                colorScheme='teal'
                borderColor='#FF8D28'
                color='#FF8D28'
                variant='outline'
                fontSize='xs'
                p='8px 24px'
                onClick={onAddOpen}>
                ADD NEW
              </Button>
              <Button
                colorScheme='teal'
                borderColor='#FF8D28'
                color='#FF8D28'
                variant='outline'
                fontSize='xs'
                p='8px 24px'
                onClick={onOpen}>
                VIEW MORE
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            {isLoading ? (
              <Text color={textColor} textAlign="center" py="20px">
                Loading bills and rents...
              </Text>
            ) : payables.length === 0 ? (
              <Flex direction="column" align="center" py="40px">
                <Text color={textColor} fontSize="lg" fontWeight="bold" mb="8px">
                  No Bills or Rents
                </Text>
                <Text color="gray.500" textAlign="center" mb="16px">
                  Start by adding your first bill or rent to track your payables.
                </Text>
                <Button
                  colorScheme='teal'
                  bg='#FF8D28'
                  color='white'
                  _hover={{ bg: '#E67E22' }}
                  size="sm"
                  onClick={onAddOpen}>
                  ADD FIRST BILL/RENT
                </Button>
              </Flex>
            ) : (
              payables.slice(0, 3).map((row, index) => {
                return (
                  <BillingRow
                    key={row.id || index}
                    id={row.id}
                    type={row.type}
                    name={row.name}
                    description={row.description}
                    amount={row.amount}
                    status={row.status}
                    due_date={row.due_date}
                    created_at={row.created_at}
                    paid_at={row.paid_at}
                    onEdit={() => handleEditPayable(row)}
                    onDelete={() => handleDeletePayable(row)}
                    onMarkPaid={() => handleMarkAsPaid(row)}
                  />
                );
              })
            )}
          </Flex>
        </CardBody>
      </Flex>

      {/* Glassy Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='4xl' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb='16px'>
              <InputLeftElement pointerEvents='none'>
                <FiSearch color={useColorModeValue("#718096", "#A0AEC0")} />
              </InputLeftElement>
              <Input
                placeholder='Search bills and rents by name, description, type or amount'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%'>
              {filteredData.length === 0 ? (
                <Text color={textColor} textAlign="center" py="20px">
                  No bills or rents found matching your search.
                </Text>
              ) : (
                filteredData.map((row, index) => (
                  <BillingRow
                    key={`${row.id}-${index}`}
                    id={row.id}
                    type={row.type}
                    name={row.name}
                    description={row.description}
                    amount={row.amount}
                    status={row.status}
                    due_date={row.due_date}
                    created_at={row.created_at}
                    paid_at={row.paid_at}
                    onEdit={() => handleEditPayable(row)}
                    onDelete={() => handleDeletePayable(row)}
                    onMarkPaid={() => handleMarkAsPaid(row)}
                  />
                ))
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add New Bill Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>Add New Bill/Rent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl isRequired>
                <FormLabel color={textColor}>Type</FormLabel>
                <Select
                  value={newBill.type}
                  onChange={(e) => setNewBill({...newBill, type: e.target.value})}
                  placeholder='Select type'>
                  <option value='bill'>Bill</option>
                  <option value='rent'>Rent</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Name</FormLabel>
                <Input
                  placeholder={`Enter ${newBill.type} name`}
                  value={newBill.name}
                  onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Description</FormLabel>
                <Input
                  placeholder='Enter description (optional)'
                  value={newBill.description}
                  onChange={(e) => setNewBill({...newBill, description: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Amount (PKR)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder='Enter amount'
                  value={newBill.amount}
                  onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Due Date</FormLabel>
                <Input
                  type="date"
                  value={newBill.due_date}
                  onChange={(e) => setNewBill({...newBill, due_date: e.target.value})}
                />
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddBill}>
                ADD BILL/RENT
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Payable Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>Edit Bill/Rent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl isRequired>
                <FormLabel color={textColor}>Type</FormLabel>
                <Select
                  value={editingPayable.type}
                  onChange={(e) => setEditingPayable({...editingPayable, type: e.target.value})}
                  placeholder='Select type'>
                  <option value='bill'>Bill</option>
                  <option value='rent'>Rent</option>
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
                  placeholder='Enter description (optional)'
                  value={editingPayable.description}
                  onChange={(e) => setEditingPayable({...editingPayable, description: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Amount (PKR)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder='Enter amount'
                  value={editingPayable.amount}
                  onChange={(e) => setEditingPayable({...editingPayable, amount: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Due Date</FormLabel>
                <Input
                  type="date"
                  value={editingPayable.due_date}
                  onChange={(e) => setEditingPayable({...editingPayable, due_date: e.target.value})}
                />
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleUpdatePayable}>
                UPDATE BILL/RENT
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default BillingInformation;
