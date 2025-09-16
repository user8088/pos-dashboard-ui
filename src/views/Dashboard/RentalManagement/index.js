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
    rentWeek: "",
    rentMonth: "",
    rentYear: "",
    stockValue: "",
  });

  const [editingItem, setEditingItem] = React.useState(null);
  const [rentingItem, setRentingItem] = React.useState(null);
  const [rentForm, setRentForm] = React.useState({ quantity: "", period: "month", rate: "", rentedOn: "", rentedTill: "" });

  React.useEffect(() => {
    fetchUnits();
    fetchCategories();
    fetchRentalStock();
  }, []);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/unit`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/category`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/rental-stock`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const items = await response.json();
        const formatted = items.map(item => ({
          logo: logo,
          name: item.item_name,
          quantity: `${item.quantity_per_unit} ${item.unit?.unit_name || 'Units'}`,
          rentWeek: item.rent_per_week ? `PKR.${item.rent_per_week}` : '—',
          rentMonth: item.rent_per_month ? `PKR.${item.rent_per_month}` : '—',
          rentYear: item.rent_per_year ? `PKR.${item.rent_per_year}` : '—',
          category: item.category?.category_name || 'Uncategorized',
          stockValue: item.stock_value ? `PKR.${item.stock_value}` : 'PKR.0',
          totalRented: item.total_rented ? `${item.total_rented}` : '0',
          totalProfit: item.total_profit ? `PKR.${item.total_profit}` : 'PKR.0',
          status: (item.stock_status || 'available').replace(/_/g, ' '),
          itemId: item.item_id,
          unitId: item.unit_id,
          categoryId: item.category_id,
          quantityPerUnit: item.quantity_per_unit,
          rentsRaw: { week: item.rent_per_week || '', month: item.rent_per_month || '', year: item.rent_per_year || '' },
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
        rent_per_week: newItem.rentWeek ? parseFloat(newItem.rentWeek) : undefined,
        rent_per_month: newItem.rentMonth ? parseFloat(newItem.rentMonth) : undefined,
        rent_per_year: newItem.rentYear ? parseFloat(newItem.rentYear) : undefined,
        stock_value: newItem.stockValue ? parseFloat(newItem.stockValue) : undefined,
        stock_status: newItem.status,
      };
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/rental-stock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Rental item added", description: data.message || 'Item created successfully', status: "success", duration: 3000, isClosable: true });
        setNewItem({ name: "", quantity: "", unit: "", customUnit: "", category: "", status: "available", rentWeek: "", rentMonth: "", rentYear: "", stockValue: "" });
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
      rentWeek: row.rentsRaw?.week?.toString() || "",
      rentMonth: row.rentsRaw?.month?.toString() || "",
      rentYear: row.rentsRaw?.year?.toString() || "",
      stockValue: row.stockValueRaw ? row.stockValueRaw.toString() : "",
    });
    onEditOpen();
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/rental-stock/${editingItem.itemId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          item_name: editingItem.name,
          unit_id: editingItem.unit || undefined,
          category_id: editingItem.category || undefined,
          quantity_per_unit: editingItem.quantity ? parseFloat(editingItem.quantity) : undefined,
          rent_per_week: editingItem.rentWeek !== "" ? parseFloat(editingItem.rentWeek) : undefined,
          rent_per_month: editingItem.rentMonth !== "" ? parseFloat(editingItem.rentMonth) : undefined,
          rent_per_year: editingItem.rentYear !== "" ? parseFloat(editingItem.rentYear) : undefined,
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/rental-stock/${row.itemId}`, {
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
    setRentForm({ quantity: "", period: "month", rate: "", rentedOn: "", rentedTill: "" });
    onRentOpen();
  };

  const handleRecordRent = async () => {
    if (!rentingItem || !rentForm.quantity) return;
    try {
      const token = localStorage.getItem('token');
      const payload = {
        quantity: parseFloat(rentForm.quantity),
        period: rentForm.period,
        rate: rentForm.rate ? parseFloat(rentForm.rate) : undefined,
        rented_on: rentForm.rentedOn || undefined,
        rented_till: rentForm.rentedTill || undefined,
      };
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/rental-stock/${rentingItem.itemId}/rent`, {
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

  const captions = [
    "Products",
    "QUANTITY",
    "RENT (W/M/Y)",
    "CATEGORY",
    "STOCK VALUE",
    "TOTAL RENTED",
    "TOTAL PROFIT",
    "STATUS",
    "",
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
    <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex justify='space-between' align='center' w='100%'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Rental Management
          </Text>
          <HStack spacing='12px'>
            <Button leftIcon={<FaFileCsv />} colorScheme='teal' borderColor='#FF8D28' color='#FF8D28' variant='outline' fontSize='xs' p='8px 24px'>
              IMPORT CSV
            </Button>
            <Button leftIcon={<FaTags />} colorScheme='teal' borderColor='#FF8D28' color='#FF8D28' variant='outline' fontSize='xs' p='8px 24px'>
              ADD CATEGORY
            </Button>
            <Button leftIcon={<FaRuler />} colorScheme='teal' borderColor='#FF8D28' color='#FF8D28' variant='outline' fontSize='xs' p='8px 24px'>
              ADD UNIT
            </Button>
            <Button leftIcon={<FaPlus />} colorScheme='teal' borderColor='#FF8D28' color='#FF8D28' variant='outline' fontSize='xs' p='8px 24px' onClick={onOpen}>
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
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr my='.8rem' pl='0px' color='gray.400'>
                {captions.map((caption, idx) => (
                  <Th color='gray.400' key={idx} ps={idx === 0 ? "0px" : null}>{caption}</Th>
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
                  rentWeek={row.rentWeek}
                  rentMonth={row.rentMonth}
                  rentYear={row.rentYear}
                  category={row.category}
                  status={row.status}
                  stockValue={row.stockValue}
                  totalRented={row.totalRented}
                  totalProfit={row.totalProfit}
                  onEdit={() => openEdit(row)}
                  onDelete={() => handleDelete(row)}
                  onRent={() => openRent(row)}
                />
              ))}
            </Tbody>
          </Table>
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
              <FormLabel color={textColor}>Rent Per Week (PKR)</FormLabel>
              <Input type='number' value={newItem.rentWeek} onChange={(e) => setNewItem({ ...newItem, rentWeek: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Rent Per Month (PKR)</FormLabel>
              <Input type='number' value={newItem.rentMonth} onChange={(e) => setNewItem({ ...newItem, rentMonth: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Rent Per Year (PKR)</FormLabel>
              <Input type='number' value={newItem.rentYear} onChange={(e) => setNewItem({ ...newItem, rentYear: e.target.value })} />
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
                <FormLabel color={textColor}>Rent Per Week (PKR)</FormLabel>
                <Input type='number' value={editingItem.rentWeek} onChange={(e) => setEditingItem({ ...editingItem, rentWeek: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Rent Per Month (PKR)</FormLabel>
                <Input type='number' value={editingItem.rentMonth} onChange={(e) => setEditingItem({ ...editingItem, rentMonth: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Rent Per Year (PKR)</FormLabel>
                <Input type='number' value={editingItem.rentYear} onChange={(e) => setEditingItem({ ...editingItem, rentYear: e.target.value })} />
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
              <FormLabel color={textColor}>Period</FormLabel>
              <Select value={rentForm.period} onChange={(e) => setRentForm({ ...rentForm, period: e.target.value })}>
                <option value='week'>Week</option>
                <option value='month'>Month</option>
                <option value='year'>Year</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Rate (PKR, optional)</FormLabel>
              <Input type='number' step='0.01' placeholder='Override configured rent' value={rentForm.rate} onChange={(e) => setRentForm({ ...rentForm, rate: e.target.value })} />
            </FormControl>
            <HStack spacing='8px' w='100%'>
              <FormControl>
                <FormLabel color={textColor}>Rented On</FormLabel>
                <Input type='date' value={rentForm.rentedOn} onChange={(e) => setRentForm({ ...rentForm, rentedOn: e.target.value })} />
              </FormControl>
              <FormControl>
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
    </Flex>
  );
}

export default RentalManagement;


