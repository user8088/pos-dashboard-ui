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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  InputGroup,
  InputRightElement,
  useToast,
  Spinner,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import StockTableRow from "components/Tables/StockTableRow";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv, FaRuler, FaTags, FaTrash } from "react-icons/fa";

const Authors = ({ title, captions, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isUnitOpen, onOpen: onUnitOpen, onClose: onUnitClose } = useDisclosure();
  const { isOpen: isCategoryOpen, onOpen: onCategoryOpen, onClose: onCategoryClose } = useDisclosure();
  const [newStock, setNewStock] = React.useState({
    name: "",
    quantity: "",
    unit: "",
    customUnit: "",
    category: "",
    status: "in_stock",
    stockValue: ""
  });
  const [editingStock, setEditingStock] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  const [newUnit, setNewUnit] = React.useState({
    unitName: "",
    unitMetric: "",
    customMetric: ""
  });
  const [customUnits, setCustomUnits] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [newCategory, setNewCategory] = React.useState({
    categoryName: ""
  });
  const [stockData, setStockData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Fetch units, categories, and stock data on component mount
  React.useEffect(() => {
    fetchUnits();
    fetchCategories();
    fetchStock();
  }, []);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/unit`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const units = await response.json();
        const formattedUnits = units.map(unit => ({
          unitName: unit.unit_name,
          unitMetric: unit.metric,
          unitId: unit.unit_id
        }));
        setCustomUnits(formattedUnits);
      } else {
        console.error('Failed to fetch units');
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/category`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const categoriesData = await response.json();
        const formattedCategories = categoriesData.map(category => ({
          categoryId: category.category_id,
          categoryName: category.category_name
        }));
        setCategories(formattedCategories);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const stockItems = await response.json();
        const formattedStock = stockItems.map(item => ({
          logo: logo,
          name: item.item_name,
          quantity: `${item.quantity_per_unit} ${item.unit?.unit_name || 'Units'}`,
          category: item.category?.category_name || 'Uncategorized',
          status: item.stock_status === 'in_stock' ? 'In Stock' : 
                  item.stock_status === 'out_of_stock' ? 'Out of Stock' : 
                  item.stock_status === 'pending' ? 'Pending' : 'In Stock',
          stockValue: item.stock_value ? `PKR.${item.stock_value}` : 'PKR.0',
          itemId: item.item_id,
          unitId: item.unit_id,
          categoryId: item.category_id,
          quantityPerUnit: item.quantity_per_unit,
          stockValueRaw: item.stock_value || 0,
          stockStatusRaw: item.stock_status || 'in_stock'
        }));
        setStockData(formattedStock);
      } else {
        console.error('Failed to fetch stock');
        setStockData([]);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      setStockData([]);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Stock management captions
  const stockCaptions = ["Products", "QUANTITY PER UNIT", "CATEGORY", "STATUS", "Stock Value", ""];

  const handleAddStock = async () => {
    if (!newStock.name || !newStock.quantity || !newStock.unit || !newStock.category) return;
    
    try {
      // Find the selected unit ID
      const selectedUnit = customUnits.find(unit => unit.unitName === newStock.unit);
      const unitId = selectedUnit ? selectedUnit.unitId : null;
      
      // Find the selected category ID
      const selectedCategory = categories.find(cat => cat.categoryName === newStock.category);
      const categoryId = selectedCategory ? selectedCategory.categoryId : null;
      
      if (!unitId) {
        toast({
          title: "Invalid Unit",
          description: "Please select a valid unit.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          item_name: newStock.name,
          unit_id: unitId,
          category_id: categoryId,
          quantity_per_unit: parseFloat(newStock.quantity),
          stock_value: newStock.stockValue ? parseFloat(newStock.stockValue) : null,
          stock_status: newStock.status
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        toast({
          title: "Stock Item Added Successfully",
          description: `Stock item "${data.item_name}" has been added to the system.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form
        setNewStock({
          name: "",
          quantity: "",
          unit: "",
          customUnit: "",
          category: "",
          status: "in_stock",
          stockValue: ""
        });
        
        // Refresh stock data
        fetchStock();
        onClose();
      } else {
        // Handle API errors
        const errorMessage = data.message || 'Failed to add stock item';
        toast({
          title: "Failed to Add Stock Item",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        
        if (data.errors) {
          console.error('Validation errors:', data.errors);
        }
      }
    } catch (error) {
      console.error('Failed to add stock item:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditStock = (stock, index) => {
    // Parse the quantity to separate number and unit
    const quantityMatch = stock.quantity.match(/^(\d+\.?\d*)\s+(.+)$/);
    const quantity = quantityMatch ? quantityMatch[1] : "";
    const unit = quantityMatch ? quantityMatch[2] : "";
    
    // Parse stock value to remove PKR. prefix
    const stockValue = stock.stockValue.replace("PKR.", "");
    
    // Determine if unit is custom or predefined
    const predefinedUnits = ["Units", "Kilograms", "Grams", "Liters", "Milliliters", "Meters", "Centimeters", "Pieces"];
    const isCustomUnit = !predefinedUnits.includes(unit);
    
    setEditingStock({
      name: stock.name,
      quantity: quantity,
      unit: isCustomUnit ? "Custom" : unit,
      customUnit: isCustomUnit ? unit : "",
      category: stock.category,
      status: stock.stockStatusRaw,
      stockValue: stockValue,
      itemId: stock.itemId
    });
    setEditIndex(index);
    onEditOpen();
  };

  const handleUpdateStock = async () => {
    if (!editingStock.name || !editingStock.quantity || !editingStock.category) return;
    
    try {
      // Find the selected unit ID
      const selectedUnit = customUnits.find(unit => unit.unitName === editingStock.unit);
      const unitId = selectedUnit ? selectedUnit.unitId : null;
      
      // Find the selected category ID
      const selectedCategory = categories.find(cat => cat.categoryName === editingStock.category);
      const categoryId = selectedCategory ? selectedCategory.categoryId : null;
      
      if (!unitId) {
        toast({
          title: "Invalid Unit",
          description: "Please select a valid unit.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${editingStock.itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          item_name: editingStock.name,
          unit_id: unitId,
          category_id: categoryId,
          quantity_per_unit: parseFloat(editingStock.quantity),
          stock_value: editingStock.stockValue ? parseFloat(editingStock.stockValue) : null,
          stock_status: editingStock.status
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        toast({
          title: "Stock Item Updated Successfully",
          description: `Stock item "${data.item_name}" has been updated.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh stock data
        fetchStock();
        
        // Reset editing state
        setEditingStock(null);
        setEditIndex(-1);
        onEditClose();
      } else {
        // Handle API errors
        const errorMessage = data.message || 'Failed to update stock item';
        toast({
          title: "Failed to Update Stock Item",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        
        if (data.errors) {
          console.error('Validation errors:', data.errors);
        }
      }
    } catch (error) {
      console.error('Failed to update stock item:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImportCSV = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Here you would typically parse the CSV and add the data
        // For now, we'll just show an alert
        alert(`CSV file "${file.name}" selected. CSV import functionality would be implemented here.`);
      }
    };
    input.click();
  };

  const handleAddUnit = async () => {
    if (!newUnit.unitName || !newUnit.unitMetric) return;
    
    const finalMetric = newUnit.unitMetric === "Custom" ? newUnit.customMetric : newUnit.unitMetric;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/unit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          unit_name: newUnit.unitName,
          metric: finalMetric,
          custom_metric: newUnit.unitMetric === "Custom" ? newUnit.customMetric : null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add to custom units list with API response data
        const unitData = {
          unitName: data.unit_name,
          unitMetric: data.metric,
          unitId: data.unit_id
        };
        
        setCustomUnits([...customUnits, unitData]);
        
        // Show success message
        toast({
          title: "Unit Added Successfully",
          description: `Unit "${data.unit_name}" has been added to the system.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form
        setNewUnit({
          unitName: "",
          unitMetric: "",
          customMetric: ""
        });
        
        onUnitClose();
      } else {
        // Handle API errors
        const errorMessage = data.message || 'Failed to add unit';
        toast({
          title: "Failed to Add Unit",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        
        if (data.errors) {
          console.error('Validation errors:', data.errors);
        }
      }
    } catch (error) {
      console.error('Failed to add unit:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.categoryName) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/category`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          category_name: newCategory.categoryName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add to categories list with API response data
        const categoryData = {
          categoryId: data.category_id,
          categoryName: data.category_name
        };
        
        setCategories([...categories, categoryData]);
        
        // Show success message
        toast({
          title: "Category Added Successfully",
          description: `Category "${data.category_name}" has been added to the system.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form
        setNewCategory({
          categoryName: ""
        });
        
        onCategoryClose();
      } else {
        // Handle API errors
        const errorMessage = data.message || 'Failed to add category';
        toast({
          title: "Failed to Add Category",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        
        if (data.errors) {
          console.error('Validation errors:', data.errors);
        }
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteStock = async (stockItem) => {
    if (!window.confirm(`Are you sure you want to delete "${stockItem.name}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${stockItem.itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // Show success message
        toast({
          title: "Stock Item Deleted Successfully",
          description: `Stock item "${stockItem.name}" has been deleted.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh stock data
        fetchStock();
      } else {
        const data = await response.json();
        const errorMessage = data.message || 'Failed to delete stock item';
        toast({
          title: "Failed to Delete Stock Item",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to delete stock item:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex justify='space-between' align='center' w='100%'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Stock Management
          </Text>
          <HStack spacing='12px'>
            <Button
              leftIcon={<FaFileCsv />}
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={handleImportCSV}>
              IMPORT CSV
            </Button>
            <Button
              leftIcon={<FaTags />}
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onCategoryOpen}>
              ADD CATEGORY
            </Button>
            <Button
              leftIcon={<FaRuler />}
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onUnitOpen}>
              ADD UNIT
            </Button>
            <Button
              leftIcon={<FaPlus />}
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onOpen}>
              ADD NEW STOCK
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
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
        ) : stockData.length === 0 ? (
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
                No Stock Items Added
              </Text>
              <Text color="gray.500" fontSize="md" lineHeight="1.6">
                Start by adding your first stock item to manage your inventory.
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
                onClick={onOpen}>
                ADD FIRST STOCK ITEM
              </Button>
            </VStack>
          </Flex>
        ) : (
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr my='.8rem' pl='0px' color='gray.400'>
                {stockCaptions.map((caption, idx) => {
                  return (
                    <Th color='gray.400' key={idx} ps={idx === 0 ? "0px" : null}>
                      {caption}
                    </Th>
                  );
                })}
              </Tr>
            </Thead>
            <Tbody>
              {stockData.map((row, index) => {
                return (
                  <StockTableRow
                    key={`${row.name}-${index}`}
                    logo={row.logo}
                    name={row.name}
                    quantity={row.quantity}
                    category={row.category}
                    status={row.status}
                    stockValue={row.stockValue}
                    onEdit={() => handleEditStock(row, index)}
                    onDelete={() => handleDeleteStock(row)}
                  />
                );
              })}
            </Tbody>
          </Table>
        )}
      </CardBody>

      {/* Add New Stock Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent>
          <ModalHeader color={textColor}>Add New Stock Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl isRequired>
                <FormLabel color={textColor}>Product Name</FormLabel>
                <Input
                  placeholder='Enter product name'
                  value={newStock.name}
                  onChange={(e) => setNewStock({...newStock, name: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Quantity</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter quantity'
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Unit</FormLabel>
                <Select
                  value={newStock.unit}
                  onChange={(e) => setNewStock({...newStock, unit: e.target.value})}
                  placeholder='Select unit'>
                  {customUnits.map((unit, index) => (
                    <option key={index} value={unit.unitName}>
                      {unit.unitName} ({unit.unitMetric})
                    </option>
                  ))}
                  <option value='Custom'>Custom</option>
                </Select>
              </FormControl>
              
              {newStock.unit === "Custom" && (
                <FormControl isRequired>
                  <FormLabel color={textColor}>Custom Unit</FormLabel>
                  <Input
                    placeholder='Enter custom unit (e.g., kgs, pcs, etc.)'
                    value={newStock.customUnit}
                    onChange={(e) => setNewStock({...newStock, customUnit: e.target.value})}
                  />
                </FormControl>
              )}
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Category</FormLabel>
                <Select
                  value={newStock.category}
                  onChange={(e) => setNewStock({...newStock, category: e.target.value})}
                  placeholder='Select category'>
                  {categories.map((category, index) => (
                    <option key={index} value={category.categoryName}>
                      {category.categoryName}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Status</FormLabel>
                <Select
                  value={newStock.status}
                  onChange={(e) => setNewStock({...newStock, status: e.target.value})}>
                  <option value='in_stock'>In Stock</option>
                  <option value='out_of_stock'>Out of Stock</option>
                  <option value='pending'>Pending</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Stock Value (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter stock value (optional)'
                  value={newStock.stockValue}
                  onChange={(e) => setNewStock({...newStock, stockValue: e.target.value})}
                />
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddStock}>
                ADD STOCK ITEM
              </Button>
            </VStack>
          </ModalBody>
                 </ModalContent>
       </Modal>

       {/* Edit Stock Modal */}
       <Modal isOpen={isEditOpen} onClose={onEditClose} size='lg' motionPreset='slideInBottom'>
         <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
         <ModalContent>
           <ModalHeader color={textColor}>Edit Stock Item</ModalHeader>
           <ModalCloseButton />
           <ModalBody pb='24px'>
             {editingStock && (
               <VStack spacing='16px'>
                 <FormControl isRequired>
                   <FormLabel color={textColor}>Product Name</FormLabel>
                   <Input
                     placeholder='Enter product name'
                     value={editingStock.name}
                     onChange={(e) => setEditingStock({...editingStock, name: e.target.value})}
                   />
                 </FormControl>
                 
                 <FormControl isRequired>
                   <FormLabel color={textColor}>Quantity</FormLabel>
                   <Input
                     type='number'
                     placeholder='Enter quantity'
                     value={editingStock.quantity}
                     onChange={(e) => setEditingStock({...editingStock, quantity: e.target.value})}
                   />
                 </FormControl>
                 
                 <FormControl isRequired>
                   <FormLabel color={textColor}>Unit</FormLabel>
                   <Select
                     value={editingStock.unit}
                     onChange={(e) => setEditingStock({...editingStock, unit: e.target.value})}
                     placeholder='Select unit'>
                     <option value='Units'>Units</option>
                     <option value='Kilograms'>Kilograms</option>
                     <option value='Grams'>Grams</option>
                     <option value='Liters'>Liters</option>
                     <option value='Milliliters'>Milliliters</option>
                     <option value='Meters'>Meters</option>
                     <option value='Centimeters'>Centimeters</option>
                     <option value='Pieces'>Pieces</option>
                     {customUnits.map((unit, index) => (
                       <option key={index} value={unit.unitName}>
                         {unit.unitName} ({unit.unitMetric})
                       </option>
                     ))}
                     <option value='Custom'>Custom</option>
                   </Select>
                 </FormControl>
                 
                 {editingStock.unit === "Custom" && (
                   <FormControl isRequired>
                     <FormLabel color={textColor}>Custom Unit</FormLabel>
                     <Input
                       placeholder='Enter custom unit (e.g., kgs, pcs, etc.)'
                       value={editingStock.customUnit}
                       onChange={(e) => setEditingStock({...editingStock, customUnit: e.target.value})}
                     />
                   </FormControl>
                 )}
                 
                 <FormControl isRequired>
                   <FormLabel color={textColor}>Category</FormLabel>
                   <Select
                     value={editingStock.category}
                     onChange={(e) => setEditingStock({...editingStock, category: e.target.value})}
                     placeholder='Select category'>
                     {categories.map((category, index) => (
                       <option key={index} value={category.categoryName}>
                         {category.categoryName}
                       </option>
                     ))}
                   </Select>
                 </FormControl>
                 
                 <FormControl>
                   <FormLabel color={textColor}>Status</FormLabel>
                   <Select
                     value={editingStock.status}
                     onChange={(e) => setEditingStock({...editingStock, status: e.target.value})}>
                     <option value='in_stock'>In Stock</option>
                     <option value='out_of_stock'>Out of Stock</option>
                     <option value='pending'>Pending</option>
                   </Select>
                 </FormControl>
                 
                 <FormControl>
                   <FormLabel color={textColor}>Stock Value (PKR)</FormLabel>
                   <Input
                     type='number'
                     placeholder='Enter stock value (optional)'
                     value={editingStock.stockValue}
                     onChange={(e) => setEditingStock({...editingStock, stockValue: e.target.value})}
                   />
                 </FormControl>
                 
                 <Button
                   colorScheme='teal'
                   bg='#FF8D28'
                   color='white'
                   _hover={{ bg: '#E67E22' }}
                   w='100%'
                   onClick={handleUpdateStock}>
                   UPDATE STOCK ITEM
                 </Button>
               </VStack>
             )}
           </ModalBody>
         </ModalContent>
       </Modal>

       {/* Add Unit Modal */}
       <Modal isOpen={isUnitOpen} onClose={onUnitClose} size='md' motionPreset='slideInBottom'>
         <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
         <ModalContent>
           <ModalHeader color={textColor}>Add New Unit</ModalHeader>
           <ModalCloseButton />
           <ModalBody pb='24px'>
             <VStack spacing='16px'>
               <FormControl isRequired>
                 <FormLabel color={textColor}>Unit Name</FormLabel>
                 <Input
                   placeholder='Enter unit name (e.g., Boxes, Pallets, etc.)'
                   value={newUnit.unitName}
                   onChange={(e) => setNewUnit({...newUnit, unitName: e.target.value})}
                 />
               </FormControl>
               
               <FormControl isRequired>
                 <FormLabel color={textColor}>Unit Metric</FormLabel>
                 <Select
                   value={newUnit.unitMetric}
                   onChange={(e) => setNewUnit({...newUnit, unitMetric: e.target.value})}
                   placeholder='Select metric type'>
                   <option value='kg'>Kilograms (kg)</option>
                   <option value='g'>Grams (g)</option>
                   <option value='lbs'>Pounds (lbs)</option>
                   <option value='oz'>Ounces (oz)</option>
                   <option value='l'>Liters (l)</option>
                   <option value='ml'>Milliliters (ml)</option>
                   <option value='gal'>Gallons (gal)</option>
                   <option value='m'>Meters (m)</option>
                   <option value='cm'>Centimeters (cm)</option>
                   <option value='ft'>Feet (ft)</option>
                   <option value='in'>Inches (in)</option>
                   <option value='pcs'>Pieces (pcs)</option>
                   <option value='units'>Units</option>
                   <option value='Custom'>Custom</option>
                 </Select>
               </FormControl>
               
               {newUnit.unitMetric === "Custom" && (
                 <FormControl isRequired>
                   <FormLabel color={textColor}>Custom Metric</FormLabel>
                   <Input
                     placeholder='Enter custom metric (e.g., tons, yards, etc.)'
                     value={newUnit.customMetric}
                     onChange={(e) => setNewUnit({...newUnit, customMetric: e.target.value})}
                   />
                 </FormControl>
               )}
               
               <Button
                 colorScheme='teal'
                 bg='#FF8D28'
                 color='white'
                 _hover={{ bg: '#E67E22' }}
                 w='100%'
                 onClick={handleAddUnit}>
                 ADD UNIT
               </Button>
             </VStack>
           </ModalBody>
         </ModalContent>
       </Modal>

       {/* Add Category Modal */}
       <Modal isOpen={isCategoryOpen} onClose={onCategoryClose} size='md' motionPreset='slideInBottom'>
         <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
         <ModalContent>
           <ModalHeader color={textColor}>Add New Category</ModalHeader>
           <ModalCloseButton />
           <ModalBody pb='24px'>
             <VStack spacing='16px'>
               <FormControl isRequired>
                 <FormLabel color={textColor}>Category Name</FormLabel>
                 <Input
                   placeholder='Enter category name (e.g., Electronics, Food, etc.)'
                   value={newCategory.categoryName}
                   onChange={(e) => setNewCategory({...newCategory, categoryName: e.target.value})}
                 />
               </FormControl>
               
               <Button
                 colorScheme='teal'
                 bg='#FF8D28'
                 color='white'
                 _hover={{ bg: '#E67E22' }}
                 w='100%'
                 onClick={handleAddCategory}>
                 ADD CATEGORY
               </Button>
             </VStack>
           </ModalBody>
         </ModalContent>
       </Modal>
     </Card>
   );
 };

export default Authors;
