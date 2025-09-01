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
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import StockTableRow from "components/Tables/StockTableRow";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv } from "react-icons/fa";

const Authors = ({ title, captions, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [newStock, setNewStock] = React.useState({
    name: "",
    quantity: "",
    unit: "",
    customUnit: "",
    category: "",
    status: "In Stock",
    stockValue: ""
  });
  const [editingStock, setEditingStock] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  
  // Stock management data based on the image
  const stockData = [
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Construction Material",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "Out of Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Electrical Accessories",
      status: "Low Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Construction Material",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Construction Material",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    }
  ];

  // Stock management captions
  const stockCaptions = ["Products", "QUANTITY PER UNIT", "CATEGORY", "STATUS", "Stock Value", ""];

  const handleAddStock = () => {
    if (!newStock.name || !newStock.quantity || !newStock.category || !newStock.stockValue) return;
    
    const finalUnit = newStock.unit === "Custom" ? newStock.customUnit : newStock.unit;
    const newStockData = {
      logo: logo,
      name: newStock.name,
      quantity: `${newStock.quantity} ${finalUnit}`,
      category: newStock.category,
      status: newStock.status,
      stockValue: `PKR.${newStock.stockValue}`
    };
    
    stockData.push(newStockData);
    setNewStock({
      name: "",
      quantity: "",
      unit: "",
      customUnit: "",
      category: "",
      status: "In Stock",
      stockValue: ""
    });
    onClose();
  };

  const handleEditStock = (stock, index) => {
    // Parse the quantity to separate number and unit
    const quantityMatch = stock.quantity.match(/^(\d+)\s+(.+)$/);
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
      status: stock.status,
      stockValue: stockValue
    });
    setEditIndex(index);
    onEditOpen();
  };

  const handleUpdateStock = () => {
    if (!editingStock.name || !editingStock.quantity || !editingStock.category || !editingStock.stockValue) return;
    
    const finalUnit = editingStock.unit === "Custom" ? editingStock.customUnit : editingStock.unit;
    const updatedStockData = {
      logo: logo,
      name: editingStock.name,
      quantity: `${editingStock.quantity} ${finalUnit}`,
      category: editingStock.category,
      status: editingStock.status,
      stockValue: `PKR.${editingStock.stockValue}`
    };
    
    // Update the stock data at the specific index
    stockData[editIndex] = updatedStockData;
    
    // Reset editing state
    setEditingStock(null);
    setEditIndex(-1);
    onEditClose();
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
                 />
               );
             })}
          </Tbody>
        </Table>
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
                  <option value='Units'>Units</option>
                  <option value='Kilograms'>Kilograms</option>
                  <option value='Grams'>Grams</option>
                  <option value='Liters'>Liters</option>
                  <option value='Milliliters'>Milliliters</option>
                  <option value='Meters'>Meters</option>
                  <option value='Centimeters'>Centimeters</option>
                  <option value='Pieces'>Pieces</option>
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
                <Input
                  placeholder='Enter category'
                  value={newStock.category}
                  onChange={(e) => setNewStock({...newStock, category: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Status</FormLabel>
                <Select
                  value={newStock.status}
                  onChange={(e) => setNewStock({...newStock, status: e.target.value})}>
                  <option value='In Stock'>In Stock</option>
                  <option value='Out of Stock'>Out of Stock</option>
                  <option value='Low Stock'>Low Stock</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Stock Value (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter stock value'
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
                   <Input
                     placeholder='Enter category'
                     value={editingStock.category}
                     onChange={(e) => setEditingStock({...editingStock, category: e.target.value})}
                   />
                 </FormControl>
                 
                 <FormControl>
                   <FormLabel color={textColor}>Status</FormLabel>
                   <Select
                     value={editingStock.status}
                     onChange={(e) => setEditingStock({...editingStock, status: e.target.value})}>
                     <option value='In Stock'>In Stock</option>
                     <option value='Out of Stock'>Out of Stock</option>
                     <option value='Low Stock'>Low Stock</option>
                   </Select>
                 </FormControl>
                 
                 <FormControl isRequired>
                   <FormLabel color={textColor}>Stock Value (PKR)</FormLabel>
                   <Input
                     type='number'
                     placeholder='Enter stock value'
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
     </Card>
   );
 };

export default Authors;
