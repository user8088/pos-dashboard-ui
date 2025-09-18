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
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import StockTableRow from "components/Tables/StockTableRow";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv, FaRuler, FaTags, FaTrash, FaCog } from "react-icons/fa";

const Authors = ({ title, captions, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isUnitOpen, onOpen: onUnitOpen, onClose: onUnitClose } = useDisclosure();
  const { isOpen: isCategoryOpen, onOpen: onCategoryOpen, onClose: onCategoryClose } = useDisclosure();
  const { isOpen: isEditProductionOpen, onOpen: onEditProductionOpen, onClose: onEditProductionClose } = useDisclosure();
  const [newStock, setNewStock] = React.useState({
    name: "",
    quantity: "",
    unit: "",
    customUnit: "",
    category: "",
    status: "in_stock",
    stockValue: "",
    itemPrice: ""
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
  const [rawMaterials, setRawMaterials] = React.useState([]);
  const [selectedRawMaterials, setSelectedRawMaterials] = React.useState([]);
  const [newCategory, setNewCategory] = React.useState({
    categoryName: ""
  });
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
  const [editProductionValidation, setEditProductionValidation] = React.useState({
    isValid: true,
    errors: [],
    insufficientMaterials: []
  });
  
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
  }, []);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/unit`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/category`, {
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

  const fetchRawMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/raw-material`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const rawMaterialsData = await response.json();
        const formattedRawMaterials = rawMaterialsData.map(material => ({
          materialId: material.id,
          materialName: material.material_name,
          amountPerUnit: material.amount_per_unit,
          purchaseCost: material.purchase_cost
        }));
        setRawMaterials(formattedRawMaterials);
      } else {
        console.error('Failed to fetch raw materials');
      }
    } catch (error) {
      console.error('Error fetching raw materials:', error);
    }
  };

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock`, {
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
          itemPrice: item.item_price ? `PKR.${item.item_price}` : 'PKR.0',
          category: item.category?.category_name || 'Uncategorized',
          status: item.stock_status === 'in_stock' ? 'In Stock' : 
                  item.stock_status === 'out_of_stock' ? 'Out of Stock' : 
                  item.stock_status === 'pending' ? 'Pending' : 'In Stock',
          stockValue: item.stock_value ? `PKR.${item.stock_value}` : 'PKR.0',
          totalSold: item.total_sold ? `${item.total_sold}` : '0',
          totalProfit: item.total_profit ? `PKR.${item.total_profit}` : 'PKR.0',
          itemId: item.item_id,
          unitId: item.unit_id,
          categoryId: item.category_id,
          quantityPerUnit: item.quantity_per_unit,
          stockValueRaw: item.stock_value || 0,
          stockStatusRaw: item.stock_status || 'in_stock',
          itemPriceRaw: item.item_price || 0,
          totalSoldRaw: item.total_sold || 0,
          totalProfitRaw: item.total_profit || 0
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

  const handleRawMaterialToggle = (materialId, isChecked) => {
    if (isChecked) {
      // Add material with default quantity of 1
      setSelectedRawMaterials([
        ...selectedRawMaterials,
        { materialId: materialId, quantity: 1 }
      ]);
    } else {
      // Remove material
      setSelectedRawMaterials(selectedRawMaterials.filter(item => item.materialId !== materialId));
    }
  };

  const handleRawMaterialQuantityChange = (materialId, quantity) => {
    setSelectedRawMaterials(selectedRawMaterials.map(item => 
      item.materialId === materialId 
        ? { ...item, quantity: parseFloat(quantity) || 1 }
        : item
    ));
    
    // Re-validate if production is enabled
    if (shouldProduceImmediately && immediateProductionQuantity) {
      validateProductionRequirements(parseFloat(immediateProductionQuantity) || 0);
    }
  };

  const validateProductionRequirements = (productionQty) => {
    if (!productionQty || productionQty <= 0 || selectedRawMaterials.length === 0) {
      setProductionValidation({ isValid: true, errors: [], insufficientMaterials: [] });
      return true;
    }

    const insufficientMaterials = [];
    
    selectedRawMaterials.forEach(selectedMaterial => {
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

    const isValid = insufficientMaterials.length === 0;
    setProductionValidation({
      isValid,
      errors: isValid ? [] : ['Insufficient raw materials for production'],
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

  const openEditProductionModal = async (stockItem) => {
    setEditingStockProduction(stockItem);
    setEditProductionQuantity("");
    
    // Fetch current raw material mappings for this stock item
    await fetchStockRawMaterials(stockItem.itemId);
    
    onEditProductionOpen();
  };

  const fetchStockRawMaterials = async (stockId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock/${stockId}/raw-materials`, {
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
          quantity: parseFloat(material.quantity)
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
      // Add material with default quantity of 1
      setEditSelectedRawMaterials([
        ...editSelectedRawMaterials,
        { materialId: materialId, quantity: 1 }
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
        ? { ...item, quantity: parseFloat(quantity) || 1 }
        : item
    ));
    
    // Re-validate if production quantity is set
    if (editProductionQuantity) {
      validateEditProductionRequirements(parseFloat(editProductionQuantity) || 0);
    }
  };

  const validateEditProductionRequirements = (productionQty) => {
    if (!productionQty || productionQty <= 0 || editSelectedRawMaterials.length === 0) {
      setEditProductionValidation({ isValid: true, errors: [], insufficientMaterials: [] });
      return true;
    }

    const insufficientMaterials = [];
    
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

    const isValid = insufficientMaterials.length === 0;
    setEditProductionValidation({
      isValid,
      errors: isValid ? [] : ['Insufficient raw materials for production'],
      insufficientMaterials
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
        description: "Insufficient raw materials for production.",
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

      // Then produce the stock
      await produceStockFromEdit(editingStockProduction.itemId, editingStockProduction.name, parseFloat(editProductionQuantity));

      // Close modal and refresh data
      setEditingStockProduction(null);
      setEditProductionQuantity("");
      setEditSelectedRawMaterials([]);
      setEditProductionValidation({ isValid: true, errors: [], insufficientMaterials: [] });
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock/${stockId}/raw-materials`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock/${stockId}/produce`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock/${stockId}/produce`, {
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
  const stockCaptions = ["Products", "QUANTITY PER UNIT", "ITEM PRICE", "CATEGORY", "STATUS", "Stock Value", "TOTAL SOLD", "TOTAL PROFIT", ""];

  const handleAddStock = async () => {
    if (!newStock.name || !newStock.unit || !newStock.category) return;
    
    // Validate production requirements if production is enabled
    if (shouldProduceImmediately && !productionValidation.isValid) {
      toast({
        title: "Cannot Create Stock",
        description: "Insufficient raw materials for production. Please adjust quantities or disable immediate production.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock`, {
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
          quantity_per_unit: newStock.quantity ? parseFloat(newStock.quantity) : 0,
          item_price: newStock.itemPrice ? parseFloat(newStock.itemPrice) : null,
          stock_value: newStock.stockValue ? parseFloat(newStock.stockValue) : null,
          stock_status: newStock.status
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        toast({
          title: "Stock Item Added Successfully",
          description: `Stock item "${data.item_name}" has been added to the system${newStock.quantity ? ` with ${newStock.quantity} units` : ' (ready for production)'}.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
         // If raw materials are selected, map them to the stock item
         if (selectedRawMaterials.length > 0) {
           await mapRawMaterialsToStock(data.item_id, selectedRawMaterials);
           
           // If user wants to produce immediately after creating stock
           if (shouldProduceImmediately && immediateProductionQuantity && parseFloat(immediateProductionQuantity) > 0) {
             await produceStockImmediately(data.item_id, data.item_name, parseFloat(immediateProductionQuantity));
           }
         }
         
         // Reset form
    setNewStock({
      name: "",
      quantity: "",
      unit: "",
      customUnit: "",
      category: "",
      status: "in_stock",
      stockValue: "",
      itemPrice: ""
    });
         
         // Reset selected raw materials and production settings
         setSelectedRawMaterials([]);
         setShouldProduceImmediately(false);
         setImmediateProductionQuantity("");
         setProductionValidation({ isValid: true, errors: [], insufficientMaterials: [] });
         
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
      itemId: stock.itemId,
      itemPrice: stock.itemPriceRaw // Add itemPriceRaw to editingStock
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock/${editingStock.itemId}`, {
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
          item_price: editingStock.itemPrice ? parseFloat(editingStock.itemPrice) : undefined,
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/unit`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/category`, {
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

  const mapRawMaterialsToStock = async (stockId, rawMaterialMappings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock/${stockId}/raw-materials`, {
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

  const handleDeleteStock = async (stockItem) => {
    if (!window.confirm(`Are you sure you want to delete "${stockItem.name}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock/${stockItem.itemId}`, {
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
                   itemPrice={row.itemPrice}
                   category={row.category}
                   status={row.status}
                   stockValue={row.stockValue}
                   totalSold={row.totalSold}
                   totalProfit={row.totalProfit}
                   onEdit={() => handleEditStock(row, index)}
                     onDelete={() => handleDeleteStock(row)}
                     onEditProduction={() => openEditProductionModal(row)}
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
                    setNewStock({...newStock, stockValue: e.target.value});
                    recalcAddStockValue(newStock.itemPrice, e.target.value, immediateProductionQuantity);
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
                               <NumberInput
                                 size="sm"
                                 min={0.01}
                                 step={0.01}
                                 value={selectedMaterial?.quantity || 1}
                                 onChange={(valueString) => handleRawMaterialQuantityChange(material.materialId, valueString)}
                               >
                                 <NumberInputField />
                                 <NumberInputStepper>
                                   <NumberIncrementStepper />
                                   <NumberDecrementStepper />
                                 </NumberInputStepper>
                               </NumberInput>
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

               {/* Immediate Production Section */}
               {selectedRawMaterials.length > 0 && (
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
                       This will consume the selected raw materials and add the produced quantity to your initial stock.
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
                             ❌ Insufficient Raw Materials:
                           </Text>
                           {productionValidation.insufficientMaterials.map((material, index) => (
                             <Text key={index} fontSize="xs" color="red.600" ml="16px">
                               • {material.materialName}: Need {material.required}, have {material.available} 
                               (deficit: {material.deficit})
                             </Text>
                           ))}
                         </VStack>
                       )}
                       
                       {productionValidation.isValid && immediateProductionQuantity && (
                         <Text fontSize="xs" color="green.600" mt="8px" fontStyle="italic">
                           ✅ Sufficient raw materials available for production
                         </Text>
                       )}
                     </FormControl>
                   )}
                 </>
               )}
              
              <Button
                colorScheme='teal'
                 bg={productionValidation.isValid ? '#FF8D28' : 'gray.400'}
                color='white'
                 _hover={{ bg: productionValidation.isValid ? '#E67E22' : 'gray.400' }}
                w='100%'
                 isDisabled={shouldProduceImmediately && !productionValidation.isValid}
                onClick={handleAddStock}>
                 {shouldProduceImmediately && selectedRawMaterials.length > 0 ? 'CREATE STOCK & PRODUCE' : 'ADD STOCK ITEM'}
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
                       setEditingStock({...editingStock, stockValue: e.target.value});
                       recalcEditStockValue(editingStock.itemPrice, e.target.value);
                     }}
                   />
                   {(editingStock.itemPrice && editingStock.quantity) ? (
                     <Text fontSize='sm' color='gray.500' mt='4px'>
                       Auto: PKR.{(parseFloat(editingStock.itemPrice || 0) * parseFloat(editingStock.quantity || 0)).toFixed(2)}
                     </Text>
                   ) : null}
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
                                  <NumberInput
                                    size="sm"
                                    min={0.01}
                                    step={0.01}
                                    value={selectedMaterial?.quantity || 1}
                                    onChange={(valueString) => handleEditRawMaterialQuantityChange(material.materialId, valueString)}
                                  >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
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

                  {/* Production Quantity */}
                  {editSelectedRawMaterials.length > 0 && (
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
                            <Text fontSize="sm" color="red.500" fontWeight="bold">
                              ❌ Insufficient Raw Materials:
                            </Text>
                            {editProductionValidation.insufficientMaterials.map((material, index) => (
                              <Text key={index} fontSize="xs" color="red.600" ml="16px">
                                • {material.materialName}: Need {material.required}, have {material.available} 
                                (deficit: {material.deficit})
                              </Text>
                            ))}
                          </VStack>
                        )}
                        
                        {editProductionValidation.isValid && editProductionQuantity && (
                          <Text fontSize="xs" color="green.600" mt="8px" fontStyle="italic">
                            ✅ Sufficient raw materials available for production
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
   );
 };

export default Authors;
