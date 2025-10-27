// Chakra imports
import {
  Table,
  Tbody,
  Box,
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
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Menu,
  MenuButton,
  Switch,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import StockTableRow from "components/Tables/StockTableRow";
import ResponsiveTable from "components/Tables/ResponsiveTable";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv, FaRuler, FaTags, FaTrash, FaCog } from "react-icons/fa";
import { EditIcon, DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useSearch } from "contexts/SearchContext";
import { useDashboard } from "contexts/DashboardContext";
import { ApiService } from "services/apiService";
import { getHeaders } from "services/apiConfig";
import unitConversionService from "services/unitConversionService";

const Authors = ({ title, captions, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const { currentDashboard, isFactory } = useDashboard();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { filterData, isSearchActive } = useSearch();
  const { isOpen: isUnitOpen, onOpen: onUnitOpen, onClose: onUnitClose } = useDisclosure();
  const { isOpen: isCategoryOpen, onOpen: onCategoryOpen, onClose: onCategoryClose } = useDisclosure();
  const { isOpen: isCategoryManageOpen, onOpen: onCategoryManageOpen, onClose: onCategoryManageClose } = useDisclosure();
  const { isOpen: isEditProductionOpen, onOpen: onEditProductionOpen, onClose: onEditProductionClose } = useDisclosure();
  const [newStock, setNewStock] = React.useState({
    name: "",
    quantity: "",
    unit: "",
    customUnit: "",
    category: "",
    status: "in_stock",
    stockValue: "",
    itemPrice: "",
    secondaryUnit: "",
    conversionFactor: "",
    allowSecondarySales: false
  });
  const [editingStock, setEditingStock] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  const [newUnit, setNewUnit] = React.useState({
    unitName: "",
    unitMetric: "",
    customMetric: ""
  });
  const [customUnits, setCustomUnits] = React.useState([]);
  const [units, setUnits] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [rawMaterials, setRawMaterials] = React.useState([]);
  const [selectedRawMaterials, setSelectedRawMaterials] = React.useState([]);
  const [selectedComponents, setSelectedComponents] = React.useState([]);
  const [newCategory, setNewCategory] = React.useState({
    categoryName: "",
    serialAlias: ""
  });
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [stockData, setStockData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [shouldProduceImmediately, setShouldProduceImmediately] = React.useState(false);
  const [immediateProductionQuantity, setImmediateProductionQuantity] = React.useState("");
  const [productionValidation, setProductionValidation] = React.useState({
    isValid: true,
    errors: [],
    insufficientMaterials: []
  });
  const [editingStockProduction, setEditingStockProduction] = React.useState(null);
  const [editProductionQuantity, setEditProductionQuantity] = React.useState("");
  const [editSelectedRawMaterials, setEditSelectedRawMaterials] = React.useState([]);
  const [editSelectedComponents, setEditSelectedComponents] = React.useState([]);
  const [editProductionValidation, setEditProductionValidation] = React.useState({
    isValid: true,
    errors: [],
    insufficientMaterials: [],
    insufficientComponents: []
  });
  const [unitConversions, setUnitConversions] = React.useState([]);
  
  // Auto-calc helpers for stock value
  const recalcAddStockValue = (nextItemPrice, nextQuantity, nextProducedQty) => {
    const price = parseFloat(nextItemPrice);
    const baseQty = parseFloat(nextQuantity);
    const produced = parseFloat((nextProducedQty ?? immediateProductionQuantity) || 0);
    const qty = (isFinite(baseQty) ? baseQty : 0) + (shouldProduceImmediately && isFinite(produced) ? produced : 0);
    if (isFinite(price) && isFinite(qty)) {
      setNewStock((prev) => ({ ...prev, stockValue: (price * qty).toString() }));
    }
  };

  const recalcEditStockValue = (nextItemPrice, nextQuantity) => {
    const price = parseFloat(nextItemPrice);
    const qty = parseFloat(nextQuantity);
    if (isFinite(price) && isFinite(qty)) {
      setEditingStock((prev) => ({ ...prev, stockValue: (price * qty).toString() }));
    }
  };
  
  // Fetch units, categories, raw materials, and stock data on component mount
  React.useEffect(() => {
    fetchUnits();
    fetchCategories();
    fetchRawMaterials();
    fetchStock();
    fetchUnitConversions();
  }, []);

  const fetchUnitConversions = async () => {
    try {
      const data = await unitConversionService.getUnitConversions();
      if (data.data) {
        setUnitConversions(data.data);
      } else {
        setUnitConversions([]);
      }
    } catch (error) {
      console.error('Error fetching unit conversions:', error);
      setUnitConversions([]);
    }
  };

  const fetchUnits = async () => {
    try {
      const apiService = new ApiService(currentDashboard);
      const data = await apiService.getUnits();
      
      if (data.data) {
        const formattedUnits = data.data.map(unit => ({
          unitName: unit.unit_name,
          unitMetric: unit.metric,
          unitId: unit.unit_id
        }));
        setCustomUnits(formattedUnits);
        setUnits(data.data);
      } else {
        console.error('Failed to fetch units');
        setUnits([]);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const apiService = new ApiService(currentDashboard);
      const data = await apiService.getCategories();
      
      if (data.data) {
        const formattedCategories = data.data.map(category => ({
          categoryId: category.category_id,
          categoryName: category.category_name,
          serialAlias: category.serial_alias || null
        }));
        setCategories(formattedCategories);
      } else {
        console.error('Failed to fetch categories');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchRawMaterials = async () => {
    try {
      if (!isFactory) {
        setRawMaterials([]);
        return;
      }
      
      const apiService = new ApiService(currentDashboard);
      const data = await apiService.getRawMaterials();
      
      if (data.data) {
        const formattedRawMaterials = data.data.map(material => ({
          materialId: material.id,
          materialName: material.material_name,
          amountPerUnit: material.amount_per_unit,
          purchaseCost: material.purchase_cost
        }));
        setRawMaterials(formattedRawMaterials);
      } else {
        console.error('Failed to fetch raw materials');
        setRawMaterials([]);
      }
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      setRawMaterials([]);
    }
  };

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const apiService = new ApiService(currentDashboard);
      const data = await apiService.getStock();
      
      if (data.data && Array.isArray(data.data)) {
        const formattedStock = data.data.map(item => ({
          logo: logo,
          name: item.item_name,
          serialNumber: item.serial_number || '-',
          quantity: `${item.quantity_per_unit || 0} ${item.unit?.unit_name || 'Units'}`,
          itemPrice: item.item_price && !isNaN(parseFloat(item.item_price)) ? `PKR.${parseFloat(item.item_price).toFixed(2)}` : 'PKR.0.00',
          category: item.category?.category_name || 'Uncategorized',
          status: item.stock_status === 'in_stock' ? 'In Stock' : 
                  item.stock_status === 'out_of_stock' ? 'Out of Stock' : 
                  item.stock_status === 'pending' ? 'Pending' : 'In Stock',
          stockValue: item.stock_value && !isNaN(parseFloat(item.stock_value)) ? `PKR.${parseFloat(item.stock_value).toFixed(2)}` : 'PKR.0.00',
          totalSold: item.total_sold && !isNaN(parseFloat(item.total_sold)) ? `${parseFloat(item.total_sold).toFixed(0)}` : '0',
          totalProfit: item.total_profit && !isNaN(parseFloat(item.total_profit)) ? `PKR.${parseFloat(item.total_profit).toFixed(2)}` : 'PKR.0.00',
          canBeComponent: item.can_be_component || false,
          itemId: item.item_id,
          unitId: item.unit_id,
          categoryId: item.category_id,
          quantityPerUnit: item.quantity_per_unit,
          stockValueRaw: item.stock_value || 0,
          stockStatusRaw: item.stock_status || 'in_stock',
          itemPriceRaw: item.item_price || 0,
          totalSoldRaw: item.total_sold || 0,
          totalProfitRaw: item.total_profit || 0,
          // Secondary unit conversion fields
          secondaryUnitId: item.secondary_unit_id || null,
          secondaryUnit: item.secondaryUnit?.unit_name || null,
          conversionFactor: item.conversion_factor || null,
          allowSecondarySales: item.allow_secondary_sales || false,
          availableSecondaryQuantity: item.available_secondary_quantity || null
        }));
        console.log('Formatted stock data:', formattedStock);
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

  const handleRawMaterialToggle = (materialId, isChecked) => {
    if (isChecked) {
      // Add material with empty quantity
      setSelectedRawMaterials([
        ...selectedRawMaterials,
        { materialId: materialId, quantity: '' }
      ]);
    } else {
      // Remove material
      setSelectedRawMaterials(selectedRawMaterials.filter(item => item.materialId !== materialId));
    }
  };

  const handleRawMaterialQuantityChange = (materialId, quantity) => {
    setSelectedRawMaterials(selectedRawMaterials.map(item => 
      item.materialId === materialId 
        ? { ...item, quantity: quantity }
        : item
    ));
    
    // Re-validate if production is enabled
    if (shouldProduceImmediately && immediateProductionQuantity) {
      validateProductionRequirements(parseFloat(immediateProductionQuantity) || 0);
    }
  };

  // Components selection for Add Stock modal
  const handleComponentToggle = (componentId, isChecked) => {
    if (isChecked) {
      setSelectedComponents([
        ...selectedComponents,
        { componentId, quantity: '' }
      ]);
    } else {
      setSelectedComponents(selectedComponents.filter(c => c.componentId !== componentId));
    }
    
    // Re-validate if production is enabled
    if (shouldProduceImmediately && immediateProductionQuantity) {
      setTimeout(() => validateProductionRequirements(parseFloat(immediateProductionQuantity) || 0), 0);
    }
  };

  const handleComponentQuantityChange = (componentId, quantity) => {
    setSelectedComponents(selectedComponents.map(c =>
      c.componentId === componentId ? { ...c, quantity } : c
    ));
    
    // Re-validate if production is enabled
    if (shouldProduceImmediately && immediateProductionQuantity) {
      validateProductionRequirements(parseFloat(immediateProductionQuantity) || 0);
    }
  };

  const validateProductionRequirements = (productionQty) => {
    if (!productionQty || productionQty <= 0 || (selectedRawMaterials.length === 0 && selectedComponents.length === 0)) {
      setProductionValidation({ isValid: true, errors: [], insufficientMaterials: [] });
      return true;
    }

    const insufficientMaterials = [];
    
    // Check raw materials
    selectedRawMaterials.forEach(selectedMaterial => {
      const rawMaterial = rawMaterials.find(rm => rm.materialId === selectedMaterial.materialId);
      if (rawMaterial && selectedMaterial.quantity) {
        const requiredQuantity = parseFloat(selectedMaterial.quantity) * productionQty;
        const availableQuantity = parseFloat(rawMaterial.amountPerUnit || 0);
        
        if (requiredQuantity > availableQuantity) {
          insufficientMaterials.push({
            materialName: rawMaterial.materialName,
            required: requiredQuantity,
            available: availableQuantity,
            deficit: requiredQuantity - availableQuantity,
            type: 'raw_material'
          });
        }
      }
    });

    // Check components
    selectedComponents.forEach(selectedComponent => {
      const component = stockData.find(s => s.itemId === selectedComponent.componentId);
      if (component && selectedComponent.quantity) {
        const requiredQuantity = parseFloat(selectedComponent.quantity) * productionQty;
        const availableQuantity = parseFloat(component.quantity || 0);
        
        if (requiredQuantity > availableQuantity) {
          insufficientMaterials.push({
            materialName: component.name,
            required: requiredQuantity,
            available: availableQuantity,
            deficit: requiredQuantity - availableQuantity,
            type: 'component'
          });
        }
      }
    });

    const isValid = insufficientMaterials.length === 0;
    setProductionValidation({
      isValid,
      errors: isValid ? [] : ['Insufficient raw materials or components for production'],
      insufficientMaterials
    });

    return isValid;
  };

  const handleProductionCheckboxChange = (isChecked) => {
    setShouldProduceImmediately(isChecked);
    
    if (isChecked && immediateProductionQuantity) {
      // Validate immediately when enabling production
      validateProductionRequirements(parseFloat(immediateProductionQuantity) || 0);
    } else {
      // Reset validation when disabling production
      setProductionValidation({ isValid: true, errors: [], insufficientMaterials: [] });
    }
  };

  const handleProductionQuantityChange = (valueString) => {
    setImmediateProductionQuantity(valueString);
    
    if (shouldProduceImmediately) {
      validateProductionRequirements(parseFloat(valueString) || 0);
      if (newStock.itemPrice) {
        recalcAddStockValue(newStock.itemPrice, newStock.quantity || 0, valueString);
      }
    }
  };

  const handleViewComponents = async (stockItem) => {
    try {
      const components = await fetchStockComponents(stockItem.itemId);
      
      if (components.length === 0) {
        toast({
          title: "No Components",
          description: `${stockItem.name} has no components defined.`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create a formatted message showing all components
      const componentsList = components.map(comp => 
        `• ${comp.item_name}: ${comp.quantity} units`
      ).join('\n');

      toast({
        title: `Components for ${stockItem.name}`,
        description: componentsList,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error viewing components:', error);
      toast({
        title: "Error",
        description: "Failed to fetch components.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openEditProductionModal = async (stockItem) => {
    setEditingStockProduction(stockItem);
    setEditProductionQuantity("");
    setEditSelectedRawMaterials([]);
    setEditSelectedComponents([]);
    
    // Fetch current raw material mappings for this stock item
    await fetchStockRawMaterials(stockItem.itemId);
    
    // Fetch current component mappings for this stock item
    const components = await fetchStockComponents(stockItem.itemId);
    if (components && components.length > 0) {
      const formattedComponents = components.map(comp => ({
        componentId: comp.component_stock_id,
        componentName: comp.item_name,
        quantity: comp.quantity ? parseFloat(comp.quantity) : ''
      }));
      setEditSelectedComponents(formattedComponents);
    }
    
    onEditProductionOpen();
  };

  const fetchStockComponents = async (stockId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${stockId}/components`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.components || [];
      } else {
        console.error('Failed to fetch stock components');
        return [];
      }
    } catch (error) {
      console.error('Error fetching stock components:', error);
      return [];
    }
  };

  const fetchStockRawMaterials = async (stockId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${stockId}/raw-materials`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const mappedMaterials = data.raw_materials.map(material => ({
          materialId: material.raw_material_id,
          quantity: material.quantity ? parseFloat(material.quantity) : ''
        }));
        setEditSelectedRawMaterials(mappedMaterials);
      } else {
        // No raw materials mapped to this stock item
        setEditSelectedRawMaterials([]);
      }
    } catch (error) {
      console.error('Failed to fetch stock raw materials:', error);
      setEditSelectedRawMaterials([]);
    }
  };

  const handleEditRawMaterialToggle = (materialId, isChecked) => {
    if (isChecked) {
      // Add material with empty quantity
      setEditSelectedRawMaterials([
        ...editSelectedRawMaterials,
        { materialId: materialId, quantity: '' }
      ]);
    } else {
      // Remove material
      setEditSelectedRawMaterials(editSelectedRawMaterials.filter(item => item.materialId !== materialId));
    }
    
    // Re-validate if production quantity is set
    if (editProductionQuantity) {
      validateEditProductionRequirements(parseFloat(editProductionQuantity) || 0);
    }
  };

  const handleEditRawMaterialQuantityChange = (materialId, quantity) => {
    setEditSelectedRawMaterials(editSelectedRawMaterials.map(item => 
      item.materialId === materialId 
        ? { ...item, quantity: quantity }
        : item
    ));
    
    // Re-validate if production quantity is set
    if (editProductionQuantity) {
      validateEditProductionRequirements(parseFloat(editProductionQuantity) || 0);
    }
  };

  const handleEditComponentToggle = (componentId, componentName, isChecked) => {
    if (isChecked) {
      // Add component with empty quantity
      setEditSelectedComponents([
        ...editSelectedComponents,
        { componentId: componentId, componentName: componentName, quantity: '' }
      ]);
    } else {
      // Remove component
      setEditSelectedComponents(editSelectedComponents.filter(item => item.componentId !== componentId));
    }
    
    // Re-validate if production quantity is set
    if (editProductionQuantity) {
      validateEditProductionRequirements(parseFloat(editProductionQuantity) || 0);
    }
  };

  const handleEditComponentQuantityChange = (componentId, quantity) => {
    setEditSelectedComponents(editSelectedComponents.map(item => 
      item.componentId === componentId 
        ? { ...item, quantity: quantity }
        : item
    ));
    
    // Re-validate if production quantity is set
    if (editProductionQuantity) {
      validateEditProductionRequirements(parseFloat(editProductionQuantity) || 0);
    }
  };

  const validateEditProductionRequirements = (productionQty) => {
    if (!productionQty || productionQty <= 0 || (editSelectedRawMaterials.length === 0 && editSelectedComponents.length === 0)) {
      setEditProductionValidation({ isValid: true, errors: [], insufficientMaterials: [], insufficientComponents: [] });
      return true;
    }

    const insufficientMaterials = [];
    const insufficientComponents = [];
    
    // Validate raw materials
    editSelectedRawMaterials.forEach(selectedMaterial => {
      const rawMaterial = rawMaterials.find(rm => rm.materialId === selectedMaterial.materialId);
      if (rawMaterial) {
        const requiredQuantity = selectedMaterial.quantity * productionQty;
        const availableQuantity = rawMaterial.amountPerUnit;
        
        if (requiredQuantity > availableQuantity) {
          insufficientMaterials.push({
            materialName: rawMaterial.materialName,
            required: requiredQuantity,
            available: availableQuantity,
            deficit: requiredQuantity - availableQuantity
          });
        }
      }
    });

    // Validate components
    editSelectedComponents.forEach(selectedComponent => {
      const component = stockData.find(c => c.itemId === selectedComponent.componentId);
      if (component) {
        const required = selectedComponent.quantity * productionQty;
        const available = parseFloat(component.quantity.split(' ')[0]) || 0; // Extract number from "40 Piece" format
        const deficit = Math.max(0, required - available);
        
        if (deficit > 0) {
          insufficientComponents.push({
            componentName: component.name,
            required: required.toFixed(2),
            available: available.toFixed(2),
            deficit: deficit.toFixed(2)
          });
        }
      }
    });

    const isValid = insufficientMaterials.length === 0 && insufficientComponents.length === 0;
    setEditProductionValidation({
      isValid,
      errors: isValid ? [] : ['Insufficient materials or components for production'],
      insufficientMaterials,
      insufficientComponents
    });

    return isValid;
  };

  const handleEditProductionQuantityChange = (valueString) => {
    setEditProductionQuantity(valueString);
    validateEditProductionRequirements(parseFloat(valueString) || 0);
  };

  const handleUpdateProduction = async () => {
    if (!editingStockProduction || !editProductionQuantity || parseFloat(editProductionQuantity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid production quantity.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!editProductionValidation.isValid) {
      toast({
        title: "Cannot Produce",
        description: "Insufficient materials or components for production.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // First, update the raw material mappings if they changed
      if (editSelectedRawMaterials.length > 0) {
        await updateStockRawMaterials(editingStockProduction.itemId, editSelectedRawMaterials);
      }

      // Update component mappings if they changed
      if (editSelectedComponents.length > 0) {
        const token = localStorage.getItem('token');
        const componentsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${editingStockProduction.itemId}/components`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            items: editSelectedComponents.map(comp => ({
              component_stock_id: comp.componentId,
              quantity: comp.quantity
            }))
          }),
        });

        if (!componentsResponse.ok) {
          console.error('Failed to update components');
        }
      }

      // Then produce the stock
      await produceStockFromEdit(editingStockProduction.itemId, editingStockProduction.name, parseFloat(editProductionQuantity));

      // Close modal and refresh data
      setEditingStockProduction(null);
      setEditProductionQuantity("");
      setEditSelectedRawMaterials([]);
      setEditSelectedComponents([]);
      setEditProductionValidation({ isValid: true, errors: [], insufficientMaterials: [], insufficientComponents: [] });
      onEditProductionClose();
      fetchStock();

    } catch (error) {
      console.error('Failed to update production:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update production settings.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const updateStockRawMaterials = async (stockId, rawMaterialMappings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${stockId}/raw-materials`, {
        method: 'PUT', // Use PUT to replace all mappings
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          items: rawMaterialMappings.map(mapping => ({
            raw_material_id: mapping.materialId,
            quantity: mapping.quantity
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update raw material mappings');
      }
    } catch (error) {
      console.error('Error updating raw materials:', error);
      throw error;
    }
  };

  const produceStockFromEdit = async (stockId, stockName, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${stockId}/produce`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          quantity: quantity
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show detailed success message with consumption info
        let consumptionDetails = "";
        if (data.consumed && data.consumed.length > 0) {
          consumptionDetails = "\n\nRaw materials consumed:\n" + 
            data.consumed.map(item => `• ${item.material_name}: ${item.quantity} units`).join('\n');
        }

        toast({
          title: "Production Updated & Completed!",
          description: `Updated mappings and produced ${data.produced} units of "${stockName}".${consumptionDetails}`,
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      } else {
        throw new Error(data.message || 'Production failed');
      }
    } catch (error) {
      console.error('Failed to produce stock from edit:', error);
      throw error;
    }
  };


  const produceStockImmediately = async (stockId, stockName, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${stockId}/produce`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          quantity: quantity
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show detailed success message with consumption info
        let consumptionDetails = "";
        if (data.consumed && data.consumed.length > 0) {
          consumptionDetails = "\n\nRaw materials consumed:\n" + 
            data.consumed.map(item => `• ${item.material_name}: ${item.quantity} units`).join('\n');
        }

        toast({
          title: "Stock Created & Production Completed!",
          description: `Created "${stockName}" and produced ${data.produced} units.${consumptionDetails}`,
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      } else {
        // Handle specific error cases
        let errorTitle = "Production Failed After Stock Creation";
        let errorDescription = data.message || 'Failed to produce stock';
        
        if (data.insufficient && data.insufficient.length > 0) {
          errorTitle = "Insufficient Raw Materials for Production";
          errorDescription = "Stock was created but production failed:\n" + 
            data.insufficient.map(item => 
              `• ${item.material_name}: Need ${item.required}, have ${item.available} (deficit: ${item.deficit})`
            ).join('\n');
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          status: "warning",
          duration: 8000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to produce stock immediately:', error);
      toast({
        title: "Production Error After Stock Creation",
        description: "Stock was created successfully, but production failed due to network error.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Stock management captions
  const stockCaptions = ["Products", "SERIAL", "QUANTITY PER UNIT", "ITEM PRICE", "CATEGORY", "STATUS", "Stock Value", "TOTAL SOLD", "TOTAL PROFIT", "TYPE", ""];

  const handleAddStock = async () => {
    if (!newStock.name || !newStock.unit || !newStock.category) return;
    
    try {
      const apiService = new ApiService(currentDashboard);
      
      // Find or create unit id
      let selectedUnit = customUnits.find(unit => unit.unitName === newStock.unit);
      let unitId = selectedUnit ? selectedUnit.unitId : null;

      if (!unitId && newStock.unit === 'Custom') {
        if (!newStock.customUnit) {
          toast({ title: "Invalid Unit", description: "Please enter a custom unit name.", status: "error", duration: 3000, isClosable: true });
          return;
        }
        // Create custom unit first
        const unitData = await apiService.addUnit({
          unit_name: newStock.customUnit,
          metric: newStock.customUnit,
          custom_metric: null
        });
        unitId = unitData.data.unit_id;
        setCustomUnits(prev => [...prev, { unitName: unitData.data.unit_name, unitMetric: unitData.data.metric, unitId: unitData.data.unit_id }]);
        setNewStock(prev => ({ ...prev, unit: unitData.data.unit_name }));
      }
      
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
      
      const response = await apiService.addStock({
        item_name: newStock.name,
        unit_id: unitId,
        category_id: categoryId,
        quantity_per_unit: newStock.quantity ? parseFloat(newStock.quantity) : 0,
        item_price: newStock.itemPrice ? parseFloat(newStock.itemPrice) : null,
        stock_value: newStock.stockValue ? parseFloat(newStock.stockValue) : null,
        stock_status: newStock.status,
        // Secondary unit conversion fields - only for Factory dashboard
        ...(isFactory && newStock.secondaryUnit ? {
          secondary_unit_id: parseInt(newStock.secondaryUnit),
          conversion_factor: newStock.conversionFactor ? parseFloat(newStock.conversionFactor) : null,
          allow_secondary_sales: newStock.allowSecondarySales || false
        } : {}),
      });

      if (response.success) {
        // Show success message
        toast({
          title: "Stock Item Added Successfully",
          description: `Stock item "${response.data.item_name}" has been added to the system.`,
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
          stockValue: "",
          itemPrice: "",
          secondaryUnit: "",
          conversionFactor: "",
          allowSecondarySales: false
        });
        
        // Refresh stock data
        fetchStock();
        onClose();
      } else {
        // Handle API errors
        const errorMessage = response.message || 'Failed to add stock item';
        toast({
          title: "Failed to Add Stock Item",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
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

  const handleEditStock = async (stock, index) => {
    // Parse the quantity to separate number and unit
    const quantityMatch = stock.quantity.match(/^(\d+\.?\d*)\s+(.+)$/);
    const quantity = quantityMatch ? quantityMatch[1] : "";
    const unit = quantityMatch ? quantityMatch[2] : "";
    
    // Parse stock value to remove PKR. prefix
    const stockValue = stock.stockValue.replace("PKR.", "");
    
    // Determine if unit is custom or predefined
    const predefinedUnits = ["Units", "Kilograms", "Grams", "Liters", "Milliliters", "Meters", "Centimeters", "Pieces"];
    const isCustomUnit = !predefinedUnits.includes(unit);
    
    // Fetch components for this stock item
    const components = await fetchStockComponents(stock.itemId);
    
    setEditingStock({
      name: stock.name,
      quantity: quantity,
      unit: isCustomUnit ? "Custom" : unit,
      customUnit: isCustomUnit ? unit : "",
      category: stock.category,
      status: stock.stockStatusRaw,
      stockValue: stockValue,
      itemId: stock.itemId,
      itemPrice: stock.itemPriceRaw,
      canBeComponent: stock.canBeComponent || false,
      components: components || [],
      selectedComponent: "",
      selectedComponentName: "",
      newComponentQuantity: "",
      secondaryUnit: stock.secondaryUnitId || "",
      conversionFactor: stock.conversionFactor || "",
      allowSecondarySales: stock.allowSecondarySales || false
    });
    setEditIndex(index);
    onEditOpen();
  };

  const handleUpdateStock = async () => {
    if (!editingStock.name || !editingStock.quantity || !editingStock.category) return;
    
    try {
      let unitId = null;
      
      // Handle predefined units
      const predefinedUnits = ["Units", "Kilograms", "Grams", "Liters", "Milliliters", "Meters", "Centimeters", "Pieces"];
      if (predefinedUnits.includes(editingStock.unit)) {
        // For predefined units, we need to find them in the units array
        const predefinedUnit = units.find(unit => unit.unit_name === editingStock.unit);
        unitId = predefinedUnit ? predefinedUnit.unit_id : null;
      } else if (editingStock.unit === "Custom") {
        // For custom units, use the custom unit name
        const customUnit = customUnits.find(unit => unit.unitName === editingStock.customUnit);
        unitId = customUnit ? customUnit.unitId : null;
        
        // If custom unit doesn't exist, create it first
        if (!unitId && editingStock.customUnit) {
          try {
            const createUnitResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/unit`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                unit_name: editingStock.customUnit,
                unit_metric: 'Custom'
              }),
            });
            
            if (createUnitResponse.ok) {
              const newUnit = await createUnitResponse.json();
              unitId = newUnit.unit_id;
              // Refresh units list
              fetchUnits();
            }
          } catch (error) {
            console.error('Error creating custom unit:', error);
          }
        }
      } else {
        // For other units (existing custom units)
        const existingUnit = customUnits.find(unit => unit.unitName === editingStock.unit);
        unitId = existingUnit ? existingUnit.unitId : null;
      }
      
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
      
      const apiService = new ApiService(currentDashboard);
      const data = await apiService.updateStock(editingStock.itemId, {
        item_name: editingStock.name,
        unit_id: unitId,
        category_id: categoryId,
        quantity_per_unit: parseFloat(editingStock.quantity),
        item_price: editingStock.itemPrice ? parseFloat(editingStock.itemPrice) : undefined,
        stock_value: editingStock.stockValue ? parseFloat(editingStock.stockValue) : null,
        stock_status: editingStock.status,
        can_be_component: editingStock.canBeComponent || false,
        // Secondary unit conversion fields - only for Factory dashboard
        ...(isFactory && editingStock.secondaryUnit ? {
          secondary_unit_id: parseInt(editingStock.secondaryUnit),
          conversion_factor: editingStock.conversionFactor ? parseFloat(editingStock.conversionFactor) : null,
          allow_secondary_sales: editingStock.allowSecondarySales || false
        } : {})
      });

      if (data.success || data.data) {
        // Update components if any
        if (editingStock.components && editingStock.components.length > 0) {
          try {
            const componentsResponse = await fetch(`${apiService.baseURL}/stock/${editingStock.itemId}/components`, {
              method: 'PUT',
              headers: getHeaders(),
              body: JSON.stringify({
                items: editingStock.components.map(comp => ({
                  component_stock_id: comp.component_stock_id,
                  quantity: comp.quantity
                }))
              }),
            });

            if (!componentsResponse.ok) {
              console.error('Failed to update components');
            }
          } catch (error) {
            console.error('Error updating components:', error);
          }
        }

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
      const apiService = new ApiService(currentDashboard);
      const data = await apiService.addUnit({
        unit_name: newUnit.unitName,
        metric: finalMetric,
        custom_metric: newUnit.unitMetric === "Custom" ? newUnit.customMetric : null
      });

      if (data.success || data.data) {
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
      const apiService = new ApiService(currentDashboard);
      const data = await apiService.addCategory({
        category_name: newCategory.categoryName,
        serial_alias: newCategory.serialAlias || undefined
      });

      if (data.success || data.data) {
        // Add to categories list with API response data
        const categoryData = {
          categoryId: data.category_id,
          categoryName: data.category_name,
          serialAlias: data.serial_alias || null
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
          categoryName: "",
          serialAlias: ""
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

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.categoryName) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/category/${editingCategory.categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          category_name: editingCategory.categoryName,
          serial_alias: editingCategory.serialAlias || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update categories list
        setCategories(categories.map(cat => 
          cat.categoryId === editingCategory.categoryId 
            ? {
                categoryId: data.data.category_id,
                categoryName: data.data.category_name,
                serialAlias: data.data.serial_alias || null
              }
            : cat
        ));
        
        toast({
          title: "Category Updated Successfully",
          description: `Category "${data.data.category_name}" has been updated.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        setEditingCategory(null);
      } else {
        const errorMessage = data.message || 'Failed to update category';
        toast({
          title: "Failed to Update Category",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/category/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from categories list
        setCategories(categories.filter(cat => cat.categoryId !== categoryId));
        
        toast({
          title: "Category Deleted Successfully",
          description: `Category "${categoryName}" has been removed.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const data = await response.json();
        const errorMessage = data.message || 'Failed to delete category';
        toast({
          title: "Failed to Delete Category",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const mapRawMaterialsToStock = async (stockId, rawMaterialMappings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${stockId}/raw-materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          items: rawMaterialMappings.map(mapping => ({
            raw_material_id: mapping.materialId,
            quantity: mapping.quantity
          }))
        }),
      });

      if (response.ok) {
        console.log('Raw materials mapped successfully');
      } else {
        console.error('Failed to map raw materials to stock');
      }
    } catch (error) {
      console.error('Error mapping raw materials:', error);
    }
  };

  const mapComponentsToStock = async (stockId, componentMappings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/stock/${stockId}/components`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          items: componentMappings.map(m => ({ component_stock_id: m.componentId, quantity: m.quantity }))
        })
      });
      if (!response.ok) {
        console.error('Failed to map components to stock');
      }
    } catch (e) {
      console.error('Error mapping components:', e);
    }
  };

  const handleDeleteStock = async (stockItem) => {
    if (!window.confirm(`Are you sure you want to delete "${stockItem.name}"?`)) {
      return;
    }
    
    try {
      const apiService = new ApiService(currentDashboard);
      const response = await apiService.deleteStock(stockItem.itemId);

      if (response.success || response.data) {
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
    <Box pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex justify='space-between' align='center' w='100%'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Stock Management
          </Text>
          <Flex direction={{ base: "column", sm: "row" }} gap="8px">
            {/* Desktop: Show all buttons */}
            <HStack spacing='12px' display={{ base: "none", md: "flex" }}>
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
                onClick={onCategoryManageOpen}>
                MANAGE CATEGORIES
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
            
            {/* Mobile/Tablet: Dropdown menu */}
            <Box display={{ base: "block", md: "none" }}>
              <Menu>
                <MenuButton as={Button} rightIcon={<HamburgerIcon />} size="sm" variant="outline" colorScheme="teal" borderColor='#FF8D28' color='#FF8D28'>
                  Actions
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FaPlus />} onClick={onOpen}>
                    Add New Stock
                  </MenuItem>
                  <MenuItem icon={<FaTags />} onClick={onCategoryManageOpen}>
                    Manage Categories
                  </MenuItem>
                  <MenuItem icon={<FaRuler />} onClick={onUnitOpen}>
                    Add Unit
                  </MenuItem>
                  <MenuItem icon={<FaFileCsv />} onClick={handleImportCSV}>
                    Import CSV
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Flex>
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
        <ResponsiveTable
          captions={stockCaptions}
          data={filterData(stockData, ['name', 'quantity', 'itemPrice', 'category', 'status', 'stockValue', 'totalSold', 'totalProfit'])}
          isLoading={isLoading}
          actionButtons={[
            {
              label: "Edit",
              icon: <EditIcon />,
              onClick: (item, index) => handleEditStock(item, index),
            },
            {
              label: "Edit Production", 
              icon: <FaCog />,
              onClick: (item) => openEditProductionModal(item),
            },
            {
              label: "Delete",
              icon: <DeleteIcon />,
              onClick: (item) => handleDeleteStock(item),
              color: "red.500",
            },
          ]}
        >
          {filterData(stockData, ['name', 'quantity', 'itemPrice', 'category', 'status', 'stockValue', 'totalSold', 'totalProfit']).map((row, index) => (
            <StockTableRow
              key={`${row.name}-${index}`}
              logo={row.logo}
              name={row.name}
              serialNumber={row.serialNumber}
              quantity={row.quantity}
              itemPrice={row.itemPrice}
              category={row.category}
              status={row.status}
              stockValue={row.stockValue}
              totalSold={row.totalSold}
              totalProfit={row.totalProfit}
              canBeComponent={row.canBeComponent}
              onEdit={() => handleEditStock(row, index)}
              onDelete={() => handleDeleteStock(row)}
              onEditProduction={() => openEditProductionModal(row)}
              onViewComponents={() => handleViewComponents(row)}
              onProduce={() => openEditProductionModal(row)}
            />
          ))}
        </ResponsiveTable>
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
              
              <FormControl>
                <FormLabel color={textColor}>Quantity (Optional)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter initial quantity (or leave empty to produce later)'
                  value={newStock.quantity}
                  onChange={(e) => { setNewStock({...newStock, quantity: e.target.value}); if (newStock.itemPrice) recalcAddStockValue(newStock.itemPrice, e.target.value, immediateProductionQuantity); }}
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
                <FormLabel color={textColor}>Item Price (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter price per unit (optional)'
                  value={newStock.itemPrice}
                  onChange={(e) => { setNewStock({...newStock, itemPrice: e.target.value}); if (newStock.quantity) recalcAddStockValue(e.target.value, newStock.quantity, immediateProductionQuantity); }}
                />
              </FormControl>
              
               <FormControl>
                <FormLabel color={textColor}>Stock Value (PKR)</FormLabel>
                <Input
                  type='number'
                   placeholder='Enter stock value (optional)'
                  value={newStock.stockValue}
                  onChange={(e) => {
                    // Stock value is a manual override; do not feed it back into auto-calculation
                    setNewStock({...newStock, stockValue: e.target.value});
                  }}
                />
                {(newStock.itemPrice && (newStock.quantity || (shouldProduceImmediately && immediateProductionQuantity))) ? (
                  <Text fontSize='sm' color='gray.500' mt='4px'>
                    Auto: PKR.{(
                      parseFloat(newStock.itemPrice || 0) * (
                        (parseFloat(newStock.quantity || 0) || 0) + (shouldProduceImmediately ? parseFloat(immediateProductionQuantity || 0) : 0)
                      )
                    ).toFixed(2)}
                  </Text>
                ) : null}
              </FormControl>

              {/* Unit Conversion Section */}
              <Divider />
              <FormControl>
                <FormLabel color={textColor} fontSize="md" fontWeight="bold" mb="16px">
                  Secondary Unit (Optional)
                </FormLabel>
                <Text color="gray.500" fontSize="sm" mb="16px">
                  Set up unit conversion for selling in smaller units (e.g., sell KG in grams)
                </Text>
                
                <FormControl mb="12px">
                  <FormLabel color={textColor} fontSize="sm">Secondary Unit</FormLabel>
                  <Select
                    placeholder='Select secondary unit (optional)'
                    value={newStock.secondaryUnit}
                    onChange={(e) => setNewStock({...newStock, secondaryUnit: e.target.value})}>
                    {customUnits.map((unit, index) => (
                      <option key={index} value={unit.unitId}>
                        {unit.unitName} ({unit.unitMetric})
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                {newStock.secondaryUnit && (
                  <>
                    <FormControl mb="12px">
                      <FormLabel color={textColor} fontSize="sm">Conversion Factor</FormLabel>
                      <Input
                        type='number'
                        step='0.000001'
                        placeholder='e.g., 1000 (for 1 KG = 1000 grams)'
                        value={newStock.conversionFactor}
                        onChange={(e) => setNewStock({...newStock, conversionFactor: e.target.value})}
                      />
                      <Text fontSize='xs' color='gray.500' mt='4px'>
                        How many secondary units in 1 primary unit
                      </Text>
                    </FormControl>
                    
                    <FormControl mb="12px">
                      <Checkbox
                        isChecked={newStock.allowSecondarySales}
                        onChange={(e) => setNewStock({...newStock, allowSecondarySales: e.target.checked})}
                      >
                        <Text fontSize='sm' color={textColor}>
                          Allow selling in secondary units
                        </Text>
                      </Checkbox>
                    </FormControl>
                  </>
                )}
              </FormControl>

               {/* Raw Materials Selection */}
               <Divider />
               <FormControl>
                 <FormLabel color={textColor} fontSize="md" fontWeight="bold" mb="16px">
                   Raw Materials Required (Optional)
                 </FormLabel>
                 <Text color="gray.500" fontSize="sm" mb="16px">
                   Select the raw materials needed to produce this stock item and specify quantities:
                 </Text>
                 
                 {rawMaterials.length > 0 ? (
                   <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px" maxH="300px" overflowY="auto">
                     {rawMaterials.map((material) => {
                       const isSelected = selectedRawMaterials.some(item => item.materialId === material.materialId);
                       const selectedMaterial = selectedRawMaterials.find(item => item.materialId === material.materialId);
                       
                       return (
                         <VStack 
                           key={material.materialId} 
                           align="stretch" 
                           spacing="8px"
                           p="12px"
                           border="1px solid"
                           borderColor={isSelected ? "#FF8D28" : "gray.200"}
                           borderRadius="8px"
                           bg={isSelected ? "orange.50" : "transparent"}
                           transition="all 0.2s"
                         >
                           <Checkbox
                             colorScheme="orange"
                             isChecked={isSelected}
                             onChange={(e) => handleRawMaterialToggle(material.materialId, e.target.checked)}
                           >
                             <Text fontSize="sm" fontWeight="bold" color={textColor}>
                               {material.materialName}
                             </Text>
                           </Checkbox>
                           
                           <Text fontSize="xs" color="gray.500">
                             Available: {material.amountPerUnit} units @ PKR {material.purchaseCost}
                           </Text>
                           
                           {isSelected && (
                             <FormControl size="sm">
                               <FormLabel fontSize="xs" color={textColor}>Quantity Needed</FormLabel>
                                  <Input
                                    size="sm"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    value={selectedMaterial?.quantity}
                                    onChange={(e) => handleRawMaterialQuantityChange(material.materialId, e.target.value)}
                                  />
                             </FormControl>
                           )}
                         </VStack>
                       );
                     })}
                   </SimpleGrid>
                 ) : (
                   <Text color="gray.400" fontSize="sm" textAlign="center" py="20px">
                     No raw materials available. Add raw materials from the Factory Dashboard first.
                   </Text>
                 )}
               </FormControl>

             {/* Components Selection */}
             <Divider />
             <FormControl>
               <FormLabel color={textColor} fontSize="md" fontWeight="bold" mb="16px">
                 Components Required (Optional)
               </FormLabel>
               <Text color="gray.500" fontSize="sm" mb="16px">
                 Select existing products used as components and specify quantities per 1 unit of this product:
               </Text>
               {(() => {
                 const availableComponents = stockData.filter(item => item.canBeComponent);
                 return availableComponents.length > 0;
               })() ? (
                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px" maxH="300px" overflowY="auto">
                   {stockData.filter(item => item.canBeComponent).map((component) => {
                     const isSelected = selectedComponents.some(c => c.componentId === component.itemId);
                     const selected = selectedComponents.find(c => c.componentId === component.itemId);
                     return (
                       <VStack key={component.itemId} align="stretch" spacing="8px" p="12px" border="1px solid" borderColor={isSelected ? "#4CAF50" : "gray.200"} borderRadius="8px" bg={isSelected ? "green.50" : "transparent"} transition="all 0.2s">
                         <Checkbox colorScheme="green" isChecked={isSelected} onChange={(e) => handleComponentToggle(component.itemId, e.target.checked)}>
                           <Text fontSize="sm" fontWeight="bold" color={textColor}>{component.name}</Text>
                         </Checkbox>
                         <Text fontSize="xs" color="gray.500">Available: {component.quantity} | Price: {component.itemPrice}</Text>
                         {isSelected && (
                           <FormControl size="sm">
                             <FormLabel fontSize="xs" color={textColor}>Quantity Needed</FormLabel>
                             <Input size="sm" type="number" step="0.01" min="0" inputMode="decimal" value={selected?.quantity || ''} onChange={(e) => handleComponentQuantityChange(component.itemId, e.target.value)} />
                           </FormControl>
                         )}
                       </VStack>
                     );
                   })}
                 </SimpleGrid>
               ) : (
                 <Text color="gray.400" fontSize="sm" textAlign="center" py="20px">
                   No eligible components. Mark products as "Can be used as component" first.
                 </Text>
               )}
             </FormControl>

              {/* Immediate Production Section - at the bottom */}
              {(selectedRawMaterials.length > 0 || selectedComponents.length > 0) && (
                <>
                  <Divider />
                  <FormControl>
                    <Checkbox
                      colorScheme="orange"
                      isChecked={shouldProduceImmediately}
                      onChange={(e) => handleProductionCheckboxChange(e.target.checked)}
                      size="md"
                    >
                      <Text fontSize="md" fontWeight="bold" color={textColor}>
                        🏭 Produce immediately after creating stock item
                      </Text>
                    </Checkbox>
                    
                    <Text color="gray.500" fontSize="sm" mt="8px" ml="24px">
                      This will consume the selected raw materials and components and add the produced quantity to your initial stock.
                    </Text>
                  </FormControl>

                  {shouldProduceImmediately && (
                    <FormControl>
                      <FormLabel color={textColor} fontSize="sm">Production Quantity</FormLabel>
                      <NumberInput
                        size="md"
                        min={0.01}
                        step={0.01}
                        value={immediateProductionQuantity}
                        onChange={handleProductionQuantityChange}
                      >
                        <NumberInputField placeholder="Enter quantity to produce" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      
                      {/* Validation Errors */}
                      {!productionValidation.isValid && (
                        <VStack spacing="8px" mt="12px" align="stretch">
                          <Text fontSize="sm" color="red.500" fontWeight="bold">
                            ❌ Insufficient Materials/Components:
                          </Text>
                          {productionValidation.insufficientMaterials.map((material, index) => (
                            <Text key={index} fontSize="xs" color="red.600" ml="16px">
                              • [{material.type === 'component' ? 'Component' : 'Raw Material'}] {material.materialName}: Need {parseFloat(material.required || 0).toFixed(2)}, have {parseFloat(material.available || 0).toFixed(2)} 
                              (deficit: {parseFloat(material.deficit || 0).toFixed(2)})
                            </Text>
                          ))}
                        </VStack>
                      )}
                      
                      {productionValidation.isValid && immediateProductionQuantity && (
                        <Text fontSize="xs" color="green.600" mt="8px" fontStyle="italic">
                          ✅ Sufficient materials and components available for production
                        </Text>
                      )}
                    </FormControl>
                  )}
                </>
              )}

             <Button
               colorScheme='teal'
               bg='#FF8D28'
               color='white'
               _hover={{ bg: '#E67E22' }}
               w='100%'
               isDisabled={shouldProduceImmediately && !productionValidation.isValid}
               onClick={handleAddStock}>
                {shouldProduceImmediately ? 'CREATE STOCK & PRODUCE' : 'ADD STOCK ITEM'}
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
                     onChange={(e) => { setEditingStock({...editingStock, quantity: e.target.value}); if (editingStock.itemPrice) recalcEditStockValue(editingStock.itemPrice, e.target.value); }}
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
                   <FormLabel color={textColor}>Item Price (PKR)</FormLabel>
                   <Input
                     type='number'
                     placeholder='Enter price per unit (optional)'
                     value={editingStock.itemPrice || ""}
                     onChange={(e) => { setEditingStock({...editingStock, itemPrice: e.target.value}); if (editingStock.quantity) recalcEditStockValue(e.target.value, editingStock.quantity); }}
                   />
                 </FormControl>
                 
                 <FormControl>
                   <FormLabel color={textColor}>Stock Value (PKR)</FormLabel>
                   <Input
                     type='number'
                     placeholder='Enter stock value (optional)'
                     value={editingStock.stockValue}
                     onChange={(e) => {
                      // Manual override; do not trigger auto-calc from stock value field
                      setEditingStock({...editingStock, stockValue: e.target.value});
                     }}
                   />
                   {(editingStock.itemPrice && editingStock.quantity) ? (
                     <Text fontSize='sm' color='gray.500' mt='4px'>
                       Auto: PKR.{(parseFloat(editingStock.itemPrice || 0) * parseFloat(editingStock.quantity || 0)).toFixed(2)}
                     </Text>
                   ) : null}
                 </FormControl>

                 {/* Unit Conversion Section */}
                 <Divider />
                 <FormControl>
                   <FormLabel color={textColor} fontSize="md" fontWeight="bold" mb="16px">
                     Secondary Unit (Optional)
                   </FormLabel>
                   <Text color="gray.500" fontSize="sm" mb="16px">
                     Update unit conversion settings for selling in smaller units
                   </Text>
                   
                   <FormControl mb="12px">
                     <FormLabel color={textColor} fontSize="sm">Secondary Unit</FormLabel>
                     <Select
                       placeholder='Select secondary unit (optional)'
                       value={editingStock.secondaryUnit || ""}
                       onChange={(e) => setEditingStock({...editingStock, secondaryUnit: e.target.value})}>
                       {customUnits.map((unit, index) => (
                         <option key={index} value={unit.unitId}>
                           {unit.unitName} ({unit.unitMetric})
                         </option>
                       ))}
                     </Select>
                   </FormControl>
                   
                   {editingStock.secondaryUnit && (
                     <>
                       <FormControl mb="12px">
                         <FormLabel color={textColor} fontSize="sm">Conversion Factor</FormLabel>
                         <Input
                           type='number'
                           step='0.000001'
                           placeholder='e.g., 1000 (for 1 KG = 1000 grams)'
                           value={editingStock.conversionFactor || ""}
                           onChange={(e) => setEditingStock({...editingStock, conversionFactor: e.target.value})}
                         />
                         <Text fontSize='xs' color='gray.500' mt='4px'>
                           How many secondary units in 1 primary unit
                         </Text>
                       </FormControl>
                       
                       <FormControl mb="12px">
                         <Checkbox
                           isChecked={editingStock.allowSecondarySales || false}
                           onChange={(e) => setEditingStock({...editingStock, allowSecondarySales: e.target.checked})}
                         >
                           <Text fontSize='sm' color={textColor}>
                             Allow selling in secondary units
                           </Text>
                         </Checkbox>
                       </FormControl>
                     </>
                   )}
                 </FormControl>

                 {/* Can be used as component toggle */}
                 <FormControl>
                   <Flex justify="space-between" align="center">
                     <FormLabel color={textColor} mb="0">Can be used as component</FormLabel>
                     <Switch
                       isChecked={editingStock.canBeComponent || false}
                       onChange={(e) => setEditingStock({...editingStock, canBeComponent: e.target.checked})}
                       colorScheme="blue"
                     />
                   </Flex>
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

       {/* Manage Categories Modal */}
      <Modal isOpen={isCategoryManageOpen} onClose={onCategoryManageClose} size='2xl' motionPreset='slideInBottom'>
         <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
         <ModalContent maxH="90vh">
           <ModalHeader color={textColor}>Manage Categories</ModalHeader>
           <ModalCloseButton />
           <ModalBody pb='24px' overflowY="auto">
             <VStack spacing='24px' align="stretch">
              {/* Add New Category Section */}
              <Box p="20px" borderWidth="1px" borderRadius="lg" borderColor="gray.200" bg="gray.50">
                <Text fontSize="md" fontWeight="bold" color={textColor} mb="16px">
                  Add New Category
                </Text>
                <VStack spacing='12px'>
                  <FormControl isRequired>
                    <FormLabel color={textColor} fontSize="sm">Category Name</FormLabel>
                    <Input
                      bg="white"
                      placeholder='Enter category name (e.g., Electronics, Food, etc.)'
                      value={newCategory.categoryName}
                      onChange={(e) => setNewCategory({...newCategory, categoryName: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textColor} fontSize="sm">Serial Alias (optional)</FormLabel>
                    <Input
                      bg="white"
                      placeholder='e.g., FOOD, ELEC'
                      value={newCategory.serialAlias}
                      onChange={(e) => setNewCategory({...newCategory, serialAlias: e.target.value})}
                    />
                  </FormControl>
                  
                  <Button
                    colorScheme='teal'
                    bg='#FF8D28'
                    color='white'
                    _hover={{ bg: '#E67E22' }}
                    w='100%'
                    size="sm"
                    onClick={handleAddCategory}>
                    ADD CATEGORY
                  </Button>
                </VStack>
              </Box>

              {/* Existing Categories List */}
              <Box>
                <Text fontSize="md" fontWeight="bold" color={textColor} mb="16px">
                  Existing Categories ({categories.length})
                </Text>
                {categories.length === 0 ? (
                  <Text color="gray.500" fontSize="sm" textAlign="center" py="20px">
                    No categories yet. Add your first category above.
                  </Text>
                ) : (
                  <VStack spacing='12px' align="stretch">
                    {categories.map((category) => (
                      <Box
                        key={category.categoryId}
                        p="16px"
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="gray.200"
                        bg={editingCategory?.categoryId === category.categoryId ? "blue.50" : "white"}
                        transition="all 0.2s"
                      >
                        {editingCategory?.categoryId === category.categoryId ? (
                          // Edit Mode
                          <VStack spacing='12px' align="stretch">
                            <FormControl isRequired>
                              <FormLabel color={textColor} fontSize="sm">Category Name</FormLabel>
                              <Input
                                size="sm"
                                value={editingCategory.categoryName}
                                onChange={(e) => setEditingCategory({...editingCategory, categoryName: e.target.value})}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel color={textColor} fontSize="sm">Serial Alias</FormLabel>
                              <Input
                                size="sm"
                                value={editingCategory.serialAlias || ''}
                                onChange={(e) => setEditingCategory({...editingCategory, serialAlias: e.target.value})}
                              />
                            </FormControl>
                            <HStack spacing='8px'>
                              <Button
                                size="sm"
                                colorScheme="green"
                                flex="1"
                                onClick={handleUpdateCategory}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                flex="1"
                                onClick={() => setEditingCategory(null)}
                              >
                                Cancel
                              </Button>
                            </HStack>
                          </VStack>
                        ) : (
                          // View Mode
                          <Flex justify="space-between" align="center">
                            <Box flex="1">
                              <Text fontSize="md" fontWeight="bold" color={textColor}>
                                {category.categoryName}
                              </Text>
                              {category.serialAlias && (
                                <Text fontSize="xs" color="gray.500" mt="4px">
                                  Alias: {category.serialAlias}
                                </Text>
                              )}
                            </Box>
                            <HStack spacing='8px'>
                              <Button
                                size="sm"
                                leftIcon={<EditIcon />}
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => setEditingCategory({
                                  categoryId: category.categoryId,
                                  categoryName: category.categoryName,
                                  serialAlias: category.serialAlias || ''
                                })}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                leftIcon={<DeleteIcon />}
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteCategory(category.categoryId, category.categoryName)}
                              >
                                Delete
                              </Button>
                            </HStack>
                          </Flex>
                        )}
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
             </VStack>
           </ModalBody>
          </ModalContent>
        </Modal>

        {/* Edit Production Modal */}
        <Modal isOpen={isEditProductionOpen} onClose={onEditProductionClose} size='xl' motionPreset='slideInBottom'>
          <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
          <ModalContent>
            <ModalHeader color={textColor}>Edit Production Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb='24px'>
              {editingStockProduction && (
                <VStack spacing='20px'>
                  <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
                    {editingStockProduction.name}
                  </Text>
                  
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Current Stock: {editingStockProduction.quantity}
                  </Text>
                  
                  {/* Raw Materials Selection */}
                  <FormControl>
                    <FormLabel color={textColor} fontSize="md" fontWeight="bold" mb="16px">
                      Raw Materials Required
                    </FormLabel>
                    <Text color="gray.500" fontSize="sm" mb="16px">
                      Select and adjust the raw materials needed to produce this stock item:
                    </Text>
                    
                    {rawMaterials.length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px" maxH="300px" overflowY="auto">
                        {rawMaterials.map((material) => {
                          const isSelected = editSelectedRawMaterials.some(item => item.materialId === material.materialId);
                          const selectedMaterial = editSelectedRawMaterials.find(item => item.materialId === material.materialId);
                          
                          return (
                            <VStack 
                              key={material.materialId} 
                              align="stretch" 
                              spacing="8px"
                              p="12px"
                              border="1px solid"
                              borderColor={isSelected ? "#FF8D28" : "gray.200"}
                              borderRadius="8px"
                              bg={isSelected ? "orange.50" : "transparent"}
                              transition="all 0.2s"
                            >
                              <Checkbox
                                colorScheme="orange"
                                isChecked={isSelected}
                                onChange={(e) => handleEditRawMaterialToggle(material.materialId, e.target.checked)}
                              >
                                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                  {material.materialName}
                                </Text>
                              </Checkbox>
                              
                              <Text fontSize="xs" color="gray.500">
                                Available: {material.amountPerUnit} units @ PKR {material.purchaseCost}
                              </Text>
                              
                              {isSelected && (
                                <FormControl size="sm">
                                  <FormLabel fontSize="xs" color={textColor}>Quantity Needed</FormLabel>
                                  <Input
                                    size="sm"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    value={selectedMaterial?.quantity || ''}
                                    onChange={(e) => handleEditRawMaterialQuantityChange(material.materialId, e.target.value)}
                                  />
                                </FormControl>
                              )}
                            </VStack>
                          );
                        })}
                      </SimpleGrid>
                    ) : (
                      <Text color="gray.400" fontSize="sm" textAlign="center" py="20px">
                        No raw materials available.
                      </Text>
                    )}
                  </FormControl>

                  {/* Components Selection */}
                  <FormControl>
                    <FormLabel color={textColor} fontSize="md" fontWeight="bold" mb="16px">
                      Components Required
                    </FormLabel>
                    <Text color="gray.500" fontSize="sm" mb="16px">
                      Select and adjust the components (other products) needed to produce this item:
                    </Text>
                    
                    {(() => {
                      const availableComponents = stockData.filter(item => item.canBeComponent && item.itemId !== editingStockProduction.itemId);
                      console.log('Available components:', availableComponents);
                      console.log('All stock data:', stockData.map(item => ({ name: item.name, canBeComponent: item.canBeComponent, itemId: item.itemId })));
                      return availableComponents.length > 0;
                    })() ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px" maxH="300px" overflowY="auto">
                        {stockData.filter(item => item.canBeComponent && item.itemId !== editingStockProduction.itemId).map((component) => {
                          const isSelected = editSelectedComponents.some(item => item.componentId === component.itemId);
                          const selectedComponent = editSelectedComponents.find(item => item.componentId === component.itemId);
                          
                          return (
                            <VStack 
                              key={component.itemId} 
                              align="stretch" 
                              spacing="8px"
                              p="12px"
                              border="1px solid"
                              borderColor={isSelected ? "#4CAF50" : "gray.200"}
                              borderRadius="8px"
                              bg={isSelected ? "green.50" : "transparent"}
                              transition="all 0.2s"
                            >
                              <Checkbox
                                colorScheme="green"
                                isChecked={isSelected}
                                onChange={(e) => handleEditComponentToggle(component.itemId, component.name, e.target.checked)}
                              >
                                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                  {component.name}
                                </Text>
                              </Checkbox>
                              
                              <Text fontSize="xs" color="gray.500">
                                Available: {component.quantity} | Price: {component.itemPrice}
                              </Text>
                              
                              {isSelected && (
                                <FormControl size="sm">
                                  <FormLabel fontSize="xs" color={textColor}>Quantity Needed</FormLabel>
                                  <Input
                                    size="sm"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    value={selectedComponent?.quantity || ''}
                                    onChange={(e) => handleEditComponentQuantityChange(component.itemId, e.target.value)}
                                  />
                                </FormControl>
                              )}
                            </VStack>
                          );
                        })}
                      </SimpleGrid>
                    ) : (
                      <Text color="gray.400" fontSize="sm" textAlign="center" py="20px">
                        No components available. Create products and mark them as "Can be used as component" first.
                      </Text>
                    )}
                  </FormControl>

                  {/* Production Quantity */}
                  {(editSelectedRawMaterials.length > 0 || editSelectedComponents.length > 0) && (
                    <>
                      <Divider />
                      <FormControl>
                        <FormLabel color={textColor}>Production Quantity</FormLabel>
                        <NumberInput
                          min={0.01}
                          step={0.01}
                          value={editProductionQuantity}
                          onChange={handleEditProductionQuantityChange}
                        >
                          <NumberInputField placeholder="Enter quantity to produce" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        
                        {/* Validation Errors */}
                        {!editProductionValidation.isValid && (
                          <VStack spacing="8px" mt="12px" align="stretch">
                            {editProductionValidation.insufficientMaterials.length > 0 && (
                              <>
                                <Text fontSize="sm" color="red.500" fontWeight="bold">
                                  ❌ Insufficient Raw Materials:
                                </Text>
                                {editProductionValidation.insufficientMaterials.map((material, index) => (
                                  <Text key={index} fontSize="xs" color="red.600" ml="16px">
                                    • {material.materialName}: Need {material.required}, have {material.available} 
                                    (deficit: {material.deficit})
                                  </Text>
                                ))}
                              </>
                            )}
                            {editProductionValidation.insufficientComponents.length > 0 && (
                              <>
                                <Text fontSize="sm" color="red.500" fontWeight="bold">
                                  ❌ Insufficient Components:
                                </Text>
                                {editProductionValidation.insufficientComponents.map((component, index) => (
                                  <Text key={index} fontSize="xs" color="red.600" ml="16px">
                                    • {component.componentName}: Need {component.required}, have {component.available} 
                                    (deficit: {component.deficit})
                                  </Text>
                                ))}
                              </>
                            )}
                          </VStack>
                        )}
                        
                        {editProductionValidation.isValid && editProductionQuantity && (
                          <Text fontSize="xs" color="green.600" mt="8px" fontStyle="italic">
                            ✅ Sufficient materials and components available for production
                          </Text>
                        )}
                      </FormControl>
                    </>
                  )}
                  
                  <HStack spacing="12px" w="100%">
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      flex="1"
                      onClick={onEditProductionClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="green"
                      bg={editProductionValidation.isValid ? "#4CAF50" : "gray.400"}
                      color="white"
                      _hover={{ bg: editProductionValidation.isValid ? "#45A049" : "gray.400" }}
                      flex="1"
                      leftIcon={<FaCog />}
                      isDisabled={!editProductionValidation.isValid || !editProductionQuantity}
                      onClick={handleUpdateProduction}
                    >
                      Update & Produce
                    </Button>
                  </HStack>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

     </Card>
    </Box>
  );
};

export default Authors;
