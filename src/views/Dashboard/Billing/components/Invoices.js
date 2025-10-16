// Chakra imports
import {
  Button,
  Flex,
  Text,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
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
import InvoicesRow from "components/Tables/InvoicesRow";
import React from "react";
import { FiSearch } from "react-icons/fi";
import { useSearch } from "contexts/SearchContext";

const Invoices = ({ title, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [query, setQuery] = React.useState("");
  const { filterData, isSearchActive } = useSearch();
  const [newInvoice, setNewInvoice] = React.useState({
    date: "",
    code: "",
    price: "",
    format: "PDF"
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [invoices, setInvoices] = React.useState(data || []);

  React.useEffect(() => {
    fetchInvoices();
    const handler = () => fetchInvoices();
    window.addEventListener('refresh-invoices', handler);
    return () => window.removeEventListener('refresh-invoices', handler);
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      // Fetch all customers
      const customersRes = await fetch(`${apiUrl}/core/customer`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      if (!customersRes.ok) { 
        setInvoices([]); 
        setIsLoading(false); 
        return; 
      }
      
      const customers = await customersRes.json();
      const allInvoices = [];
      
      // For each customer, get their initial purchase and all subsequent purchases
      for (const customer of customers) {
        const customerName = customer.customer_name || 'Unknown Customer';
        
        // Add initial purchase invoice
        if (customer.total_bill && parseFloat(customer.total_bill) > 0) {
          allInvoices.push({
            date: new Date(customer.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' }),
            code: customer.customer_code ? `#${customer.customer_code}` : `#CUST-${customer.id}`,
            price: `PKR. ${parseFloat(customer.total_bill || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            logo: () => null,
            format: 'PDF',
            customerName: customerName,
            _customerId: customer.id,
            _sortDate: new Date(customer.created_at || Date.now())
          });
        }
        
        // Fetch and add all subsequent purchases for this customer
        try {
          const purchasesRes = await fetch(`${apiUrl}/core/customer/${customer.id}/purchases`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          });
          
          if (purchasesRes.ok) {
            const purchasesData = await purchasesRes.json();
            if (purchasesData.success && purchasesData.data && purchasesData.data.purchases) {
              purchasesData.data.purchases.forEach(purchase => {
                allInvoices.push({
                  date: new Date(purchase.purchased_at || purchase.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' }),
                  code: `#${purchase.purchase_code}`,
                  price: `PKR. ${parseFloat(purchase.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  logo: () => null,
                  format: 'PDF',
                  customerName: customerName,
                  _invoiceId: purchase.invoice_id,
                  _purchaseId: purchase.id,
                  _customerId: customer.id,
                  _sortDate: new Date(purchase.purchased_at || purchase.created_at || Date.now())
                });
              });
            }
          }
        } catch (e) {
          // Continue with other customers if one fails
        }
      }
      
      // Sort by date descending (newest first)
      allInvoices.sort((a, b) => b._sortDate - a._sortDate);
      
      setInvoices(allInvoices);
    } catch (e) {
      console.error('Error fetching invoices:', e);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const navbarGlassBg = useColorModeValue(
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );
  const navbarGlassBorder = useColorModeValue(
    "1.5px solid #FFFFFF",
    "1.5px solid rgba(255, 255, 255, 0.31)"
  );

  const sortedData = React.useMemo(() => {
    return [...invoices].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [invoices]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    return sortedData.filter(
      (row) =>
        row.date.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        (row.price || "").toLowerCase().includes(q)
    );
  }, [sortedData, query]);

  const handleAddInvoice = () => {
    if (!newInvoice.date || !newInvoice.code || !newInvoice.price) return;
    
    const newInvoiceData = {
      date: newInvoice.date,
      code: newInvoice.code,
      price: newInvoice.price,
      logo: "https://demos.creative-tim.com/vision-ui-dashboard-chakra/static/media/atlassian.0e9c0b4b.svg",
      format: newInvoice.format
    };
    
    setInvoices((prev) => [newInvoiceData, ...prev]);
    setNewInvoice({
      date: "",
      code: "",
      price: "",
      format: "PDF"
    });
    onAddClose();
  };

  const downloadCustomerPdf = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/customer/${customerId}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${customerId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {}
  };

  const downloadInvoiceById = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/invoices/${invoiceId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <Card
      p='22px'
      my={{ sm: "24px", lg: "0px" }}
      ms={{ sm: "0px", lg: "24px" }}>
      <CardHeader>
        <Flex justify='space-between' align='center' mb='1rem' w='100%'>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            {title}
          </Text>
          <HStack spacing='12px'>
            <Button
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onAddOpen}>
              ADD NEW
            </Button>
            <Button
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onOpen}>
              VIEW ALL
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction='column' w='100%'>
          {isLoading ? (
            <Text color={textColor} fontSize='sm'>Loading invoices...</Text>
          ) : (
            invoices.length === 0 ? (
              <Flex align='center' justify='center' w='100%' minH={{ base: '50vh', md: '60vh' }}>
                <Flex direction='column' align='center' justify='center' p='24px' w={{ base: '100%', md: '60%' }} maxW='520px' borderRadius='16px' bg={useColorModeValue('white', 'gray.700')} border={useColorModeValue('1px solid #EDF2F7', '1px solid rgba(255,255,255,0.12)')} boxShadow={useColorModeValue('0 4px 12px rgba(0,0,0,0.06)', 'none')}>
                  <Text fontSize='lg' fontWeight='bold' color={textColor} mb='6px'>No invoices yet</Text>
                  <Text fontSize='sm' color={subTextColor} textAlign='center' mb='12px'>Create or attach an invoice to see it here. You can search and view all invoices anytime.</Text>
                  <Button size='sm' colorScheme='teal' bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={onAddOpen}>ADD NEW</Button>
                </Flex>
              </Flex>
            ) : (
              filterData(invoices, ['date', 'code', 'price', 'format', 'customerName']).slice(0, 6).map((row) => (
                <InvoicesRow
                  key={`${row.code}-${row.date}`}
                  date={row.date}
                  code={row.code}
                  price={row.price}
                  logo={row.logo}
                  format={row.format}
                  customerName={row.customerName}
                  onDownload={row._invoiceId ? () => downloadInvoiceById(row._invoiceId) : (row._customerId ? () => downloadCustomerPdf(row._customerId) : undefined)}
                />
              ))
            )
          )}
        </Flex>
      </CardBody>
      {/* Glassy Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='4xl' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb='16px'>
              <InputLeftElement pointerEvents='none'>
                <FiSearch color={useColorModeValue("#718096", "#A0AEC0")} />
              </InputLeftElement>
              <Input
                placeholder='Search invoices by date, code, amount or customer'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%'>
              {filterData(filtered, ['date', 'code', 'price', 'format', 'customerName']).map((row) => (
                <InvoicesRow
                  key={`${row.code}-${row.date}`}
                  date={row.date}
                  code={row.code}
                  price={row.price}
                  logo={row.logo}
                  format={row.format}
                  customerName={row.customerName}
                  onDownload={row._invoiceId ? () => downloadInvoiceById(row._invoiceId) : (row._customerId ? () => downloadCustomerPdf(row._customerId) : undefined)}
                />
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add New Invoice Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>Add New Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl>
                <FormLabel color={textColor}>Date</FormLabel>
                <Input
                  type='date'
                  value={newInvoice.date}
                  onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Invoice Code</FormLabel>
                <Input
                  placeholder='Enter invoice code'
                  value={newInvoice.code}
                  onChange={(e) => setNewInvoice({...newInvoice, code: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Amount</FormLabel>
                <Input
                  placeholder='Enter amount'
                  value={newInvoice.price}
                  onChange={(e) => setNewInvoice({...newInvoice, price: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Format</FormLabel>
                <Select
                  value={newInvoice.format}
                  onChange={(e) => setNewInvoice({...newInvoice, format: e.target.value})}
                  placeholder='Select format'>
                  <option value='PDF'>PDF</option>
                  <option value='DOC'>DOC</option>
                  <option value='XLS'>XLS</option>
                </Select>
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddInvoice}>
                ADD INVOICE
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default Invoices;
