// Chakra imports
import {
  Box,
  Flex,
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
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import React, { useMemo, useState } from "react";
import { FaPlus, FaList } from "react-icons/fa";
import logo from "assets/img/avatars/placeholder.png";

// Supplier Table Row Component
const SupplierTableRow = ({ supplier, onViewTransactions }) => {
  const textColor = useColorModeValue("gray.700", "white");

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "On Hold":
        return "orange";
      default:
        return "gray";
    }
  };

  return (
    <Tr>
      <Td minWidth={{ sm: "250px" }} pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={supplier.avatar} w="30px" h="30px" me="18px" objectFit="cover" />
          <Flex direction="column">
            <Text fontSize="md" color={textColor} fontWeight="bold" minWidth="100%">
              {supplier.name}
            </Text>
            <Text fontSize="sm" color="gray.400" fontWeight="medium">
              {supplier.email}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {supplier.phone}
        </Text>
      </Td>

      <Td>
        <Badge colorScheme={getStatusColor(supplier.status)} fontSize="14px" p="3px 10px" borderRadius="20px">
          {supplier.status}
        </Badge>
      </Td>

      <Td>
        <Button size="sm" leftIcon={<FaList />} onClick={() => onViewTransactions(supplier)}>
          View Transactions
        </Button>
      </Td>
    </Tr>
  );
};

function SupplierManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isTxnOpen, onOpen: onTxnOpen, onClose: onTxnClose } = useDisclosure();

  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "Alpha Traders",
      email: "alpha@suppliers.com",
      phone: "+92 300 1111111",
      status: "Active",
      avatar: logo,
    },
    {
      id: 2,
      name: "Beta Raw Materials",
      email: "beta@suppliers.com",
      phone: "+92 300 2222222",
      status: "Active",
      avatar: logo,
    },
    {
      id: 3,
      name: "Gamma Industries",
      email: "gamma@suppliers.com",
      phone: "+92 300 3333333",
      status: "On Hold",
      avatar: logo,
    },
  ]);

  // Demo transactions keyed by supplier id
  const supplierIdToTransactions = useMemo(
    () => ({
      1: [
        { id: "t-1", date: "2025-08-05", type: "Purchase", amount: "PKR 120,000", status: "Paid" },
        { id: "t-2", date: "2025-08-18", type: "Purchase", amount: "PKR 80,000", status: "Pending" },
      ],
      2: [
        { id: "t-3", date: "2025-08-11", type: "Refund", amount: "-PKR 10,000", status: "Settled" },
        { id: "t-4", date: "2025-08-22", type: "Purchase", amount: "PKR 45,000", status: "Paid" },
      ],
      3: [
        { id: "t-5", date: "2025-07-29", type: "Purchase", amount: "PKR 200,000", status: "On Hold" },
      ],
    }),
    []
  );

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
  });

  const handleViewTransactions = (supplier) => {
    setSelectedSupplier(supplier);
    onTxnOpen();
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.email || !newSupplier.phone) return;
    const created = {
      id: suppliers.length + 1,
      ...newSupplier,
      avatar: logo,
    };
    setSuppliers((prev) => [...prev, created]);
    setNewSupplier({ name: "", email: "", phone: "", status: "Active" });
    onAddClose();
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Box mb='24px'>
        <Flex direction='column' w='100%'>
          <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='8px'>
            Supplier Management
          </Text>

          <Flex
            direction={{ sm: "column", lg: "row" }}
            justify='space-between'
            align={{ sm: "start", lg: "center" }}
            w='100%'
            gap='16px'>
            <Button
              leftIcon={<FaPlus />}
              colorScheme='teal'
              bg='#FF8D28'
              color='white'
              _hover={{ bg: '#E67E22' }}
              onClick={onAddOpen}
              size='md'>
              Add New Supplier
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Card bg={cardBg} boxShadow={cardShadow}>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Suppliers</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>PHONE</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>STATUS</Th>
                <Th color='gray.400' fontSize='sm' fontWeight='semibold'>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {suppliers.map((supplier) => (
                <SupplierTableRow key={supplier.id} supplier={supplier} onViewTransactions={handleViewTransactions} />
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Add Supplier Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Add New Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="16px" align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">Supplier Name</FormLabel>
                <Input
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter supplier name"
                  size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">Email</FormLabel>
                <Input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">Phone</FormLabel>
                <Input
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  size="md"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onAddClose}>Cancel</Button>
              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: "#E67E22" }}
                onClick={handleAddSupplier}
                isDisabled={!newSupplier.name || !newSupplier.email || !newSupplier.phone}
              >
                Add Supplier
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Transactions Modal */}
      <Modal isOpen={isTxnOpen} onClose={onTxnClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>
            {selectedSupplier ? `${selectedSupplier.name} - Transactions` : "Transactions"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSupplier && (
              <Table variant='simple' size='md'>
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Amount</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(supplierIdToTransactions[selectedSupplier.id] || []).map((t) => (
                    <Tr key={t.id}>
                      <Td>{t.date}</Td>
                      <Td>{t.type}</Td>
                      <Td isNumeric>{t.amount}</Td>
                      <Td>
                        <Badge>{t.status}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onTxnClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default SupplierManagement;


