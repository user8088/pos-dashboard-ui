// Chakra imports
import {
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Button,
  Flex,
  useDisclosure,
  VStack,
  HStack,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Input,
  Box,
  Image,
  Badge,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { FaPlus, FaFileCsv, FaRuler, FaTags } from "react-icons/fa";
import RentalTableRow from "components/Tables/RentalTableRow";
import logo from "assets/img/avatars/placeholder.png";

function RentalManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isRentOpen, onOpen: onRentOpen, onClose: onRentClose } = useDisclosure();
  const { isOpen: isEndRentalOpen, onOpen: onEndRentalOpen, onClose: onEndRentalClose } = useDisclosure();

  const [rentalData, setRentalData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [customUnits, setCustomUnits] = React.useState([]);
  const [categories, setCategories] = React.useState([]);

  const [newItem, setNewItem] = React.useState({
    name: "",
    quantity: "",
    unit: "",
    customUnit: "",
    category: "",
    status: "available",
    stockValue: "",
  });

  const [editingItem, setEditingItem] = React.useState(null);
  const [rentingItem, setRentingItem] = React.useState(null);
  const [endingRentalItem, setEndingRentalItem] = React.useState(null);
  const [rentForm, setRentForm] = React.useState({ 
    quantity: "", 
    rentedOn: "", 
    rentedTill: "", 
    totalRentAmount: "" 
  });
  const [endRentalForm, setEndRentalForm] = React.useState({ quantity: "" });

  React.useEffect(() => {
    fetchUnits();
    fetchCategories();
    fetchRentalStock();
  }, []);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/unit`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const units = await response.json();
        setCustomUnits(units.map(u => ({ unitName: u.unit_name, unitMetric: u.metric, unitId: u.unit_id })));
      }
    } catch {}
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/category`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const cats = await response.json();
        setCategories(cats.map(c => ({ id: c.category_id, name: c.category_name })));
      }
    } catch {}
  };

  const fetchRentalStock = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/rental-stock/details`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const items = await response.json();
        const formatted = items.map(item => ({
          logo: logo,
          name: item.item_name,
          quantity: `${item.quantity_per_unit} ${item.unit?.unit_name || 'Units'}`,
          category: item.category?.category_name || 'Uncategorized',
          stockValue: item.stock_value || 0,
          totalRented: item.total_rented || 0,
          currentRent: item.total_rent_amount || 0,
          totalProfit: item.total_profit || 0,
          status: item.stock_status || 'available',
          rentedOn: item.rented_on,
          rentedTill: item.rented_till,
          rentalDurationDays: item.rental_duration_days,
          dailyRate: item.daily_rate,
          isOverdue: item.is_overdue,
          itemId: item.item_id,
          unitId: item.unit_id,
          categoryId: item.category_id,
          quantityPerUnit: item.quantity_per_unit,
          stockValueRaw: item.stock_value || 0,
        }));
        setRentalData(formatted);
      } else {
        setRentalData([]);
      }
    } catch (e) {
      setRentalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.unit) return;
    try {
      const token = localStorage.getItem('token');
      const selectedUnit = customUnits.find(u => u.unitName === newItem.unit);
      const unitId = selectedUnit ? selectedUnit.unitId : null;
      const selectedCategory = categories.find(c => c.name === newItem.category);
      const categoryId = selectedCategory ? selectedCategory.id : null;
      const payload = {
        item_name: newItem.name,
        unit_id: unitId,
        category_id: categoryId,
        quantity_per_unit: newItem.quantity ? parseFloat(newItem.quantity) : 0,
        stock_value: newItem.stockValue ? parseFloat(newItem.stockValue) : undefined,
        stock_status: newItem.status,
      };
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/rental-stock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Rental item added", description: data.message || 'Item created successfully', status: "success", duration: 3000, isClosable: true });
        setNewItem({ name: "", quantity: "", unit: "", customUnit: "", category: "", status: "available", stockValue: "" });
        fetchRentalStock();
        onClose();
      } else {
        toast({ title: "Failed to add rental item", description: data.message || 'Validation error', status: "error", duration: 5000, isClosable: true });
      }
    } catch (e) {
      toast({ title: "Network error", description: 'Unable to connect to server', status: "error", duration: 5000, isClosable: true });
    }
  };

  const openEdit = (row) => {
    setEditingItem({
      itemId: row.itemId,
      name: row.name,
      quantity: row.quantityPerUnit ? row.quantityPerUnit.toString() : "",
      unit: row.unitId,
      category: row.categoryId,
      status: row.status,
      stockValue: row.stockValueRaw ? row.stockValueRaw.toString() : "",
    });
    onEditOpen();
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/rental-stock/${editingItem.itemId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          item_name: editingItem.name,
          unit_id: editingItem.unit || undefined,
          category_id: editingItem.category || undefined,
          quantity_per_unit: editingItem.quantity ? parseFloat(editingItem.quantity) : undefined,
          stock_value: editingItem.stockValue !== "" ? parseFloat(editingItem.stockValue) : undefined,
          stock_status: editingItem.status,
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Rental item updated", description: data.message || 'Item updated successfully', status: "success", duration: 3000, isClosable: true });
        fetchRentalStock();
        setEditingItem(null);
        onEditClose();
      } else {
        toast({ title: "Failed to update item", description: data.message || 'Validation error', status: "error", duration: 5000, isClosable: true });
      }
    } catch (e) {
      toast({ title: "Network error", description: 'Unable to connect to server', status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete rental item "${row.name}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/rental-stock/${row.itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast({ title: "Rental item deleted", description: data.message || 'Deleted successfully', status: "success", duration: 3000, isClosable: true });
        fetchRentalStock();
      } else {
        toast({ title: "Delete failed", description: data.message || 'Could not delete item', status: "error", duration: 5000, isClosable: true });
      }
    } catch (e) {
      toast({ title: "Network error", description: 'Unable to delete item', status: "error", duration: 5000, isClosable: true });
    }
  };

  const openRent = (row) => {
    setRentingItem(row);
    setRentForm({ quantity: "", rentedOn: "", rentedTill: "", totalRentAmount: "" });
    onRentOpen();
  };

  const openEndRental = (row) => {
    setEndingRentalItem(row);
    setEndRentalForm({ quantity: "" });
    onEndRentalOpen();
  };

  const handleRecordRent = async () => {
    if (!rentingItem || !rentForm.quantity || !rentForm.rentedOn || !rentForm.rentedTill || !rentForm.totalRentAmount) return;
    try {
      const token = localStorage.getItem('token');
      const payload = {
        quantity: parseFloat(rentForm.quantity),
        rented_on: rentForm.rentedOn,
        rented_till: rentForm.rentedTill,
        total_rent_amount: parseFloat(rentForm.totalRentAmount),
      };
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/rental-stock/${rentingItem.itemId}/rent`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Rental recorded", description: data.message || 'Rental completed', status: "success", duration: 4000, isClosable: true });
        fetchRentalStock();
        onRentClose();
      } else {
        toast({ title: "Rental failed", description: data.message || 'Unable to record rental', status: "error", duration: 5000, isClosable: true });
      }
    } catch (e) {
      toast({ title: "Network error", description: 'Unable to record rental', status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleEndRental = async () => {
    if (!endingRentalItem || !endRentalForm.quantity) return;
    try {
      const token = localStorage.getItem('token');
      const payload = {
        quantity: parseFloat(endRentalForm.quantity),
      };
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/rental-stock/${endingRentalItem.itemId}/end-rental`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Rental ended", description: data.message || 'Rental ended successfully', status: "success", duration: 4000, isClosable: true });
        fetchRentalStock();
        onEndRentalClose();
      } else {
        toast({ title: "Failed to end rental", description: data.message || 'Unable to end rental', status: "error", duration: 5000, isClosable: true });
      }
    } catch (e) {
      toast({ title: "Network error", description: 'Unable to end rental', status: "error", duration: 5000, isClosable: true });
    }
  };

  const captions = [
    "Products",
    "QUANTITY",
    "RENTAL INFO",
    "CATEGORY",
    "STOCK VALUE",
    "TOTAL RENTED",
    "CURRENT RENT",
    "TOTAL PROFIT",
    "RENTAL PERIOD",
    "STATUS",
    "ACTIONS",
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
    <Card overflowX={{ sm: "scroll", xl: "hidden" }} maxW="100%">
      <CardHeader p='6px 0px 22px 0px'>
        <Flex justify='space-between' align='center' w='100%' direction={{ base: 'column', md: 'row' }} gap={{ base: '16px', md: '0' }}>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Rental Management
          </Text>
          <HStack spacing='8px' wrap='wrap' justify={{ base: 'center', md: 'flex-end' }}>
            <Button leftIcon={<FaFileCsv />} colorScheme='teal' borderColor='#FF8D28' color='#FF8D28' variant='outline' fontSize='xs' p='6px 16px' size='sm'>
              IMPORT CSV
            </Button>
            <Button leftIcon={<FaTags />} colorScheme='teal' borderColor='#FF8D28' color='#FF8D28' variant='outline' fontSize='xs' p='6px 16px' size='sm'>
              ADD CATEGORY
            </Button>
            <Button leftIcon={<FaRuler />} colorScheme='teal' borderColor='#FF8D28' color='#FF8D28' variant='outline' fontSize='xs' p='6px 16px' size='sm'>
              ADD UNIT
            </Button>
            <Button leftIcon={<FaPlus />} colorScheme='teal' borderColor='#FF8D28' color='#FF8D28' variant='outline' fontSize='xs' p='6px 16px' size='sm' onClick={onOpen}>
              ADD NEW RENTAL
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <Flex justify="center" align="center" h="400px" w="100%">
            <VStack spacing="16px" textAlign="center">
              <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#FF8D28" size="xl" />
            </VStack>
          </Flex>
        ) : rentalData.length === 0 ? (
          <Flex direction="column" justify="center" align="center" h="400px" p="40px" w="100%">
            <VStack spacing="24px" maxW="400px" textAlign="center">
              <Text fontSize="2xl" color={textColor} fontWeight="bold">No Rental Items Added</Text>
              <Button leftIcon={<FaPlus />} colorScheme='teal' bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} size="lg" px="32px" py="12px" onClick={onOpen}>
                ADD FIRST RENTAL ITEM
              </Button>
            </VStack>
          </Flex>
        ) : (
          <>
            {/* Desktop Table View */}
            <Box display={{ base: "none", lg: "block" }} overflowX="auto" maxW="100%">
              <Table variant='simple' color={textColor} minW="1350px">
                <Thead>
                  <Tr my='.8rem' pl='0px' color='gray.400'>
                    {captions.map((caption, idx) => (
                             <Th 
                               color='gray.400' 
                               key={idx} 
                               ps={idx === 0 ? "0px" : null}
                               minW={idx === 0 ? "200px" : idx === 1 ? "100px" : idx === 2 ? "150px" : idx === 3 ? "120px" : idx === 4 ? "120px" : idx === 5 ? "120px" : idx === 6 ? "120px" : idx === 7 ? "120px" : idx === 8 ? "180px" : idx === 9 ? "100px" : "120px"}
                               maxW={idx === 0 ? "250px" : idx === 1 ? "120px" : idx === 2 ? "180px" : idx === 3 ? "150px" : idx === 4 ? "150px" : idx === 5 ? "150px" : idx === 6 ? "150px" : idx === 7 ? "150px" : idx === 8 ? "220px" : idx === 9 ? "120px" : "150px"}
                             >
                        {caption}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {rentalData.map((row, index) => (
                        <RentalTableRow
                          key={`${row.name}-${index}`}
                          logo={logo}
                          name={row.name}
                          quantity={row.quantity}
                          category={row.category}
                          status={row.status}
                          stockValue={row.stockValue}
                          totalRented={row.totalRented}
                          currentRent={row.currentRent}
                          totalProfit={row.totalProfit}
                          rentedOn={row.rentedOn}
                          rentedTill={row.rentedTill}
                          rentalDurationDays={row.rentalDurationDays}
                          dailyRate={row.dailyRate}
                          isOverdue={row.isOverdue}
                          onEdit={() => openEdit(row)}
                          onDelete={() => handleDelete(row)}
                          onRent={() => openRent(row)}
                          onEndRental={() => openEndRental(row)}
                        />
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Mobile Card View */}
            <Box display={{ base: "block", lg: "none" }}>
              <VStack spacing="16px" align="stretch">
                {rentalData.map((row, index) => (
                  <Card key={`${row.name}-${index}`} p="16px">
                    <VStack spacing="12px" align="stretch">
                      <Flex justify="space-between" align="center">
                        <Flex align="center">
                          <Image src={logo} w="40px" h="40px" me="12px" objectFit="cover" />
                          <VStack align="start" spacing="2px">
                            <Text fontSize="md" color={textColor} fontWeight="bold">
                              {row.name}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {row.category}
                            </Text>
                          </VStack>
                        </Flex>
                        <Badge colorScheme={row.status === "rented" && row.isOverdue ? "red" : row.status === "rented" ? "yellow" : row.status === "available" ? "green" : "gray"} fontSize="12px" p="4px 8px">
                          {row.status}
                        </Badge>
                      </Flex>
                      
                             <Flex justify="space-between" wrap="wrap" gap="8px">
                               <VStack align="start" spacing="2px">
                                 <Text fontSize="xs" color="gray.500">Quantity</Text>
                                 <Text fontSize="sm" color={textColor} fontWeight="bold">{row.quantity}</Text>
                               </VStack>
                               <VStack align="start" spacing="2px">
                                 <Text fontSize="xs" color="gray.500">Stock Value</Text>
                                 <Text fontSize="sm" color={textColor} fontWeight="bold">{row.stockValue ? `PKR.${row.stockValue}` : 'PKR.0'}</Text>
                               </VStack>
                               <VStack align="start" spacing="2px">
                                 <Text fontSize="xs" color="gray.500">Total Rented</Text>
                                 <Text fontSize="sm" color={textColor} fontWeight="bold">{row.totalRented || "0"}</Text>
                               </VStack>
                               <VStack align="start" spacing="2px">
                                 <Text fontSize="xs" color="gray.500">Current Rent</Text>
                                 <Text fontSize="sm" color={textColor} fontWeight="bold">{row.currentRent ? `PKR.${row.currentRent}` : 'PKR.0'}</Text>
                               </VStack>
                             </Flex>

                             <Flex justify="space-between" wrap="wrap" gap="8px">
                               <VStack align="start" spacing="2px">
                                 <Text fontSize="xs" color="gray.500">Total Profit</Text>
                                 <Text fontSize="sm" color={textColor} fontWeight="bold">{row.totalProfit ? `PKR.${row.totalProfit}` : 'PKR.0'}</Text>
                               </VStack>
                             </Flex>

                      {row.rentalDurationDays && (
                        <Flex justify="space-between" wrap="wrap" gap="8px">
                          <VStack align="start" spacing="2px">
                            <Text fontSize="xs" color="gray.500">Duration</Text>
                            <Text fontSize="sm" color={textColor} fontWeight="bold">{row.rentalDurationDays} days</Text>
                          </VStack>
                          <VStack align="start" spacing="2px">
                            <Text fontSize="xs" color="gray.500">Daily Rate</Text>
                            <Text fontSize="sm" color={textColor} fontWeight="bold">{row.dailyRate ? `PKR.${row.dailyRate}/day` : "—"}</Text>
                          </VStack>
                        </Flex>
                      )}

                      {(row.rentedOn || row.rentedTill) && (
                        <Flex justify="space-between" wrap="wrap" gap="8px">
                          <VStack align="start" spacing="2px">
                            <Text fontSize="xs" color="gray.500">Rented On</Text>
                            <Text fontSize="sm" color={textColor} fontWeight="bold">{row.rentedOn ? new Date(row.rentedOn).toLocaleDateString() : "—"}</Text>
                          </VStack>
                          <VStack align="start" spacing="2px">
                            <Text fontSize="xs" color="gray.500">Rented Till</Text>
                            <Text fontSize="sm" color={textColor} fontWeight="bold">{row.rentedTill ? new Date(row.rentedTill).toLocaleDateString() : "—"}</Text>
                          </VStack>
                        </Flex>
                      )}

                      <HStack spacing="12px" justify="center" pt="8px">
                        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                          Edit
                        </Button>
                        {row.status === "rented" ? (
                          <Button size="sm" colorScheme="red" variant="outline" onClick={() => openEndRental(row)}>
                            End Rental
                          </Button>
                        ) : (
                          <Button size="sm" colorScheme="green" variant="outline" onClick={() => openRent(row)}>
                            Record Rental
                          </Button>
                        )}
                        <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDelete(row)}>
                          Delete
                        </Button>
                      </HStack>
                    </VStack>
                  </Card>
                ))}
              </VStack>
            </Box>
          </>
        )}
      </CardBody>
    </Card>
    {/* Add Rental Item Modal */}
    <Modal isOpen={isOpen} onClose={onClose} size='lg' motionPreset='slideInBottom'>
      <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
      <ModalContent>
        <ModalHeader color={textColor}>Add Rental Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb='24px'>
          <VStack spacing='16px'>
            <FormControl isRequired>
              <FormLabel color={textColor}>Item Name</FormLabel>
              <Input placeholder='Enter item name' value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Quantity</FormLabel>
              <Input type='number' placeholder='Enter quantity' value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color={textColor}>Unit</FormLabel>
              <Select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} placeholder='Select unit'>
                {customUnits.map((unit, index) => (
                  <option key={index} value={unit.unitName}>{unit.unitName} ({unit.unitMetric})</option>
                ))}
                <option value='Custom'>Custom</option>
              </Select>
            </FormControl>
            {newItem.unit === 'Custom' && (
              <FormControl isRequired>
                <FormLabel color={textColor}>Custom Unit</FormLabel>
                <Input placeholder='Enter custom unit' value={newItem.customUnit} onChange={(e) => setNewItem({ ...newItem, customUnit: e.target.value })} />
              </FormControl>
            )}
            <FormControl>
              <FormLabel color={textColor}>Category</FormLabel>
              <Select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} placeholder='Select category'>
                {categories.map((c, index) => (
                  <option key={index} value={c.name}>{c.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Status</FormLabel>
              <Select value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}>
                <option value='available'>Available</option>
                <option value='rented'>Rented</option>
                <option value='maintenance'>Maintenance</option>
                <option value='pending'>Pending</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Stock Value (PKR)</FormLabel>
              <Input type='number' value={newItem.stockValue} onChange={(e) => setNewItem({ ...newItem, stockValue: e.target.value })} />
            </FormControl>
            <Button colorScheme='teal' bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} w='100%' onClick={handleAddItem}>
              ADD RENTAL ITEM
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>

    {/* Edit Rental Item Modal */}
    <Modal isOpen={isEditOpen} onClose={onEditClose} size='lg' motionPreset='slideInBottom'>
      <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
      <ModalContent>
        <ModalHeader color={textColor}>Edit Rental Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb='24px'>
          {editingItem && (
            <VStack spacing='16px'>
              <FormControl isRequired>
                <FormLabel color={textColor}>Item Name</FormLabel>
                <Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Quantity</FormLabel>
                <Input type='number' value={editingItem.quantity} onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Status</FormLabel>
                <Select value={editingItem.status} onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}>
                  <option value='available'>Available</option>
                  <option value='rented'>Rented</option>
                  <option value='maintenance'>Maintenance</option>
                  <option value='pending'>Pending</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Stock Value (PKR)</FormLabel>
                <Input type='number' value={editingItem.stockValue} onChange={(e) => setEditingItem({ ...editingItem, stockValue: e.target.value })} />
              </FormControl>
              <Button colorScheme='teal' bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} w='100%' onClick={handleUpdateItem}>
                UPDATE RENTAL ITEM
              </Button>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>

    {/* Record Rental Modal */}
    <Modal isOpen={isRentOpen} onClose={onRentClose} size='md' motionPreset='slideInBottom'>
      <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
      <ModalContent>
        <ModalHeader color={textColor}>Record Rental{rentingItem ? ` - ${rentingItem.name}` : ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb='24px'>
          <VStack spacing='16px'>
            <FormControl isRequired>
              <FormLabel color={textColor}>Quantity</FormLabel>
              <Input type='number' step='0.01' placeholder='Enter rental quantity' value={rentForm.quantity} onChange={(e) => setRentForm({ ...rentForm, quantity: e.target.value })} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color={textColor}>Total Rent Amount (PKR)</FormLabel>
              <Input type='number' step='0.01' placeholder='Enter total rent amount' value={rentForm.totalRentAmount} onChange={(e) => setRentForm({ ...rentForm, totalRentAmount: e.target.value })} />
            </FormControl>
            <HStack spacing='8px' w='100%'>
              <FormControl isRequired>
                <FormLabel color={textColor}>Rented On</FormLabel>
                <Input type='date' value={rentForm.rentedOn} onChange={(e) => setRentForm({ ...rentForm, rentedOn: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color={textColor}>Rented Till</FormLabel>
                <Input type='date' value={rentForm.rentedTill} onChange={(e) => setRentForm({ ...rentForm, rentedTill: e.target.value })} />
              </FormControl>
            </HStack>
            <Button colorScheme='teal' bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} w='100%' onClick={handleRecordRent}>
              RECORD RENTAL
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>

    {/* End Rental Modal */}
    <Modal isOpen={isEndRentalOpen} onClose={onEndRentalClose} size='md' motionPreset='slideInBottom'>
      <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
      <ModalContent>
        <ModalHeader color={textColor}>End Rental{endingRentalItem ? ` - ${endingRentalItem.name}` : ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb='24px'>
          <VStack spacing='16px'>
            <FormControl isRequired>
              <FormLabel color={textColor}>Return Quantity</FormLabel>
              <Input type='number' step='0.01' placeholder='Enter quantity to return' value={endRentalForm.quantity} onChange={(e) => setEndRentalForm({ ...endRentalForm, quantity: e.target.value })} />
            </FormControl>
            <Button colorScheme='red' bg='#FF6B6B' color='white' _hover={{ bg: '#E55A5A' }} w='100%' onClick={handleEndRental}>
              END RENTAL
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
    </Flex>
  );
}

export default RentalManagement;


