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
  ModalFooter,
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
  useToast,
  Spinner,
  Badge,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TransactionRow from "components/Tables/TransactionRow";
import React from "react";
import { FaRegCalendarAlt, FaPlus } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { HamburgerIcon } from "@chakra-ui/icons";
import { accountService } from "services/accountService";

const Transactions = () => {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const [query, setQuery] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [accounts, setAccounts] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);
  const [editingTransaction, setEditingTransaction] = React.useState(null);
  
  const [newTransaction, setNewTransaction] = React.useState({
    account_id: "",
    transaction_type: "inflow",
    amount: "",
    description: "",
    transaction_date: "",
  });

  const toast = useToast();

  const navbarGlassBg = useColorModeValue(
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );
  const navbarGlassBorder = useColorModeValue(
    "1.5px solid #FFFFFF",
    "1.5px solid rgba(255, 255, 255, 0.31)"
  );

  // Load accounts
  const loadAccounts = React.useCallback(async () => {
    try {
      const resp = await accountService.listAccounts();
      const data = resp?.data || resp || {};
      const accountsList = Array.isArray(data) ? data : (data.accounts || []);
      setAccounts(accountsList);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  }, []);

  // Load transactions from all accounts
  const loadTransactions = React.useCallback(async (forceReloadAccounts = false) => {
    try {
      setLoading(true);
      // Always fetch fresh accounts if forceReloadAccounts is true or accounts is empty
      let allAccounts = accounts;
      if (forceReloadAccounts || accounts.length === 0) {
        const resp = await accountService.listAccounts();
        const data = resp?.data || resp || {};
        allAccounts = Array.isArray(data) ? data : (data.accounts || []);
        setAccounts(allAccounts);
        console.log('Loaded accounts:', allAccounts.length, allAccounts);
      }
      
      if (allAccounts.length === 0) {
        console.log('No accounts found, skipping transaction load');
        setTransactions([]);
        return;
      }
      
      const allTransactions = [];
      for (const account of allAccounts) {
        try {
          console.log(`Loading transactions for account ${account.id} (${account.name})`);
          const resp = await accountService.getAccountTransactions(account.id, {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          });
          console.log(`API response for account ${account.id}:`, resp);
          
          // Try multiple possible response structures
          let txns = [];
          if (Array.isArray(resp)) {
            txns = resp;
          } else if (resp?.data) {
            if (Array.isArray(resp.data)) {
              txns = resp.data;
            } else if (Array.isArray(resp.data.transactions)) {
              txns = resp.data.transactions;
            } else if (Array.isArray(resp.data.data)) {
              txns = resp.data.data;
            }
          } else if (resp?.transactions && Array.isArray(resp.transactions)) {
            txns = resp.transactions;
          }
          
          console.log(`Found ${txns.length} transactions for account ${account.id}`);
          
          if (txns && txns.length > 0) {
            txns.forEach(txn => {
              allTransactions.push({
                ...txn,
                account_name: account.name,
                account_code: account.code,
              });
            });
          }
        } catch (err) {
          console.error(`Failed to load transactions for account ${account.id}:`, err);
        }
      }
      
      console.log('Total transactions collected:', allTransactions.length);
      console.log('Sample transactions:', allTransactions.slice(0, 3));
      
      // Sort by transaction_date descending
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.transaction_date || a.created_at || 0);
        const dateB = new Date(b.transaction_date || b.created_at || 0);
        return dateB - dateA;
      });
      setTransactions(allTransactions);
      console.log('Final transactions set:', allTransactions.length);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: 'Error loading transactions',
        description: error.message || 'Failed to load transactions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, accounts, toast]);

  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Load transactions when accounts are loaded or date filters change
  React.useEffect(() => {
    if (accounts.length > 0) {
      loadTransactions(false);
    }
  }, [accounts.length, startDate, endDate, loadTransactions]);

  // Filter transactions by search query
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions;
    
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(txn =>
        (txn.description || "").toLowerCase().includes(q) ||
        (txn.transaction_date || txn.created_at || "").toLowerCase().includes(q) ||
        (txn.amount || "").toString().toLowerCase().includes(q) ||
        (txn.account_name || "").toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [transactions, query]);

  // Format transaction for display
  const formatTransaction = (txn) => {
    const isCredit = txn.type === 'credit' || txn.transaction_type === 'inflow';
    const amount = parseFloat(txn.amount || 0);
    const sign = isCredit ? "+" : "-";
    const price = `${sign}PKR. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const dateStr = txn.transaction_date || txn.created_at;
    let formattedDate = "";
    if (dateStr) {
      try {
        const date = new Date(dateStr);
        formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (e) {
        formattedDate = dateStr;
      }
    }
    
    const name = txn.description || "Transaction";
    const accountInfo = txn.account_name ? ` (${txn.account_name})` : "";
    
    return {
      name: `${name}${accountInfo}`,
      date: formattedDate,
      price,
      transaction: txn,
    };
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.account_id || !newTransaction.amount || !newTransaction.description) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      // Format transaction_date properly if provided
      let transactionDate = undefined;
      if (newTransaction.transaction_date) {
        // Convert datetime-local format to YYYY-MM-DD HH:MM:SS format
        const date = new Date(newTransaction.transaction_date);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          transactionDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
      }
      
      const payload = {
        account_id: Number(newTransaction.account_id),
        transaction_type: newTransaction.transaction_type,
        amount: Number(newTransaction.amount),
        description: newTransaction.description,
        transaction_date: transactionDate,
      };
      
      await accountService.addTransaction(payload);
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setNewTransaction({
        account_id: "",
        transaction_type: "inflow",
        amount: "",
        description: "",
        transaction_date: "",
      });
      onAddClose();
      
      // Force reload everything - wait a moment for the backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload accounts first to get fresh account list
      const accountsResp = await accountService.listAccounts();
      const accountsData = accountsResp?.data || accountsResp || {};
      const freshAccounts = Array.isArray(accountsData) ? accountsData : (accountsData.accounts || []);
      setAccounts(freshAccounts);
      
      // Now reload transactions with the fresh accounts
      await loadTransactions(true);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast({
        title: 'Error adding transaction',
        description: error.message || 'Failed to add transaction',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Split transactions into newest and older (based on date)
  const sortedTransactions = React.useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.transaction_date || a.created_at || 0);
      const dateB = new Date(b.transaction_date || b.created_at || 0);
      return dateB - dateA;
    });
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const newest = sorted.filter(txn => {
      const txnDate = new Date(txn.transaction_date || txn.created_at);
      return txnDate >= sevenDaysAgo;
    });
    
    const older = sorted.filter(txn => {
      const txnDate = new Date(txn.transaction_date || txn.created_at);
      return txnDate < sevenDaysAgo;
    });
    
    return { newest, older };
  }, [filteredTransactions]);

  const actionSize = useBreakpointValue({ base: "sm", md: "sm" });
  const dividerColor = useColorModeValue('gray.100','whiteAlpha.200');
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();

  return (
    <Card>
      <CardHeader mb='12px'>
        <Flex direction='column' w='100%'>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify='space-between'
            align={{ base: "stretch", md: "center" }}
            gap='12px'
            w='100%'
            my={{ md: "12px" }}>
            <HStack spacing='8px'>
              <Text
                color={textColor}
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight='bold'>
                Your Transactions
              </Text>
              <Badge colorScheme='orange' variant='subtle' borderRadius='8px'>
                {transactions.length}
              </Badge>
            </HStack>

            {/* Always-visible search */}
            <Box flex='1' maxW={{ base: '100%', md: '420px' }}>
              <InputGroup>
                <InputLeftElement pointerEvents='none'>
                  <FiSearch color={useColorModeValue("#718096", "#A0AEC0")} />
                </InputLeftElement>
                <Input
                  placeholder='Search...'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  size={actionSize}
                />
              </InputGroup>
            </Box>

            {/* Always-on hamburger actions */}
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                aria-label='Actions'
                display={{ base: 'inline-flex', md: 'inline-flex' }}
                variant='outline'
              />
              <MenuList>
                <MenuItem onClick={onFilterOpen}>Date Range</MenuItem>
                <MenuItem onClick={onAddOpen}>Add New</MenuItem>
                <MenuItem onClick={onOpen}>View All</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Flex justify='center' py='40px'>
            <Spinner />
          </Flex>
        ) : (
          <Flex direction='column' w='100%'>
            {startDate && endDate ? (
              <>
                <Text
                  color='gray.400'
                  fontSize={{ sm: "sm", md: "md" }}
                  fontWeight='semibold'
                  my='12px'>
                  FILTERED TRANSACTIONS ({filteredTransactions.length})
                </Text>
                {filteredTransactions.length === 0 ? (
                  <Text color='gray.500' py='20px' textAlign='center'>No transactions found</Text>
                ) : (
                  filteredTransactions.map((txn, index) => {
                    const formatted = formatTransaction(txn);
                    return (
                      <Box key={`filtered-${txn.id || index}`} borderBottom='1px solid' borderColor={dividerColor} py='10px'>
                        <TransactionRow
                          name={formatted.name}
                          logo={null}
                          date={formatted.date}
                          price={formatted.price}
                        />
                      </Box>
                    );
                  })
                )}
              </>
            ) : (
              <>
                <Text
                  color='gray.400'
                  fontSize={{ sm: "sm", md: "md" }}
                  fontWeight='semibold'
                  my='12px'>
                  NEWEST ({sortedTransactions.newest.length})
                </Text>
                {sortedTransactions.newest.length === 0 ? (
                  <Text color='gray.500' py='10px' fontSize='sm'>No recent transactions</Text>
                ) : (
                  sortedTransactions.newest.slice(0, 5).map((txn, index) => {
                    const formatted = formatTransaction(txn);
                    return (
                      <Box key={`newest-${txn.id || index}`} borderBottom='1px solid' borderColor={dividerColor} py='10px'>
                        <TransactionRow
                          name={formatted.name}
                          logo={null}
                          date={formatted.date}
                          price={formatted.price}
                        />
                      </Box>
                    );
                  })
                )}
                <Text
                  color='gray.400'
                  fontSize={{ sm: "sm", md: "md" }}
                  fontWeight='semibold'
                  my='12px'>
                  OLDER ({sortedTransactions.older.length})
                </Text>
                {sortedTransactions.older.length === 0 ? (
                  <Text color='gray.500' py='10px' fontSize='sm'>No older transactions</Text>
                ) : (
                  sortedTransactions.older.slice(0, 5).map((txn, index) => {
                    const formatted = formatTransaction(txn);
                    return (
                      <Box key={`older-${txn.id || index}`} borderBottom='1px solid' borderColor={dividerColor} py='10px'>
                        <TransactionRow
                          name={formatted.name}
                          logo={null}
                          date={formatted.date}
                          price={formatted.price}
                        />
                      </Box>
                    );
                  })
                )}
              </>
            )}
          </Flex>
        )}
      </CardBody>

      {/* Glassy Modal for View All */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '3xl', lg: '4xl' }} motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>All Transactions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb='16px'>
              <InputLeftElement pointerEvents='none'>
                <FiSearch color={useColorModeValue("#718096", "#A0AEC0")} />
              </InputLeftElement>
              <Input
                placeholder='Search transactions by description, date, amount or account'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%' maxH={{ base: '60vh', md: '65vh' }} overflowY='auto'>
              {loading ? (
                <Flex justify='center' py='40px'>
                  <Spinner />
                </Flex>
              ) : filteredTransactions.length === 0 ? (
                <Text color='gray.500' py='20px' textAlign='center'>No transactions found</Text>
              ) : (
                filteredTransactions.map((txn, index) => {
                  const formatted = formatTransaction(txn);
                  return (
                    <Box key={`modal-${txn.id || index}`} borderBottom='1px solid' borderColor={dividerColor} py='10px'>
                      <TransactionRow
                        name={formatted.name}
                        logo={null}
                        date={formatted.date}
                        price={formatted.price}
                      />
                    </Box>
                  );
                })
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Mobile Date Range Modal */}
      <Modal isOpen={isFilterOpen} onClose={onFilterClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Date Range</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='12px'>
              <FormControl>
                <FormLabel fontSize='sm'>Start Date</FormLabel>
                <Input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='sm'>End Date</FormLabel>
                <Input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={() => { setStartDate(""); setEndDate(""); }}>Clear</Button>
            <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={onFilterClose}>Apply</Button>
          </ModalFooter>
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
              <FormControl isRequired>
                <FormLabel color={textColor}>Account *</FormLabel>
                <Select
                  placeholder='Select account'
                  value={newTransaction.account_id}
                  onChange={(e) => setNewTransaction({...newTransaction, account_id: e.target.value})}>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} {acc.code ? `(${acc.code})` : ''}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Transaction Type *</FormLabel>
                <Select
                  value={newTransaction.transaction_type}
                  onChange={(e) => setNewTransaction({...newTransaction, transaction_type: e.target.value})}>
                  <option value='inflow'>Inflow (Money In)</option>
                  <option value='outflow'>Outflow (Money Out)</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Amount *</FormLabel>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='Enter amount'
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Description *</FormLabel>
                <Input
                  placeholder='Enter transaction description'
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Transaction Date (Optional)</FormLabel>
                <Input
                  type='datetime-local'
                  value={newTransaction.transaction_date}
                  onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                />
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddTransaction}
                isLoading={loading}>
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
