// Chakra imports
import {
  Table,
  Tbody,
  Td,
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
  InputLeftElement,
  InputRightElement,
  Spinner,
  Box,
  Icon,
  IconButton,
  Divider,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { useHistory } from "react-router-dom";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv, FaSearch, FaTimes, FaTags, FaTrash } from "react-icons/fa";
import { factoryStockService } from "services/factoryStockService";
import StockTableRow from "components/Tables/StockTableRow";

const FactoryStockTable = ({ title, captions }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isCatOpen, onOpen: onCatOpen, onClose: onCatClose } = useDisclosure();
  const { isOpen: isUnitOpen, onOpen: onUnitOpen, onClose: onUnitClose } = useDisclosure();
  const { isOpen: isProduceOpen, onOpen: onProduceOpen, onClose: onProduceClose } = useDisclosure();
  const [newStock, setNewStock] = React.useState({
    name: "",
    serial_id: "",
    factory_product_category_id: "",
    primary_unit_id: "",
    secondary_unit_id: "",
    secondary_per_primary: "",
    manufacturing_cost: "",
    selling_price: "",
    image_url: "",
    status: "In Stock",
    raw_materials: [],
  });
  const [editingStock, setEditingStock] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  const [producingItem, setProducingItem] = React.useState(null);
  const [produceQuantity, setProduceQuantity] = React.useState("");
  
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState([]);
  const [catLoading, setCatLoading] = React.useState(false);
  const [catSearchInput, setCatSearchInput] = React.useState("");
  const [catForm, setCatForm] = React.useState({ id: null, name: "", description: "", serial_alias: "" });
  const [search, setSearch] = React.useState("");
  const [units, setUnits] = React.useState([]);
  const [unitLoading, setUnitLoading] = React.useState(false);
  const [unitSearchInput, setUnitSearchInput] = React.useState("");
  const [unitForm, setUnitForm] = React.useState({ id: null, name: "", symbol: "", description: "" });
  const [rawMaterials, setRawMaterials] = React.useState([]);
  const [rawMaterialLoading, setRawMaterialLoading] = React.useState(false);

  const getUnitLabel = React.useCallback((id) => {
    const u = units.find((x) => String(x.id) === String(id));
    return u ? `${u.name}${u.symbol ? ` (${u.symbol})` : ''}` : '';
  }, [units]);

  const loadCategories = React.useCallback(async () => {
    try {
      setCatLoading(true);
      const params = catSearchInput ? { search: catSearchInput } : {};
      const resp = await factoryStockService.listCategories(params);
      const list = resp?.data?.data || resp?.data || resp || [];
        setCategories(list.map(c => ({ id: c.id, name: c.name, description: c.description, serial_alias: c.serial_alias || '' })));
    } catch (e) {
      // non-blocking
    } finally {
      setCatLoading(false);
    }
  }, [catSearchInput]);

  const loadItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = { search: search || undefined };
      const resp = await factoryStockService.listItems(params);
      const raw = resp?.data?.data || resp?.data || resp || [];
      const rows = raw.map((it) => ({
        id: it.id,
        logo: it.image_url || logo,
        name: it.name,
        serialId: it.serial_id || it.serial_number || '',
        primaryUnit: (() => {
          if (it.primaryUnit && typeof it.primaryUnit === 'object') {
            return it.primaryUnit.symbol || it.primaryUnit.name || '';
          }
          if (it.primary_unit && typeof it.primary_unit === 'object') {
            return it.primary_unit.symbol || it.primary_unit.name || '';
          }
          return typeof it.primary_unit === 'string' ? it.primary_unit : '';
        })(),
        secondaryUnit: (() => {
          if (it.secondaryUnit && typeof it.secondaryUnit === 'object') {
            return it.secondaryUnit.symbol || it.secondaryUnit.name || '';
          }
          if (it.secondary_unit && typeof it.secondary_unit === 'object') {
            return it.secondary_unit.symbol || it.secondary_unit.name || '';
          }
          return typeof it.secondary_unit === 'string' ? it.secondary_unit : '';
        })(),
        category: (() => {
          const cat = it.category;
          if (cat && typeof cat === 'object') {
            return cat.name || cat.title || '';
          }
          return it.category_name || (typeof it.category === 'string' ? it.category : '') || '';
        })(),
        status: it.status || 'In Stock',
        lastPurchase: `PKR.${it.manufacturing_cost != null ? Number(it.manufacturing_cost).toFixed(2) : it.last_purchase_price != null ? Number(it.last_purchase_price).toFixed(2) : '0.00'}`,
        sellingPrice: `PKR.${it.selling_price != null ? Number(it.selling_price).toFixed(2) : '0.00'}`,
        secondary_per_primary: it.secondary_per_primary ? Number(it.secondary_per_primary) : null,
        // Keep raw data for editing
        rawData: it,
      }));
      setItems(rows);
    } catch (e) {
      console.warn('Items load failed', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadUnits = React.useCallback(async () => {
    try {
      setUnitLoading(true);
      const params = unitSearchInput ? { q: unitSearchInput } : {};
      const resp = await factoryStockService.listUnits(params);
      const list = resp?.data?.data || resp?.data || resp || [];
      setUnits(list.map(u => ({ id: u.id, name: u.name, symbol: u.symbol, description: u.description })));
    } catch (e) {
      // non-blocking
    } finally {
      setUnitLoading(false);
    }
  }, [unitSearchInput]);

  const loadRawMaterials = React.useCallback(async () => {
    try {
      setRawMaterialLoading(true);
      const resp = await factoryStockService.listRawMaterials();
      const list = resp?.data?.data || resp?.data || resp || [];
      setRawMaterials(list.map(rm => ({ id: rm.id, name: rm.name })));
    } catch (e) {
      console.warn('Raw materials load failed', e);
    } finally {
      setRawMaterialLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
    loadUnits();
    loadRawMaterials();
  }, [loadCategories, loadUnits, loadRawMaterials]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddStock = async () => {
    if (!newStock.name || !newStock.factory_product_category_id || !newStock.primary_unit_id) return;
    const hasSecondaryAny = Boolean(newStock.secondary_unit_id) || Boolean(newStock.secondary_per_primary);
    if (hasSecondaryAny && !(newStock.secondary_unit_id && newStock.secondary_per_primary)) {
      alert('Please provide both Stocking Unit and "Stocking per 1 Selling" value.');
      return;
    }
    try {
      const rawMaterialsPayload = newStock.raw_materials && newStock.raw_materials.length > 0
        ? newStock.raw_materials
            .filter(rm => rm.raw_material_id && rm.quantity_required && Number(rm.quantity_required) > 0)
            .map(rm => ({
              raw_material_id: Number(rm.raw_material_id),
              quantity_required: Number(rm.quantity_required)
            }))
        : undefined;
      await factoryStockService.createItem({
        name: newStock.name,
        serial_id: newStock.serial_id || undefined,
        factory_product_category_id: Number(newStock.factory_product_category_id),
        primary_unit_id: Number(newStock.primary_unit_id),
        secondary_unit_id: newStock.secondary_unit_id ? Number(newStock.secondary_unit_id) : undefined,
        secondary_per_primary: newStock.secondary_per_primary ? Number(newStock.secondary_per_primary) : undefined,
        manufacturing_cost: newStock.manufacturing_cost ? Math.max(0, Number(newStock.manufacturing_cost)) : undefined,
        selling_price: Math.max(0, Number(newStock.selling_price) || 0),
        image_url: newStock.image_url || undefined,
        raw_materials: rawMaterialsPayload,
      });
      onClose();
      await loadItems();
      setNewStock({
        name: "",
        serial_id: "",
        factory_product_category_id: "",
        primary_unit_id: "",
        secondary_unit_id: "",
        secondary_per_primary: "",
        manufacturing_cost: "",
        selling_price: "",
        image_url: "",
        status: "In Stock",
        raw_materials: [],
      });
    } catch (e) {
      alert(e?.message || 'Failed to create item');
    }
  };

  const handleUpdateStock = async () => {
    if (!editingStock) return;
    if (!editingStock.name || !editingStock.factory_product_category_id || !editingStock.primary_unit_id) return;
    
    const hasSecondaryAny = Boolean(editingStock.secondary_unit_id) || Boolean(editingStock.secondary_per_primary);
    if (hasSecondaryAny && !(editingStock.secondary_unit_id && editingStock.secondary_per_primary)) {
      alert('Please provide both Stocking Unit and "Stocking per 1 Selling" value.');
      return;
    }

    try {
      const id = items[editIndex]?.id;
      if (!id) throw new Error('Item id not found');
      const rawMaterialsPayload = editingStock.raw_materials && editingStock.raw_materials.length > 0
        ? editingStock.raw_materials
            .filter(rm => rm.raw_material_id && rm.quantity_required && Number(rm.quantity_required) > 0)
            .map(rm => ({
              raw_material_id: Number(rm.raw_material_id),
              quantity_required: Number(rm.quantity_required)
            }))
        : undefined;
      await factoryStockService.updateItem(id, {
        name: editingStock.name,
        serial_id: editingStock.serial_id || undefined,
        factory_product_category_id: Number(editingStock.factory_product_category_id),
        primary_unit_id: Number(editingStock.primary_unit_id),
        secondary_unit_id: editingStock.secondary_unit_id ? Number(editingStock.secondary_unit_id) : undefined,
        secondary_per_primary: editingStock.secondary_per_primary ? Number(editingStock.secondary_per_primary) : undefined,
        manufacturing_cost: editingStock.manufacturing_cost ? Math.max(0, Number(editingStock.manufacturing_cost)) : undefined,
        selling_price: Math.max(0, Number(editingStock.selling_price) || 0),
        image_url: editingStock.image_url || undefined,
        raw_materials: rawMaterialsPayload,
      });
      onEditClose();
      await loadItems();
      setEditingStock(null);
      setEditIndex(-1);
    } catch (e) {
      alert(e?.message || 'Failed to update item');
    }
  };

  const handleDelete = async (index) => {
    const row = items[index];
    if (!row) return;
    const ok = window.confirm(`Delete item "${row.name}"?`);
    if (!ok) return;
    try {
      await factoryStockService.deleteItem(row.id);
      await loadItems();
    } catch (e) {
      alert(e?.message || 'Failed to delete item');
    }
  };

  const handleView = (id) => {
    history.push(`/factory/stock-management/${id}`);
  };

  const handleProduce = (index) => {
    const row = items[index];
    setProducingItem(row);
    setProduceQuantity("");
    onProduceOpen();
  };

  const handleProduceSubmit = async () => {
    if (!producingItem || !produceQuantity || Number(produceQuantity) < 1) {
      alert('Please enter a valid quantity (at least 1)');
      return;
    }
    try {
      const resp = await factoryStockService.produceItem(producingItem.id, Number(produceQuantity));
      alert(`Successfully produced ${produceQuantity} unit(s) of ${producingItem.name}`);
      onProduceClose();
      setProducingItem(null);
      setProduceQuantity("");
      await loadItems();
    } catch (e) {
      alert(e?.message || 'Failed to produce items');
    }
  };

  const handleEdit = (index) => {
    const row = items[index];
    const raw = row.rawData || {};
    const rawMaterialsFromResponse = raw.rawMaterials || raw.raw_materials || [];
    setEditingStock({
      name: row.name,
      serial_id: raw.serial_id || raw.serial_number || "",
      factory_product_category_id: raw.factory_product_category_id || "",
      primary_unit_id: raw.primary_unit_id || "",
      secondary_unit_id: raw.secondary_unit_id || "",
      secondary_per_primary: raw.secondary_per_primary || "",
      manufacturing_cost: raw.manufacturing_cost || "",
      selling_price: raw.selling_price || "",
      image_url: raw.image_url || "",
      status: row.status || 'In Stock',
      raw_materials: rawMaterialsFromResponse.map(rm => ({
        raw_material_id: rm.id || rm.raw_material_id,
        quantity_required: rm.pivot?.quantity_required || rm.quantity_required || "",
      })),
    });
    setEditIndex(index);
    onEditOpen();
  };

  const handleAddRawMaterialRow = (isEdit = false) => {
    if (isEdit) {
      setEditingStock({
        ...editingStock,
        raw_materials: [...(editingStock.raw_materials || []), { raw_material_id: "", quantity_required: "" }]
      });
    } else {
      setNewStock({
        ...newStock,
        raw_materials: [...(newStock.raw_materials || []), { raw_material_id: "", quantity_required: "" }]
      });
    }
  };

  const handleRemoveRawMaterialRow = (index, isEdit = false) => {
    if (isEdit) {
      setEditingStock({
        ...editingStock,
        raw_materials: editingStock.raw_materials.filter((_, i) => i !== index)
      });
    } else {
      setNewStock({
        ...newStock,
        raw_materials: newStock.raw_materials.filter((_, i) => i !== index)
      });
    }
  };

  const handleUpdateRawMaterial = (index, field, value, isEdit = false) => {
    if (isEdit) {
      const updated = [...editingStock.raw_materials];
      updated[index] = { ...updated[index], [field]: value };
      setEditingStock({ ...editingStock, raw_materials: updated });
    } else {
      const updated = [...newStock.raw_materials];
      updated[index] = { ...updated[index], [field]: value };
      setNewStock({ ...newStock, raw_materials: updated });
    }
  };

  const handleImportCSV = () => {
    alert("CSV import functionality would be implemented here.");
  };

  return (
    <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex justify='space-between' align='center' w='100%'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            {title}
          </Text>
          <HStack spacing='12px'>
            <InputGroup maxW="200px">
              <InputLeftElement pointerEvents="none">
                <FaSearch />
              </InputLeftElement>
              <Input
                placeholder="Type here"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Button
              leftIcon={<FaTags />}
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onUnitOpen}>
              MANAGE UNITS
            </Button>
            <Button
              leftIcon={<FaTags />}
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onCatOpen}>
              MANAGE CATEGORIES
            </Button>
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
              leftIcon={<FaPlus />}
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onOpen}>
              Add New Stock Item
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={textColor}>
          <Thead position='sticky' top='0' zIndex='1' bg={useColorModeValue("white", "gray.700")}> 
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
            {loading && items.length === 0 && (
              <Tr>
                <Td colSpan={captions.length} py='48px' textAlign='center'>
                  <Spinner thickness='3px' speed='0.65s' emptyColor='gray.200' color='#FF8D28' size='lg' />
                </Td>
              </Tr>
            )}
            {!loading && items.length === 0 && (
              <Tr>
                <Td colSpan={captions.length} py='48px'>
                  <Box textAlign='center' color='gray.500'>
                    <Text fontWeight='bold' mb='2'>No items found</Text>
                    <Text fontSize='sm'>Try adjusting your search or add a new stock item.</Text>
                  </Box>
                </Td>
              </Tr>
            )}
            {items.map((row, index) => {
              return (
                <StockTableRow
                  key={`${row.name}-${index}`}
                  logo={row.logo}
                  name={row.name}
                  serialId={row.serialId}
                  primaryUnit={row.primaryUnit}
                  secondaryUnit={row.secondaryUnit}
                  secondaryPerPrimary={row.secondary_per_primary}
                  category={row.category}
                  status={row.status}
                  lastPurchase={row.lastPurchase}
                  sellingPrice={row.sellingPrice}
                  onEdit={() => handleEdit(index)}
                  onView={() => handleView(row.id)}
                  onDelete={() => handleDelete(index)}
                  onProduce={() => handleProduce(index)}
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
              
              <FormControl>
                <FormLabel color={textColor}>Serial ID (Optional - Auto-generated if category has alias)</FormLabel>
                <Input
                  placeholder='e.g., PROD-001 or leave empty for auto-generation'
                  value={newStock.serial_id}
                  onChange={(e) => setNewStock({...newStock, serial_id: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Category</FormLabel>
                <Select
                  value={newStock.factory_product_category_id}
                  onChange={(e) => setNewStock({...newStock, factory_product_category_id: e.target.value})}
                  placeholder='Select category'>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Selling Unit</FormLabel>
                <Select
                  value={newStock.primary_unit_id}
                  onChange={(e) => setNewStock({...newStock, primary_unit_id: e.target.value})}
                  placeholder='Select unit'>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Stocking Unit (Optional)</FormLabel>
                <Select
                  value={newStock.secondary_unit_id}
                  onChange={(e) => setNewStock({...newStock, secondary_unit_id: e.target.value})}
                  placeholder='Select unit'>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {newStock.secondary_unit_id && (
                <FormControl isRequired>
                  <FormLabel color={textColor}>Stocking per 1 Selling</FormLabel>
                  <Input
                    type='number'
                    placeholder='e.g., 1000 for grams per kg'
                    value={newStock.secondary_per_primary}
                    onChange={(e) => setNewStock({...newStock, secondary_per_primary: e.target.value})}
                  />
                </FormControl>
              )}
              
              <FormControl>
                <FormLabel color={textColor}>Image URL (Optional)</FormLabel>
                <Input
                  placeholder='Enter image URL'
                  value={newStock.image_url}
                  onChange={(e) => setNewStock({...newStock, image_url: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Manufacturing Cost (PKR) - Optional</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter manufacturing cost'
                  value={newStock.manufacturing_cost}
                  onChange={(e) => setNewStock({...newStock, manufacturing_cost: e.target.value})}
                />
                <Text fontSize='xs' color='gray.500' mt='1'>
                  Leave empty to auto-calculate from raw materials below
                </Text>
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Selling Price (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter selling price'
                  value={newStock.selling_price}
                  onChange={(e) => setNewStock({...newStock, selling_price: e.target.value})}
                />
              </FormControl>

              <Divider />

              <Box w='100%'>
                <Flex justify='space-between' align='center' mb='3'>
                  <Text fontWeight='bold' color={textColor}>Raw Materials (Optional)</Text>
                  <Button
                    size='sm'
                    leftIcon={<FaPlus />}
                    onClick={() => handleAddRawMaterialRow(false)}
                    colorScheme='gray'
                    variant='outline'>
                    Add Material
                  </Button>
                </Flex>
                {newStock.raw_materials && newStock.raw_materials.length > 0 && (
                  <VStack spacing='2' align='stretch'>
                    {newStock.raw_materials.map((rm, idx) => (
                      <Box key={idx} p={3} borderWidth='1px' borderRadius='md' bg={useColorModeValue('gray.50', 'gray.800')}>
                        <HStack spacing='2'>
                          <Select
                            placeholder='Select raw material'
                            value={String(rm.raw_material_id || '')}
                            onChange={(e) => handleUpdateRawMaterial(idx, 'raw_material_id', e.target.value, false)}
                            flex='1'>
                            {rawMaterials.map((material) => (
                              <option key={material.id} value={String(material.id)}>
                                {material.name}
                              </option>
                            ))}
                          </Select>
                          <Input
                            type='number'
                            step='0.0001'
                            placeholder='Qty required'
                            value={rm.quantity_required}
                            onChange={(e) => handleUpdateRawMaterial(idx, 'quantity_required', e.target.value, false)}
                            w='150px'
                          />
                          <IconButton
                            size='sm'
                            aria-label='Remove'
                            icon={<FaTrash />}
                            colorScheme='red'
                            variant='ghost'
                            onClick={() => handleRemoveRawMaterialRow(idx, false)}
                          />
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
                <Text fontSize='sm' color='gray.600' mt='2'>
                  Manufacturing cost will be automatically calculated from raw materials.
                </Text>
              </Box>
              
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
                
                <FormControl>
                  <FormLabel color={textColor}>Serial ID (Optional - Auto-generated if category has alias)</FormLabel>
                  <Input
                    placeholder='e.g., PROD-001 or leave empty for auto-generation'
                    value={editingStock.serial_id || ''}
                    onChange={(e) => setEditingStock({...editingStock, serial_id: e.target.value})}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={textColor}>Category</FormLabel>
                  <Select
                    value={editingStock.factory_product_category_id}
                    onChange={(e) => setEditingStock({...editingStock, factory_product_category_id: e.target.value})}
                    placeholder='Select category'>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Selling Unit</FormLabel>
                  <Select
                    value={editingStock.primary_unit_id}
                    onChange={(e) => setEditingStock({...editingStock, primary_unit_id: e.target.value})}
                    placeholder='Select unit'>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Stocking Unit (Optional)</FormLabel>
                  <Select
                    value={editingStock.secondary_unit_id}
                    onChange={(e) => setEditingStock({...editingStock, secondary_unit_id: e.target.value})}
                    placeholder='Select unit'>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {editingStock.secondary_unit_id && (
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Stocking per 1 Selling</FormLabel>
                    <Input
                      type='number'
                      placeholder='e.g., 1000 for grams per kg'
                      value={editingStock.secondary_per_primary}
                      onChange={(e) => setEditingStock({...editingStock, secondary_per_primary: e.target.value})}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel color={textColor}>Image URL (Optional)</FormLabel>
                  <Input
                    placeholder='Enter image URL'
                    value={editingStock.image_url}
                    onChange={(e) => setEditingStock({...editingStock, image_url: e.target.value})}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Manufacturing Cost (PKR) - Optional</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter manufacturing cost'
                    value={editingStock.manufacturing_cost}
                    onChange={(e) => setEditingStock({...editingStock, manufacturing_cost: e.target.value})}
                  />
                  <Text fontSize='xs' color='gray.500' mt='1'>
                    Leave empty to auto-calculate from raw materials below
                  </Text>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Selling Price (PKR)</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter selling price'
                    value={editingStock.selling_price}
                    onChange={(e) => setEditingStock({...editingStock, selling_price: e.target.value})}
                  />
                </FormControl>

                <Divider />

                <Box w='100%'>
                  <Flex justify='space-between' align='center' mb='3'>
                    <Text fontWeight='bold' color={textColor}>Raw Materials (Optional)</Text>
                    <Button
                      size='sm'
                      leftIcon={<FaPlus />}
                      onClick={() => handleAddRawMaterialRow(true)}
                      colorScheme='gray'
                      variant='outline'>
                      Add Material
                    </Button>
                  </Flex>
                  {editingStock.raw_materials && editingStock.raw_materials.length > 0 && (
                    <VStack spacing='2' align='stretch'>
                      {editingStock.raw_materials.map((rm, idx) => (
                        <Box key={idx} p={3} borderWidth='1px' borderRadius='md' bg={useColorModeValue('gray.50', 'gray.800')}>
                          <HStack spacing='2'>
                            <Select
                              placeholder='Select raw material'
                              value={String(rm.raw_material_id || '')}
                              onChange={(e) => handleUpdateRawMaterial(idx, 'raw_material_id', e.target.value, true)}
                              flex='1'>
                              {rawMaterials.map((material) => (
                                <option key={material.id} value={String(material.id)}>
                                  {material.name}
                                </option>
                              ))}
                            </Select>
                            <Input
                              type='number'
                              step='0.0001'
                              placeholder='Qty required'
                              value={rm.quantity_required}
                              onChange={(e) => handleUpdateRawMaterial(idx, 'quantity_required', e.target.value, true)}
                              w='150px'
                            />
                            <IconButton
                              size='sm'
                              aria-label='Remove'
                              icon={<FaTrash />}
                              colorScheme='red'
                              variant='ghost'
                              onClick={() => handleRemoveRawMaterialRow(idx, true)}
                            />
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                  <Text fontSize='sm' color='gray.600' mt='2'>
                    Manufacturing cost will be automatically recalculated when raw materials change.
                  </Text>
                </Box>
                
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

      {/* Category CRUD Modal */}
      <Modal isOpen={isCatOpen} onClose={() => { onCatClose(); setCatForm({ id: null, name: "", description: "", serial_alias: "" }); }} size='xl' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent>
          <ModalHeader color={textColor}>Manage Categories</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px' align='stretch'>
              <HStack>
                <InputGroup width='100%'>
                  <InputLeftElement pointerEvents='none'>
                    <Icon as={FaSearch} color='gray.400' />
                  </InputLeftElement>
                  <Input placeholder='Search categories...' value={catSearchInput} onChange={(e) => setCatSearchInput(e.target.value)} />
                  {catSearchInput && (
                    <InputRightElement>
                      <Button size='sm' variant='ghost' onClick={() => setCatSearchInput("")}> 
                        <Icon as={FaTimes} />
                      </Button>
                    </InputRightElement>
                  )}
                </InputGroup>
                <Button onClick={loadCategories} isDisabled={catLoading} variant='outline' borderColor='#FF8D28' color='#FF8D28'>Search</Button>
              </HStack>

              <HStack align='flex-start' spacing='16px'>
                <VStack flex='1' align='stretch' maxH='260px' overflowY='auto' borderWidth='1px' borderRadius='12px' p='12px' borderColor={useColorModeValue('gray.200','gray.600')}>
                  {catLoading && (
                    <Flex align='center' justify='center' py='24px'>
                      <Spinner color='#FF8D28' />
                    </Flex>
                  )}
                  {!catLoading && categories.map((c) => (
                    <Flex key={c.id} justify='space-between' align='center' p='8px' borderRadius='8px' _hover={{ bg: useColorModeValue('gray.50','gray.700') }}>
                      <Text fontWeight='semibold'>{c.name}</Text>
                      <HStack>
                        <Button size='xs' variant='outline' onClick={() => setCatForm({ id: c.id, name: c.name, description: c.description || "", serial_alias: c.serial_alias || "" })}>Edit</Button>
                        <Button size='xs' variant='ghost' color='red.400' onClick={async () => { if (!window.confirm(`Delete category "${c.name}"?`)) return; try { await factoryStockService.deleteCategory(c.id); await loadCategories(); } catch (e) { alert(e?.message || 'Failed to delete category'); } }}>Delete</Button>
                      </HStack>
                    </Flex>
                  ))}
                  {!catLoading && categories.length === 0 && (
                    <Text color='gray.500' textAlign='center'>No categories</Text>
                  )}
                </VStack>

                <VStack flex='1' align='stretch' borderWidth='1px' borderRadius='12px' p='12px' borderColor={useColorModeValue('gray.200','gray.600')}>
                  <Text fontWeight='bold' color={textColor}>{catForm.id ? 'Edit Category' : 'Create Category'}</Text>
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Name</FormLabel>
                    <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder='e.g., Beverages' />
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textColor}>Description</FormLabel>
                    <Input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder='Optional description' />
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textColor}>Serial Alias (Optional - Used for auto-generating product serials)</FormLabel>
                    <Input value={catForm.serial_alias} onChange={(e) => setCatForm({ ...catForm, serial_alias: e.target.value })} placeholder='e.g., PROD, ITEM, etc.' />
                    <Text fontSize='xs' color='gray.500' mt='1'>
                      Products in this category will have serials like: {catForm.serial_alias || 'ALIAS'}-001, {catForm.serial_alias || 'ALIAS'}-002, etc.
                    </Text>
                  </FormControl>
                  <HStack>
                    <Button
                      bg='#FF8D28'
                      color='white'
                      _hover={{ bg: '#E67E22' }}
                      onClick={async () => {
                        if (!catForm.name.trim()) return;
                        try {
                          if (catForm.id) {
                            await factoryStockService.updateCategory(catForm.id, { name: catForm.name.trim(), description: catForm.description || undefined, serial_alias: catForm.serial_alias || undefined });
                          } else {
                            await factoryStockService.createCategory({ name: catForm.name.trim(), description: catForm.description || undefined, serial_alias: catForm.serial_alias || undefined });
                          }
                          setCatForm({ id: null, name: "", description: "", serial_alias: "" });
                          await loadCategories();
                        } catch (e) {
                          alert(e?.message || 'Failed to save category');
                        }
                      }}
                    >
                      {catForm.id ? 'Update' : 'Create'}
                    </Button>
                    {catForm.id && (
                      <Button variant='outline' onClick={() => setCatForm({ id: null, name: "", description: "", serial_alias: "" })}>Cancel</Button>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Units CRUD Modal */}
      <Modal isOpen={isUnitOpen} onClose={() => { onUnitClose(); setUnitForm({ id: null, name: "", symbol: "", description: "" }); }} size='xl' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent>
          <ModalHeader color={textColor}>Manage Units</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px' align='stretch'>
              <HStack>
                <InputGroup width='100%'>
                  <InputLeftElement pointerEvents='none'>
                    <Icon as={FaSearch} color='gray.400' />
                  </InputLeftElement>
                  <Input placeholder='Search units...' value={unitSearchInput} onChange={(e) => setUnitSearchInput(e.target.value)} />
                  {unitSearchInput && (
                    <InputRightElement>
                      <Button size='sm' variant='ghost' onClick={() => setUnitSearchInput("")}> 
                        <Icon as={FaTimes} />
                      </Button>
                    </InputRightElement>
                  )}
                </InputGroup>
                <Button onClick={loadUnits} isDisabled={unitLoading} variant='outline' borderColor='#FF8D28' color='#FF8D28'>Search</Button>
              </HStack>

              <HStack align='flex-start' spacing='16px'>
                <VStack flex='1' align='stretch' maxH='260px' overflowY='auto' borderWidth='1px' borderRadius='12px' p='12px' borderColor={useColorModeValue('gray.200','gray.600')}>
                  {unitLoading && (
                    <Flex align='center' justify='center' py='24px'>
                      <Spinner color='#FF8D28' />
                    </Flex>
                  )}
                  {!unitLoading && units.map((u) => (
                    <Flex key={u.id} justify='space-between' align='center' p='8px' borderRadius='8px' _hover={{ bg: useColorModeValue('gray.50','gray.700') }}>
                      <HStack>
                        <Text fontWeight='semibold'>{u.name}</Text>
                        {u.symbol && <Text color='gray.500'>({u.symbol})</Text>}
                      </HStack>
                      <HStack>
                        <Button size='xs' variant='outline' onClick={() => setUnitForm({ id: u.id, name: u.name, symbol: u.symbol || "", description: u.description || "" })}>Edit</Button>
                        <Button size='xs' variant='ghost' color='red.400' onClick={async () => { if (!window.confirm(`Delete unit "${u.name}"?`)) return; try { await factoryStockService.deleteUnit(u.id); await loadUnits(); } catch (e) { alert(e?.message || 'Failed to delete unit'); } }}>Delete</Button>
                      </HStack>
                    </Flex>
                  ))}
                  {!unitLoading && units.length === 0 && (
                    <Text color='gray.500' textAlign='center'>No units</Text>
                  )}
                </VStack>

                <VStack flex='1' align='stretch' borderWidth='1px' borderRadius='12px' p='12px' borderColor={useColorModeValue('gray.200','gray.600')}>
                  <Text fontWeight='bold' color={textColor}>{unitForm.id ? 'Edit Unit' : 'Create Unit'}</Text>
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Name</FormLabel>
                    <Input value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} placeholder='e.g., Kilogram' />
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textColor}>Symbol</FormLabel>
                    <Input value={unitForm.symbol} onChange={(e) => setUnitForm({ ...unitForm, symbol: e.target.value })} placeholder='e.g., kg' />
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textColor}>Description</FormLabel>
                    <Input value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} placeholder='Optional description' />
                  </FormControl>
                  <HStack>
                    <Button
                      bg='#FF8D28'
                      color='white'
                      _hover={{ bg: '#E67E22' }}
                      onClick={async () => {
                        if (!unitForm.name.trim()) return;
                        try {
                          if (unitForm.id) {
                            await factoryStockService.updateUnit(unitForm.id, { name: unitForm.name.trim(), symbol: unitForm.symbol || undefined, description: unitForm.description || undefined });
                          } else {
                            await factoryStockService.createUnit({ name: unitForm.name.trim(), symbol: unitForm.symbol || undefined, description: unitForm.description || undefined });
                          }
                          setUnitForm({ id: null, name: "", symbol: "", description: "" });
                          await loadUnits();
                        } catch (e) {
                          alert(e?.message || 'Failed to save unit');
                        }
                      }}
                    >
                      {unitForm.id ? 'Update' : 'Create'}
                    </Button>
                    {unitForm.id && (
                      <Button variant='outline' onClick={() => setUnitForm({ id: null, name: "", symbol: "", description: "" })}>Cancel</Button>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Produce Stock Item Modal */}
      <Modal isOpen={isProduceOpen} onClose={onProduceClose} size='md' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent>
          <ModalHeader color={textColor}>Produce Stock Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            {producingItem && (
              <VStack spacing='16px'>
                <Box w='100%' p={4} bg='orange.50' borderRadius='md'>
                  <Text fontSize='sm' fontWeight='bold' color='orange.800' mb='2'>
                    Item: {producingItem.name}
                  </Text>
                </Box>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Quantity to Produce</FormLabel>
                  <Input
                    type='number'
                    min='1'
                    placeholder='Enter quantity'
                    value={produceQuantity}
                    onChange={(e) => setProduceQuantity(e.target.value)}
                  />
                </FormControl>
                <Text fontSize='sm' color='gray.600'>
                  This will consume raw materials from inventory automatically.
                </Text>
                <Button
                  colorScheme='teal'
                  bg='#FF8D28'
                  color='white'
                  _hover={{ bg: '#E67E22' }}
                  w='100%'
                  onClick={handleProduceSubmit}>
                  PRODUCE ITEMS
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default FactoryStockTable;
