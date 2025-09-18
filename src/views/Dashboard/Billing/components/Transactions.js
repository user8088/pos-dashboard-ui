// Chakra imports
import {
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  useToast,
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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Box,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TransactionRow from "components/Tables/TransactionRow";
import React from "react";
import { FaRegCalendarAlt, FaPlus } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const Transactions = ({
  title,
  date,
}) => {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const toast = useToast();
  const [query, setQuery] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [transactions, setTransactions] = React.useState([]);
  const [accounts, setAccounts] = React.useState([]);
  const [newTransaction, setNewTransaction] = React.useState({
    title: "",
    transacted_at: "",
    amount: "",
    type: "inflow",
    account_id: "",
    notes: ""
  });

  React.useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    setIsLoading(true);
    await Promise.all([fetchTransactions(), fetchAccounts()]);
    setIsLoading(false);
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/transactions`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) {
        setTransactions([]);
        toast({ title: 'Failed to load transactions', status: 'error', duration: 3000, isClosable: true });
        return;
      }
      const list = await res.json();
      const mapped = (Array.isArray(list) ? list : []).map(t => ({
        id: t.id,
        title: t.title || t.name || 'Transaction',
        type: t.type, // inflow | outflow
        amount: parseFloat(t.amount || 0),
        account: t.account?.account_name || `Account #${t.account_id || ''}`,
        transacted_at: t.transacted_at || t.created_at || new Date().toISOString(),
      }));
      setTransactions(mapped);
    } catch {
      setTransactions([]);
      toast({ title: 'Error loading transactions', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/accounts`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) { setAccounts([]); toast({ title: 'Failed to load accounts', status: 'error', duration: 3000, isClosable: true }); return; }
      const list = await res.json();
      setAccounts(Array.isArray(list) ? list : []);
    } catch { setAccounts([]); toast({ title: 'Error loading accounts', status: 'error', duration: 3000, isClosable: true }); }
  };

  const handleDeleteTransaction = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) { toast({ title: 'Failed to delete transaction', status: 'error', duration: 3000, isClosable: true }); return; }
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Transaction deleted', status: 'success', duration: 2500, isClosable: true });
    } catch {
      toast({ title: 'Error deleting transaction', status: 'error', duration: 3000, isClosable: true });
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

  // Sort, filter transactions by date range and search query
  const filteredTransactions = React.useMemo(() => {
    let filtered = [...transactions].sort((a, b) => new Date(b.transacted_at).getTime() - new Date(a.transacted_at).getTime());
    
    if (startDate && endDate) {
      filtered = filtered.filter(row => {
        const rowDate = new Date(row.transacted_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return rowDate >= start && rowDate <= end;
      });
    }
    
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(row =>
        (row.title || '').toLowerCase().includes(q) ||
        new Date(row.transacted_at).toLocaleDateString().toLowerCase().includes(q) ||
        String(row.amount).toLowerCase().includes(q) ||
        (row.account || '').toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [transactions, startDate, endDate, query]);

  const handleAddTransaction = async () => {
    if (!newTransaction.account_id) {
      toast({ title: 'Select an account', description: 'Total revenue is read-only. Please choose an account to transact from.', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!newTransaction.title || !newTransaction.transacted_at || !newTransaction.amount || !newTransaction.type) {
      toast({ title: 'Missing fields', description: 'Please fill title, date, amount and type.', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const body = {
        title: newTransaction.title,
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        account_id: Number(newTransaction.account_id),
        notes: newTransaction.notes || undefined,
        transacted_at: newTransaction.transacted_at,
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/transactions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { toast({ title: 'Failed to add transaction', status: 'error', duration: 3000, isClosable: true }); return; }
      const created = await res.json();
      const t = created?.data || created;
      const mapped = {
        id: t.id,
        title: t.title || body.title,
        type: t.type || body.type,
        amount: parseFloat(t.amount ?? body.amount ?? 0),
        account: t.account?.account_name || `Account #${t.account_id || body.account_id}`,
        transacted_at: t.transacted_at || t.created_at || body.transacted_at,
      };
      setTransactions(prev => [mapped, ...prev]);
      setNewTransaction({ title: "", transacted_at: "", amount: "", type: "inflow", account_id: "", notes: "" });
      onAddClose();
      toast({ title: 'Transaction added', status: 'success', duration: 2500, isClosable: true });
      // Ask Billing to refresh live totals from backend
      window.dispatchEvent(new Event('billing-refresh'));
    } catch {
      toast({ title: 'Error adding transaction', status: 'error', duration: 3000, isClosable: true });
    }
  };

  return (
    <Card my='24px' ms={{ lg: "24px" }}>
      <CardHeader mb='12px'>
        <Flex direction='column' w='100%'>
          <Flex
            direction={{ sm: "column", lg: "row" }}
            justify={{ sm: "center", lg: "space-between" }}
            align={{ sm: "center" }}
            w='100%'
            my={{ md: "12px" }}>
            <Text
              color={textColor}
              fontSize={{ sm: "lg", md: "xl", lg: "lg" }}
              fontWeight='bold'>
              {title}
            </Text>
            <HStack spacing='12px'>
              <Popover placement="bottom-start">
                <PopoverTrigger>
                  <Button
                    leftIcon={<FaRegCalendarAlt />}
                    variant='outline'
                    size='sm'
                    colorScheme='teal'
                    borderColor='#FF8D28'
                    color='#FF8D28'>
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent p='16px'>
                  <PopoverArrow />
                  <PopoverBody>
                    <VStack spacing='12px'>
                      <FormControl>
                        <FormLabel fontSize='sm'>Start Date</FormLabel>
                        <Input
                          type='date'
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          size='sm'
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize='sm'>End Date</FormLabel>
                        <Input
                          type='date'
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          size='sm'
                        />
                      </FormControl>
                      <Button
                        size='sm'
                        colorScheme='teal'
                        bg='#FF8D28'
                        color='white'
                        _hover={{ bg: '#E67E22' }}
                        onClick={() => setStartDate("") || setEndDate("")}>
                        Clear Filter
                      </Button>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Button
                colorScheme='teal'
                borderColor='#FF8D28'
                color='#FF8D28'
                variant='outline'
                fontSize='xs'
                p='8px 24px'
                leftIcon={<FaPlus />}
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
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction='column' w='100%'>
          {/* Show filtered transactions if date range is set, otherwise show original grouped view */}
          {isLoading ? (
            <Text color={subTextColor} fontSize='sm'>Loading transactions...</Text>
          ) : (
            filteredTransactions.length === 0 ? (
              <Flex align='center' justify='center' w='100%' minH={{ base: '50vh', md: '60vh' }}>
                <Flex direction='column' align='center' justify='center' p='24px' w={{ base: '100%', md: '60%' }} maxW='520px' borderRadius='16px' bg={useColorModeValue('white', 'gray.700')} border={useColorModeValue('1px solid #EDF2F7', '1px solid rgba(255,255,255,0.12)')} boxShadow={useColorModeValue('0 4px 12px rgba(0,0,0,0.06)', 'none')}>
                  <Text fontSize='lg' fontWeight='bold' color={textColor} mb='6px'>No transactions yet</Text>
                  <Text fontSize='sm' color={subTextColor} textAlign='center' mb='12px'>Add your first transaction to see it here. You can filter, search and manage them anytime.</Text>
                  <Button size='sm' colorScheme='teal' bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={onAddOpen}>ADD NEW</Button>
                </Flex>
              </Flex>
            ) : (
              filteredTransactions.map((row) => (
                <TransactionRow
                  key={row.id}
                  name={`${row.title}${row.account ? ` • ${row.account}` : ''}`}
                  logo={''}
                  date={new Date(row.transacted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                  price={`${row.type === 'inflow' ? '+' : '-'} PKR. ${row.amount}`}
                  onDelete={() => handleDeleteTransaction(row.id)}
                />
              ))
            )
          )}
        </Flex>
      </CardBody>

      {/* Glassy Modal for View All */}
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
                placeholder='Search transactions by title, date, amount or account'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%'>
              {filteredTransactions.map((row) => (
                <TransactionRow
                  key={`modal-${row.id}`}
                  name={`${row.title}${row.account ? ` • ${row.account}` : ''}`}
                  logo={''}
                  date={new Date(row.transacted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                  price={`${row.type === 'inflow' ? '+' : '-'} PKR. ${row.amount}`}
                  onDelete={() => handleDeleteTransaction(row.id)}
                />
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add New Transaction Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>Add New Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl>
                <FormLabel color={textColor}>Title</FormLabel>
                <Input
                  placeholder='Enter title'
                  value={newTransaction.title}
                  onChange={(e) => setNewTransaction({...newTransaction, title: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Date & Time</FormLabel>
                <Input
                  type='datetime-local'
                  value={newTransaction.transacted_at}
                  onChange={(e) => setNewTransaction({...newTransaction, transacted_at: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Amount</FormLabel>
                <Input
                  placeholder='Enter amount'
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Type</FormLabel>
                <Select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                  placeholder='Select type'>
                  <option value='inflow'>Inflow</option>
                  <option value='outflow'>Outflow</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Account</FormLabel>
                <Select
                  value={newTransaction.account_id}
                  onChange={(e) => setNewTransaction({...newTransaction, account_id: e.target.value})}
                  placeholder='Select account'>
                  {accounts.map(acc => (
                    <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Notes</FormLabel>
                <Input
                  placeholder='Optional notes'
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                />
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddTransaction}>
                ADD TRANSACTION
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default Transactions;
