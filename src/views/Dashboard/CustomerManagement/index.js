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
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState } from "react";
import { FaPlus, FaFileCsv, FaDownload } from "react-icons/fa";
import logo from "assets/img/avatars/placeholder.png";

// Customer Table Row Component
const CustomerTableRow = ({ customer, onEdit }) => {
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
        <VStack align="start" spacing="4px">
          <Text fontSize="md" color={textColor} fontWeight="bold">
            {customer.totalDue}
          </Text>
          <Text
            fontSize="sm"
            color="gray.400"
            fontWeight="medium"
            cursor="pointer"
            _hover={{ color: "brand.500" }}
          >
            Download Invoice
          </Text>
        </VStack>
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
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {customer.amountPending}
        </Text>
      </Td>

      <Td>
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
  
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "Esthera Jackson",
      email: "esthera@simmmple.com",
      avatar: logo,
      totalDue: "PKR.30,000",
      status: "Pending",
      amountPending: "PKR.15,000"
    },
    {
      id: 2,
      name: "Alexa Liras",
      email: "alexa@simmmple.com",
      avatar: logo,
      totalDue: "PKR.30,000",
      status: "Paid",
      amountPending: "None"
    },
    {
      id: 3,
      name: "Laurent Michael",
      email: "laurent@simmmple.com",
      avatar: logo,
      totalDue: "PKR.30,000",
      status: "Paid",
      amountPending: "None"
    },
    {
      id: 4,
      name: "Freduardo Hill",
      email: "freduardo@simmmple.com",
      avatar: logo,
      totalDue: "PKR.30,000",
      status: "Paid",
      amountPending: "None"
    },
    {
      id: 5,
      name: "Daniel Thomas",
      email: "daniel@simmmple.com",
      avatar: logo,
      totalDue: "PKR.30,000",
      status: "Paid",
      amountPending: "None"
    },
    {
      id: 6,
      name: "Mark Wilson",
      email: "mark@simmmple.com",
      avatar: logo,
      totalDue: "PKR.30,000",
      status: "Pending",
      amountPending: "PKR.15,000"
    }
  ]);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    totalDue: "",
    status: "Pending",
    amountPending: ""
  });

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
      onEditClose();
      setEditingCustomer(null);
    }
  };

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.totalDue) {
      const customer = {
        id: customers.length + 1,
        ...newCustomer,
        avatar: logo,
        amountPending: newCustomer.status === "Paid" ? "None" : newCustomer.amountPending
      };
      setCustomers(prev => [...prev, customer]);
      setNewCustomer({
        name: "",
        email: "",
        totalDue: "",
        status: "Pending",
        amountPending: ""
      });
      onAddClose();
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
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Customers</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>TOTAL DUE AMOUNT</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>STATUS</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>AMOUNT PENDING</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Edit</Th>
              </Tr>
            </Thead>
            <Tbody>
              {customers.map((customer) => (
                <CustomerTableRow 
                  key={customer.id} 
                  customer={customer} 
                  onEdit={handleEditCustomer}
                />
              ))}
            </Tbody>
          </Table>
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
                  onChange={(e) => setNewCustomer(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Enter customer name"
                  size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  placeholder="Enter email address"
                  size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">
                  Total Due Amount
                </FormLabel>
                <Input
                  value={newCustomer.totalDue}
                  onChange={(e) => setNewCustomer(prev => ({
                    ...prev,
                    totalDue: e.target.value
                  }))}
                  placeholder="Enter total due amount"
                  size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">
                  Status
                </FormLabel>
                <Select
                  value={newCustomer.status}
                  onChange={(e) => setNewCustomer(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  size="md"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </Select>
              </FormControl>
              {newCustomer.status === "Pending" && (
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">
                    Amount Pending
                  </FormLabel>
                  <Input
                    value={newCustomer.amountPending}
                    onChange={(e) => setNewCustomer(prev => ({
                      ...prev,
                      amountPending: e.target.value
                    }))}
                    placeholder="Enter pending amount"
                    size="md"
                  />
                </FormControl>
              )}
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
                isDisabled={!newCustomer.name || !newCustomer.email || !newCustomer.totalDue}
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
                  <FormLabel fontSize="sm" color="gray.500">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    size="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">
                    Total Due Amount
                  </FormLabel>
                  <Input
                    value={editingCustomer.totalDue}
                    onChange={(e) => setEditingCustomer(prev => ({
                      ...prev,
                      totalDue: e.target.value
                    }))}
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
                      onChange={(e) => setEditingCustomer(prev => ({
                        ...prev,
                        amountPending: e.target.value
                      }))}
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
    </Flex>
  );
}

export default CustomerManagement;
