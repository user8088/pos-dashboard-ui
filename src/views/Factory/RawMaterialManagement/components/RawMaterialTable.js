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
  Box,
  Image,
  Textarea,
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
  const { isOpen: isWasteOpen, onOpen: onWasteOpen, onClose: onWasteClose } = useDisclosure();
  const [newMaterial, setNewMaterial] = React.useState({
    name: "",
    amountPerUnit: "",
    totalPurchaseCost: "",
    status: "pending",
    amountPending: "",
    wasteQuantity: "",
    totalWasteCost: "",
    paymentMethod: "",
    paymentMethodNote: "",
    image: null
  });
  const [editingMaterial, setEditingMaterial] = React.useState({
    id: null,
    name: "",
    amountPerUnit: "",
    totalPurchaseCost: "",
    status: "pending",
    amountPending: "",
    wasteQuantity: "",
    totalWasteCost: "",
    paymentMethod: "",
    paymentMethodNote: "",
    image: null
  });
  const [wasteTarget, setWasteTarget] = React.useState(null);
  const [wasteQuantity, setWasteQuantity] = React.useState("");
  const [rawMaterialData, setRawMaterialData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [newUnitPurchaseCost, setNewUnitPurchaseCost] = React.useState("");
  const [editUnitPurchaseCost, setEditUnitPurchaseCost] = React.useState("");
  const [suppliers, setSuppliers] = React.useState([]);
  
  // Bootstrap: load suppliers first, then materials so supplier names resolve
  React.useEffect(() => {
    const bootstrap = async () => {
      await fetchSuppliers();
      await fetchRawMaterials();
    };
    bootstrap();
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
        console.log('Raw materials from API:', rawMaterials); // Debug log
        const formattedMaterials = rawMaterials.map(material => ({
          logo: logo,
          name: material.material_name,
          amountPerUnit: `${material.amount_per_unit}`,
          unitCost: material.unit_purchase_cost ? `PKR.${material.unit_purchase_cost}` : 'PKR.0.00',
          totalPurchaseCost: `PKR.${material.purchase_cost}`,
          invoiceLink: "Download Invoice",
          status: material.status === 'pending' ? 'Pending' : 'Delivered',
          amountPending: material.amount_pending ? `PKR.${material.amount_pending}` : 'None',
          materialId: material.id,
          amountPerUnitRaw: material.amount_per_unit,
          purchaseCostRaw: material.purchase_cost,
          unitCostRaw: material.unit_purchase_cost || 0,
          statusRaw: material.status,
          amountPendingRaw: material.amount_pending || 0,
          wasteQuantity: material.waste_quantity ? `${material.waste_quantity}` : '0.00',
          wasteQuantityRaw: material.waste_quantity || 0,
          lossCost: material.total_waste_cost ? `PKR.${material.total_waste_cost}` : 'PKR.0.00',
          totalWasteCostRaw: material.total_waste_cost || 0,
          billNumber: material.bill_number || 'N/A', // Include bill number from API
          paymentMethod: material.payment_method || 'N/A', // Include payment method
          paymentMethodNote: material.payment_method_note || '', // Include payment method note
          image: (() => {
            let imageUrl = material.image_url || null;
            if (imageUrl) {
              // Fix localhost URLs that might be missing port number
              if (imageUrl.includes('localhost') && !imageUrl.includes(':8000')) {
                imageUrl = imageUrl.replace('localhost', 'localhost:8000');
              }
              console.log(`Material "${material.material_name}" image_url:`, imageUrl, 'Original:', material.image_url); // Debug log
            }
            return imageUrl;
          })(), // Use the absolute URL from API response
          supplierName: (material.supplier && material.supplier.supplier_name)
            || (typeof material.supplier_name === 'string' && material.supplier_name)
            || (() => {
                 const sid = material.supplier_id || (material.supplier && material.supplier.id);
                 const found = suppliers.find(s => s.id === sid);
                 return found ? found.name : '—';
               })(),
          supplierIdRaw: material.supplier_id || (material.supplier && material.supplier.id) || null,
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

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material/suppliers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || 'Failed to fetch suppliers');
      const dataArr = Array.isArray(json) ? json : (json.data || []);
      const list = dataArr.map(s => ({ id: s.id, name: s.supplier_name }));
      setSuppliers(list);
    } catch (e) {
      console.error('Error fetching suppliers:', e);
      setSuppliers([]);
    }
  };

  const recalcEditTotalIfPossible = (unitCostString, amountString) => {
    const unitCostNum = parseFloat(unitCostString);
    const amountNum = parseFloat(amountString);
    if (isFinite(unitCostNum) && isFinite(amountNum)) {
      setEditingMaterial((prev) => prev ? { ...prev, totalPurchaseCost: (unitCostNum * amountNum).toString() } : prev);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.amountPerUnit) return;
    // Require either unit cost or total purchase cost
    if (!newUnitPurchaseCost && !newMaterial.totalPurchaseCost) return;
    
    try {
      const token = localStorage.getItem('token');
      // Create FormData for multipart upload
      const formData = new FormData();
      
      const amount = parseFloat(newMaterial.amountPerUnit);
      const unitCost = newUnitPurchaseCost !== "" ? parseFloat(newUnitPurchaseCost) : undefined;
      const computedTotal = (typeof unitCost === 'number' && isFinite(unitCost) && isFinite(amount)) ? amount * unitCost : undefined;
      const providedTotal = newMaterial.totalPurchaseCost !== "" ? parseFloat(newMaterial.totalPurchaseCost) : undefined;
      
      // Add all form fields
      formData.append('material_name', newMaterial.name);
      formData.append('amount_per_unit', amount);
      if (unitCost !== undefined) formData.append('unit_purchase_cost', unitCost);
      formData.append('purchase_cost', computedTotal || providedTotal);
      formData.append('status', newMaterial.status);
      
      if (newMaterial.amountPending !== "") formData.append('amount_pending', parseFloat(newMaterial.amountPending));
      if (newMaterial.wasteQuantity !== "") formData.append('waste_quantity', parseFloat(newMaterial.wasteQuantity));
      if (newMaterial.totalWasteCost !== "") formData.append('total_waste_cost', parseFloat(newMaterial.totalWasteCost));
      if (newMaterial.supplierId) formData.append('supplier_id', newMaterial.supplierId);
      
      // Add payment method fields
      if (newMaterial.paymentMethod) formData.append('payment_method', newMaterial.paymentMethod);
      if (newMaterial.paymentMethodNote) formData.append('payment_method_note', newMaterial.paymentMethodNote);
      
      // Add image if selected
      if (newMaterial.image) formData.append('image', newMaterial.image);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        toast({
          title: "Raw Material Added Successfully",
          description: `Raw material "${data.material_name}" has been added to the system${data.bill_number ? ` with bill number ${data.bill_number}` : ''}.`,
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
          amountPending: "",
          wasteQuantity: "",
          totalWasteCost: "",
          supplierId: undefined,
          paymentMethod: "",
          paymentMethodNote: "",
          image: null
        });
        setNewUnitPurchaseCost("");
        
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
      id: material.materialId,
      name: material.name,
      amountPerUnit: material.amountPerUnitRaw.toString(),
      totalPurchaseCost: material.purchaseCostRaw.toString(),
      status: material.statusRaw,
      amountPending: material.amountPendingRaw ? material.amountPendingRaw.toString() : "",
      wasteQuantity: (material.wasteQuantityRaw !== undefined ? material.wasteQuantityRaw : "").toString(),
      totalWasteCost: (material.totalWasteCostRaw !== undefined ? material.totalWasteCostRaw : "").toString(),
      unitCostExisting: material.unitCostRaw ? material.unitCostRaw.toString() : "",
      supplierId: material.supplierIdRaw || undefined,
      paymentMethod: material.paymentMethod || "",
      paymentMethodNote: material.paymentMethodNote || "",
      image: null, // New image file (for upload)
      currentImage: material.image // Current image URL/path (for display)
    });
    setEditUnitPurchaseCost("");
    onEditOpen();
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial.name || !editingMaterial.amountPerUnit) return;
    
    try {
      const token = localStorage.getItem('token');
      // Create FormData for multipart upload
      const formData = new FormData();
      
      const amount = parseFloat(editingMaterial.amountPerUnit);
      const unitCost = editUnitPurchaseCost !== "" ? parseFloat(editUnitPurchaseCost) : undefined;
      const providedTotal = editingMaterial.totalPurchaseCost !== "" ? parseFloat(editingMaterial.totalPurchaseCost) : undefined;
      const computedTotal = (typeof unitCost === 'number' && isFinite(unitCost) && isFinite(amount)) ? amount * unitCost : undefined;
      
      // Add all form fields
      formData.append('material_name', editingMaterial.name);
      formData.append('amount_per_unit', amount);
      formData.append('status', editingMaterial.status);
      
      if (editingMaterial.amountPending !== "") formData.append('amount_pending', parseFloat(editingMaterial.amountPending));
      if (unitCost !== undefined) formData.append('unit_purchase_cost', unitCost);
      if (providedTotal !== undefined) formData.append('purchase_cost', providedTotal);
      else if (computedTotal !== undefined) formData.append('purchase_cost', computedTotal);
      
      if (editingMaterial.wasteQuantity !== undefined && editingMaterial.wasteQuantity !== "") {
        formData.append('waste_quantity', parseFloat(editingMaterial.wasteQuantity));
      }
      if (editingMaterial.totalWasteCost !== undefined && editingMaterial.totalWasteCost !== "") {
        formData.append('total_waste_cost', parseFloat(editingMaterial.totalWasteCost));
      }
      if (editingMaterial.supplierId) formData.append('supplier_id', editingMaterial.supplierId);
      
      // Add payment method fields
      if (editingMaterial.paymentMethod) formData.append('payment_method', editingMaterial.paymentMethod);
      if (editingMaterial.paymentMethodNote) formData.append('payment_method_note', editingMaterial.paymentMethodNote);
      
      // Add image if new one is selected
      if (editingMaterial.image) formData.append('image', editingMaterial.image);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material/${editingMaterial.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
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
        setEditUnitPurchaseCost("");
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

  const handleOpenWaste = (material) => {
    setWasteTarget(material);
    setWasteQuantity("");
    onWasteOpen();
  };

  const handleRecordWaste = async () => {
    if (!wasteTarget || !wasteQuantity || parseFloat(wasteQuantity) <= 0) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material/${wasteTarget.materialId}/waste`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ quantity: parseFloat(wasteQuantity) })
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Waste Recorded",
          description: data.message || "Waste recorded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchRawMaterials();
        onWasteClose();
      } else {
        toast({
          title: "Failed to Record Waste",
          description: (data && data.message) ? data.message : 'Unable to record waste',
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to record waste:', error);
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

  const handleDownloadInvoice = async (materialId, materialName, billNumber) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📄 Downloading invoice for material ID:', materialId, 'Bill Number:', billNumber);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/raw-material/${materialId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📥 Invoice response status:', response.status);

      if (response.ok) {
        // Get the blob data
        const blob = await response.blob();
        
        // Create download link with bill number in filename
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Use bill number in filename if available, otherwise fallback to material name and ID
        const fileName = billNumber && billNumber !== 'N/A' 
          ? `invoice-${billNumber}.pdf`
          : `invoice-${materialName.replace(/\s+/g, '-')}-${materialId}.pdf`;
          
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Invoice Downloaded",
          description: `Invoice for "${materialName}"${billNumber && billNumber !== 'N/A' ? ` (${billNumber})` : ''} has been downloaded successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorText = await response.text();
        console.error('Invoice download failed:', response.status, errorText);
        
        toast({
          title: "Download Failed",
          description: `Failed to download invoice. Server returned status ${response.status}.`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Invoice download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Unable to download invoice. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
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
                    unitCost={row.unitCost}
                    totalPurchaseCost={row.totalPurchaseCost}
                    supplierName={row.supplierName}
                    wasteQuantity={row.wasteQuantity}
                    lossCost={row.lossCost}
                    invoiceLink={row.invoiceLink}
                    status={row.status}
                    amountPending={row.amountPending}
                    materialId={row.materialId}
                    billNumber={row.billNumber}
                    paymentMethod={row.paymentMethod}
                    paymentMethodNote={row.paymentMethodNote}
                    image={row.image}
                    onEdit={() => handleEditMaterial(row)}
                    onDelete={() => handleDeleteMaterial(row)}
                    onWaste={() => handleOpenWaste(row)}
                    onDownloadInvoice={() => handleDownloadInvoice(row.materialId, row.name, row.billNumber)}
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
              
              <FormControl>
                <FormLabel color={textColor}>Total Purchase Cost (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder={'Enter total cost or leave blank to auto-calc'}
                  value={newMaterial.totalPurchaseCost}
                  onChange={(e) => setNewMaterial({...newMaterial, totalPurchaseCost: e.target.value})}
                />
                {(newMaterial.amountPerUnit && newUnitPurchaseCost) ? (
                  <Text fontSize='sm' color='gray.500' mt='4px'>
                    Auto: PKR.{(parseFloat(newUnitPurchaseCost || 0) * parseFloat(newMaterial.amountPerUnit || 0)).toFixed(2)}
                  </Text>
                ) : null}
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Unit Purchase Cost (PKR)</FormLabel>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='Enter cost per unit (optional)'
                  value={newUnitPurchaseCost}
                  onChange={(e) => setNewUnitPurchaseCost(e.target.value)}
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
                <FormLabel color={textColor}>Supplier (Optional)</FormLabel>
                <Select
                  placeholder='Select supplier'
                  value={newMaterial.supplierId || ''}
                  onChange={(e) => setNewMaterial({ ...newMaterial, supplierId: e.target.value ? parseInt(e.target.value) : undefined })}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
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

              <FormControl>
                <FormLabel color={textColor}>Payment Method</FormLabel>
                <Select
                  placeholder='Select payment method'
                  value={newMaterial.paymentMethod}
                  onChange={(e) => setNewMaterial({...newMaterial, paymentMethod: e.target.value})}>
                  <option value='cash'>Cash</option>
                  <option value='card'>Card</option>
                  <option value='bank_transfer'>Bank Transfer</option>
                  <option value='other'>Other</option>
                </Select>
              </FormControl>

              {newMaterial.paymentMethod === 'other' && (
                <FormControl>
                  <FormLabel color={textColor}>Payment Method Note</FormLabel>
                  <Input
                    placeholder='Specify payment method'
                    value={newMaterial.paymentMethodNote}
                    onChange={(e) => setNewMaterial({...newMaterial, paymentMethodNote: e.target.value})}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel color={textColor}>Material Image</FormLabel>
                <Input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setNewMaterial({...newMaterial, image: e.target.files[0]})}
                />
                {newMaterial.image && (
                  <Box mt="2">
                    <Text fontSize="sm" color="green.500">Image selected: {newMaterial.image.name}</Text>
                  </Box>
                )}
              </FormControl>

              {/* Waste fields are intentionally hidden on create */}
              
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
                    onChange={(e) => {
                      const nextAmount = e.target.value;
                      setEditingMaterial({...editingMaterial, amountPerUnit: nextAmount});
                      if (editUnitPurchaseCost) {
                        recalcEditTotalIfPossible(editUnitPurchaseCost, nextAmount);
                      }
                    }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Total Purchase Cost (PKR)</FormLabel>
                  <Input
                    type='number'
                    placeholder={'Enter total cost or leave blank to auto-calc'}
                    value={editingMaterial.totalPurchaseCost}
                    onChange={(e) => setEditingMaterial({...editingMaterial, totalPurchaseCost: e.target.value})}
                  />
                  {(editingMaterial.amountPerUnit && (editUnitPurchaseCost || editingMaterial.unitCostExisting)) ? (
                    <Text fontSize='sm' color='gray.500' mt='4px'>
                      Auto: PKR.{(
                        parseFloat((editUnitPurchaseCost || editingMaterial.unitCostExisting) || 0) *
                        parseFloat(editingMaterial.amountPerUnit || 0)
                      ).toFixed(2)}
                    </Text>
                  ) : null}
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Unit Purchase Cost (PKR)</FormLabel>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='Enter cost per unit (optional)'
                    value={editUnitPurchaseCost}
                    onChange={(e) => {
                      const nextUnit = e.target.value;
                      setEditUnitPurchaseCost(nextUnit);
                      recalcEditTotalIfPossible(nextUnit, editingMaterial.amountPerUnit);
                    }}
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
                  <FormLabel color={textColor}>Supplier (Optional)</FormLabel>
                  <Select
                    placeholder='Select supplier'
                    value={editingMaterial.supplierId || ''}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, supplierId: e.target.value ? parseInt(e.target.value) : undefined })}
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
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

                <FormControl>
                  <FormLabel color={textColor}>Waste Quantity</FormLabel>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='Enter waste quantity'
                    value={editingMaterial.wasteQuantity}
                    onChange={(e) => setEditingMaterial({...editingMaterial, wasteQuantity: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Total Waste Cost (PKR)</FormLabel>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='Enter total waste cost'
                    value={editingMaterial.totalWasteCost}
                    onChange={(e) => setEditingMaterial({...editingMaterial, totalWasteCost: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Payment Method</FormLabel>
                  <Select
                    placeholder='Select payment method'
                    value={editingMaterial.paymentMethod}
                    onChange={(e) => setEditingMaterial({...editingMaterial, paymentMethod: e.target.value})}>
                    <option value='cash'>Cash</option>
                    <option value='card'>Card</option>
                    <option value='bank_transfer'>Bank Transfer</option>
                    <option value='other'>Other</option>
                  </Select>
                </FormControl>

                {editingMaterial.paymentMethod === 'other' && (
                  <FormControl>
                    <FormLabel color={textColor}>Payment Method Note</FormLabel>
                    <Input
                      placeholder='Specify payment method'
                      value={editingMaterial.paymentMethodNote}
                      onChange={(e) => setEditingMaterial({...editingMaterial, paymentMethodNote: e.target.value})}
                    />
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel color={textColor}>Material Image</FormLabel>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={(e) => setEditingMaterial({...editingMaterial, image: e.target.files[0]})}
                  />
                  {editingMaterial.image && (
                    <Box mt="2">
                      <Text fontSize="sm" color="green.500">New image selected: {editingMaterial.image.name}</Text>
                    </Box>
                  )}
                  {editingMaterial.currentImage && !editingMaterial.image && (
                    <Box mt="2">
                      <Text fontSize="sm" color="gray.500">Current image: {editingMaterial.currentImage}</Text>
                    </Box>
                  )}
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

      {/* Record Waste Modal */}
      <Modal isOpen={isWasteOpen} onClose={onWasteClose} size='md' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent>
          <ModalHeader color={textColor}>Record Waste{wasteTarget ? ` - ${wasteTarget.name}` : ''}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl isRequired>
                <FormLabel color={textColor}>Waste Quantity</FormLabel>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='Enter quantity to set aside as waste'
                  value={wasteQuantity}
                  onChange={(e) => setWasteQuantity(e.target.value)}
                />
              </FormControl>

              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleRecordWaste}
              >
                RECORD WASTE
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default RawMaterialTable;
