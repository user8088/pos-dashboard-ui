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
  useToast,
  Spinner,
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
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [newMaterial, setNewMaterial] = React.useState({
    name: "",
    amountPerUnit: "",
    totalPurchaseCost: "",
    status: "pending",
    amountPending: ""
  });
  const [editingMaterial, setEditingMaterial] = React.useState(null);
  const [rawMaterialData, setRawMaterialData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Fetch raw materials on component mount
  React.useEffect(() => {
    fetchRawMaterials();
  }, []);
  
  const fetchRawMaterials = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const rawMaterials = await response.json();
        const formattedMaterials = rawMaterials.map(material => ({
          logo: logo,
          name: material.material_name,
          amountPerUnit: `${material.amount_per_unit}`,
          totalPurchaseCost: `PKR.${material.purchase_cost}`,
          invoiceLink: "Download Invoice",
          status: material.status === 'pending' ? 'Pending' : 'Delivered',
          amountPending: material.amount_pending ? `PKR.${material.amount_pending}` : 'None',
          materialId: material.id,
          amountPerUnitRaw: material.amount_per_unit,
          purchaseCostRaw: material.purchase_cost,
          statusRaw: material.status,
          amountPendingRaw: material.amount_pending || 0
        }));
        setRawMaterialData(formattedMaterials);
      } else {
        console.error('Failed to fetch raw materials');
        setRawMaterialData([]);
      }
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      setRawMaterialData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.amountPerUnit || !newMaterial.totalPurchaseCost) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          material_name: newMaterial.name,
          amount_per_unit: parseFloat(newMaterial.amountPerUnit),
          purchase_cost: parseFloat(newMaterial.totalPurchaseCost),
          status: newMaterial.status,
          amount_pending: newMaterial.amountPending ? parseFloat(newMaterial.amountPending) : null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        toast({
          title: "Raw Material Added Successfully",
          description: `Raw material "${data.material_name}" has been added to the system.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form
        setNewMaterial({
          name: "",
          amountPerUnit: "",
          totalPurchaseCost: "",
          status: "pending",
          amountPending: ""
        });
        
        // Refresh raw materials data
        fetchRawMaterials();
        onClose();
      } else {
        // Handle API errors
        const errorMessage = data.message || 'Failed to add raw material';
        toast({
          title: "Failed to Add Raw Material",
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
      console.error('Failed to add raw material:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial({
      materialId: material.materialId,
      name: material.name,
      amountPerUnit: material.amountPerUnitRaw.toString(),
      totalPurchaseCost: material.purchaseCostRaw.toString(),
      status: material.statusRaw,
      amountPending: material.amountPendingRaw ? material.amountPendingRaw.toString() : ""
    });
    onEditOpen();
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial.name || !editingMaterial.amountPerUnit || !editingMaterial.totalPurchaseCost) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material/${editingMaterial.materialId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          material_name: editingMaterial.name,
          amount_per_unit: parseFloat(editingMaterial.amountPerUnit),
          purchase_cost: parseFloat(editingMaterial.totalPurchaseCost),
          status: editingMaterial.status,
          amount_pending: editingMaterial.amountPending ? parseFloat(editingMaterial.amountPending) : null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        toast({
          title: "Raw Material Updated Successfully",
          description: `Raw material "${data.material_name}" has been updated.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh raw materials data
        fetchRawMaterials();
        
        // Reset editing state
        setEditingMaterial(null);
        onEditClose();
      } else {
        // Handle API errors
        const errorMessage = data.message || 'Failed to update raw material';
        toast({
          title: "Failed to Update Raw Material",
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
      console.error('Failed to update raw material:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteMaterial = async (material) => {
    if (!window.confirm(`Are you sure you want to delete "${material.name}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material/${material.materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // Show success message
        toast({
          title: "Raw Material Deleted Successfully",
          description: `Raw material "${material.name}" has been deleted.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh raw materials data
        fetchRawMaterials();
      } else {
        const data = await response.json();
        const errorMessage = data.message || 'Failed to delete raw material';
        toast({
          title: "Failed to Delete Raw Material",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to delete raw material:', error);
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
              <Text color={textColor}>Loading raw materials...</Text>
            </VStack>
          </Flex>
        ) : rawMaterialData.length === 0 ? (
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
                No Raw Materials Added
              </Text>
              <Text color="gray.500" fontSize="md" lineHeight="1.6">
                Start by adding your first raw material to manage your inventory.
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
                ADD FIRST RAW MATERIAL
              </Button>
            </VStack>
          </Flex>
        ) : (
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
                    onEdit={() => handleEditMaterial(row)}
                    onDelete={() => handleDeleteMaterial(row)}
                  />
                );
              })}
            </Tbody>
          </Table>
        )}
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
                  step='0.01'
                  placeholder='Enter amount per unit'
                  value={newMaterial.amountPerUnit}
                  onChange={(e) => setNewMaterial({...newMaterial, amountPerUnit: e.target.value})}
                />
              </FormControl>
              
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
                  <option value='pending'>Pending</option>
                  <option value='delivered'>Delivered</option>
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
                    step='0.01'
                    placeholder='Enter amount per unit'
                    value={editingMaterial.amountPerUnit}
                    onChange={(e) => setEditingMaterial({...editingMaterial, amountPerUnit: e.target.value})}
                  />
                </FormControl>
                
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
                    <option value='pending'>Pending</option>
                    <option value='delivered'>Delivered</option>
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
