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
  Spinner,
  useToast,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaList } from "react-icons/fa";
import logo from "assets/img/avatars/placeholder.png";

// Supplier Table Row Component
const SupplierTableRow = ({ supplier, onViewTransactions }) => {
  const textColor = useColorModeValue("gray.700", "white");

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "Active":
        return "green";
      case "on_hold":
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
          {typeof supplier.status === "string" ? supplier.status.replace(/_/g, " ") : supplier.status}
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

  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [isTxnLoading, setIsTxnLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://server.mughalsupplier.com/api/core/suppliers", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || "Failed to load suppliers");
        const mapped = (json.data || []).map((s) => ({
          id: s.id,
          name: s.supplier_name,
          email: s.email,
          phone: s.phone,
          status: s.status || "active",
          avatar: logo,
        }));
        setSuppliers(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
  });

  const handleViewTransactions = async (supplier) => {
    setSelectedSupplier(supplier);
    setIsTxnLoading(true);
    setTransactions([]);
    onTxnOpen();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://server.mughalsupplier.com/api/core/suppliers/${supplier.id}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Failed to fetch transactions");
      const list = json.data?.transactions || json.data || [];
      setTransactions(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTxnLoading(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.email || !newSupplier.phone) return;
    try {
      const token = localStorage.getItem("token");
      const payload = {
        supplier_name: newSupplier.name,
        email: newSupplier.email,
        phone: newSupplier.phone,
        status: (newSupplier.status || "Active").toString().toLowerCase().replace(/\s+/g, "_"),
      };
      const res = await fetch("https://server.mughalsupplier.com/api/core/suppliers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Failed to add supplier");
      const s = json.data;
      const created = {
        id: s.id,
        name: s.supplier_name,
        email: s.email,
        phone: s.phone,
        status: s.status || payload.status,
        avatar: logo,
      };
      setSuppliers((prev) => [created, ...prev]);
      setNewSupplier({ name: "", email: "", phone: "", status: "Active" });
      onAddClose();
    } catch (e) {
      console.error(e);
    }
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
          {isLoading ? (
            <Flex 
              justify="center" 
              align="center" 
              h="400px" 
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
          ) : suppliers.length === 0 ? (
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
                  No Suppliers Added
                </Text>
                <Text color="gray.500" fontSize="md" lineHeight="1.6">
                  Start by adding your first supplier to manage your vendors and purchases.
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
                  ADD FIRST SUPPLIER
                </Button>
              </VStack>
            </Flex>
          ) : (
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
          )}
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
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewSupplier((prev) => ({ ...prev, name: v }));
                  }}
                  placeholder="Enter supplier name"
                  size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">Email</FormLabel>
                <Input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewSupplier((prev) => ({ ...prev, email: v }));
                  }}
                  placeholder="Enter email address"
                  size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">Phone</FormLabel>
                <Input
                  value={newSupplier.phone}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewSupplier((prev) => ({ ...prev, phone: v }));
                  }}
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
                  {isTxnLoading ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Flex align='center' justify='center' py='40px'>
                          <Spinner />
                        </Flex>
                      </Td>
                    </Tr>
                  ) : transactions.length === 0 ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Text color='gray.400' textAlign='center' py='24px'>No transactions found</Text>
                      </Td>
                    </Tr>
                  ) : (
                  transactions.map((t) => (
                    <Tr key={t.id}>
                      <Td>{t.date || t.created_at || "-"}</Td>
                      <Td>{t.type || t.transaction_type || "-"}</Td>
                      <Td isNumeric>{t.amount || t.total_amount || "-"}</Td>
                      <Td>
                        <Badge>{t.status || "-"}</Badge>
                      </Td>
                    </Tr>
                  ))
                  )}
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


