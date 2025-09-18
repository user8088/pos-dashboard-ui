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

const Invoices = ({ title, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [query, setQuery] = React.useState("");
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
      // Prefer dedicated invoices endpoint
      const invRes = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api/api'}/core/invoices`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (invRes.ok) {
        const list = await invRes.json();
        const mapped = (Array.isArray(list) ? list : []).map((inv) => ({
          date: new Date(inv.issued_at || inv.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' }),
          code: inv.invoice_number ? `#${inv.invoice_number}` : `#INV-${inv.id}`,
          price: `PKR. ${inv.total_amount ?? inv.amount ?? 0}`,
          logo: () => null,
          format: 'PDF',
          _invoiceId: inv.id,
          _customerId: inv.customer_id || inv.customer?.id || null
        }));
        setInvoices(mapped);
      } else {
        // Fallback: group customer purchases into one invoice per customer
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api/api'}/core/customer`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!res.ok) { setInvoices([]); setIsLoading(false); return; }
        const customers = await res.json();
        const rows = [];
        customers.forEach((c) => {
          const list = Array.isArray(c.purchased_items) ? c.purchased_items : [];
          const total = list.reduce((sum, it) => sum + (it.line_total !== undefined ? it.line_total : (it.unit_price || 0) * (it.quantity || 0)), 0);
          rows.push({
            date: new Date(c.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' }),
            code: `#CUST-${c.id}`,
            price: `PKR. ${total}`,
            logo: () => null,
            format: 'PDF'
          });
        });
        setInvoices(rows);
      }
    } catch (e) {
      // ignore
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api/api'}/core/customer/${customerId}/invoice`, {
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api/api'}/core/invoices/${invoiceId}/download`, {
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
              invoices.map((row) => (
                <InvoicesRow
                  key={`${row.code}-${row.date}`}
                  date={row.date}
                  code={row.code}
                  price={row.price}
                  logo={row.logo}
                  format={row.format}
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
                placeholder='Search invoices by date, code or amount'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%'>
              {filtered.map((row) => (
                <InvoicesRow
                  key={`${row.code}-${row.date}`}
                  date={row.date}
                  code={row.code}
                  price={row.price}
                  logo={row.logo}
                  format={row.format}
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
