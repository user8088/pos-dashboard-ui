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
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import StockTableRow from "components/Tables/StockTableRow";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv, FaRuler } from "react-icons/fa";

const Authors = ({ title, captions, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isUnitOpen, onOpen: onUnitOpen, onClose: onUnitClose } = useDisclosure();
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
  const [newUnit, setNewUnit] = React.useState({
    unitName: "",
    unitMetric: "",
    customMetric: ""
  });
  const [customUnits, setCustomUnits] = React.useState([]);
  
  // Fetch units on component mount
  React.useEffect(() => {
    fetchUnits();
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
     </Card>
   );
 };

export default Authors;
