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
  Spinner,
  Box,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import RawMaterialTableRow from "components/Tables/RawMaterialTableRow";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv } from "react-icons/fa";
import { factoryStockService } from "services/factoryStockService";

const RawMaterialTable = ({ title, captions }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [newMaterial, setNewMaterial] = React.useState({
    name: "",
    unit_id: "",
    custom_unit: "",
    quantity: "",
    quantity_per_unit: "1",
    supplier_name: "",
    supplier_id: "",
    last_price: "",
    status: "delivered",
    notes: "",
  });
  const [editingMaterial, setEditingMaterial] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [units, setUnits] = React.useState([]);
  const [unitLoading, setUnitLoading] = React.useState(false);
  const [unitSearchInput, setUnitSearchInput] = React.useState("");
  const [rawMaterials, setRawMaterials] = React.useState([]);
  const [useCustomUnit, setUseCustomUnit] = React.useState(false);

  const history = React.useCallback(() => {
    // History callback placeholder
  }, []);

  const getUnitLabel = React.useCallback((id) => {
    const u = units.find((x) => String(x.id) === String(id));
    return u ? `${u.name}${u.symbol ? ` (${u.symbol})` : ''}` : '';
  }, [units]);

  const loadUnits = React.useCallback(async () => {
    try {
      setUnitLoading(true);
      const params = unitSearchInput ? { search: unitSearchInput } : {};
      const resp = await factoryStockService.listUnits(params);
      const list = resp?.data?.data || resp?.data || resp || [];
      setUnits(list.map(u => ({ id: u.id, name: u.name, symbol: u.symbol })));
    } catch (e) {
      console.warn('Units load failed', e);
    } finally {
      setUnitLoading(false);
    }
  }, [unitSearchInput]);

  React.useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const loadItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await factoryStockService.listRawMaterials();
      const raw = resp?.data?.data || resp?.data || resp || [];
      const rows = raw.map((it) => ({
        id: it.id,
        logo: logo,
        name: it.name,
        amountPerUnit: `${it.quantity} ${(() => {
          if (it.unit && typeof it.unit === 'object') {
            return it.unit.symbol || it.unit.name || '';
          }
          return it.unit_name || it.custom_unit || '';
        })()}`,
        totalPurchaseCost: `PKR.${Number(it.last_price || 0).toFixed(2)}`,
        invoiceLink: "View Details",
        status: it.status === 'delivered' ? 'Delivered' : 'Pending',
        amountPending: "N/A",
        rawData: it,
      }));
      setRawMaterials(rows);
    } catch (e) {
      console.warn('Raw materials load failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.last_price || !newMaterial.status) return;
    if (!newMaterial.unit_id && !newMaterial.custom_unit) {
      alert('Please provide either a unit or custom unit.');
      return;
    }
    try {
      await factoryStockService.createRawMaterial({
        name: newMaterial.name,
        unit_id: newMaterial.unit_id ? Number(newMaterial.unit_id) : undefined,
        custom_unit: newMaterial.custom_unit || undefined,
        quantity: Number(newMaterial.quantity || 0),
        quantity_per_unit: Number(newMaterial.quantity_per_unit || 1),
        supplier_name: newMaterial.supplier_name || undefined,
        supplier_id: newMaterial.supplier_id ? Number(newMaterial.supplier_id) : undefined,
        last_price: Number(newMaterial.last_price || 0),
        status: newMaterial.status,
        notes: newMaterial.notes || undefined,
      });
      onClose();
      await loadItems();
      setNewMaterial({
        name: "",
        unit_id: "",
        custom_unit: "",
        quantity: "",
        quantity_per_unit: "1",
        supplier_name: "",
        supplier_id: "",
        last_price: "",
        status: "delivered",
        notes: "",
      });
      setUseCustomUnit(false);
    } catch (e) {
      alert(e?.message || 'Failed to create raw material');
    }
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial) return;
    if (!editingMaterial.name || !editingMaterial.last_price || !editingMaterial.status) return;
    if (!editingMaterial.unit_id && !editingMaterial.custom_unit) {
      alert('Please provide either a unit or custom unit.');
      return;
    }
    try {
      const id = rawMaterials[editIndex]?.id;
      if (!id) throw new Error('Raw material id not found');
      await factoryStockService.updateRawMaterial(id, {
        name: editingMaterial.name,
        unit_id: editingMaterial.unit_id ? Number(editingMaterial.unit_id) : undefined,
        custom_unit: editingMaterial.custom_unit || undefined,
        quantity: Number(editingMaterial.quantity || 0),
        quantity_per_unit: Number(editingMaterial.quantity_per_unit || 1),
        supplier_name: editingMaterial.supplier_name || undefined,
        supplier_id: editingMaterial.supplier_id ? Number(editingMaterial.supplier_id) : undefined,
        last_price: Number(editingMaterial.last_price || 0),
        status: editingMaterial.status,
        notes: editingMaterial.notes || undefined,
      });
      onEditClose();
      await loadItems();
      setEditingMaterial(null);
      setEditIndex(-1);
    } catch (e) {
      alert(e?.message || 'Failed to update raw material');
    }
  };

  const handleDelete = async (index) => {
    const row = rawMaterials[index];
    if (!row) return;
    const ok = window.confirm(`Delete raw material "${row.name}"?`);
    if (!ok) return;
    try {
      await factoryStockService.deleteRawMaterial(row.id);
      await loadItems();
    } catch (e) {
      alert(e?.message || 'Failed to delete raw material');
    }
  };

  const handleEdit = (index) => {
    const row = rawMaterials[index];
    const raw = row.rawData || {};
    setEditingMaterial({
      name: row.name,
      unit_id: raw.unit_id || "",
      custom_unit: raw.custom_unit || "",
      quantity: raw.quantity || "",
      quantity_per_unit: raw.quantity_per_unit || "1",
      supplier_name: raw.supplier_name || "",
      supplier_id: raw.supplier_id || "",
      last_price: raw.last_price || "",
      status: raw.status || 'delivered',
      notes: raw.notes || "",
    });
    setUseCustomUnit(Boolean(raw.custom_unit));
    setEditIndex(index);
    onEditOpen();
  };

  const handleImportCSV = () => {
    alert("CSV import functionality would be implemented here.");
  };

  const handleExportCSV = () => {
    alert("CSV export functionality would be implemented here.");
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
          <Thead
            position='sticky'
            top='0'
            zIndex='1'
            bg={useColorModeValue("white", "gray.700")}
          >
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
            {loading ? (
              <Tr>
                <Td colSpan={captions.length} textAlign='center'>
                  <Flex justify='center' align='center' py='8'>
                    <Spinner size='md' color='orange.500' />
                  </Flex>
                </Td>
              </Tr>
            ) : rawMaterials.length === 0 ? (
              <Tr>
                <Td colSpan={captions.length} textAlign='center'>
                  <Box py='8'>
                    <Text fontSize='lg' color='gray.500'>
                      No raw materials found
                    </Text>
                  </Box>
                </Td>
              </Tr>
            ) : (
              rawMaterials.map((row, index) => {
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
                    onEdit={() => handleEdit(index)}
                    onDelete={() => handleDelete(index)}
                  />
                );
              })
            )}
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
              
              <FormControl>
                <FormLabel color={textColor}>Use Custom Unit</FormLabel>
                <Select
                  value={useCustomUnit ? 'custom' : 'standard'}
                  onChange={(e) => setUseCustomUnit(e.target.value === 'custom')}
                >
                  <option value='standard'>Standard Unit</option>
                  <option value='custom'>Custom Unit</option>
                </Select>
              </FormControl>

              {!useCustomUnit ? (
                <FormControl>
                  <FormLabel color={textColor}>Unit</FormLabel>
                  <Select
                    value={newMaterial.unit_id}
                    onChange={(e) => setNewMaterial({...newMaterial, unit_id: e.target.value})}
                    placeholder='Select unit'>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl>
                  <FormLabel color={textColor}>Custom Unit</FormLabel>
                  <Input
                    placeholder='Enter custom unit (e.g., kgs, pcs, etc.)'
                    value={newMaterial.custom_unit}
                    onChange={(e) => setNewMaterial({...newMaterial, custom_unit: e.target.value})}
                  />
                </FormControl>
              )}
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Quantity</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter quantity'
                  value={newMaterial.quantity}
                  onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Quantity Per Unit</FormLabel>
                <Input
                  type='number'
                  step='0.0001'
                  placeholder='Enter quantity per unit'
                  value={newMaterial.quantity_per_unit}
                  onChange={(e) => setNewMaterial({...newMaterial, quantity_per_unit: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Supplier Name</FormLabel>
                <Input
                  placeholder='Enter supplier name'
                  value={newMaterial.supplier_name}
                  onChange={(e) => setNewMaterial({...newMaterial, supplier_name: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Last Purchase Price (PKR)</FormLabel>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='Enter price per unit'
                  value={newMaterial.last_price}
                  onChange={(e) => setNewMaterial({...newMaterial, last_price: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Status</FormLabel>
                <Select
                  value={newMaterial.status}
                  onChange={(e) => setNewMaterial({...newMaterial, status: e.target.value})}>
                  <option value='delivered'>Delivered</option>
                  <option value='pending'>Pending</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Notes</FormLabel>
                <Input
                  placeholder='Enter notes (optional)'
                  value={newMaterial.notes}
                  onChange={(e) => setNewMaterial({...newMaterial, notes: e.target.value})}
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
                
                <FormControl>
                  <FormLabel color={textColor}>Use Custom Unit</FormLabel>
                  <Select
                    value={useCustomUnit ? 'custom' : 'standard'}
                    onChange={(e) => setUseCustomUnit(e.target.value === 'custom')}
                  >
                    <option value='standard'>Standard Unit</option>
                    <option value='custom'>Custom Unit</option>
                  </Select>
                </FormControl>

                {!useCustomUnit ? (
                  <FormControl>
                    <FormLabel color={textColor}>Unit</FormLabel>
                    <Select
                      value={editingMaterial.unit_id}
                      onChange={(e) => setEditingMaterial({...editingMaterial, unit_id: e.target.value})}
                      placeholder='Select unit'>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl>
                    <FormLabel color={textColor}>Custom Unit</FormLabel>
                    <Input
                      placeholder='Enter custom unit'
                      value={editingMaterial.custom_unit}
                      onChange={(e) => setEditingMaterial({...editingMaterial, custom_unit: e.target.value})}
                    />
                  </FormControl>
                )}
                
                <FormControl isRequired>
                  <FormLabel color={textColor}>Quantity</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter quantity'
                    value={editingMaterial.quantity}
                    onChange={(e) => setEditingMaterial({...editingMaterial, quantity: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Quantity Per Unit</FormLabel>
                  <Input
                    type='number'
                    step='0.0001'
                    placeholder='Enter quantity per unit'
                    value={editingMaterial.quantity_per_unit}
                    onChange={(e) => setEditingMaterial({...editingMaterial, quantity_per_unit: e.target.value})}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Supplier Name</FormLabel>
                  <Input
                    placeholder='Enter supplier name'
                    value={editingMaterial.supplier_name}
                    onChange={(e) => setEditingMaterial({...editingMaterial, supplier_name: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Last Purchase Price (PKR)</FormLabel>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='Enter price per unit'
                    value={editingMaterial.last_price}
                    onChange={(e) => setEditingMaterial({...editingMaterial, last_price: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Status</FormLabel>
                  <Select
                    value={editingMaterial.status}
                    onChange={(e) => setEditingMaterial({...editingMaterial, status: e.target.value})}>
                    <option value='delivered'>Delivered</option>
                    <option value='pending'>Pending</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Notes</FormLabel>
                  <Input
                    placeholder='Enter notes (optional)'
                    value={editingMaterial.notes}
                    onChange={(e) => setEditingMaterial({...editingMaterial, notes: e.target.value})}
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
