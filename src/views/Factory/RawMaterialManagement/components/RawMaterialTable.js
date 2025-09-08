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
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import RawMaterialTableRow from "components/Tables/RawMaterialTableRow";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv } from "react-icons/fa";

const RawMaterialTable = ({ title, captions }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [newMaterial, setNewMaterial] = React.useState({
    name: "",
    amountPerUnit: "",
    unit: "",
    customUnit: "",
    totalPurchaseCost: "",
    status: "Delivered",
    amountPending: ""
  });
  const [editingMaterial, setEditingMaterial] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  
  // Raw material management data based on the image
  const rawMaterialData = [
    {
      logo: logo,
      name: "Iron Rods",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Delivered",
      amountPending: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Steel Slabs",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Pending",
      amountPending: "None"
    },
    {
      logo: logo,
      name: "Sand Mix",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Pending",
      amountPending: "None"
    },
    {
      logo: logo,
      name: "Stone Slabs",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Pending",
      amountPending: "None"
    },
    {
      logo: logo,
      name: "Rose Wood",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Pending",
      amountPending: "None"
    },
    {
      logo: logo,
      name: "Sandal Wood",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Delivered",
      amountPending: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Glass",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Delivered",
      amountPending: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Metal Sheets",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Delivered",
      amountPending: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Aluminum Rings",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Delivered",
      amountPending: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Sand Stone",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Delivered",
      amountPending: "None"
    },
    {
      logo: logo,
      name: "Marble",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Delivered",
      amountPending: "None"
    },
    {
      logo: logo,
      name: "Copper",
      amountPerUnit: "10 Ton",
      totalPurchaseCost: "PKR.30,000",
      invoiceLink: "Download Invoice",
      status: "Delivered",
      amountPending: "None"
    }
  ];

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.amountPerUnit || !newMaterial.totalPurchaseCost) return;
    
    const finalUnit = newMaterial.unit === "Custom" ? newMaterial.customUnit : newMaterial.unit;
    const newMaterialData = {
      logo: logo,
      name: newMaterial.name,
      amountPerUnit: `${newMaterial.amountPerUnit} ${finalUnit}`,
      totalPurchaseCost: `PKR.${newMaterial.totalPurchaseCost}`,
      invoiceLink: "Download Invoice",
      status: newMaterial.status,
      amountPending: newMaterial.amountPending ? `PKR.${newMaterial.amountPending}` : "None"
    };
    
    rawMaterialData.push(newMaterialData);
    setNewMaterial({
      name: "",
      amountPerUnit: "",
      unit: "",
      customUnit: "",
      totalPurchaseCost: "",
      status: "Delivered",
      amountPending: ""
    });
    onClose();
  };

  const handleEditMaterial = (material, index) => {
    // Parse the amount per unit to separate number and unit
    const amountMatch = material.amountPerUnit.match(/^(\d+)\s+(.+)$/);
    const amount = amountMatch ? amountMatch[1] : "";
    const unit = amountMatch ? amountMatch[2] : "";
    
    // Parse costs to remove PKR. prefix
    const totalCost = material.totalPurchaseCost.replace("PKR.", "");
    const pendingAmount = material.amountPending === "None" ? "" : material.amountPending.replace("PKR.", "");
    
    // Determine if unit is custom or predefined
    const predefinedUnits = ["Ton", "Kilograms", "Grams", "Liters", "Milliliters", "Meters", "Centimeters", "Pieces"];
    const isCustomUnit = !predefinedUnits.includes(unit);
    
    setEditingMaterial({
      name: material.name,
      amountPerUnit: amount,
      unit: isCustomUnit ? "Custom" : unit,
      customUnit: isCustomUnit ? unit : "",
      totalPurchaseCost: totalCost,
      status: material.status,
      amountPending: pendingAmount
    });
    setEditIndex(index);
    onEditOpen();
  };

  const handleUpdateMaterial = () => {
    if (!editingMaterial.name || !editingMaterial.amountPerUnit || !editingMaterial.totalPurchaseCost) return;
    
    const finalUnit = editingMaterial.unit === "Custom" ? editingMaterial.customUnit : editingMaterial.unit;
    const updatedMaterialData = {
      logo: logo,
      name: editingMaterial.name,
      amountPerUnit: `${editingMaterial.amountPerUnit} ${finalUnit}`,
      totalPurchaseCost: `PKR.${editingMaterial.totalPurchaseCost}`,
      invoiceLink: "Download Invoice",
      status: editingMaterial.status,
      amountPending: editingMaterial.amountPending ? `PKR.${editingMaterial.amountPending}` : "None"
    };
    
    // Update the material data at the specific index
    rawMaterialData[editIndex] = updatedMaterialData;
    
    // Reset editing state
    setEditingMaterial(null);
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

  const handleExportCSV = () => {
    // Here you would typically export the data as CSV
    // For now, we'll just show an alert
    alert("Export CSV functionality would be implemented here.");
  };

  return (
    <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex justify='space-between' align='center' w='100%'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Raw Material Management
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
              Import CSV
            </Button>
            <Button
              leftIcon={<FaFileCsv />}
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={handleExportCSV}>
              Export as CSV
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
              Add New Raw Material
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={textColor}>
          <Thead>
            <Tr my='.8rem' pl='0px' color='gray.400'>
              {captions.map((caption, idx) => {
                return (
                  <Th color='gray.400' key={idx} ps={idx === 0 ? "0px" : null}>
                    {caption}
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {rawMaterialData.map((row, index) => {
              return (
                <RawMaterialTableRow
                  key={`${row.name}-${index}`}
                  logo={row.logo}
                  name={row.name}
                  amountPerUnit={row.amountPerUnit}
                  totalPurchaseCost={row.totalPurchaseCost}
                  invoiceLink={row.invoiceLink}
                  status={row.status}
                  amountPending={row.amountPending}
                  onEdit={() => handleEditMaterial(row, index)}
                />
              );
            })}
          </Tbody>
        </Table>
      </CardBody>

      {/* Add New Raw Material Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent>
          <ModalHeader color={textColor}>Add New Raw Material</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl isRequired>
                <FormLabel color={textColor}>Material Name</FormLabel>
                <Input
                  placeholder='Enter material name'
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Amount Per Unit</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter amount'
                  value={newMaterial.amountPerUnit}
                  onChange={(e) => setNewMaterial({...newMaterial, amountPerUnit: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Unit</FormLabel>
                <Select
                  value={newMaterial.unit}
                  onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                  placeholder='Select unit'>
                  <option value='Ton'>Ton</option>
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
              
              {newMaterial.unit === "Custom" && (
                <FormControl isRequired>
                  <FormLabel color={textColor}>Custom Unit</FormLabel>
                  <Input
                    placeholder='Enter custom unit (e.g., kgs, pcs, etc.)'
                    value={newMaterial.customUnit}
                    onChange={(e) => setNewMaterial({...newMaterial, customUnit: e.target.value})}
                  />
                </FormControl>
              )}
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Total Purchase Cost (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter total cost'
                  value={newMaterial.totalPurchaseCost}
                  onChange={(e) => setNewMaterial({...newMaterial, totalPurchaseCost: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Status</FormLabel>
                <Select
                  value={newMaterial.status}
                  onChange={(e) => setNewMaterial({...newMaterial, status: e.target.value})}>
                  <option value='Delivered'>Delivered</option>
                  <option value='Pending'>Pending</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Amount Pending (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter pending amount (leave empty for None)'
                  value={newMaterial.amountPending}
                  onChange={(e) => setNewMaterial({...newMaterial, amountPending: e.target.value})}
                />
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddMaterial}>
                ADD RAW MATERIAL
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Raw Material Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent>
          <ModalHeader color={textColor}>Edit Raw Material</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            {editingMaterial && (
              <VStack spacing='16px'>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Material Name</FormLabel>
                  <Input
                    placeholder='Enter material name'
                    value={editingMaterial.name}
                    onChange={(e) => setEditingMaterial({...editingMaterial, name: e.target.value})}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={textColor}>Amount Per Unit</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter amount'
                    value={editingMaterial.amountPerUnit}
                    onChange={(e) => setEditingMaterial({...editingMaterial, amountPerUnit: e.target.value})}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={textColor}>Unit</FormLabel>
                  <Select
                    value={editingMaterial.unit}
                    onChange={(e) => setEditingMaterial({...editingMaterial, unit: e.target.value})}
                    placeholder='Select unit'>
                    <option value='Ton'>Ton</option>
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
                
                {editingMaterial.unit === "Custom" && (
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Custom Unit</FormLabel>
                    <Input
                      placeholder='Enter custom unit (e.g., kgs, pcs, etc.)'
                      value={editingMaterial.customUnit}
                      onChange={(e) => setEditingMaterial({...editingMaterial, customUnit: e.target.value})}
                    />
                  </FormControl>
                )}
                
                <FormControl isRequired>
                  <FormLabel color={textColor}>Total Purchase Cost (PKR)</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter total cost'
                    value={editingMaterial.totalPurchaseCost}
                    onChange={(e) => setEditingMaterial({...editingMaterial, totalPurchaseCost: e.target.value})}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Status</FormLabel>
                  <Select
                    value={editingMaterial.status}
                    onChange={(e) => setEditingMaterial({...editingMaterial, status: e.target.value})}>
                    <option value='Delivered'>Delivered</option>
                    <option value='Pending'>Pending</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Amount Pending (PKR)</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter pending amount (leave empty for None)'
                    value={editingMaterial.amountPending}
                    onChange={(e) => setEditingMaterial({...editingMaterial, amountPending: e.target.value})}
                  />
                </FormControl>
                
                <Button
                  colorScheme='teal'
                  bg='#FF8D28'
                  color='white'
                  _hover={{ bg: '#E67E22' }}
                  w='100%'
                  onClick={handleUpdateMaterial}>
                  UPDATE RAW MATERIAL
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default RawMaterialTable;
