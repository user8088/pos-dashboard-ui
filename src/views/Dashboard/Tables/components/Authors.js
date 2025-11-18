// Chakra imports
import {
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
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
  Alert,
  AlertIcon,
  Box,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { useHistory } from "react-router-dom";
import logo from "assets/img/avatars/placeholder.png";
import { FaPlus, FaFileCsv, FaSearch, FaTimes, FaTags, FaInfoCircle } from "react-icons/fa";
import { stockService } from "services/stockService";
import { supplierService } from "services/supplierService";
import { accountService } from "services/accountService";
import StockTableRow from "components/Tables/StockTableRow";

const Authors = ({ title, captions, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isCatOpen, onOpen: onCatOpen, onClose: onCatClose } = useDisclosure();
  const { isOpen: isUnitOpen, onOpen: onUnitOpen, onClose: onUnitClose } = useDisclosure();
  const [newStock, setNewStock] = React.useState({
    name: "",
    serial_id: "",
    product_category_id: "",
    supplier_id: "",
    primary_unit_id: "",
    secondary_unit_id: "",
    secondary_per_primary: "",
    quantity: "",
    last_purchase_price: "",
    selling_price: "",
    image_url: "",
    status: "In Stock",
    create_supplier_transaction: false,
    transaction_serial: "",
    transaction_note: "",
    deposit_account_id: "",
  });
  const [editingStock, setEditingStock] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(-1);
  
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [catSearchInput, setCatSearchInput] = React.useState("");
  const [catLoading, setCatLoading] = React.useState(false);
  const [catForm, setCatForm] = React.useState({ id: null, name: "", description: "", serial_alias: "" });
  const [search, setSearch] = React.useState("");
  // Units
  const [units, setUnits] = React.useState([]);
  const [unitLoading, setUnitLoading] = React.useState(false);
  const [unitSearchInput, setUnitSearchInput] = React.useState("");
  const [unitForm, setUnitForm] = React.useState({ id: null, name: "", symbol: "", description: "" });
  // Suppliers
  const [suppliers, setSuppliers] = React.useState([]);
  const [supplierLoading, setSupplierLoading] = React.useState(false);
  // Accounts
  const [accounts, setAccounts] = React.useState([]);
  const [accountLoading, setAccountLoading] = React.useState(false);

  const getUnitLabel = React.useCallback((id) => {
    const u = units.find((x) => String(x.id) === String(id));
    return u ? `${u.name}${u.symbol ? ` (${u.symbol})` : ''}` : '';
  }, [units]);

  const swapUnits = (state, setState) => {
    const sellId = state.primary_unit_id;
    const invId = state.secondary_unit_id;
    const value = Number(state.secondary_per_primary || 0);
    const inverted = value > 0 ? (1 / value).toString() : "";
    setState({
      ...state,
      primary_unit_id: invId || "",
      secondary_unit_id: sellId || "",
      secondary_per_primary: inverted,
    });
  };

  const loadCategories = React.useCallback(async () => {
    try {
      setCatLoading(true);
      const params = catSearchInput ? { search: catSearchInput } : {};
      const resp = await stockService.listCategories(params);
      const list = resp?.data?.data || resp?.data || resp || [];
      setCategories(list.map(c => ({ id: c.id, name: c.name, description: c.description, serial_alias: c.serial_alias || '' })));
    } catch (e) {
      // non-blocking
    } finally {
      setCatLoading(false);
    }
  }, []);

  const loadItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = { search: search || undefined };
      const resp = await stockService.listItems(params);
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
        quantity: it.quantity ?? it.stock_quantity ?? it.inventory_quantity ?? it.qty ?? 0,
        secondary_per_primary: it.secondary_per_primary ? Number(it.secondary_per_primary) : null,
        // Ensure category is rendered as text, not an object
        category: (() => {
          const cat = it.category;
          if (cat && typeof cat === 'object') {
            return cat.name || cat.title || '';
          }
          return it.category_name || (typeof it.category === 'string' ? it.category : '') || '';
        })(),
        status: it.status || 'In Stock',
        lastPurchase: `PKR.${it.last_purchase_price != null ? Number(it.last_purchase_price).toFixed(2) : '0.00'}`,
        sellingPrice: `PKR.${it.selling_price != null ? Number(it.selling_price).toFixed(2) : '0.00'}`,
        supplier: (() => {
          if (it.supplier && typeof it.supplier === 'object') {
            return it.supplier.name || '';
          }
          return '';
        })(),
        highestPurchasePrice: it.highest_purchase_price != null ? Number(it.highest_purchase_price) : null,
        lowestPurchasePrice: it.lowest_purchase_price != null ? Number(it.lowest_purchase_price) : null,
        rawData: it, // Store raw data for editing
      }));
      setItems(rows);
    } catch (e) {
      // Silent error; avoid noisy UI
      console.warn('Items load failed', e);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadUnits = React.useCallback(async () => {
    try {
      setUnitLoading(true);
      const params = unitSearchInput ? { q: unitSearchInput } : {};
      const resp = await stockService.listUnits(params);
      const list = resp?.data?.data || resp?.data || resp || [];
      setUnits(list.map(u => ({ id: u.id, name: u.name, symbol: u.symbol, description: u.description })));
    } catch (e) {
      // non-blocking
    } finally {
      setUnitLoading(false);
    }
  }, [unitSearchInput]);

  const loadSuppliers = React.useCallback(async () => {
    try {
      setSupplierLoading(true);
      const resp = await supplierService.listSuppliers({ per_page: 100 });
      const data = resp?.data || resp || {};
      const list = Array.isArray(data) ? data : (data.data || data.suppliers || []);
      setSuppliers(list);
    } catch (e) {
      // non-blocking
    } finally {
      setSupplierLoading(false);
    }
  }, []);

  const loadAccounts = React.useCallback(async () => {
    try {
      setAccountLoading(true);
      const resp = await accountService.listAccounts({ is_active: true });
      const data = resp?.data || resp || {};
      const accountsList = Array.isArray(data) ? data : (data.accounts || data.data || []);
      // Show ALL active accounts (any account type can be used for payments)
      const activeAccounts = accountsList.filter(acc => acc.is_active !== false);
      setAccounts(activeAccounts);
    } catch (e) {
      // non-blocking
    } finally {
      setAccountLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
    loadUnits();
    loadSuppliers();
    loadAccounts();
  }, [loadCategories, loadUnits, loadSuppliers, loadAccounts]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Listen for stock updates (when invoices/sales are created)
  React.useEffect(() => {
    const handleStockUpdate = () => {
      loadItems();
    };
    
    // Listen for custom events from POS/sales
    window.addEventListener('stock-updated', handleStockUpdate);
    window.addEventListener('invoice-created', handleStockUpdate);
    window.addEventListener('sale-created', handleStockUpdate);
    
    return () => {
      window.removeEventListener('stock-updated', handleStockUpdate);
      window.removeEventListener('invoice-created', handleStockUpdate);
      window.removeEventListener('sale-created', handleStockUpdate);
    };
  }, [loadItems]);

  // Debounce search typing
  React.useEffect(() => {
    const handler = (e) => {
      const q = (e?.detail || '').toString();
      setSearch(q.trim());
    };
    window.addEventListener('app:search', handler);
    return () => window.removeEventListener('app:search', handler);
  }, []);

  // Stock management captions (updated for API fields)
  const stockCaptions = [
    "Serial ID",
    "Product",
    "Quantity",
    "Sell Unit",
    "Inventory Unit",
    "Category",
    "Status",
    "Last Purchase",
    "Selling Price",
    "Supplier",
    "",
  ];

  const handleAddStock = async () => {
    if (!newStock.name || !newStock.product_category_id || !newStock.primary_unit_id) return;
    const hasSecondaryAny = Boolean(newStock.secondary_unit_id) || Boolean(newStock.secondary_per_primary);
    if (hasSecondaryAny && !(newStock.secondary_unit_id && newStock.secondary_per_primary)) {
      alert('Please provide both Stocking Unit and "Stocking per 1 Selling" value.');
      return;
    }
    try {
      const primaryUnitText = getUnitLabel(newStock.primary_unit_id) || undefined;
      const secondaryUnitText = newStock.secondary_unit_id ? (getUnitLabel(newStock.secondary_unit_id) || undefined) : undefined;
      await stockService.createItem({
        name: newStock.name,
        serial_id: newStock.serial_id || undefined,
        product_category_id: Number(newStock.product_category_id),
        supplier_id: newStock.supplier_id ? Number(newStock.supplier_id) : undefined,
        primary_unit_id: Number(newStock.primary_unit_id),
        primary_unit: primaryUnitText,
        secondary_unit_id: newStock.secondary_unit_id ? Number(newStock.secondary_unit_id) : undefined,
        secondary_unit: secondaryUnitText,
        secondary_per_primary: newStock.secondary_per_primary ? Number(newStock.secondary_per_primary) : undefined,
        quantity: newStock.quantity !== "" ? Math.max(0, Number(newStock.quantity)) : undefined,
        last_purchase_price: Math.max(0, Number(newStock.last_purchase_price) || 0),
        selling_price: Math.max(0, Number(newStock.selling_price) || 0),
        image_url: newStock.image_url || undefined,
        create_supplier_transaction: newStock.create_supplier_transaction && newStock.quantity && Number(newStock.quantity) > 0 ? true : undefined,
        transaction_serial: newStock.transaction_serial || undefined,
        transaction_note: newStock.transaction_note || undefined,
        deposit_account_id: newStock.deposit_account_id ? Number(newStock.deposit_account_id) : undefined,
      });
      onClose();
      await loadItems();
      // Dispatch event to update accounts in real-time if supplier transaction was created
      if (newStock.create_supplier_transaction && newStock.quantity && Number(newStock.quantity) > 0) {
        window.dispatchEvent(new CustomEvent('supplier-transaction-created'));
        window.dispatchEvent(new CustomEvent('accounts-updated'));
      }
      setNewStock({
        name: "",
        serial_id: "",
        product_category_id: "",
        supplier_id: "",
        primary_unit_id: "",
        secondary_unit_id: "",
        secondary_per_primary: "",
        quantity: "",
        last_purchase_price: "",
        selling_price: "",
        image_url: "",
        status: "In Stock",
        create_supplier_transaction: false,
        transaction_serial: "",
        transaction_note: "",
        deposit_account_id: "",
      });
    } catch (e) {
      alert(e?.message || 'Failed to create item');
    }
  };

  const handleEditStock = (row, index) => {
    const raw = row.rawData || {};
    setEditingStock({
      name: row.name,
      serial_id: row.serialId || "",
      product_category_id: raw.product_category_id || "",
      supplier_id: raw.supplier_id ? String(raw.supplier_id) : "",
      primary_unit_id: raw.primary_unit_id || "",
      secondary_unit_id: raw.secondary_unit_id || "",
      secondary_per_primary: raw.secondary_per_primary ? String(raw.secondary_per_primary) : "",
      quantity: row.quantity != null ? String(row.quantity) : "",
      last_purchase_price: (row.lastPurchase || '').replace('PKR.', ''),
      selling_price: (row.sellingPrice || '').replace('PKR.', ''),
      image_url: raw.image_url || "",
      status: row.status || 'In Stock',
    });
    setEditIndex(index);
    onEditOpen();
  };

  const handleUpdateStock = async () => {
    if (!editingStock || !items[editIndex]) return;
    const hasSecondaryAny = Boolean(editingStock.secondary_unit_id) || Boolean(editingStock.secondary_per_primary);
    if (hasSecondaryAny && !(editingStock.secondary_unit_id && editingStock.secondary_per_primary)) {
      alert('Please provide both Secondary Unit and Secondary per Primary.');
      return;
    }
    try {
      const id = items[editIndex]?.id;
      if (!id) throw new Error('Item id not found');
      const primaryUnitText = editingStock.primary_unit_id ? (getUnitLabel(editingStock.primary_unit_id) || undefined) : undefined;
      const secondaryUnitText = editingStock.secondary_unit_id ? (getUnitLabel(editingStock.secondary_unit_id) || undefined) : undefined;
      await stockService.updateItem(id, {
        name: editingStock.name,
        serial_id: editingStock.serial_id || undefined,
        product_category_id: editingStock.product_category_id ? Number(editingStock.product_category_id) : undefined,
        supplier_id: editingStock.supplier_id ? Number(editingStock.supplier_id) : undefined,
        primary_unit_id: editingStock.primary_unit_id ? Number(editingStock.primary_unit_id) : undefined,
        primary_unit: primaryUnitText,
        secondary_unit_id: editingStock.secondary_unit_id ? Number(editingStock.secondary_unit_id) : undefined,
        secondary_unit: secondaryUnitText,
        secondary_per_primary: editingStock.secondary_per_primary ? Number(editingStock.secondary_per_primary) : undefined,
        quantity: editingStock.quantity !== "" ? Math.max(0, Number(editingStock.quantity)) : undefined,
        last_purchase_price: Math.max(0, Number(editingStock.last_purchase_price) || 0),
        selling_price: Math.max(0, Number(editingStock.selling_price) || 0),
        image_url: editingStock.image_url || undefined,
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
      await stockService.deleteItem(row.id);
      await loadItems();
    } catch (e) {
      alert(e?.message || 'Failed to delete item');
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

  return (
    <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex justify='space-between' align='center' w='100%'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Stock Management
          </Text>
          <HStack spacing='12px'>
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
        {/* Silent error state, no alert rendered */}
        <Table variant='simple' color={textColor}>
          <Thead position='sticky' top='0' zIndex='1' bg={useColorModeValue("white", "gray.700")}> 
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
            {loading && items.length === 0 && (
              <Tr>
                <Td colSpan={10} py='48px' textAlign='center'>
                  <Spinner thickness='3px' speed='0.65s' emptyColor='gray.200' color='#FF8D28' size='lg' />
                </Td>
              </Tr>
            )}
            {!loading && items.length === 0 && (
              <Tr>
                <Td colSpan={10} py='48px'>
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
                  key={`${row.id || row.name}-${index}`}
                  logo={row.logo}
                  name={row.name}
                  serialId={row.serialId}
                  quantity={row.quantity}
                  primaryUnit={row.primaryUnit}
                  secondaryUnit={row.secondaryUnit}
                  secondaryPerPrimary={row.secondary_per_primary}
                  category={row.category}
                  status={row.status}
                  lastPurchase={row.lastPurchase}
                  sellingPrice={row.sellingPrice}
                  supplier={row.supplier}
                  highestPurchasePrice={row.highestPurchasePrice}
                  lowestPurchasePrice={row.lowestPurchasePrice}
                  onEdit={() => handleEditStock(row, index)}
                  onDelete={() => handleDelete(index)}
                  onView={() => history.push(`/admin/stock-management/${row.id}`)}
                />
              );
            })}
          </Tbody>
        </Table>
        {/* Pagination and local search removed in favor of navbar search */}
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
                <FormLabel color={textColor}>Sell in</FormLabel>
                <Select
                  value={newStock.primary_unit_id}
                  onChange={(e) => setNewStock({ ...newStock, primary_unit_id: e.target.value })}
                  placeholder='Select sell unit (e.g., Kg, Box)'>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ''}</option>
                  ))}
                </Select>
                <Text mt='1' fontSize='sm' color='gray.500'>Customers see prices in this unit.</Text>
              </FormControl>

              <HStack align='flex-end' justify='space-between'>
                <FormControl>
                  <FormLabel color={textColor}>Inventory in</FormLabel>
                  <Select
                    value={newStock.secondary_unit_id}
                    onChange={(e) => setNewStock({ ...newStock, secondary_unit_id: e.target.value })}
                    placeholder='Optional inventory unit (e.g., Piece, Gram)'>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ''}</option>
                    ))}
                  </Select>
                  <Text mt='1' fontSize='sm' color='gray.500'>Smaller unit used for counting stock.</Text>
                </FormControl>
                <Button size='sm' variant='ghost' onClick={() => swapUnits(newStock, setNewStock)}>Swap units</Button>
                <FormControl>
                  <HStack spacing='6px' align='center'>
                    <FormLabel m='0' color={textColor}>1 {getUnitLabel(newStock.primary_unit_id) || 'Sell'} contains</FormLabel>
                    <Tooltip label='Enter how many inventory units are in one sell unit. Use Swap if your units are reversed.'>
                      <Icon as={FaInfoCircle} color='gray.400' />
                    </Tooltip>
                  </HStack>
                  <Input
                    type='number'
                    step='any'
                    placeholder={`e.g., 12 ${getUnitLabel(newStock.secondary_unit_id) || ''}`.trim()}
                    isDisabled={!newStock.secondary_unit_id}
                    value={newStock.secondary_per_primary}
                    onChange={(e) => setNewStock({ ...newStock, secondary_per_primary: e.target.value })}
                  />
                </FormControl>
              </HStack>
              {newStock.primary_unit_id && newStock.secondary_unit_id && Number(newStock.secondary_per_primary) > 0 && (
                <Text fontSize='sm' color='gray.500'>
                  {`1 Sell = ${Number(newStock.secondary_per_primary)} Inventory • 1 Inventory = ${
                    (1 / Number(newStock.secondary_per_primary)).toFixed(4)
                  } Sell`}
                </Text>
              )}

              <FormControl>
                <FormLabel color={textColor}>Initial Quantity</FormLabel>
                <Input
                  type='number'
                  step='any'
                  placeholder='Enter initial stock quantity (in primary unit)'
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                />
                <Text mt='1' fontSize='sm' color='gray.500'>
                  Current stock quantity in {getUnitLabel(newStock.primary_unit_id) || 'primary unit'}. Leave empty to start with 0.
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Category</FormLabel>
                <Select
                  value={newStock.product_category_id}
                  onChange={(e) => setNewStock({ ...newStock, product_category_id: e.target.value })}
                  placeholder='Select category'>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Supplier (Optional)</FormLabel>
                <Select
                  value={newStock.supplier_id}
                  onChange={(e) => setNewStock({ ...newStock, supplier_id: e.target.value })}
                  placeholder='Select supplier'
                  isDisabled={supplierLoading}>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
                <Text mt='1' fontSize='sm' color='gray.500'>Link this item to a supplier</Text>
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
                <FormLabel color={textColor}>Last Purchase Price (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter last purchase price'
                  value={newStock.last_purchase_price}
                  onChange={(e) => setNewStock({ ...newStock, last_purchase_price: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Selling Price (PKR)</FormLabel>
                <Input
                  type='number'
                  placeholder='Enter selling price'
                  value={newStock.selling_price}
                  onChange={(e) => setNewStock({ ...newStock, selling_price: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Image URL</FormLabel>
                <Input
                  placeholder='https://...'
                  value={newStock.image_url}
                  onChange={(e) => setNewStock({ ...newStock, image_url: e.target.value })}
                />
              </FormControl>

              {newStock.quantity && Number(newStock.quantity) > 0 && newStock.supplier_id && (
                <>
                  <FormControl>
                    <HStack>
                      <input
                        type='checkbox'
                        checked={newStock.create_supplier_transaction}
                        onChange={(e) => setNewStock({ ...newStock, create_supplier_transaction: e.target.checked })}
                      />
                      <FormLabel m='0' color={textColor}>Create supplier transaction for this purchase</FormLabel>
                    </HStack>
                    <Text mt='1' fontSize='sm' color='gray.500'>Record this purchase in supplier transaction history</Text>
                  </FormControl>

                  {newStock.create_supplier_transaction && (
                    <>
                      <FormControl>
                        <FormLabel color={textColor}>Transaction Serial (Optional)</FormLabel>
                        <Input
                          placeholder='e.g., INV-2025-001'
                          value={newStock.transaction_serial}
                          onChange={(e) => setNewStock({ ...newStock, transaction_serial: e.target.value })}
                        />
                        <Text mt='1' fontSize='sm' color='gray.500'>Invoice/bill serial number (auto-generated if empty)</Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel color={textColor}>Transaction Note (Optional)</FormLabel>
                        <Input
                          placeholder='e.g., Initial stock purchase'
                          value={newStock.transaction_note}
                          onChange={(e) => setNewStock({ ...newStock, transaction_note: e.target.value })}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color={textColor}>Payment Account (Optional)</FormLabel>
                        <Select
                          value={newStock.deposit_account_id}
                          onChange={(e) => setNewStock({ ...newStock, deposit_account_id: e.target.value })}
                          placeholder='Select account to pay from (any account type)'
                          isDisabled={accountLoading}>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name} ({acc.type || 'custom'}) - Balance: PKR {parseFloat(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </option>
                          ))}
                        </Select>
                        <Text mt='1' fontSize='sm' color='gray.500'>
                          Money will be deducted from this account. You can select any account type (cash, bank, revenue, expense, etc.). Defaults to cash if not selected.
                        </Text>
                      </FormControl>
                    </>
                  )}
                </>
              )}
              
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
                        <Button size='xs' variant='ghost' color='red.400' onClick={async () => { if (!window.confirm(`Delete category "${c.name}"?`)) return; try { await stockService.deleteCategory(c.id); await loadCategories(); } catch (e) { alert(e?.message || 'Failed to delete category'); } }}>Delete</Button>
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
                            await stockService.updateCategory(catForm.id, { name: catForm.name.trim(), description: catForm.description || undefined, serial_alias: catForm.serial_alias || undefined });
                          } else {
                            await stockService.createCategory({ name: catForm.name.trim(), description: catForm.description || undefined, serial_alias: catForm.serial_alias || undefined });
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
                        <Button size='xs' variant='ghost' color='red.400' onClick={async () => { if (!window.confirm(`Delete unit "${u.name}"?`)) return; try { await stockService.deleteUnit(u.id); await loadUnits(); } catch (e) { alert(e?.message || 'Failed to delete unit'); } }}>Delete</Button>
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
                            await stockService.updateUnit(unitForm.id, { name: unitForm.name.trim(), symbol: unitForm.symbol || undefined, description: unitForm.description || undefined });
                          } else {
                            await stockService.createUnit({ name: unitForm.name.trim(), symbol: unitForm.symbol || undefined, description: unitForm.description || undefined });
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
                  <FormLabel color={textColor}>Sell in</FormLabel>
                  <Select
                   value={editingStock.primary_unit_id || ''}
                   onChange={(e) => setEditingStock({ ...editingStock, primary_unit_id: e.target.value })}
                   placeholder='Select sell unit (e.g., Kg, Box)'>
                   {units.map((u) => (
                     <option key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ''}</option>
                   ))}
                  </Select>
                  <Text mt='1' fontSize='sm' color='gray.500'>Customers see prices in this unit.</Text>
                </FormControl>

               <HStack align='flex-end' justify='space-between'>
                 <FormControl>
                   <FormLabel color={textColor}>Inventory in</FormLabel>
                   <Select
                     value={editingStock.secondary_unit_id || ''}
                     onChange={(e) => setEditingStock({ ...editingStock, secondary_unit_id: e.target.value })}
                     placeholder='Optional inventory unit (e.g., Piece, Gram)'>
                     {units.map((u) => (
                       <option key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ''}</option>
                     ))}
                   </Select>
                   <Text mt='1' fontSize='sm' color='gray.500'>Smaller unit used for counting stock.</Text>
                 </FormControl>
                 <Button size='sm' variant='ghost' onClick={() => swapUnits(editingStock, setEditingStock)}>Swap units</Button>
                 <FormControl>
                   <HStack spacing='6px' align='center'>
                     <FormLabel m='0' color={textColor}>1 {getUnitLabel(editingStock.primary_unit_id) || 'Sell'} contains</FormLabel>
                     <Tooltip label='Enter how many inventory units are in one sell unit. Use Swap if your units are reversed.'>
                       <Icon as={FaInfoCircle} color='gray.400' />
                     </Tooltip>
                   </HStack>
                   <Input
                     type='number'
                     step='any'
                     placeholder={`e.g., 12 ${getUnitLabel(editingStock.secondary_unit_id) || ''}`.trim()}
                     isDisabled={!editingStock.secondary_unit_id}
                     value={editingStock.secondary_per_primary || ''}
                     onChange={(e) => setEditingStock({ ...editingStock, secondary_per_primary: e.target.value })}
                   />
                 </FormControl>
               </HStack>
               {editingStock.primary_unit_id && editingStock.secondary_unit_id && Number(editingStock.secondary_per_primary) > 0 && (
                 <Text fontSize='sm' color='gray.500'>
                   {`1 Sell = ${Number(editingStock.secondary_per_primary)} Inventory • 1 Inventory = ${
                     (1 / Number(editingStock.secondary_per_primary)).toFixed(4)
                   } Sell`}
                 </Text>
               )}

                <FormControl>
                  <FormLabel color={textColor}>Quantity</FormLabel>
                  <Input
                    type='number'
                    step='any'
                    placeholder='Enter stock quantity (in primary unit)'
                    value={editingStock.quantity || ''}
                    onChange={(e) => setEditingStock({ ...editingStock, quantity: e.target.value })}
                  />
                  <Text mt='1' fontSize='sm' color='gray.500'>
                    Current stock quantity in {getUnitLabel(editingStock.primary_unit_id) || 'primary unit'}. This is the actual inventory count.
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Category</FormLabel>
                  <Select
                    value={editingStock.product_category_id || ''}
                    onChange={(e) => setEditingStock({ ...editingStock, product_category_id: e.target.value })}
                    placeholder='Select category'>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Supplier (Optional)</FormLabel>
                  <Select
                    value={editingStock.supplier_id || ''}
                    onChange={(e) => setEditingStock({ ...editingStock, supplier_id: e.target.value })}
                    placeholder='Select supplier'
                    isDisabled={supplierLoading}>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                  <Text mt='1' fontSize='sm' color='gray.500'>Link this item to a supplier</Text>
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
                  <FormLabel color={textColor}>Last Purchase Price (PKR)</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter last purchase price'
                    value={editingStock.last_purchase_price}
                    onChange={(e) => setEditingStock({ ...editingStock, last_purchase_price: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Selling Price (PKR)</FormLabel>
                  <Input
                    type='number'
                    placeholder='Enter selling price'
                    value={editingStock.selling_price}
                    onChange={(e) => setEditingStock({ ...editingStock, selling_price: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Image URL</FormLabel>
                  <Input
                    placeholder='https://...'
                    value={editingStock.image_url}
                    onChange={(e) => setEditingStock({ ...editingStock, image_url: e.target.value })}
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
